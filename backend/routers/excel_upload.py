# router/excel_upload.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import pandas as pd
import numpy as np
import os
import datetime
import traceback
from datetime import date
from dateutil.relativedelta import relativedelta
from fastapi import Request
from sqlalchemy.orm import Session

# Import from local modules
from models.sales_pmix import SalesPMix
from models_pydantic import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse, DualDashboardResponse, DashboardResponse
from excel_processor import process_excel_file
# from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from constants import *

from crud.uploaded_files import upload_file_record
from schemas.uploaded_files import UploadedFileCreate
from dependencies.auth import get_current_active_user
from models.users import User
from fastapi import Depends
from database import Base, get_db
from crud.sales_pmix import insert_sales_pmix_df



# Import the return processor
from .excel_upload_return import process_dashboard_data

router = APIRouter(
    prefix="/api",
    tags=["excel_upload"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/excel/upload", response_model=DualDashboardResponse)
async def upload_excel(
    request: ExcelUploadRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    file_path = None  # Initialize in outer scope for access in except block
    try:
        print(f"Received file upload: {request.fileName}")
        
        # Decode base64 file content
        file_content = base64.b64decode(request.fileContent)
        print("Type of file_content:", type(file_content))
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp
        # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        safe_file_name = os.path.basename(request.fileName)  # Prevent path issues
        
        # Ensure the file name is safe and does not contain any path components
        file_name = f"{timestamp}_{safe_file_name}"
        # file_name = f"{timestamp}_{request.fileName}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        if request.location:
            print('Location:', request.location)
            print("Dashboard:", request.dashboard) 

            
        excel_data_copy = io.BytesIO(file_content)

        df = pd.read_excel(excel_data_copy)
        df.columns = df.columns.str.strip()

        if request.dashboard == "Sales Split and Product Mix" or request.dashboard == "Product Mix" or request.dashboard == "Sales Split":
            # Process the dashboard data using the separate module
                   
            # Strip whitespace from column names
            df.columns = df.columns.str.strip()

            # === Fill & Type Conversion ===
            int_cols = ['Qty']
            bool_cols = ['Void?', 'Deferred', 'Tax Exempt']
            float_cols = ['Net Price']
            date_cols = ['Sent Date']
            text_cols = ['Location', 'Dining Option']
            exclude_cols = [
                'Location', 'Order Id', 'Sent Date', 'Order Date', 'Check Id', 'Server', 'Table',
                'Dining Area', 'Service', 'Dining Option', 'Item Selection Id', 'Item Id',
                'Master Id', 'SKU', 'PLU', 'Menu Item', 'Menu Subgroup(s)', 'Menu Group',
                'Menu', 'Sales Category', 'Tax Inclusion Option', 'Dining Option Tax', 'Tab Name'
            ]

            df[int_cols] = df[int_cols].fillna(0).astype(int)
            df[bool_cols] = df[bool_cols].fillna(False).astype(bool)
            df[float_cols] = df[float_cols].fillna(0.0)
            df[text_cols] = df[text_cols].fillna('')
            df[exclude_cols] = df[exclude_cols].fillna('')

            fill_cols = [col for col in df.columns if col not in exclude_cols + int_cols + bool_cols + float_cols]
            df[fill_cols] = df[fill_cols].fillna(0)

            for col in date_cols:
                df[col] = pd.to_datetime(df[col], errors='coerce')

            df["Order Date"] = pd.to_datetime(df["Order Date"], dayfirst=False)
            df['Date'] = df['Order Date'].dt.date
            df["Order Date"] = df["Order Date"].dt.strftime('%m-%d-%Y')

            df['Date'] = df['Sent Date'].dt.date
            df['Time'] = df['Sent Date'].dt.time
            df['Day'] = df['Sent Date'].dt.day_name()
            df['Week'] = df['Sent Date'].dt.isocalendar().week
            df['Month'] = df['Sent Date'].dt.month_name()
            df['Quarter'] = df['Sent Date'].dt.quarter
            df['Year'] = df['Sent Date'].dt.year

            # === Dining Option Mapping ===
            in_house = ["Kiosk - Dine In", "Kiosk - Take Out", "Take Out - Cashier", "Take Out  - Cashier",
                        "Pick Up - Phone", "Inkind - Take Out", "Dine In", "Take Out"]
            one_p = ["Delivery - Phone", "ChowNow: Pick Up", "Lunchbox Delivery", "Lunchbox Pick Up",
                    "ChowNow: Delivery", "Online Ordering - Takeout"]
            dd = ["DoorDash Pick Up", "DoorDash Self-Delivery", "DoorDash - Takeout", "DoorDash - Delivery",
                "DoorDash - Pick Up", "DoorDash - Self-Delivery"]
            catering = ["EZ Cater - Pick Up", "LB Catering Delivery", "Catering Delivery - Phone",
                        "LB Catering Pick Up", "Ez Cater - Delivery", "Catering Pick Up - Phone",
                        "CaterCow - Delivery", "Fooda Pick up", "Sharebite - Pick Up"]
            gh = ["Grubhub Pick Up", "Grubhub Self - Delivery", "Grubhub - Takeout", "Grubhub - Delivery",
                "Grubhub - Pick Up", "Grubhub - Self-Delivery"]
            ub = ["UberEats Pick Up", "UberEats Self-Delivery", "UberEats - Takeout", "UberEats - Delivery",
                "UberEats - Pick Up", "UberEats - Self-Delivery", "Uber Eats - Delivery", "Uber Eats - Takeout",
                "Uber Eats - Pick Up", "Uber Eats - Self-Delivery"]

            conditions = [
                df["Dining Option"].isin(in_house),
                df["Dining Option"].isin(one_p),
                df["Dining Option"].isin(dd),
                df["Dining Option"].isin(catering),
                df["Dining Option"].isin(gh),
                df["Dining Option"].isin(ub)
            ]
            choices = ["In-House", "1P", "DD", "Catering", "GH", "UB"]
            df["Category"] = np.select(conditions, choices, default="Others")
            


            df = df.rename(columns={
                'Order Id': 'Order_Id',
                'Order #': 'Order_number',
                'Sent Date': 'Sent_Date',
                'Order Date': 'Order_Date',
                'Check Id': 'Check_Id',
                'Dining Area': 'Dining_Area',
                'Dining Option': 'Dining_Option',
                'Item Selection Id': 'Item_Selection_Id',
                'Item Id': 'Item_Id',
                'Master Id': 'Master_Id',
                'Menu Item': 'Menu_Item',
                'Menu Subgroup(s)': 'Menu_Subgroups',
                'Menu Group': 'Menu_Group',
                'Sales Category': 'Sales_Category',
                'Gross Price': 'Gross_Price',
                'Net Price': 'Net_Price',
                'Avg Price': 'Avg_Price',
                'Void?': 'Void',
                'Tax Exempt': 'Tax_Exempt',
                'Tax Inclusion Option': 'Tax_Inclusion_Option',
                'Dining Option Tax': 'Dining_Option_Tax',
                'Tab Name': 'Tab_Name',
                # add any other necessary renames...
            })
            
            if 'Avg_Price' not in df.columns:  # Updated column name
                df['Avg_Price'] = df['Net_Price'] / df['Qty']  # Updated column names
                
                
            # print("i am here in excel upload printing the columns of the dataframe", df.columns, "\n", df.dtypes , "\n", df.head())

            result = process_dashboard_data(request, df, file_name, request.company_id)
        else:
            result = process_dashboard_data(request, df, file_name, request.company_id)

        # Save file record to database *after* successful processing
        file_record = UploadedFileCreate(
            file_name=file_name,
            dashboard_name=request.dashboard,
            uploader_id=current_user.id
        )
        upload_file_record(db, file_record)
        
        print("i am here in excel uplaod printing the columns of the dataframe", df.columns, "\n", df.dtypes , "\n", df.head())
        
        # if request.dashboard == "Sales Split and Product Mix" or request.dashboard == "Product Mix" or request.dashboard == "Sales Split":
        #     # Insert the processed DataFrame into the database
                        
        #     # Assuming insert_sales_pmix_df is a function that handles the insertion
        #     insert_sales_pmix_df(db, df, request.company_id)


        # if request.dashboard == "Sales Split and Product Mix" or request.dashboard == "Product Mix" or request.dashboard == "Sales Split":
        #     try:
        #         print(f"Starting database insertion for {len(df)} records...")
                
        #         # Validate DataFrame structure before insertion
        #         required_columns = [
        #             'Location', 'Order_Id', 'Order_number', 'Sent_Date', 'Order_Date',
        #             'Check_Id', 'Server', 'Table', 'Dining_Area', 'Service', 'Dining_Option',
        #             'Item_Selection_Id', 'Item_Id', 'Master_Id', 'SKU', 'PLU', 'Menu_Item',
        #             'Menu_Subgroups', 'Menu_Group', 'Menu', 'Sales_Category', 'Gross_Price',
        #             'Discount', 'Net_Price', 'Qty', 'Avg_Price', 'Tax', 'Void', 'Deferred',
        #             'Tax_Exempt', 'Tax_Inclusion_Option', 'Dining_Option_Tax', 'Tab_Name',
        #             'Date', 'Time', 'Day', 'Week', 'Month', 'Quarter', 'Year', 'Category'
        #         ]
                
        #         missing_columns = [col for col in required_columns if col not in df.columns]
        #         if missing_columns:
        #             raise ValueError(f"Missing required columns: {missing_columns}")
                
        #         # Clean and validate data before insertion
        #         df_clean = df.copy()
                
        #         # Handle None/NaN values that could cause issues
        #         df_clean = df_clean.where(pd.notnull(df_clean), None)
                
        #         # Ensure proper data types for problematic fields
        #         if 'Order_Id' in df_clean.columns:
        #             # Convert to int64 to handle large numbers, replace NaN with None
        #             df_clean['Order_Id'] = df_clean['Order_Id'].astype('Int64').replace({pd.NA: None})
                
        #         if 'Week' in df_clean.columns:
        #             # Convert Week to regular int, handle NaN
        #             df_clean['Week'] = df_clean['Week'].astype('Int64').replace({pd.NA: None})
                
        #         # Convert datetime columns to ensure proper format
        #         datetime_columns = ['Sent_Date']
        #         for col in datetime_columns:
        #             if col in df_clean.columns:
        #                 df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')
                
        #         # Convert string representations of dates/times to strings
        #         string_columns = ['Date', 'Time', 'Order_Date']
        #         for col in string_columns:
        #             if col in df_clean.columns:
        #                 df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
                
        #         print(f"Data validation completed. Inserting {len(df_clean)} records...")
                
        #         # Insert the processed DataFrame into the database with error handling
        #         inserted_count = insert_sales_pmix_df(db, df_clean, request.company_id)
                
        #         print(f"Successfully inserted {inserted_count} records into sales_pmix table")
                
        #         # Optional: Add to result for user feedback
        #         if hasattr(result, '__dict__'):
        #             result.database_records_inserted = inserted_count
                
        #     except Exception as db_error:
        #         print(f"Database insertion error: {str(db_error)}")
        #         print(f"DataFrame info: Shape={df.shape}, Columns={list(df.columns)}")
        #         print(f"Sample data types: {df.dtypes.head(10)}")
                
        #         # Rollback the database transaction
        #         db.rollback()
                
        #         # Still save the file record but log the database error
        #         print("Database insertion failed, but file processing succeeded")
                
        #         # Optionally, you can choose to raise the error or continue
        #         # For now, let's log it but continue (file is still processed successfully)
        #         # If you want to fail completely, uncomment the next line:
        #         # raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(db_error)}")
                
        #     except ValueError as validation_error:
        #         print(f"Data validation error: {str(validation_error)}")
        #         raise HTTPException(
        #             status_code=400, 
        #             detail=f"Data validation failed: {str(validation_error)}"
        #         )


        if request.dashboard == "Sales Split and Product Mix" or request.dashboard == "Product Mix" or request.dashboard == "Sales Split":
            try:
                print(f"Starting database insertion for {len(df)} records...")
                
                # Validate DataFrame structure before insertion
                required_columns = [
                    'Location', 'Order_Id', 'Order_number', 'Sent_Date', 'Order_Date',
                    'Check_Id', 'Server', 'Table', 'Dining_Area', 'Service', 'Dining_Option',
                    'Item_Selection_Id', 'Item_Id', 'Master_Id', 'SKU', 'PLU', 'Menu_Item',
                    'Menu_Subgroups', 'Menu_Group', 'Menu', 'Sales_Category', 'Gross_Price',
                    'Discount', 'Net_Price', 'Qty', 'Avg_Price', 'Tax', 'Void', 'Deferred',
                    'Tax_Exempt', 'Tax_Inclusion_Option', 'Dining_Option_Tax', 'Tab_Name',
                    'Date', 'Time', 'Day', 'Week', 'Month', 'Quarter', 'Year', 'Category'
                ]
                
                missing_columns = [col for col in required_columns if col not in df.columns]
                if missing_columns:
                    raise ValueError(f"Missing required columns: {missing_columns}")
                
                # Clean and validate data before insertion
                df_clean = df.copy()
                
                # Handle None/NaN values that could cause issues
                df_clean = df_clean.where(pd.notnull(df_clean), None)
                
                # Ensure proper data types for problematic fields
                if 'Order_Id' in df_clean.columns:
                    # Convert to int64 to handle large numbers, replace NaN with None
                    df_clean['Order_Id'] = df_clean['Order_Id'].astype('Int64').replace({pd.NA: None})
                
                if 'Week' in df_clean.columns:
                    # Convert Week to regular int, handle NaN
                    df_clean['Week'] = df_clean['Week'].astype('Int64').replace({pd.NA: None})
                
                # Convert datetime columns to ensure proper format
                datetime_columns = ['Sent_Date']
                for col in datetime_columns:
                    if col in df_clean.columns:
                        df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')
                
                # Convert string representations of dates/times to strings
                string_columns = ['Date', 'Time', 'Order_Date']
                for col in string_columns:
                    if col in df_clean.columns:
                        df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
                
                print(f"Data validation completed. Checking for existing records...")
                
                # ===== DUPLICATE DETECTION LOGIC =====
                
                # Option 1: Check for existing records by date range and location
                if not df_clean.empty and 'Sent_Date' in df_clean.columns:
                    date_min = df_clean['Sent_Date'].min()
                    date_max = df_clean['Sent_Date'].max()
                    location = df_clean['Location'].iloc[0] if 'Location' in df_clean.columns else None
                    
                    # Query for existing records in the same date range
                    existing_query = db.query(SalesPMix).filter(
                        SalesPMix.company_id == request.company_id,
                        SalesPMix.Sent_Date >= date_min,
                        SalesPMix.Sent_Date <= date_max
                    )
                    
                    if location:
                        existing_query = existing_query.filter(SalesPMix.Location == location)
                    
                    existing_count = existing_query.count()
                    
                    if existing_count > 0:
                        print(f"Found {existing_count} existing records in database for date range {date_min} to {date_max}")
                        
                        # Give user options for handling duplicates
                        user_choice = "replace"  # You can make this configurable via request parameter
                        
                        if user_choice == "replace":
                            print("Deleting existing records before inserting new ones...")
                            deleted_count = existing_query.delete(synchronize_session=False)
                            print(f"Deleted {deleted_count} existing records")
                            
                        elif user_choice == "skip":
                            print("Skipping insertion due to existing records")
                            return result
                            
                        elif user_choice == "append":
                            print("Proceeding with insertion (may create duplicates)")
                            # Continue with insertion without deleting
                    
                    else:
                        print("No existing records found for this date range")
                
                # Option 2: Filter out individual duplicate records (more precise)
                # Uncomment this section if you prefer record-level duplicate checking
                """
                if not df_clean.empty:
                    # Create a list of unique identifiers for existing records
                    order_ids = df_clean['Order_Id'].dropna().unique().tolist()
                    check_ids = df_clean['Check_Id'].dropna().unique().tolist()
                    
                    if order_ids or check_ids:
                        existing_records = db.query(SalesPMix).filter(
                            SalesPMix.company_id == request.company_id,
                            or_(
                                SalesPMix.Order_Id.in_(order_ids) if order_ids else False,
                                SalesPMix.Check_Id.in_(check_ids) if check_ids else False
                            )
                        ).all()
                        
                        if existing_records:
                            existing_order_ids = {r.Order_Id for r in existing_records if r.Order_Id}
                            existing_check_ids = {r.Check_Id for r in existing_records if r.Check_Id}
                            
                            # Filter out rows that already exist
                            original_len = len(df_clean)
                            df_clean = df_clean[
                                ~((df_clean['Order_Id'].isin(existing_order_ids)) | 
                                  (df_clean['Check_Id'].isin(existing_check_ids)))
                            ]
                            filtered_len = len(df_clean)
                            
                            print(f"Filtered out {original_len - filtered_len} duplicate records")
                            
                            if df_clean.empty:
                                print("All records already exist in database. Skipping insertion.")
                                return result
                """
                
                print(f"Proceeding with insertion of {len(df_clean)} records...")
                
                # Insert the processed DataFrame into the database with error handling
                inserted_count = insert_sales_pmix_df(db, df_clean, request.company_id)
                
                print(f"Successfully inserted {inserted_count} records into sales_pmix table")
                
                # Optional: Add to result for user feedback
                if hasattr(result, '__dict__'):
                    result.database_records_inserted = inserted_count
                
            except Exception as db_error:
                print(f"Database insertion error: {str(db_error)}")
                print(f"DataFrame info: Shape={df.shape}, Columns={list(df.columns)}")
                print(f"Sample data types: {df.dtypes.head(10)}")
                
                # Rollback the database transaction
                db.rollback()
                
                # Still save the file record but log the database error
                print("Database insertion failed, but file processing succeeded")
                
                # Optionally, you can choose to raise the error or continue
                # For now, let's log it but continue (file is still processed successfully)
                # raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(db_error)}")
                
            except ValueError as validation_error:
                print(f"Data validation error: {str(validation_error)}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Data validation failed: {str(validation_error)}"
                )

        return result

    except Exception as e:
        print(traceback.format_exc())

        # Delete the file if it was already saved
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted file due to error: {file_path}")

        error_message = str(e)
        if "Net Price" in error_message:
            raise HTTPException(
                status_code=400,
                detail=f"You uploaded the file in the wrong dashboard i.e. ({request.dashboard}) or the file is not properly structured. Please check the help center for more details."
            )

        raise HTTPException(status_code=500, detail=f"Error processing file: {error_message}")
