# # schemas/uploaded_files.py

# from pydantic import BaseModel
# from uuid import UUID
# from datetime import datetime
# from typing import Optional

# class UploadedFileCreate(BaseModel):
#     file_name: str
#     dashboard_name: str
#     uploader_id: int
#     # company_id: Optional[UUID] = None  # Include this for upload validation
#     company_id: Optional[int] = None  # Changed to int for consistency with the model

# class UploadedFileResponse(BaseModel):
#     id: int
#     file_name: str
#     dashboard_name: str
#     uploader_id: int
#     # company_id: Optional[UUID] = None
#     company_id: Optional[int] = None  # Changed to int for consistency with the model
#     uploaded_at: datetime

#     class Config:
#         orm_mode = True


# schemas/uploaded_files.py

from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class UploadedFileCreate(BaseModel):
    file_name: str
    dashboard_name: str
    uploader_id: int
    company_id: Optional[int] = None  # Consistent with DB

class UploadedFileResponse(BaseModel):
    id: int
    file_name: str
    dashboard_name: str
    uploader_id: int
    company_id: Optional[int] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
