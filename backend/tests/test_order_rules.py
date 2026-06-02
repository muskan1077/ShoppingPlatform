from decimal import Decimal

from fastapi import HTTPException

from app.models.customer import Customer
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services.orders import create_order


def test_create_order_reduces_stock(db_session):
    customer = Customer(name="Asha Rao", email="asha@example.com")
    product = Product(name="Notebook", sku="NB-001", price=Decimal("50.00"), stock_quantity=5)
    db_session.add_all([customer, product])
    db_session.commit()

    order = create_order(
        db_session,
        OrderCreate(customer_id=customer.id, items=[OrderItemCreate(product_id=product.id, quantity=2)]),
    )

    db_session.refresh(product)
    assert order.total_amount == Decimal("100.00")
    assert product.stock_quantity == 3


def test_create_order_rejects_insufficient_stock(db_session):
    customer = Customer(name="Ravi Shah", email="ravi@example.com")
    product = Product(name="Pen", sku="PEN-001", price=Decimal("10.00"), stock_quantity=1)
    db_session.add_all([customer, product])
    db_session.commit()

    try:
        create_order(
            db_session,
            OrderCreate(customer_id=customer.id, items=[OrderItemCreate(product_id=product.id, quantity=2)]),
        )
    except HTTPException as exc:
        assert exc.status_code == 400
        assert "Insufficient stock" in exc.detail
    else:
        raise AssertionError("Expected insufficient stock error")
