from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base
from sqlalchemy.orm import relationship


class Company(Base):
    __tablename__ = "companies"

    # id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id=  Column(Integer, primary_key=True, index=True)
    # id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)  # Add this line
    state = Column(String(100), nullable=False)
    postcode = Column(String(20), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # locations = relationship("CompanyLocation", backref="company", cascade="all, delete-orphan")
    # mails = relationship(
    #     "Mail", 
    #     back_populates="company", 
    #     cascade="all, delete-orphan"
    # )
    
        # Define all relationships properly
    locations = relationship(
        "CompanyLocation", 
        back_populates="company", 
        cascade="all, delete-orphan"
    )
    stores = relationship(
        "Store", 
        back_populates="company", 
        cascade="all, delete-orphan"
    )
    mails = relationship(
        "Mail", 
        back_populates="company", 
        cascade="all, delete-orphan"
    )
