from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from database import Base
from sqlalchemy.dialects.postgresql import UUID

class Store(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postcode = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    # company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)  # Ensure this matches the type in Company model

    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
