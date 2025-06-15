from pydantic import BaseModel
from uuid import UUID

class UserCompanyBase(BaseModel):
    location_id: int
    company_id: UUID

class UserCompanyCreate(UserCompanyBase):
    pass

class UserCompany(UserCompanyBase):
    id: int

    class Config:
        from_attributes = True
