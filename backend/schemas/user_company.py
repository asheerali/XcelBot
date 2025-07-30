from pydantic import BaseModel
from uuid import UUID

class UserCompanyBase(BaseModel):
    user_id: int
    company_id: int

class UserCompanyCreate(UserCompanyBase):
    pass

class UserCompany(UserCompanyBase):
    id: int

    class Config:
        from_attributes = True
