from pydantic import BaseModel, EmailStr
from uuid import UUID

class StoreBase(BaseModel):
    name: str
    city: str
    state: str
    postcode: str
    phone: str
    email: EmailStr
    company_id: UUID

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    location_id: int

    class Config:
        from_attributes = True
