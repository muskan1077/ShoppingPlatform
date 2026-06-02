from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderRead
from app.services.orders import create_order

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderRead])
def list_orders(db: Session = Depends(get_db)) -> list[Order]:
    return list(
        db.scalars(
            select(Order)
            .options(selectinload(Order.items))
            .order_by(Order.id.desc())
        )
    )


@router.post("", response_model=OrderRead, status_code=201)
def place_order(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    return create_order(db, payload)
