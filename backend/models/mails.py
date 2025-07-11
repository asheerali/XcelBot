# models/mails.py

from sqlalchemy import Column, Integer, String, Time
from datetime import time
from database import Base


class Mail(Base):
    __tablename__ = "mails"

    id = Column(Integer, primary_key=True, index=True)
    receiver_name = Column(String(255), nullable=False)  # Can be username or company name
    receiver_email = Column(String(255), nullable=False)
    receiving_time = Column(Time, nullable=False)  # Time when user will receive the mail
