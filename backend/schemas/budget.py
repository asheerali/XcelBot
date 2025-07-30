# schemas/budget.py

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class BudgetBase(BaseModel):
    
    
    # New fields
    file_name: Optional[str] = Field(None, max_length=255)  # For storing filename
    dashboard: Optional[int] = Field(None, ge=0)  # Dashboard integer field, non-negative
    
    # Basic information fields
    Store: Optional[str] = Field(None, max_length=100)
    Date: Optional[str] = Field(None, max_length=50)
    Week: Optional[int] = Field(None, ge=1, le=53)  # Valid week range
    Month: Optional[str] = Field(None, max_length=20)
    Quarter: Optional[int] = Field(None, ge=1, le=4)  # Valid quarter range
    Year: Optional[int] = Field(None, ge=1900, le=2100)  # Reasonable year range
    
    # Helper fields
    Helper_1: Optional[str] = Field(None, max_length=100)
    Helper: Optional[str] = Field(None, max_length=100)
    Helper_2: Optional[str] = Field(None, max_length=100)
    Helper_4: Optional[str] = Field(None, max_length=100)
    
    # Sales metrics
    Sales_Pct_Contribution: Optional[float] = None
    Catering_Sales: Optional[float] = Field(None, ge=0.0)  # Non-negative
    In_House_Sales: Optional[float] = Field(None, ge=0.0)
    Weekly_Plus_Minus: Optional[float] = None  # Can be negative
    Net_Sales_1: Optional[float] = Field(None, ge=0.0)
    Net_Sales: Optional[float] = Field(None, ge=0.0)
    Orders: Optional[float] = Field(None, ge=0.0)
    
    # Cost metrics
    Food_Cost: Optional[float] = Field(None, ge=0.0)
    Johns: Optional[float] = Field(None, ge=0.0)
    Terra: Optional[float] = Field(None, ge=0.0)
    Metro: Optional[float] = Field(None, ge=0.0)
    Victory: Optional[float] = Field(None, ge=0.0)
    Central_Kitchen: Optional[float] = Field(None, ge=0.0)
    Other: Optional[int] = Field(None, ge=0)
    
    # Performance metrics
    LPMH: Optional[float] = Field(None, ge=0.0)  # Labor Per Man Hour
    SPMH: Optional[float] = Field(None, ge=0.0)  # Sales Per Man Hour
    LB_Hours: Optional[float] = Field(None, ge=0.0)  # Labor Hours
    
    # Labor and cost metrics
    Labor_Cost: Optional[float] = Field(None, ge=0.0)
    Labor_Pct_Cost: Optional[float] = None  # Can be percentage
    Prime_Cost: Optional[float] = Field(None, ge=0.0)
    Prime_Pct_Cost: Optional[float] = None  # Can be percentage
    Rent: Optional[float] = Field(None, ge=0.0)
    Opex_Cost: Optional[int] = Field(None, ge=0)  # Operating Expense Cost
    
    # Financial summary
    TTL_Expense: Optional[float] = Field(None, ge=0.0)  # Total Expense
    Net_Income: Optional[float] = None  # Can be negative
    Net_Pct_Income: Optional[float] = None  # Can be negative percentage

class BudgetCreate(BudgetBase):
    company_id: int = Field(..., ge=1)  # Required, positive integer

class Budget(BudgetBase):
    id: int = Field(..., ge=1)  # Required, positive integer
    company_id: int = Field(..., ge=1)  # Required, positive integer

    model_config = ConfigDict(from_attributes=True)  # Updated for Pydantic v2