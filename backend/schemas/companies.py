# 1. FIXED SCHEMA (schemas/companies.py)
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class CompanyBase(BaseModel):
    name: str
    address: str  # Made required to match model
    state: str
    postcode: str
    phone_number: str  # Changed from 'phone' to match frontend
    email: Optional[EmailStr] = None  # Made optional to match frontend
    website: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True