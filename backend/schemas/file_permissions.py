from pydantic import BaseModel

class FilePermissionBase(BaseModel):
    file_id: int
    user_id: int
    can_view: bool = True

class FilePermissionCreate(FilePermissionBase):
    pass

class FilePermission(FilePermissionBase):
    id: int

    class Config:
        from_attributes = True
