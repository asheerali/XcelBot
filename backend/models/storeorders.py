# models/storeorders.py
from sqlalchemy import Column, Integer, JSON, ForeignKey, DateTime
from database import Base
from datetime import datetime

class StoreOrders(Base):
    __tablename__ = "storeorders"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    items_ordered = Column(JSON, nullable=False)
    prev_items_ordered = Column(JSON, nullable=True)