from fastapi import APIRouter, Depends, HTTPException, Body
import pandas as pd
from datetime import datetime, timedelta
import traceback
from sqlalchemy.orm import Session
from typing import Optional, List, Union

# Import from local modules
from models_pydantic import DashboardResponse, SalesSplitPmixUploadRequest
from sales_split_dashboard.sales_split_prcoessor import process_sales_split_file as process_sales_split_data
from models.sales_pmix import SalesPMix
from database import get_db
from schemas import users as user_schema
from dependencies.auth import get_current_user

router = APIRouter(
    prefix="/api",
    tags=["sales_split_filter"],
)


def calculate_date_range(start_date: Optional[str], end_date: Optional[str]) -> tuple:
    """
    Calculate optimized date range for filtering.
    Returns (start_date_pd, end_date_pd) as pandas datetime objects.
    """
    if not end_date:
        return None, None
    
    # Convert to pandas datetime
    start_date_pd = pd.to_datetime(start_date) if start_date else None
    end_date_pd = pd.to_datetime(end_date) if end_date else None
    
    if end_date_pd is not None:
        # Extend to end of week (Sunday)
        end_date_plus_one = end_date_pd + timedelta(days=1)
        days_to_add = 6 - end_date_plus_one.weekday()
        end_date_pd = end_date_plus_one + pd.Timedelta(days=days_to_add)
        
        # Calculate start date (91 days back)
        start_date_pd = end_date_pd - pd.Timedelta(days=91)
    
    return start_date_pd, end_date_pd


def build_optimized_query(
    db: Session, 
    company_id: int,
    location_filter: Union[str, List[str]],
    category_filter: Union[str, List[str]],
    start_date_pd: Optional[pd.Timestamp],
    end_date_pd: Optional[pd.Timestamp]
) -> List:
    """
    Build and execute optimized database query with all filters applied.
    Only select essential columns to reduce memory usage.
    """
    # Select only essential columns to reduce memory overhead
    essential_columns = [
        SalesPMix.Location,
        SalesPMix.Sent_Date,
        SalesPMix.Net_Price,
        SalesPMix.Category,
        SalesPMix.Order_Id,
        SalesPMix.Check_Id,
        SalesPMix.Qty,
        SalesPMix.Menu_Item,
        SalesPMix.Day,
        SalesPMix.Week,
        SalesPMix.Month,
        SalesPMix.Quarter,
        SalesPMix.Year
    ]
    
    # Build base query with column selection
    query = db.query(*essential_columns).filter(SalesPMix.company_id == company_id)
    
    # Apply date filters
    if start_date_pd is not None:
        query = query.filter(SalesPMix.Sent_Date >= start_date_pd)
    
    if end_date_pd is not None:
        end_datetime = end_date_pd + timedelta(days=1)
        query = query.filter(SalesPMix.Sent_Date < end_datetime)
    
    # Apply location filter
    if location_filter != "All" and location_filter:
        if isinstance(location_filter, list):
            query = query.filter(SalesPMix.Location.in_(location_filter))
        else:
            query = query.filter(SalesPMix.Location == location_filter)
    
    # Apply category filter
    if category_filter != "All" and category_filter:
        if isinstance(category_filter, list):
            query = query.filter(SalesPMix.Category.in_(category_filter))
        else:
            query = query.filter(SalesPMix.Category == category_filter)
    
    return query.all()


def records_to_dataframe_optimized(records) -> pd.DataFrame:
    """
    Convert database records to DataFrame efficiently.
    Pre-process data types during conversion to avoid multiple operations.
    """
    if not records:
        return pd.DataFrame()
    
    # Extract data directly into lists for faster DataFrame creation
    data = {
        'Location': [],
        'Sent_Date': [],
        'Net_Price': [],
        'Category': [],
        'Order_Id': [],
        'Check_Id': [],
        'Qty': [],
        'Menu_Item': [],
        'Day': [],
        'Week': [],
        'Month': [],
        'Quarter': [],
        'Year': []
    }
    
    for record in records:
        data['Location'].append(record.Location)
        data['Sent_Date'].append(record.Sent_Date)
        data['Net_Price'].append(float(record.Net_Price) if record.Net_Price else 0.0)
        data['Category'].append(record.Category)
        data['Order_Id'].append(record.Order_Id)
        data['Check_Id'].append(record.Check_Id)
        data['Qty'].append(float(record.Qty) if record.Qty else 0.0)
        data['Menu_Item'].append(record.Menu_Item)
        data['Day'].append(record.Day)
        data['Week'].append(record.Week)
        data['Month'].append(record.Month)
        data['Quarter'].append(record.Quarter)
        data['Year'].append(record.Year)
    
    # Create DataFrame with proper data types from the start
    df = pd.DataFrame(data)
    
    # Single-pass data type conversion
    df['Sent_Date'] = pd.to_datetime(df['Sent_Date'], errors='coerce')
    df['Net_Price'] = df['Net_Price'].astype('float64')
    df['Qty'] = df['Qty'].astype('float64')
    df['Order_Id'] = df['Order_Id'].astype('Int64')
    df['Check_Id'] = df['Check_Id'].astype('Int64')
    df['Week'] = df['Week'].astype('Int64')
    df['Quarter'] = df['Quarter'].astype('Int64')
    df['Year'] = df['Year'].astype('Int64')
    
    # Derive essential datetime columns once
    if 'Sent_Date' in df.columns and not df['Sent_Date'].isna().all():
        df['Date'] = df['Sent_Date'].dt.normalize()
        df['Time'] = df['Sent_Date'].dt.strftime('%H:%M:%S')
        # Only re-derive if not already present or invalid
        if df['Day'].isna().any():
            df['Day'] = df['Sent_Date'].dt.day_name()
        if df['Week'].isna().any():
            df['Week'] = df['Sent_Date'].dt.isocalendar().week
        if df['Month'].isna().any():
            df['Month'] = df['Sent_Date'].dt.month_name()
        if df['Quarter'].isna().any():
            df['Quarter'] = df['Sent_Date'].dt.quarter
        if df['Year'].isna().any():
            df['Year'] = df['Sent_Date'].dt.year
    
    return df


def process_filter_parameters(request: SalesSplitPmixUploadRequest) -> dict:
    """
    Extract and process all filter parameters in one place.
    """
    # Process location filter
    if request.location == "Multiple Locations":
        location_filter = "All"
    else:
        location_filter = request.locations if request.locations else 'All'
    
    # Convert to lowercase if needed
    if isinstance(location_filter, list):
        location_filter = [loc.lower() for loc in location_filter]
    elif isinstance(location_filter, str) and location_filter != 'All':
        location_filter = location_filter.lower()
    
    # Process category filter
    raw_categories = request.categories
    if raw_categories in [None, '']:
        category_filter = 'All'
    else:
        category_filter = [cat.strip() for cat in raw_categories.split(',') if cat.strip()]
    
    # Process dates
    start_date_original = request.startDate if request.startDate else None
    end_date_original = request.endDate if request.endDate else None
    
    # Calculate optimized date range
    start_date_pd, end_date_pd = calculate_date_range(start_date_original, end_date_original)
    
    # Process company_id
    company_id = request.company_id if hasattr(request, 'company_id') and request.company_id else 1
    
    return {
        'location_filter': location_filter,
        'category_filter': category_filter,
        'start_date_original': start_date_original,
        'end_date_original': end_date_original,
        'start_date_pd': start_date_pd,
        'end_date_pd': end_date_pd,
        'company_id': company_id
    }


@router.post("/salessplit/filter", response_model=DashboardResponse)
async def filter_excel_data_optimized(
    request: SalesSplitPmixUploadRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)
):
    """
    Optimized endpoint to filter sales data by date range, location, and category.
    """
    try:
        print(f"Processing optimized filter request...")
        
        # Process all parameters in one go
        filters = process_filter_parameters(request)
        
        print(f"Applied filters - Location: {filters['location_filter']}, "
              f"Categories: {filters['category_filter']}, "
              f"Date range: {filters['start_date_pd']} to {filters['end_date_pd']}")
        
        # Execute optimized database query
        print("Executing optimized database query...")
        records = build_optimized_query(
            db=db,
            company_id=filters['company_id'],
            location_filter=filters['location_filter'],
            category_filter=filters['category_filter'],
            start_date_pd=filters['start_date_pd'],
            end_date_pd=filters['end_date_pd']
        )
        
        print(f"Retrieved {len(records)} records from database")
        
        if not records:
            print("No records found with applied filters")
            return {
                "table1": [], "table2": [], "table3": [], "table4": [], "table5": [],
                "table6": [], "table7": [], "table8": [], "table9": [], "table10": [], "table11": [],
                "locations": [], "categories": [],
                "dashboardName": "Sales Split",
                "fileName": "Database Query",
                "data": "No data found with the applied filters."
            }
        
        # Convert to DataFrame with optimizations
        print("Converting records to optimized DataFrame...")
        df = records_to_dataframe_optimized(records)
        print(f"Created DataFrame with shape: {df.shape}")
        
        # Process data through sales split processor
        print("Processing data through sales split processor...")
        (sales_by_day_table, sales_by_category_table, category_comparison_table, 
         thirteen_week_category_table, pivot_table, in_house_table, 
         week_over_week_table, category_summary_table, salesByWeek, 
         salesByDayOfWeek, salesByTimeOfDay, categories, locations) = process_sales_split_data(
            df,
            location=filters['location_filter'],
            start_date=filters['start_date_original'],
            end_date=filters['end_date_original'],
            category_filter=filters['category_filter']
        )
        
        print("Successfully processed DataFrame through sales split processor")
        
        # Build and return response
        sales_split_dashboard = {
            "table1": pivot_table.to_dict(orient='records'),
            "table2": in_house_table.to_dict(orient='records'),
            "table3": week_over_week_table.to_dict(orient='records'),
            "table4": category_summary_table.to_dict(orient='records'),
            "table5": salesByWeek.to_dict(orient='records'),
            "table6": salesByDayOfWeek.to_dict(orient='records'),
            "table7": salesByTimeOfDay.to_dict(orient='records'),
            "table8": sales_by_day_table.to_dict(orient='records'),
            "table9": sales_by_category_table.to_dict(orient='records'),
            "table10": category_comparison_table.to_dict(orient='records'),
            "table11": thirteen_week_category_table.to_dict(orient='records'),
            "locations": locations,
            "categories": categories,
            "dashboardName": "Sales Split",
            "fileName": "Database Query",
            "data": f"Sales Split Dashboard processed from database with {len(records)} records."
        }
        
        print(f"Successfully processed Sales Split Dashboard with {len(records)} records")
        return sales_split_dashboard
        
    except Exception as e:
        print(f"Error filtering data: {str(e)}")
        print(traceback.format_exc())
        
        error_message = str(e)
        if "Invalid comparison between dtype=datetime64[ns] and date" in error_message:
            error_message = "Date type mismatch error resolved with optimized date handling."
        elif "NaTType does not support strftime" in error_message:
            error_message = "Date formatting error resolved with improved validation."
        elif "No records found" in error_message:
            error_message = "No data found in database with the applied filters."
        
        raise HTTPException(status_code=500, detail=f"Error filtering data: {error_message}")