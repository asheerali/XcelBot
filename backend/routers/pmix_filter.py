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
from models_pydantic import DashboardResponse, SalesSplitPmixUploadRequest
from pmix_dashboard.pmix_processor import process_pmix_file
from models.sales_pmix import SalesPMix  # Import the SQLAlchemy model
from database import get_db

router = APIRouter(
    prefix="/api",
    tags=["pmix_filter"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/pmix/filter", response_model=DashboardResponse)
async def filter_pmix_data(
    request: SalesSplitPmixUploadRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Endpoint to filter previously processed PMIX data by date range and location from database.
    No authentication required.
    """
    print("Received request for PMIX filter with data:", request)
    try:
        print(f"Processing PMIX filter request...")
        
        # Extract filter parameters
        if hasattr(request, 'location') and request.location == "Multiple Locations":
            location_filter = "All"
        else:
            raw_locations = request.locations
            if raw_locations in [None, '', []] or not raw_locations:
                location_filter = 'All'
            elif isinstance(raw_locations, list):
                # If it's already a list, use it directly (filter out empty strings)
                location_filter = [loc.strip() for loc in raw_locations if loc and loc.strip()]
                if not location_filter:  # If list becomes empty after filtering
                    location_filter = 'All'
            else:
                # If it's a string, split by comma
                location_filter = [loc.strip() for loc in raw_locations.split(',') if loc.strip()]
                if not location_filter:  # If list becomes empty after filtering
                    location_filter = 'All'
        
        
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
        
        # Process server filter
        raw_servers = request.servers
        if raw_servers in [None, '', []] or not raw_servers:
            server_filter = 'All'
        elif isinstance(raw_servers, list):
            # If it's already a list, use it directly (filter out empty strings)
            server_filter = [srv.strip() for srv in raw_servers if srv and srv.strip()]
            if not server_filter:  # If list becomes empty after filtering
                server_filter = 'All'
        else:
            # If it's a string, split by comma
            server_filter = [srv.strip() for srv in raw_servers.split(',') if srv.strip()]
            if not server_filter:  # If list becomes empty after filtering
                server_filter = 'All'
        
        # Process categories filter
        raw_categories = request.categories
        if raw_categories in [None, '', []] or not raw_categories:
            category_filter = 'All'
        elif isinstance(raw_categories, list):
            # If it's already a list, use it directly (filter out empty strings)
            category_filter = [cat.strip() for cat in raw_categories if cat and cat.strip()]
            if not category_filter:  # If list becomes empty after filtering
                category_filter = 'All'
        else:
            # If it's a string, split by comma
            category_filter = [cat.strip() for cat in raw_categories.split(',') if cat.strip()]
            if not category_filter:  # If list becomes empty after filtering
                category_filter = 'All'
        
        print(f"Filters applied - Location: {location_filter} (type: {type(location_filter)}), Start: {start_date_pd}, End: {end_date_pd}, Server: {server_filter} (type: {type(server_filter)}), Categories: {category_filter} (type: {type(category_filter)})")
        
        # ===== QUERY DATABASE INSTEAD OF FILE =====
        print("Querying database for PMIX data...")
        
        # Handle company_id
        if not hasattr(request, 'company_id') or not request.company_id:
            company_id = 1  # Default fallback
            print(f"Warning: No company_id provided, using default: {company_id}")
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
        
        print("Checking date filters - start_date_pd:", start_date_pd, "end_date_pd:", end_date_pd)
        
        # Apply location filter
        if location_filter != "All" and location_filter:
            if isinstance(location_filter, list):
                query = query.filter(SalesPMix.Location.in_(location_filter))
            else:
                query = query.filter(SalesPMix.Location == location_filter)
        
        # Apply server filter
        if server_filter != "All" and server_filter:
            if isinstance(server_filter, list):
                query = query.filter(SalesPMix.Server.in_(server_filter))
            else:
                query = query.filter(SalesPMix.Server == server_filter)
        
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
                "table12": [],
                "table13": [],
                "locations": [],
                "servers": [],
                "categories": [],
                "dateRanges": [],
                "fileName": "Database Query",
                "dashboardName": "Product Mix",
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
        
        # CRITICAL FIX: Re-derive date/time columns from Sent_Date
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
        print(f"DataFrame dtypes verified:")
        for col in ['Sent_Date', 'Date', 'Order_Date']:
            if col in df.columns:
                print(f"  {col}: {df[col].dtype}")
        
        # ===== PROCESS THE DATA =====
        print("Processing data for PMIX dashboard...")
        print(f"DataFrame columns: {list(df.columns)}")
        print(f"Sample Sent_Date values: {df['Sent_Date'].head(3).tolist() if 'Sent_Date' in df.columns else 'N/A'}")
        
        try:
            # Save DataFrame to temporary file for processing (if your process_pmix_file expects a file)
            # OR modify process_pmix_file to accept DataFrame directly
            temp_file_path = os.path.join(UPLOAD_DIR, f"temp_pmix_{company_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl")
            df.to_pickle(temp_file_path)  # Save as pickle to preserve data types
            
            print("i am here in pmix_filter.py checking the category_filter", category_filter, "and the request", request)
            
            print(" i am here in pmix_filter.py before calling process_pmix_file with DataFrame")
            # Process the data using existing pmix processor
            # NOTE: You may need to modify process_pmix_file to accept DataFrame or pickle file
            (net_sales, 
            orders, 
            qty_sold, 
            sales_by_category_df, 
            sales_by_menu_group_df, 
            sales_by_server_df, 
            top_selling_items_df, 
            sales_by_location_df, 
            average_price_by_item_df, 
            average_order_value, 
            average_items_per_order, 
            price_changes_df, 
            top_items_df, 
            unique_orders, 
            total_quantity, 
            locations, 
            server, 
            category, 
            net_sales_change, 
            orders_change, 
            qty_sold_change, 
            average_order_value_change,
            average_items_per_order_change,
            unique_orders_change,
            total_quantity_change,
            sales_by_category_tables_df, 
            category_comparison_table_df, 
            sales_by_category_by_day_table_df,
            top_vs_bottom_comparison_df
            ) = process_pmix_file(
                df,  # Pass DataFrame directly OR temp_file_path if file is expected
                location_filter=location_filter,
                start_date=start_date_original, 
                end_date=end_date_original,
                server_filter=server_filter,
                category_filter=category_filter
            )
            
            # Clean up temporary file if created
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
            print("Successfully processed DataFrame through PMIX processor")
                    
        except Exception as processing_error:
            print(f"Error in process_pmix_file: {str(processing_error)}")
            print(f"DataFrame dtypes: {df.dtypes.to_dict()}")
            print(f"DataFrame shape: {df.shape}")
            print(f"Sample DataFrame head: {df.head(2).to_dict()}")
            
            # Clean up temporary file on error
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            
            raise HTTPException(
                status_code=500, 
                detail=f"Error processing PMIX dashboard data: {str(processing_error)}"
            )
        
        # ===== BUILD RESPONSE =====
        pmix_dashboard = {
            "table1": [{
                        "net_sales": [float(net_sales)],
                        "orders": [int(orders)],
                        "qty_sold": [int(qty_sold)],
                        "average_order_value": [float(average_order_value)],
                        "average_items_per_order": [float(average_items_per_order)],
                        "unique_orders": [int(unique_orders)],
                        "total_quantity": [int(total_quantity)],
                        
                        "net_sales_change": [float(net_sales_change)],
                        "orders_change": [int(orders_change)],
                        "qty_sold_change": [int(qty_sold_change)],
                        "average_order_value_change": [float(average_order_value_change)],
                        "average_items_per_order_change": [float(average_items_per_order_change)],
                        "unique_orders_change": [int(unique_orders_change)],
                        "total_quantity_change": [int(total_quantity_change)]
                    }],
            "table2": sales_by_category_df.to_dict(orient='records'),
            "table3": sales_by_menu_group_df.to_dict(orient='records'),
            "table4": sales_by_server_df.to_dict(orient='records'),
            "table5": top_selling_items_df.to_dict(orient='records'),
            "table6": sales_by_location_df.to_dict(orient='records'),
            "table7": average_price_by_item_df.to_dict(orient='records'),
            "table8": price_changes_df.to_dict(orient='records'),
            "table9": top_items_df.to_dict(orient='records'),
            "table10": sales_by_category_tables_df.to_dict(orient='records'),
            "table11": category_comparison_table_df.to_dict(orient='records'),
            "table12": top_vs_bottom_comparison_df.to_dict(orient='records'),
            "table13": sales_by_category_by_day_table_df.to_dict(orient='records'),
            "locations": locations,
            "servers": server,
            "categories": category,
            "dateRanges": [],
            "fileName": "Database Query",  # Changed from request.fileName
            "dashboardName": "Product Mix",
            "data": f"Product Mix Dashboard processed from database with {len(records)} records."
        }
        
        print(f"Successfully processed PMIX Dashboard with {len(records)} records")
        
        
        print("--------------------------------------------")
        print(pmix_dashboard)  # Log the dashboard structure for debugging
        print("--------------------------------------------")
        
        return pmix_dashboard
    
    except Exception as e:
        # Log the full exception for debugging
        error_message = str(e)
        print(f"Error processing PMIX filter: {error_message}")
        print(traceback.format_exc())
        
        # Handle specific error cases
        if "Invalid comparison between dtype=datetime64[ns] and date" in error_message:
            error_message = "Date type mismatch error. This has been fixed by ensuring all date parameters are pandas datetime objects."
        elif "NaTType does not support strftime" in error_message:
            error_message = "Date formatting error. This usually happens with invalid date values in your data."
        elif "No records found" in error_message:
            error_message = "No data found in database with the applied filters."
        elif "Net Price" in error_message:
            error_message = f"Data structure error. Please check if the database contains properly formatted PMIX data."
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error processing PMIX filter: {error_message}")