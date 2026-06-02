import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db.session import Base
from app import models


@pytest.fixture
def db_session():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    with Session(engine) as session:
        yield session


_registered_models = models
