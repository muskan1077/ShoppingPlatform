from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import customers, orders, products
from app.core.config import get_settings
from app.db.session import Base, engine
from app import models

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


_registered_models = models
