from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
import pandas as pd
from datetime import datetime, timedelta
import traceback
from sqlalchemy.orm import Session

# Import from local modules
from models_pydantic import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, DashboardResponse, SalesSplitPmixUploadRequest
from excel_processor import process_excel_file
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file
from sales_split_dashboard.sales_split_prcoessor import process_sales_split_file as process_sales_split_data  # Changed to process_sales_split_data
from models.sales_pmix import SalesPMix  # Import the SQLAlchemy model
from database import get_db
from schemas import users as user_schema
from dependencies.auth import get_current_user


# Directory to save uploaded files
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/api",
    tags=["sales_split_filter"],
)


@router.post("/salessplit/filter", response_model=DashboardResponse)
async def filter_excel_data(
    request: SalesSplitPmixUploadRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_user)

):
    """
    Endpoint to filter previously processed Excel data by date range and location from database.
    No authentication required.
    """
    print(f"Received filter request: {request}")
    try:
        print(f"Processing filter request...")
        
        # Extract filter parameters
        if request.location == "Multiple Locations":
            location_filter = "All"
        else:
            location_filter = request.locations if request.locations else 'All'
                    
                # Convert all locations to lowercase if it's a list
        if isinstance(location_filter, list):
            location_filter = [loc.lower() for loc in location_filter]
        elif isinstance(location_filter, str) and location_filter != 'All':
            location_filter = location_filter.lower()

        # FIXED: Convert dates to pandas datetime objects immediately
        start_date_original = request.startDate if request.startDate else None
        end_date_original = request.endDate if request.endDate else None
        
        # Convert to pandas datetime for consistent handling
        start_date_pd = None
        end_date_pd = None
        
        if start_date_original:
            start_date_pd = pd.to_datetime(start_date_original)
            print(f"Converted start_date to pandas datetime: {start_date_pd}")

        if end_date_original:
            end_date_pd = pd.to_datetime(end_date_original)
            print(f"Converted end_date to pandas datetime: {end_date_pd}")


        if end_date_original:
            print("i am here in the sales split filter checking the start_date_original and end_date_original", start_date_original, end_date_original)
            print("i am here in the sales split filter checking", f"Start date pd: {start_date_pd}, End date pd: {end_date_pd}")
            print("-------------------------------------------------------------------------------------")
            print(f"  Start date pd: {start_date_pd} (Day: {start_date_pd.day}, Month: {start_date_pd.month})")
            print(f"  End date pd:   {end_date_pd} (Day: {end_date_pd.day}, Month: {end_date_pd.month})")
            
            
            # Add one day
            # start_date_plus_one = start_date_pd + timedelta(days=1)
            end_date_plus_one = end_date_pd + timedelta(days=1) if end_date_pd else None
            print(f"End date plus one day: {end_date_plus_one}")
            end_date_pd = end_date_plus_one if end_date_plus_one else None

            days_to_add = 6 - end_date_pd.weekday()
            end_date_pd = end_date_pd + pd.Timedelta(days=days_to_add)
            print(f"end date end of the week: {end_date_pd}")
            
            # monday_this_week = end_date_pd - pd.Timedelta(days=end_date_pd.weekday())

            # start_date_pd = monday_this_week - pd.Timedelta(weeks=1)
            
                    
            # Get the most recent after the end_date
            # last_sunday = sunday_of_week - pd.Timedelta(days=(end_date_pd.weekday() + 1))

            # Monday of that week
            start_date_pd = end_date_pd - pd.Timedelta(days=91)

            print(f"Start date pd: {start_date_pd} (Day: {start_date_pd.day}, Month: {start_date_pd.month})")
        # Process categories filter
        raw_categories = request.categories
        if raw_categories in [None, '']:
            category_filter = 'All'
        else:
            category_filter = [cat.strip() for cat in raw_categories.split(',') if cat.strip()]
        
        print(f"Filters applied - Location: {location_filter}, Start: {start_date_pd}, End: {end_date_pd}, Categories: {category_filter}")
        
        # ===== QUERY DATABASE INSTEAD OF FILE =====
        print("Querying database for sales data...")
        
        # Handle company_id
        if not hasattr(request, 'company_id') or not request.company_id:
            company_id = 1  # Default fallback
        else:
            company_id = request.company_id
        
        print(f"Using company_id: {company_id}")
        
        # Build the base query
        query = db.query(SalesPMix).filter(SalesPMix.company_id == company_id)
        
        # Apply date filters using pandas datetime objects
        if start_date_pd is not None:
            query = query.filter(SalesPMix.Sent_Date >= start_date_pd)
            
        if end_date_pd is not None:
            end_datetime = end_date_pd + timedelta(days=1)  # Include end date
            query = query.filter(SalesPMix.Sent_Date < end_datetime)
        
        print("i am here in the filter_excel_data checking the start_date_pd and end_date_pd", start_date_pd, end_date_pd)
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
        
        # Execute query and get results
        records = query.all()
        print(f"Retrieved {len(records)} records from database")
        
        if not records:
            print("No records found with applied filters")
            # Return empty dashboard structure
            empty_dashboard = {
                "table1": [],
                "table2": [],
                "table3": [],
                "table4": [],
                "table5": [],
                "table6": [],
                "table7": [],
                "table8": [],
                "table9": [],
                "table10": [],
                "table11": [],
                "locations": [],
                "categories": [],
                "dashboardName": "Sales Split",
                "fileName": "Database Query",
                "data": "No data found with the applied filters."
            }
            return empty_dashboard
        
    
        # ===== CONVERT TO DATAFRAME =====
        print("Converting database records to DataFrame...")
        
        # Convert SQLAlchemy objects to DataFrame
        df_data = []
        for record in records:
            # Convert each record to dictionary
            record_dict = {
                'Location': record.Location,
                'Order_Id': record.Order_Id,
                'Order_number': record.Order_number,
                'Sent_Date': record.Sent_Date,  # Keep as datetime
                'Order_Date': record.Order_Date,
                'Check_Id': record.Check_Id,
                'Server': record.Server,
                'Table': record.Table,
                'Dining_Area': record.Dining_Area,
                'Service': record.Service,
                'Dining_Option': record.Dining_Option,
                'Item_Selection_Id': record.Item_Selection_Id,
                'Item_Id': record.Item_Id,
                'Master_Id': record.Master_Id,
                'SKU': record.SKU,
                'PLU': record.PLU,
                'Menu_Item': record.Menu_Item,
                'Menu_Subgroups': record.Menu_Subgroups,
                'Menu_Group': record.Menu_Group,
                'Menu': record.Menu,
                'Sales_Category': record.Sales_Category,
                'Gross_Price': record.Gross_Price,
                'Discount': record.Discount,
                'Net_Price': record.Net_Price,
                'Qty': record.Qty,
                'Avg_Price': record.Avg_Price,
                'Tax': record.Tax,
                'Void': record.Void,
                'Deferred': record.Deferred,
                'Tax_Exempt': record.Tax_Exempt,
                'Tax_Inclusion_Option': record.Tax_Inclusion_Option,
                'Dining_Option_Tax': record.Dining_Option_Tax,
                'Tab_Name': record.Tab_Name,
                'Date': record.Date,
                'Time': record.Time,
                'Day': record.Day,
                'Week': record.Week,
                'Month': record.Month,
                'Quarter': record.Quarter,
                'Year': record.Year,
                'Category': record.Category
            }
            df_data.append(record_dict)
        
        # Create DataFrame
        df = pd.DataFrame(df_data)
        print(f"Created DataFrame with shape: {df.shape}")
        
        # ===== FIX DATA TYPES - ENSURE ALL DATE COLUMNS ARE datetime64[ns] =====
        print("Converting data types...")
        
        # Convert all date columns to datetime64[ns] consistently
        date_columns = ['Sent_Date', 'Order_Date', 'Date']
        for col in date_columns:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
                print(f"Converted {col} to datetime64[ns]: {df[col].dtype}")
        
        # CRITICAL FIX: Re-derive date/time columns from Sent_Date but keep them as datetime64[ns]
        if 'Sent_Date' in df.columns and not df['Sent_Date'].isna().all():
            print("Re-deriving date/time columns from Sent_Date...")
            
            # Keep Date as datetime64[ns] (DO NOT convert to .dt.date)
            df['Date'] = df['Sent_Date'].dt.normalize()  # This keeps it as datetime64[ns] but sets time to 00:00:00
            
            # Convert Time to string to avoid any datetime comparison issues
            df['Time'] = df['Sent_Date'].dt.strftime('%H:%M:%S')
            
            # Re-derive other time components
            df['Day'] = df['Sent_Date'].dt.day_name()
            df['Week'] = df['Sent_Date'].dt.isocalendar().week
            df['Month'] = df['Sent_Date'].dt.month_name()
            df['Quarter'] = df['Sent_Date'].dt.quarter
            df['Year'] = df['Sent_Date'].dt.year
        
        # Convert numeric columns to proper types
        numeric_columns = ['Gross_Price', 'Net_Price', 'Qty', 'Avg_Price', 'Tax', 'Discount']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        # Convert boolean columns
        boolean_columns = ['Void', 'Deferred', 'Tax_Exempt']
        for col in boolean_columns:
            if col in df.columns:
                df[col] = df[col].astype(bool)
        
        # Convert integer columns
        integer_columns = ['Order_Id', 'Order_number', 'Check_Id', 'Item_Selection_Id', 
                          'Item_Id', 'Master_Id', 'Week', 'Quarter', 'Year']
        for col in integer_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype('Int64')
        
        print("Data type conversion completed")
        print(f"Sent_Date dtype: {df['Sent_Date'].dtype if 'Sent_Date' in df.columns else 'Not found'}")
        print(f"Date dtype: {df['Date'].dtype if 'Date' in df.columns else 'Not found'}")
        print(f"Date range: {df['Sent_Date'].min()} to {df['Sent_Date'].max()}" if 'Sent_Date' in df.columns and not df['Sent_Date'].isna().all() else "No valid dates")
        
        # Verify all date columns are now datetime64[ns]
        for col in ['Sent_Date', 'Date', 'Order_Date']:
            if col in df.columns:
                if not pd.api.types.is_datetime64_any_dtype(df[col]):
                    print(f"WARNING: {col} is not datetime64[ns]: {df[col].dtype}")
                else:
                    print(f"✓ {col} is properly datetime64[ns]: {df[col].dtype}")
                    
            date_cols = ['Sent_Date']
            for col in date_cols:
                df[col] = pd.to_datetime(df[col], errors='coerce')

            df["Order_Date"] = pd.to_datetime(df["Order_Date"], dayfirst=False)
            df['Date'] = df['Order_Date'].dt.date
            df["Order_Date"] = df["Order_Date"].dt.strftime('%m-%d-%Y')

            df['Date'] = df['Sent_Date'].dt.date
            df['Time'] = df['Sent_Date'].dt.time
            df['Day'] = df['Sent_Date'].dt.day_name()
            df['Week'] = df['Sent_Date'].dt.isocalendar().week
            df['Month'] = df['Sent_Date'].dt.month_name()
            df['Quarter'] = df['Sent_Date'].dt.quarter
            df['Year'] = df['Sent_Date'].dt.year
            
        
        # ===== PROCESS THE DATA =====
        print("Processing data for dashboard...")
        print(f"DataFrame columns: {list(df.columns)}")
        print(f"Sample Sent_Date values: {df['Sent_Date'].head(3).tolist() if 'Sent_Date' in df.columns else 'N/A'}")
        print(f"Date column dtype: {df['Date'].dtype if 'Date' in df.columns else 'N/A'}")
        
        # print("i am here in the filter_excel_data checking the df", df)

        # FIXED: Pass pandas datetime objects to the processing function
        (sales_by_day_table, 
        sales_by_category_table, 
        category_comparison_table, 
        thirteen_week_category_table, 
        pivot_table, 
        in_house_table, 
        week_over_week_table, 
        category_summary_table, 
        salesByWeek, 
        salesByDayOfWeek, 
        salesByTimeOfDay, 
        categories, 
        locations) = process_sales_split_data(
                df,  # Pass DataFrame directly
                location=location_filter,
                start_date=start_date_original,  # Pass pandas datetime objects
                end_date=end_date_original,      # Pass pandas datetime objects
                category_filter=category_filter
            )
        print("Successfully processed DataFrame through sales split processor")
        # ===== BUILD RESPONSE =====
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
            "fileName": "Database Query",  # Changed from request.fileName
            "data": f"Sales Split Dashboard processed from database with {len(records)} records."
        }

        print(f"Successfully processed Sales Split Dashboard with {len(records)} records")
        return sales_split_dashboard
        
    except Exception as e:
        # Log the full exception for debugging
        print(f"Error filtering data: {str(e)}")
        print(traceback.format_exc())
        
        # Return a more specific error message
        error_message = str(e)
        if "Invalid comparison between dtype=datetime64[ns] and date" in error_message:
            error_message = "Date type mismatch error. This has been fixed by ensuring all date parameters are pandas datetime objects."
        elif "NaTType does not support strftime" in error_message:
            error_message = "Date formatting error. This usually happens with invalid date values in your data."
        elif "No records found" in error_message:
            error_message = "No data found in database with the applied filters."
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error filtering data: {error_message}")