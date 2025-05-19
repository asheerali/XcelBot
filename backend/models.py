# Updated models.py to support Sales Wide dashboard without __root__ field

from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional, Union

# Pydantic models
class ExcelUploadRequest(BaseModel):
    fileName: str
    fileContent: str  # base64 encoded file content
    startDate: Optional[str] = None  # Optional date filter start
    endDate: Optional[str] = None    # Optional date filter end
    location: Optional[str] = None   # Optional location filter
    dashboard: Optional[str] = None  # Dashboard type (e.g., "Sales Split", "Financials", "Sales Wide")

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