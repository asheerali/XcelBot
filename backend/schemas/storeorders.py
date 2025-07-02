# schemas/storeorders.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict, Optional
from datetime import datetime

class StoreOrdersBase(BaseModel):
    items_ordered: Dict[str, Any] = Field(..., description="JSON data for current items ordered")

class StoreOrdersCreate(StoreOrdersBase):
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)
    created_at: Optional[datetime] = Field(default=None, description="Will be auto-set if not provided")

class StoreOrdersUpdate(BaseModel):
    items_ordered: Dict[str, Any] = Field(..., description="JSON data for updated items ordered")

class StoreOrders(StoreOrdersBase):
    id: int = Field(..., ge=1)
    company_id: int = Field(..., ge=1)
    location_id: int = Field(..., ge=1)
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    prev_items_ordered: Optional[Dict[str, Any]] = Field(default=None, description="Previous items ordered data")

    model_config = ConfigDict(from_attributes=True)