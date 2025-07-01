# schemas/logs.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict, Optional
from datetime import datetime

class LogsBase(BaseModel):
    filename: str = Field(..., max_length=255, min_length=1)
    file_data: Dict[str, Any] = Field(..., description="JSON data from frontend")

class LogsCreate(LogsBase):
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)
    created_at: Optional[datetime] = Field(default=None, description="Will be auto-set if not provided")

class Logs(LogsBase):
    id: int = Field(..., ge=1)
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)