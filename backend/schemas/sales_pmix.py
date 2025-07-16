from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class SalesPMixBase(BaseModel):
    
    # New fields
    file_name: Optional[str] = Field(None, max_length=255)  # For storing filename
    dashboard: Optional[int] = Field(None, ge=0)  # Dashboard integer field, non-negative
    
    # String fields with length validation
    Location: Optional[str] = Field(None, max_length=100)
    Order_Id: Optional[int] = Field(None, ge=0)  # Allow large integers, non-negative
    Order_number: Optional[int] = Field(None, ge=0)
    Sent_Date: Optional[datetime] = None
    Order_Date: Optional[str] = Field(None, max_length=50)
    Check_Id: Optional[int] = Field(None, ge=0)
    Server: Optional[str] = Field(None, max_length=100)
    Table: Optional[str] = Field(None, max_length=50)
    Dining_Area: Optional[str] = Field(None, max_length=100)
    Service: Optional[str] = Field(None, max_length=100)
    Dining_Option: Optional[str] = Field(None, max_length=100)
    
    # ID fields with validation
    Item_Selection_Id: Optional[int] = Field(None, ge=0)
    Item_Id: Optional[int] = Field(None, ge=0)
    Master_Id: Optional[int] = Field(None, ge=0)
    
    # Product information
    SKU: Optional[str] = Field(None, max_length=100)
    PLU: Optional[str] = Field(None, max_length=100)
    Menu_Item: Optional[str] = Field(None, max_length=255)
    Menu_Subgroups: Optional[str] = Field(None, max_length=200)
    Menu_Group: Optional[str] = Field(None, max_length=200)
    Menu: Optional[str] = Field(None, max_length=200)
    Sales_Category: Optional[str] = Field(None, max_length=100)
    
    # Financial fields with validation
    Gross_Price: Optional[float] = Field(None, ge=0.0)  # Non-negative
    Discount: Optional[int] = Field(None, ge=0)  # Non-negative
    Net_Price: Optional[float] = Field(None, ge=0.0)  # Non-negative
    Qty: Optional[int] = Field(None, ge=0)  # Non-negative quantity
    Avg_Price: Optional[float] = Field(None, ge=0.0)  # Non-negative
    Tax: Optional[float] = Field(None, ge=0.0)  # Non-negative
    
    # Boolean fields
    Void: Optional[bool] = None
    Deferred: Optional[bool] = None
    Tax_Exempt: Optional[bool] = None
    
    # Additional string fields
    Tax_Inclusion_Option: Optional[str] = Field(None, max_length=100)
    Dining_Option_Tax: Optional[str] = Field(None, max_length=100)
    Tab_Name: Optional[str] = Field(None, max_length=100)
    Date: Optional[str] = Field(None, max_length=50)
    Time: Optional[str] = Field(None, max_length=50)
    Day: Optional[str] = Field(None, max_length=20)
    
    # Time period fields
    Week: Optional[int] = Field(None, ge=1, le=53)  # Valid week range
    Month: Optional[str] = Field(None, max_length=20)
    Quarter: Optional[int] = Field(None, ge=1, le=4)  # Valid quarter range
    Year: Optional[int] = Field(None, ge=1900, le=2100)  # Reasonable year range
    Category: Optional[str] = Field(None, max_length=100)

class SalesPMixCreate(SalesPMixBase):
    company_id: int = Field(..., ge=1)  # Required, positive integer

class SalesPMix(SalesPMixBase):
    id: int = Field(..., ge=1)  # Required, positive integer
    company_id: int = Field(..., ge=1)  # Required, positive integer

    model_config = ConfigDict(from_attributes=True)  # Updated for Pydantic v2