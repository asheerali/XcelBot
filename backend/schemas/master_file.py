# schemas/master_file.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict

class MasterFileBase(BaseModel):
    filename: str = Field(..., max_length=255, min_length=1)
    file_data: Dict[str, Any] = Field(..., description="JSON data from frontend")

class MasterFileCreate(MasterFileBase):
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)  # NEW

class MasterFile(MasterFileBase):
    id: int = Field(..., ge=1)
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)  # NEW

    model_config = ConfigDict(from_attributes=True)