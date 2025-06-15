# schemas/users.py

from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional
from uuid import UUID


class RoleEnum(str, Enum):
    superuser = "superuser"
    admin = "admin"
    manager = "manager"
    user = "user"
    trial = "trial"

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None  
    theme: bool = False
    role: RoleEnum
    company_id: Optional[UUID] = None  # Now optional

class UserCreate(UserBase):
    password: str  # Plain password for registration

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
