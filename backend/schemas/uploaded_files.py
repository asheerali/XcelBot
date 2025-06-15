# schemas/uploaded_files.py

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class UploadedFileCreate(BaseModel):
    file_name: str
    dashboard_name: str
    uploader_id: int
    company_id: Optional[UUID] = None  # Include this for upload validation

class UploadedFileResponse(BaseModel):
    id: int
    file_name: str
    dashboard_name: str
    uploader_id: int
    company_id: Optional[UUID] = None
    uploaded_at: datetime

    class Config:
        orm_mode = True
