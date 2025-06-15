from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False)
    postcode = Column(String(20), nullable=False)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
