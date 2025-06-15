from pydantic import BaseModel
from uuid import UUID

class PermissionBase(BaseModel):
    company_id: UUID
    user_id: int
    upload_excel: bool = False
    d1: bool = False
    d2: bool = False
    d3: bool = False
    d4: bool = False
    d5: bool = False
    d6: bool = False
    d7: bool = False

class PermissionCreate(PermissionBase):
    pass

class Permission(PermissionBase):
    id: int

    class Config:
        from_attributes = True
