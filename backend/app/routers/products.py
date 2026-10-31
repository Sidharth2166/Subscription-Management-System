from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product, ProductVariant, User
from app.schemas import ProductCreate, ProductResponse, ProductVariantCreate, ProductVariantResponse
from app.services.auth import require_admin, get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.name.asc()).all()
    return products

@router.post("", response_model=ProductResponse)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(Product).filter(Product.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product code already exists")

    product = Product(
        name=payload.name,
        code=payload.code,
        description=payload.description,
        base_price=payload.base_price,
        is_active=payload.is_active
    )
    db.add(product)
    db.flush()

    if payload.variants:
        for v in payload.variants:
            variant = ProductVariant(
                product_id=product.id,
                name=v.name,
                sku=v.sku,
                price_adjustment=v.price_adjustment,
                is_active=v.is_active
            )
            db.add(variant)

    db.commit()
    db.refresh(product)
    return product

@router.post("/{product_id}/variants", response_model=ProductVariantResponse)
def add_variant(
    product_id: int,
    payload: ProductVariantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = ProductVariant(
        product_id=product.id,
        name=payload.name,
        sku=payload.sku,
        price_adjustment=payload.price_adjustment,
        is_active=payload.is_active
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant
