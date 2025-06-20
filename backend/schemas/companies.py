from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class CompanyBase(BaseModel):
    name: str
    state: str
    postcode: str
    address: Optional[str] = None  # New field
    phone: str
    email: EmailStr
    website: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int  # Changed from UUID to int
    created_at: datetime

    class Config:
        from_attributes = True
