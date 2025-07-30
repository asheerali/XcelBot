# models/mails.py

from sqlalchemy import Column, Integer, String, Time, ForeignKey
from datetime import time
from database import Base
from sqlalchemy.orm import relationship


class Mail(Base):
    __tablename__ = "mails"

    id = Column(Integer, primary_key=True, index=True)
    receiver_name = Column(String(255), nullable=False)  # Can be username or company name
    receiver_email = Column(String(255), nullable=False)
    receiving_time = Column(Time, nullable=False)  # Time when user will receive the mail
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)  # Optional company association
    
    # Relationship to Company
    company = relationship("Company", backref="mails")