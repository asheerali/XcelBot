# schemas/financials_company_wide.py

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class FinancialsCompanyWideBase(BaseModel):
    # Basic information fields
    Store: Optional[str] = Field(None, max_length=100)
    Ly_Date: Optional[datetime] = None  # Last Year Date
    Date: Optional[str] = Field(None, max_length=50)
    Day: Optional[str] = Field(None, max_length=20)
    Week: Optional[int] = Field(None, ge=1, le=53)  # Valid week range
    Month: Optional[str] = Field(None, max_length=20)
    Quarter: Optional[int] = Field(None, ge=1, le=4)  # Valid quarter range
    Year: Optional[int] = Field(None, ge=1900, le=2100)  # Reasonable year range
    
    # Helper fields
    Helper_1: Optional[str] = Field(None, max_length=100)
    Helper_2: Optional[str] = Field(None, max_length=100)
    Helper_3: Optional[str] = Field(None, max_length=100)
    Helper_4: Optional[str] = Field(None, max_length=100)
    
    # Sales metrics (This Week, Last Week, Last Year)
    Tw_Sales: Optional[float] = Field(None, ge=0.0)  # Non-negative
    Lw_Sales: Optional[float] = Field(None, ge=0.0)
    Ly_Sales: Optional[float] = Field(None, ge=0.0)
    
    # Order metrics
    Tw_Orders: Optional[float] = Field(None, ge=0.0)
    Lw_Orders: Optional[float] = Field(None, ge=0.0)
    Ly_Orders: Optional[float] = Field(None, ge=0.0)
    
    # Average Ticket metrics
    Tw_Avg_Tckt: Optional[float] = Field(None, ge=0.0)
    Lw_Avg_Tckt: Optional[float] = Field(None, ge=0.0)
    Ly_Avg_Tckt: Optional[float] = Field(None, ge=0.0)
    
    # Labor metrics
    Tw_Labor_Hrs: Optional[float] = Field(None, ge=0.0)
    Lw_Labor_Hrs: Optional[float] = Field(None, ge=0.0)
    Tw_Reg_Pay: Optional[float] = Field(None, ge=0.0)
    Lw_Reg_Pay: Optional[float] = Field(None, ge=0.0)
    
    # Performance metrics (Sales Per Man Hour, Labor Per Man Hour)
    Tw_SPMH: Optional[float] = Field(None, ge=0.0)  # Sales Per Man Hour
    Lw_SPMH: Optional[float] = Field(None, ge=0.0)
    Tw_LPMH: Optional[float] = Field(None, ge=0.0)  # Labor Per Man Hour
    Lw_LPMH: Optional[float] = Field(None, ge=0.0)
    
    # COGS (Cost of Goods Sold) - This Week
    Tw_COGS: Optional[float] = Field(None, ge=0.0)
    TW_Johns: Optional[float] = Field(None, ge=0.0)
    TW_Terra: Optional[float] = Field(None, ge=0.0)
    TW_Metro: Optional[float] = Field(None, ge=0.0)
    TW_Victory: Optional[float] = Field(None, ge=0.0)
    TW_Central_Kitchen: Optional[float] = Field(None, ge=0.0)
    TW_Other: Optional[float] = Field(None, ge=0.0)
    
    # Unnamed columns (you might want to rename these based on their actual purpose)
    Unnamed_36: Optional[float] = None
    Unnamed_37: Optional[float] = None
    Unnamed_38: Optional[float] = None
    Unnamed_39: Optional[float] = None
    
    # COGS (Cost of Goods Sold) - Last Week
    Lw_COGS: Optional[float] = Field(None, ge=0.0)
    LW_Johns: Optional[float] = Field(None, ge=0.0)
    LW_Terra: Optional[float] = Field(None, ge=0.0)
    LW_Metro: Optional[float] = Field(None, ge=0.0)
    LW_Victory: Optional[float] = Field(None, ge=0.0)
    LW_Central_Kitchen: Optional[float] = Field(None, ge=0.0)
    LW_Other: Optional[float] = Field(None, ge=0.0)

class FinancialsCompanyWideCreate(FinancialsCompanyWideBase):
    company_id: int = Field(..., ge=1)  # Required, positive integer

class FinancialsCompanyWide(FinancialsCompanyWideBase):
    id: int = Field(..., ge=1)  # Required, positive integer
    company_id: int = Field(..., ge=1)  # Required, positive integer

    model_config = ConfigDict(from_attributes=True)  # Updated for Pydantic v2