# schemas/uploaded_files.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UploadedFileCreate(BaseModel):
    file_name: str
    dashboard_name: str
    uploader_id: int  # Get this from the current logged-in user

class UploadedFileResponse(BaseModel):
    id: int
    file_name: str
    dashboard_name: str
    uploader_id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True
