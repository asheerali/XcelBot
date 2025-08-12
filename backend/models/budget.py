# models/budget.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base

class Budget(Base):
    __tablename__ = "budget"
    
    id = Column(Integer, primary_key=True, index=True)
    # company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete='CASCADE'), nullable=False, index=True)  # Added CASCADE

    
    # New columns
    file_name = Column(String(255), nullable=True, index=True)  # For storing filename
    dashboard = Column(Integer, nullable=True)  # Dashboard integer field
    
    
    # Basic information fields
    Store = Column(String(100), index=True, nullable=True)
    Date = Column(String(50), nullable=True)
    Week = Column(Integer, nullable=True)
    Month = Column(String(20), nullable=True)
    Quarter = Column(Integer, nullable=True)
    Year = Column(Integer, nullable=True)
    
    # Helper fields
    Helper_1 = Column(String(100), nullable=True)
    Helper = Column(String(100), nullable=True)
    Helper_2 = Column(String(100), nullable=True)
    Helper_4 = Column(String(100), nullable=True)
    
    # Sales metrics
    Sales_Pct_Contribution = Column(Float, nullable=True)
    Catering_Sales = Column(Float, nullable=True)
    In_House_Sales = Column(Float, nullable=True)
    Weekly_Plus_Minus = Column(Float, nullable=True)
    Net_Sales_1 = Column(Float, nullable=True)
    Net_Sales = Column(Float, nullable=True)
    Orders = Column(Float, nullable=True)
    
    # Cost metrics
    Food_Cost = Column(Float, nullable=True)
    Johns = Column(Float, nullable=True)
    Terra = Column(Float, nullable=True)
    Metro = Column(Float, nullable=True)
    Victory = Column(Float, nullable=True)
    Central_Kitchen = Column(Float, nullable=True)
    Other = Column(Integer, nullable=True)
    
    # Performance metrics
    LPMH = Column(Float, nullable=True)  # Labor Per Man Hour
    SPMH = Column(Float, nullable=True)  # Sales Per Man Hour
    LB_Hours = Column(Float, nullable=True)  # Labor Hours
    
    # Labor and cost metrics
    Labor_Cost = Column(Float, nullable=True)
    Labor_Pct_Cost = Column(Float, nullable=True)
    Prime_Cost = Column(Float, nullable=True)
    Prime_Pct_Cost = Column(Float, nullable=True)
    Rent = Column(Float, nullable=True)
    Opex_Cost = Column(Integer, nullable=True)  # Operating Expense Cost
    
    # Financial summary
    TTL_Expense = Column(Float, nullable=True)  # Total Expense
    Net_Income = Column(Float, nullable=True)
    Net_Pct_Income = Column(Float, nullable=True)