<<<<<<< HEAD
# Updated models.py to support Sales Wide dashboard without __root__ field

from pydantic import BaseModel, Field
=======
from pydantic import BaseModel, RootModel
>>>>>>> integrations_v41
from typing import Dict, List, Any, Optional, Union

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
    category: Optional[str] = None  # Optional sales category filter

class SalesSplitPmixUploadRequest(BaseModel):
    fileName: str
    # fileContent: str  # base64 encoded file content
    dashboard: Optional[str] = None  # Optional type of dashboard (e.g., "Sales", "Inventory")
    dashboardName: Optional[str] = None  # Optional name for the dashboard
    startDate: str = None  # Date filter start
    endDate: str = None    # Date filter end
    location: Union[str, List[str]] = "All"  # must be a string or list of strings
    server: Union[str, List[str]] = "All" # must be a string or list of strings
    category: Union[str, List[str]] = "All"  # must be a string or list of strings
    
class FinancialCompanyWideUploadRequest(BaseModel):
    fileName: str
    dashboardName: Optional[str] = None  # Optional name for the dashboard
    dashboard: Optional[str] = None  # Optional type of dashboard (e.g., "Sales", "Inventory")
    location: Union[str, List[str]] = "All" # Location filter can be a single string or a list of strings
    year: Union[Any, List[Any]] = "All"  # Year filter can be a single value or a list of values
    weekRange: Union[str, List[str]] = "All"  # Week range filter can be a single value or a list of values
    quarter: Union[int, List[int]] = "All"  # Quarter filter can be a single value or a list of values
    startDate: str = None  # Date filter start
    endDate: str = None    # Date filter end

class ExcelFilterRequest(BaseModel):
    fileName: str  # Name of the previously uploaded file
    fileContent: Optional[str] = None  # Optional base64 content if re-uploading
    startDate: Optional[str] = None  # Date filter start
    endDate: Optional[str] = None    # Date filter end
    location: Optional[str] = None   # Location filter
    dateRangeType: Optional[str] = None  # Type of date range (e.g., "Last 7 Days")
    helper: Optional[str] = None     # Helper filter for Sales Wide
    year: Optional[str] = None       # Year filter for Sales Wide
    equator: Optional[str] = None    # Equator filter for Sales Wide

<<<<<<< HEAD
# Sales Wide specific data models
class StoreValuePair(BaseModel):
    store: str
    value1: Union[str, float]
    value2: Union[str, float]
    value3: Optional[Union[str, float]] = None
    change1: Optional[Union[str, float]] = None
    change2: Optional[Union[str, float]] = None
    isGrandTotal: Optional[bool] = None

class FinancialTable(BaseModel):
    title: str
    columns: List[str]
    data: List[StoreValuePair]

# Generic chart data point (instead of using __root__)
class ChartDataPoint(BaseModel):
    # Use a dict field instead of __root__
    store: str
    data: Dict[str, Any] = Field(default_factory=dict)
    
    # Additional fields as needed - can be expanded
    value1: Optional[float] = None
    value2: Optional[float] = None

# Updated response model to handle all dashboard types
class ExcelUploadResponse(BaseModel):
    # Common fields for all dashboards
    locations: List[str] = []
    dateRanges: List[str] = []
    fileLocation: Optional[str] = None
    dashboardName: Optional[str] = None
    data: Optional[Any] = None
=======


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
>>>>>>> integrations_v41

    # Sales Split specific fields
    table1: Optional[List[Dict[str, Any]]] = []
    table2: Optional[List[Dict[str, Any]]] = []
    table3: Optional[List[Dict[str, Any]]] = []
    table4: Optional[List[Dict[str, Any]]] = []
    table5: Optional[List[Dict[str, Any]]] = []

    # Financials specific fields
    default_location: Optional[str] = None
    locations_range: Optional[List[str]] = None

    # Sales Wide specific fields
    salesData: Optional[List[Dict[str, Any]]] = None
    ordersData: Optional[List[Dict[str, Any]]] = None
    avgTicketData: Optional[List[Dict[str, Any]]] = None
    laborHrsData: Optional[List[Dict[str, Any]]] = None
    spmhData: Optional[List[Dict[str, Any]]] = None
    laborCostData: Optional[List[Dict[str, Any]]] = None
    laborPercentageData: Optional[List[Dict[str, Any]]] = None
    cogsData: Optional[List[Dict[str, Any]]] = None
    cogsPercentageData: Optional[List[Dict[str, Any]]] = None
    financialTables: Optional[List[Dict[str, Any]]] = None
    helpers: Optional[List[str]] = None
    years: Optional[List[str]] = None
    equators: Optional[List[str]] = None

# Sales Analytics response (for existing analytics endpoint)
class SalesAnalyticsResponse(BaseModel):
    salesByWeek: List[Dict[str, Any]]
    salesByDayOfWeek: List[Dict[str, Any]]
    salesByTimeOfDay: List[Dict[str, Any]]
    salesByCategory: List[Dict[str, Any]]
    fileLocation: Optional[str] = None