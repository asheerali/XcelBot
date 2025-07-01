# schemas/logs.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict, Optional
import time

class LogsBase(BaseModel):
    filename: str = Field(..., max_length=255, min_length=1)
    file_data: Dict[str, Any] = Field(..., description="JSON data from frontend")

class LogsCreate(LogsBase):
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)
    created_at: Optional[int] = Field(default_factory=lambda: int(time.time()))

class Logs(LogsBase):
    id: int = Field(..., ge=1)
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)
    created_at: int = Field(..., description="Timestamp in seconds")

    model_config = ConfigDict(from_attributes=True)