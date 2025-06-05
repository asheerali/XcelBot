from pydantic import BaseModel
from datetime import datetime

class UploadedFileBase(BaseModel):
    file_name: str
    uploader_id: int
    store_id: int

class UploadedFileCreate(UploadedFileBase):
    pass

class UploadedFile(UploadedFileBase):
    id: int
    uploaded_at: datetime

    class Config:
        from_attributes = True
