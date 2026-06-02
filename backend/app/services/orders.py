from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


def create_order(db: Session, payload: OrderCreate) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    requested_quantities: dict[int, int] = {}
    for item in payload.items:
        requested_quantities[item.product_id] = requested_quantities.get(item.product_id, 0) + item.quantity

    products = list(
        db.scalars(
            select(Product)
            .where(Product.id.in_(requested_quantities.keys()))
            .with_for_update()
        )
    )
    products_by_id = {product.id: product for product in products}

    missing_ids = set(requested_quantities) - set(products_by_id)
    if missing_ids:
        raise HTTPException(status_code=404, detail=f"Product not found: {sorted(missing_ids)}")

    for product_id, quantity in requested_quantities.items():
        product = products_by_id[product_id]
        if product.stock_quantity < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.sku}. Available: {product.stock_quantity}",
            )

    total_amount = Decimal("0.00")
    order_items: list[OrderItem] = []
    for product_id, quantity in requested_quantities.items():
        product = products_by_id[product_id]
        line_total = product.price * quantity
        product.stock_quantity -= quantity
        total_amount += line_total
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                line_total=line_total,
            )
        )

    order = Order(customer_id=payload.customer_id, total_amount=total_amount, items=order_items)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
