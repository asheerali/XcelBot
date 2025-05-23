from pydantic import BaseModel
from typing import Dict, List, Any, Optional

# Pydantic models
class ExcelUploadRequest(BaseModel):
    fileName: str
    fileContent: str  # base64 encoded file content
    startDate: Optional[str] = None  # Optional date filter start
    endDate: Optional[str] = None    # Optional date filter end
    location: Optional[str] = None   # Optional location filter
    dashboard: Optional[str] = None  # Optional type of dashboard (e.g., "Sales", "Inventory")
    server: Optional[str] = None  # Optional server filter
    diningOption: Optional[str] = None  # Optional dining option filter
    menuItem: Optional[str] = None  # Optional menu item filter

    
class FinancialUploadRequest(BaseModel):
    fileName: str
    fileContent: str  # base64 encoded file content
    startDate: Optional[str] = None  # Optional date filter start
    endDate: Optional[str] = None    # Optional date filter end
    location: Optional[str] = None   # Optional location filter
    dashboard: Optional[str] = None  # Optional type of dashboard (e.g., "Sales", "Inventory")
    year: Optional[int] = None  # Optional year filter
    weekRange: Optional[str] = None  # Optional week range filter

class ExcelFilterRequest(BaseModel):
    fileName: str  # Name of the previously uploaded file
    fileContent: Optional[str] = None  # Optional base64 content if re-uploading
    startDate: Optional[str] = None  # Date filter start
    endDate: Optional[str] = None    # Date filter end
    location: Optional[str] = None   # Location filter
    dateRangeType: Optional[str] = None  # Type of date range (e.g., "Last 7 Days")

class ExcelUploadResponse(BaseModel):
    table1: List[Dict[str, Any]]
    table2: List[Dict[str, Any]]
    table3: List[Dict[str, Any]]
    table4: List[Dict[str, Any]]
    table5: List[Dict[str, Any]]
    table6: List[Dict[str, Any]]
    table7: List[Dict[str, Any]]
    table8: List[Dict[str, Any]]
    table9: List[Dict[str, Any]]
    locations: List[Any] = []
    servers: List[Any] = []
    categories: List[Any] = []
    dateRanges: List[str] = []
    fileLocation: List[Any] = []
    dashboardName: str
    fileName: str
    data: str

# class ExcelUploadResponse(BaseModel):
#     table1: List[Dict[str, Any]]
#     table2: List[Dict[str, Any]]
#     table3: List[Dict[str, Any]]
#     table4: List[Dict[str, Any]]
#     table5: List[Dict[str, Any]]
#     table6: List[Dict[str, Any]]
#     table7: List[Dict[str, Any]]
#     table8: List[Dict[str, Any]]
#     table9: List[Dict[str, Any]]
#     locations: List[str] = []
#     dateRanges: List[str] = []
#     fileLocation: List[str] = []
#     dashboardName: str
#     fileName: str
#     data: str    
    
class FinancialUploadResponse(BaseModel):
    table1: List[Dict[str, Any]]
    table2: List[Dict[str, Any]]
    table3: List[Dict[str, Any]]
    table4: List[Dict[str, Any]]
    table5: List[Dict[str, Any]]
    table6: List[Dict[str, Any]]
    table7: List[Dict[str, Any]]
    table8: List[Dict[str, Any]]
    table9: List[Dict[str, Any]]
    locations: List[str] = []
    dateRanges: List[str] = []
    fileName: str
    dashboardName: str
    data: str

# New model for Sales Analytics response
class SalesAnalyticsResponse(BaseModel):
    salesByWeek: List[Dict[str, Any]]
    salesByDayOfWeek: List[Dict[str, Any]]
    salesByTimeOfDay: List[Dict[str, Any]]
    salesByCategory: List[Dict[str, Any]]