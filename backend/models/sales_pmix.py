from sqlalchemy import Column, Integer, BigInteger, String, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from database import Base

class SalesPMix(Base):
    __tablename__ = "sales_pmix"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)

    # String fields with appropriate length constraints
    Location = Column(String(100), index=True, nullable=True)
    Order_Id = Column(BigInteger, index=True, nullable=True)  # Changed to BigInteger for large IDs
    Order_number = Column(Integer, nullable=True)
    Sent_Date = Column(DateTime, index=True, nullable=True)
    Order_Date = Column(String(50), nullable=True)  # Date as string
    Check_Id = Column(Integer, nullable=True)
    Server = Column(String(100), nullable=True)
    Table = Column(String(50), nullable=True)
    Dining_Area = Column(String(100), nullable=True)
    Service = Column(String(100), nullable=True)
    Dining_Option = Column(String(100), nullable=True)
    Item_Selection_Id = Column(Integer, nullable=True)
    Item_Id = Column(Integer, nullable=True)
    Master_Id = Column(Integer, nullable=True)
    SKU = Column(String(100), nullable=True)
    PLU = Column(String(100), nullable=True)
    Menu_Item = Column(String(255), nullable=True)  # Longer for menu item names
    Menu_Subgroups = Column(String(200), nullable=True)
    Menu_Group = Column(String(200), nullable=True)
    Menu = Column(String(200), nullable=True)
    Sales_Category = Column(String(100), nullable=True)
    
    # Numeric fields
    Gross_Price = Column(Float, nullable=True)
    Discount = Column(Integer, nullable=True)
    Net_Price = Column(Float, nullable=True)
    Qty = Column(Integer, nullable=True)
    Avg_Price = Column(Float, nullable=True)
    Tax = Column(Float, nullable=True)
    
    # Boolean fields
    Void = Column(Boolean, nullable=True)
    Deferred = Column(Boolean, nullable=True)
    Tax_Exempt = Column(Boolean, nullable=True)
    
    # Additional string fields
    Tax_Inclusion_Option = Column(String(100), nullable=True)
    Dining_Option_Tax = Column(String(100), nullable=True)
    Tab_Name = Column(String(100), nullable=True)
    Date = Column(String(50), nullable=True)
    Time = Column(String(50), nullable=True)
    Day = Column(String(20), nullable=True)
    Week = Column(Integer, nullable=True)
    Month = Column(String(20), nullable=True)
    Quarter = Column(Integer, nullable=True)
    Year = Column(Integer, nullable=True)
    Category = Column(String(100), nullable=True)
    
    # Define unique constraint to prevent duplicates
    __table_args__ = (
        UniqueConstraint(
            'company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date',
            name='unique_sales_record'
        ),
    )