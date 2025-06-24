from pydantic import BaseModel, RootModel
from typing import Dict, List, Any, Optional, Union

# Pydantic models
class ExcelUploadRequest(BaseModel):
    fileName: str
    fileContent: str  # base64 encoded file content
    startDate: Optional[str] = None  # Optional date filter start
    endDate: Optional[str] = None    # Optional date filter end
    company_id: Optional[int] = None  # Optional company ID filter
    location: Optional[str] = None   # Optional location filter
    dashboard: Optional[str] = None  # Optional type of dashboard (e.g., "Sales", "Inventory")
    server: Optional[str] = None  # Optional server filter
    diningOption: Optional[str] = None  # Optional dining option filter
    menuItem: Optional[str] = None  # Optional menu item filter
    category: Optional[str] = None  # Optional sales category filter

class SalesSplitPmixUploadRequest(BaseModel):
    fileName: str
    company_id: Optional[int] = None  # Optional company ID filter
    dashboard: Optional[str] = None
    dashboardName: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    location: Optional[Union[str, List[str]]] = None
    locations: Optional[List[str]] = None
    servers: Optional[Union[str, List[str]]] = None
    server: Optional[Union[str, List[str]]] = None
    categories: Optional[Union[str, List[str]]] = None

class FinancialCompanyWideUploadRequest(BaseModel):
    fileName: str
    dashboardName: Optional[str] = None
    company_id: Optional[int] = None  # Optional company ID filter
    dashboard: Optional[str] = None
    location: Optional[Union[str, List[str]]] = None
    locations: Optional[List[str]] = None
    year: Optional[Union[Any, List[Any]]] = None
    weekRange: Optional[Union[str, List[str]]] = None
    quarter: Optional[Union[int, List[int]]] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    
class ExcelFilterRequest(BaseModel):
    fileName: str  # Name of the previously uploaded file
    fileContent: Optional[str] = None  # Optional base64 content if re-uploading
    startDate: Optional[str] = None  # Date filter start
    endDate: Optional[str] = None    # Date filter end
    location: Optional[str] = None   # Location filter
    dateRangeType: Optional[str] = None  # Type of date range (e.g., "Last 7 Days")



class DashboardResponse(BaseModel):
    table1: Optional[List[Dict[str, Any]]] = None
    table2: Optional[List[Dict[str, Any]]] = None
    table3: Optional[List[Dict[str, Any]]] = None
    table4: Optional[List[Dict[str, Any]]] = None
    table5: Optional[List[Dict[str, Any]]] = None
    table6: Optional[List[Dict[str, Any]]] = None
    table7: Optional[List[Dict[str, Any]]] = None
    table8: Optional[List[Dict[str, Any]]] = None
    table9: Optional[List[Dict[str, Any]]] = None
    table10: Optional[List[Dict[str, Any]]] = None
    table11: Optional[List[Dict[str, Any]]] = None
    table12: Optional[List[Dict[str, Any]]] = None
    table13: Optional[List[Dict[str, Any]]] = None
    table14: Optional[List[Dict[str, Any]]] = None
    table15: Optional[List[Dict[str, Any]]] = None
    table16: Optional[List[Dict[str, Any]]] = None
    table17: Optional[List[Dict[str, Any]]] = None
    company_id: Optional[int] = None  # Optional company ID filter
    locations: Optional[List[Any]] = None
    servers: Optional[List[Any]] = None
    categories: Optional[List[Any]] = None
    dateRanges: Optional[List[str]] = None
    fileLocation:Optional[List[Any]] = None
    dashboardName: str
    fileName: str
    data: str

    # Financials specific fields
    default_location: Optional[str] = None
    locations_range: Optional[List[str]] = None

    # Sales Wide specific fields
    salesData: Optional[List[Dict[str, Any]]] = None
    ordersData: Optional[List[Dict[str, Any]]] = None
    avgTicketData: Optional[List[Dict[str, Any]]] = None
    cogsData: Optional[List[Dict[str, Any]]] = None
    laborCostData: Optional[List[Dict[str, Any]]] = None
    laborHrsData: Optional[List[Dict[str, Any]]] = None
    spmhData: Optional[List[Dict[str, Any]]] = None
    laborPercentageData: Optional[List[Dict[str, Any]]] = None
    cogsPercentageData: Optional[List[Dict[str, Any]]] = None
    financialTables: Optional[List[Dict[str, Any]]] = None
    dates: Optional[List[str]] = None
    years: Optional[List[Any]] = None
    stores: Optional[List[str]] = None
    quarters: Optional[List[str]] = None
    



class DualDashboardResponse(RootModel[List[DashboardResponse]]):
    pass
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