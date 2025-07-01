from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict

class MasterFileBase(BaseModel):
    filename: str = Field(..., max_length=255, min_length=1)
    file_data: Dict[str, Any] = Field(..., description="JSON data from frontend")

class MasterFileCreate(MasterFileBase):
    company_id: int = Field(..., ge=1)  # Required, positive integer

class MasterFile(MasterFileBase):
    id: int = Field(..., ge=1)  # Required, positive integer
    company_id: int = Field(..., ge=1)  # Required, positive integer

    model_config = ConfigDict(from_attributes=True)  # Updated for Pydantic v2