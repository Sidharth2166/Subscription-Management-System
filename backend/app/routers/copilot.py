import uuid
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatSession, ChatMessage, User
from app.schemas import CopilotMessageRequest, CopilotMessageResponse
from app.services.auth import get_current_user
from app.services.copilot_service import handle_copilot_query

router = APIRouter(prefix="/api/copilot", tags=["AI Business Copilot"])

@router.post("/query", response_model=CopilotMessageResponse)
def query_copilot(
    payload: CopilotMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id = payload.session_id or str(uuid.uuid4())
    user_id = current_user.id if current_user else 1

    # Ensure session exists
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        session = ChatSession(id=session_id, user_id=user_id, title=payload.query[:50])
        db.add(session)
        db.flush()

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=payload.query)
    db.add(user_msg)

    # Process query
    result = handle_copilot_query(db, payload.query, current_user)

    # Save assistant message
    asst_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=result["answer"],
        structured_data=str(result["structured_data"]) if result["structured_data"] else None
    )
    db.add(asst_msg)
    db.commit()

    return {
        "session_id": session.id,
        "answer": result["answer"],
        "structured_data": result["structured_data"],
        "suggested_actions": result.get("suggested_actions", [])
    }

@router.get("/history/{session_id}")
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "structured_data": m.structured_data,
            "timestamp": m.timestamp.isoformat()
        }
        for m in msgs
    ]
