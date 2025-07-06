# 2. FIXED MODEL (models/companies.py)
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database import Base
from sqlalchemy.orm import relationship

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    postcode = Column(String(20), nullable=False)
    phone_number = Column(String(20), nullable=False)  # Changed from 'phone' to match frontend
    email = Column(String(255), nullable=True)  # Made nullable
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    locations = relationship("CompanyLocation", backref="company", cascade="all, delete-orphan")


