import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, customers, products, plans, quotations,
    subscriptions, invoices, payments, rescue,
    guardian, analytics, copilot, notifications, settings as settings_router
)

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SubFlow: Next-Generation Subscription Management & Revenue Intelligence API",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(products.router)
app.include_router(plans.router)
app.include_router(quotations.router)
app.include_router(subscriptions.router)
app.include_router(invoices.router)
app.include_router(payments.router)
app.include_router(rescue.router)
app.include_router(guardian.router)
app.include_router(analytics.router)
app.include_router(copilot.router)
app.include_router(notifications.router)
app.include_router(settings_router.router)

@app.get("/")
def root():
    return {
        "app": "SubFlow API",
        "status": "healthy",
        "tagline": "Manage subscriptions. Protect revenue. Grow smarter.",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "database": "connected"}
