# models/financials_company_wide.py

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base

class FinancialsCompanyWide(Base):
    __tablename__ = "financials_company_wide"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    
        # New columns
    file_name = Column(String(255), nullable=True, index=True)  # For storing filename
    dashboard = Column(Integer, nullable=True)  # Dashboard integer field
    
    
    # Basic information fields
    Store = Column(String(100), index=True, nullable=True)
    Ly_Date = Column(DateTime, index=True, nullable=True)  # Last Year Date
    Date = Column(String(50), nullable=True)  # Date as string
    Day = Column(String(20), nullable=True)
    Week = Column(Integer, nullable=True)
    Month = Column(String(20), nullable=True)
    Quarter = Column(Integer, nullable=True)
    Year = Column(Integer, nullable=True)
    
    # Helper fields
    Helper_1 = Column(String(100), nullable=True)
    Helper_2 = Column(String(100), nullable=True)
    Helper_3 = Column(String(100), nullable=True)
    Helper_4 = Column(String(100), nullable=True)
    
    # Sales metrics (This Week, Last Week, Last Year)
    Tw_Sales = Column(Float, nullable=True)  # This Week Sales
    Lw_Sales = Column(Float, nullable=True)  # Last Week Sales
    Ly_Sales = Column(Float, nullable=True)  # Last Year Sales
    
    # Order metrics
    Tw_Orders = Column(Float, nullable=True)
    Lw_Orders = Column(Float, nullable=True)
    Ly_Orders = Column(Float, nullable=True)
    
    # Average Ticket metrics
    Tw_Avg_Tckt = Column(Float, nullable=True)
    Lw_Avg_Tckt = Column(Float, nullable=True)
    Ly_Avg_Tckt = Column(Float, nullable=True)
    
    # Labor metrics
    Tw_Labor_Hrs = Column(Float, nullable=True)
    Lw_Labor_Hrs = Column(Float, nullable=True)
    Tw_Reg_Pay = Column(Float, nullable=True)
    Lw_Reg_Pay = Column(Float, nullable=True)
    
    # Performance metrics (Sales Per Man Hour, Labor Per Man Hour)
    Tw_SPMH = Column(Float, nullable=True)  # Sales Per Man Hour
    Lw_SPMH = Column(Float, nullable=True)
    Tw_LPMH = Column(Float, nullable=True)  # Labor Per Man Hour
    Lw_LPMH = Column(Float, nullable=True)
    
    # COGS (Cost of Goods Sold) - This Week
    Tw_COGS = Column(Float, nullable=True)
    TW_Johns = Column(Float, nullable=True)
    TW_Terra = Column(Float, nullable=True)
    TW_Metro = Column(Float, nullable=True)
    TW_Victory = Column(Float, nullable=True)
    TW_Central_Kitchen = Column(Float, nullable=True)
    TW_Other = Column(Float, nullable=True)
    
    # Unnamed columns (you might want to rename these based on their actual purpose)
    Unnamed_36 = Column(Float, nullable=True)
    Unnamed_37 = Column(Float, nullable=True)
    Unnamed_38 = Column(Float, nullable=True)
    Unnamed_39 = Column(Float, nullable=True)
    
    # COGS (Cost of Goods Sold) - Last Week
    Lw_COGS = Column(Float, nullable=True)
    LW_Johns = Column(Float, nullable=True)
    LW_Terra = Column(Float, nullable=True)
    LW_Metro = Column(Float, nullable=True)
    LW_Victory = Column(Float, nullable=True)
    LW_Central_Kitchen = Column(Float, nullable=True)
    LW_Other = Column(Float, nullable=True)