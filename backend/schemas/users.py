# schemas/users.py

from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional, List
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
    # theme: bool = False
    role: RoleEnum
    company_id: Optional[int] = None  # Now optional
    # assigned_location_ids: Optional[List[int]] = None  # ✅ new 
    permissions: Optional[List[str]] = None  # ✅ new
class UserCreate(UserBase):
    # password: str  # Plain password for registration
    password: Optional[str] = None  # Make optional
    assigned_location: Optional[List[int]] = None  # ✅ new
    # assigned_location_ids: Optional[List[int]] = None  # ✅ new


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(UserBase):
    password: Optional[str] = None
    assigned_location: Optional[List[int]] = None  # ✅ new
