from pydantic import BaseModel
from uuid import UUID

class CompanyLocationBase(BaseModel):
    company_id: UUID
    location_id: int

class CompanyLocationCreate(CompanyLocationBase):
    pass

class CompanyLocation(CompanyLocationBase):
    id: int

    class Config:
        from_attributes = True
