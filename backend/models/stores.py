from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base
from sqlalchemy.dialects.postgresql import UUID


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
