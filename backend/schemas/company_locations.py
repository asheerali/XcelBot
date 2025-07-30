from pydantic import BaseModel
from typing import List

class CompanyLocationCreate(BaseModel):
    company_id: int
    location_id: int

class CompanyLocation(BaseModel):
    id: int
    company_id: int
    location_id: int
    
    class Config:
        from_attributes = True

class LocationInfo(BaseModel):
    """Schema for location information in nested response"""
    location_id: int
    location_name: str

class CompanyWithLocations(BaseModel):
    """Schema for companies with nested locations"""
    company_id: int
    company_name: str
    locations: List[LocationInfo]