# models/logs.py
from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from database import Base
from datetime import datetime
from database import Base

class Logs(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    # company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete='CASCADE'), nullable=False, index=True)  # Added CASCADE

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False, index=True)
    # created_at = Column(Integer, nullable=False)  # Timestamp in seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    file_data = Column(JSON, nullable=False)