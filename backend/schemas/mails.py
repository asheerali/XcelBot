# schemas/mails.py

from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import time


class MailBase(BaseModel):
    receiver_name: Optional[str] = None  # Can be username or company name   
    receiver_email: EmailStr
    receiving_time: time  # Time when user will receive the mail
    company_id: Optional[int] = None  # Optional company association


class MailCreate(MailBase):
    pass


class Mail(MailBase):
    id: int

    class Config:
        from_attributes = True


class MailUpdate(BaseModel):
    receiver_email: Optional[str] = None
    receiver_name: Optional[str] = None
    receiving_time: Optional[time] = None
    company_id: Optional[int] = None  # Allow updating company association