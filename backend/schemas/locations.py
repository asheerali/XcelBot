from pydantic import BaseModel, EmailStr
from uuid import UUID

class StoreBase(BaseModel):
    name: str
    city: str
    state: str
    postcode: str
    phone: str
    address: str 
    email: EmailStr
    company_id: int

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    id: int

    class Config:
        from_attributes = True
