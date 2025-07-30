
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models.sales_pmix import SalesPMix
from typing import List, Tuple

# def check_and_filter_duplicates_sales_pmix(
#     db: Session, 
#     df_clean: pd.DataFrame, 
#     company_id: int
# ) -> Tuple[pd.DataFrame, int, int]:
#     """
#     Check for duplicate records and filter them out before database insertion.
    
#     Args:
#         db: Database session
#         df_clean: Cleaned DataFrame to check for duplicates
#         company_id: Company ID for filtering
    
#     Returns:
#         Tuple of (filtered_dataframe, new_records_count, duplicates_count)
#     """
    
#     if df_clean.empty:
#         return df_clean, 0, 0
    
#     print(f"Starting duplicate check for {len(df_clean)} records...")
    
#     # Define the columns that make up a unique record
#     # You can adjust these based on your business logic
#     unique_identifier_columns = [
#         'Sent_Date', 'Order_Date', 'Net_Price', 'Location', 
#         'Qty', 'Menu_Item', 'Order_Id'
#     ]
    
#     # Get the date range from the new data to optimize the query
#     min_sent_date = df_clean['Sent_Date'].min()
#     max_sent_date = df_clean['Sent_Date'].max()
    
#     print(f"Checking for duplicates in date range: {min_sent_date} to {max_sent_date}")
    
#     try:
#         # Query existing records from database using SQLAlchemy ORM
#         # This is more efficient than loading all records
#         existing_records_query = db.query(SalesPMix).filter(
#             and_(
#                 SalesPMix.company_id == company_id,
#                 or_(
#                     and_(
#                         SalesPMix.Sent_Date >= min_sent_date,
#                         SalesPMix.Sent_Date <= max_sent_date
#                     ),
#                     and_(
#                         SalesPMix.Order_Date >= min_sent_date.strftime('%m-%d-%Y') if min_sent_date else None,
#                         SalesPMix.Order_Date <= max_sent_date.strftime('%m-%d-%Y') if max_sent_date else None
#                     )
#                 )
#             )
#         )
        
#         # Convert to DataFrame for easier comparison
#         existing_records = []
#         for record in existing_records_query:
#             record_dict = {}
#             for col in unique_identifier_columns:
#                 record_dict[col] = getattr(record, col, None)
#             existing_records.append(record_dict)
        
#         existing_df = pd.DataFrame(existing_records)
#         print(f"Found {len(existing_df)} existing records in database for comparison")
        
#         if existing_df.empty:
#             print("No existing records found. All records will be inserted.")
#             return df_clean, len(df_clean), 0
        
#         # Normalize data types for comparison
#         df_comparison = df_clean.copy()
        
#         # Handle datetime columns
#         for col in ['Sent_Date']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = pd.to_datetime(existing_df[col], errors='coerce')
#                 df_comparison[col] = pd.to_datetime(df_comparison[col], errors='coerce')
        
#         # Handle string date columns
#         for col in ['Order_Date']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = existing_df[col].astype(str).replace('None', '').replace('nan', '')
#                 df_comparison[col] = df_comparison[col].astype(str).replace('None', '').replace('nan', '')
        
#         # Handle numeric columns
#         for col in ['Net_Price', 'Qty', 'Order_Id']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = pd.to_numeric(existing_df[col], errors='coerce').fillna(0)
#                 df_comparison[col] = pd.to_numeric(df_comparison[col], errors='coerce').fillna(0)
        
#         # Handle string columns
#         for col in ['Location', 'Menu_Item']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = existing_df[col].astype(str).fillna('').str.strip()
#                 df_comparison[col] = df_comparison[col].astype(str).fillna('').str.strip()
        
#         # Create composite keys for comparison
#         def create_composite_key(row, columns):
#             """Create a composite key from specified columns"""
#             key_parts = []
#             for col in columns:
#                 if col in row.index:
#                     val = row[col]
#                     if pd.isna(val) or val is None:
#                         key_parts.append('NULL')
#                     else:
#                         key_parts.append(str(val))
#                 else:
#                     key_parts.append('NULL')
#             return '|'.join(key_parts)
        
#         # Create composite keys
#         existing_df['composite_key'] = existing_df.apply(
#             lambda row: create_composite_key(row, unique_identifier_columns), axis=1
#         )
        
#         df_comparison['composite_key'] = df_comparison.apply(
#             lambda row: create_composite_key(row, unique_identifier_columns), axis=1
#         )
        
#         # Find duplicates
#         existing_keys = set(existing_df['composite_key'].tolist())
#         duplicate_mask = df_comparison['composite_key'].isin(existing_keys)
        
#         duplicates_count = duplicate_mask.sum()
#         new_records_count = len(df_comparison) - duplicates_count
        
#         print(f"Duplicate analysis complete:")
#         print(f"  - Total records in upload: {len(df_comparison)}")
#         print(f"  - Duplicate records found: {duplicates_count}")
#         print(f"  - New records to insert: {new_records_count}")
        
#         if duplicates_count > 0:
#             print("Sample duplicate records:")
#             duplicate_samples = df_comparison[duplicate_mask][unique_identifier_columns].head(3)
#             print(duplicate_samples.to_string())
        
#         # Filter out duplicates
#         df_filtered = df_comparison[~duplicate_mask].copy()
        
#         # Remove the temporary composite_key column
#         if 'composite_key' in df_filtered.columns:
#             df_filtered = df_filtered.drop('composite_key', axis=1)
        
#         return df_filtered, new_records_count, duplicates_count
        
#     except Exception as e:
#         print(f"Error during duplicate check: {str(e)}")
#         print("Proceeding without duplicate check...")
#         return df_clean, len(df_clean), 0


# def insert_sales_pmix_with_duplicate_check(
#     db: Session, 
#     df: pd.DataFrame, 
#     company_id: int
# ) -> dict:
#     """
#     Insert sales data with comprehensive duplicate checking.
    
#     Args:
#         db: Database session
#         df: DataFrame to insert
#         company_id: Company ID
    
#     Returns:
#         Dictionary with insertion results
#     """
    
#     try:
#         print(f"Starting insertion process for {len(df)} records...")
        
#         # Validate DataFrame structure
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
        
#         # Clean and prepare data
#         df_clean = df.copy()
        
#         # Handle Week column properly
#         if 'Week' in df_clean.columns:
#             df_clean['Week'] = pd.to_numeric(df_clean['Week'], errors='coerce').astype('Int64')
        
#         # Convert datetime columns
#         datetime_columns = ['Sent_Date']
#         for col in datetime_columns:
#             if col in df_clean.columns:
#                 df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')
        
#         # Convert string columns
#         string_columns = ['Date', 'Time', 'Order_Date']
#         for col in string_columns:
#             if col in df_clean.columns:
#                 df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
        
#         # Check for duplicates
#         df_filtered, new_records_count, duplicates_count = check_and_filter_duplicates_sales_pmix(
#             db, df_clean, company_id
#         )
        
#         if len(df_filtered) == 0:
#             print("No new records to insert after duplicate check.")
#             return {
#                 'inserted_count': 0,
#                 'duplicate_count': duplicates_count,
#                 'total_processed': len(df),
#                 'status': 'success'
#             }
        
#         # Insert records in batches for better performance
#         batch_size = 1000
#         inserted_count = 0
        
#         for i in range(0, len(df_filtered), batch_size):
#             batch_df = df_filtered.iloc[i:i + batch_size]
            
#             # Convert DataFrame to list of dictionaries
#             records_to_insert = []
#             for _, row in batch_df.iterrows():
#                 record_dict = row.to_dict()
#                 record_dict['company_id'] = company_id
                
#                 # Handle NaN values
#                 for key, value in record_dict.items():
#                     if pd.isna(value):
#                         record_dict[key] = None
                
#                 records_to_insert.append(record_dict)
            
#             # Bulk insert using SQLAlchemy
#             db.bulk_insert_mappings(SalesPMix, records_to_insert)
#             inserted_count += len(records_to_insert)
            
#             print(f"Inserted batch {i//batch_size + 1}: {len(records_to_insert)} records")
        
#         # Commit the transaction
#         db.commit()
#         print(f"Successfully inserted {inserted_count} new records into sales_pmix table")
        
#         return {
#             'inserted_count': inserted_count,
#             'duplicate_count': duplicates_count,
#             'total_processed': len(df),
#             'status': 'success'
#         }
        
#     except Exception as e:
#         db.rollback()
#         print(f"Error during insertion: {str(e)}")
#         raise e


def check_and_filter_duplicates_sales_pmix(
    db: Session, 
    df_clean: pd.DataFrame, 
    company_id: int
) -> Tuple[pd.DataFrame, int, int]:
    """
    Check for duplicate records and filter them out before database insertion.
    
    Args:
        db: Database session
        df_clean: Cleaned DataFrame to check for duplicates
        company_id: Company ID for filtering
    
    Returns:
        Tuple of (filtered_dataframe, new_records_count, duplicates_count)
    """
    
    if df_clean.empty:
        return df_clean, 0, 0
    
    print(f"Starting duplicate check for {len(df_clean)} records...")
    
    # Define the columns that make up a unique record
    # You can adjust these based on your business logic
    unique_identifier_columns = [
        'Sent_Date', 'Order_Date', 'Net_Price', 'Location', 
        'Qty', 'Menu_Item', 'Order_Id'
    ]
    
    # Get the date range from the new data to optimize the query
    min_sent_date = df_clean['Sent_Date'].min()
    max_sent_date = df_clean['Sent_Date'].max()
    
    print(f"Checking for duplicates in date range: {min_sent_date} to {max_sent_date}")
    
    try:
        # Query existing records from database using SQLAlchemy ORM
        # This is more efficient than loading all records
        existing_records_query = db.query(SalesPMix).filter(
            and_(
                SalesPMix.company_id == company_id,
                or_(
                    and_(
                        SalesPMix.Sent_Date >= min_sent_date,
                        SalesPMix.Sent_Date <= max_sent_date
                    ),
                    and_(
                        SalesPMix.Order_Date >= min_sent_date.strftime('%m-%d-%Y') if min_sent_date else None,
                        SalesPMix.Order_Date <= max_sent_date.strftime('%m-%d-%Y') if max_sent_date else None
                    )
                )
            )
        )
        
        # Convert to DataFrame for easier comparison
        existing_records = []
        for record in existing_records_query:
            record_dict = {}
            for col in unique_identifier_columns:
                record_dict[col] = getattr(record, col, None)
            existing_records.append(record_dict)
        
        existing_df = pd.DataFrame(existing_records)
        print(f"Found {len(existing_df)} existing records in database for comparison")
        
        if existing_df.empty:
            print("No existing records found. All records will be inserted.")
            return df_clean, len(df_clean), 0
        
        # Normalize data types for comparison
        df_comparison = df_clean.copy()
        
        # Handle datetime columns
        for col in ['Sent_Date']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = pd.to_datetime(existing_df[col], errors='coerce')
                df_comparison[col] = pd.to_datetime(df_comparison[col], errors='coerce')
        
        # Handle string date columns
        for col in ['Order_Date']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = existing_df[col].astype(str).replace('None', '').replace('nan', '')
                df_comparison[col] = df_comparison[col].astype(str).replace('None', '').replace('nan', '')
        
        # Handle numeric columns
        for col in ['Net_Price', 'Qty', 'Order_Id']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = pd.to_numeric(existing_df[col], errors='coerce').fillna(0)
                df_comparison[col] = pd.to_numeric(df_comparison[col], errors='coerce').fillna(0)
        
        # Handle string columns
        for col in ['Location', 'Menu_Item']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = existing_df[col].astype(str).fillna('').str.strip()
                df_comparison[col] = df_comparison[col].astype(str).fillna('').str.strip()
        
        # Create composite keys for comparison
        def create_composite_key(row, columns):
            """Create a composite key from specified columns"""
            key_parts = []
            for col in columns:
                if col in row.index:
                    val = row[col]
                    if pd.isna(val) or val is None:
                        key_parts.append('NULL')
                    else:
                        key_parts.append(str(val))
                else:
                    key_parts.append('NULL')
            return '|'.join(key_parts)
        
        # Create composite keys
        existing_df['composite_key'] = existing_df.apply(
            lambda row: create_composite_key(row, unique_identifier_columns), axis=1
        )
        
        df_comparison['composite_key'] = df_comparison.apply(
            lambda row: create_composite_key(row, unique_identifier_columns), axis=1
        )
        
        # Find duplicates
        existing_keys = set(existing_df['composite_key'].tolist())
        duplicate_mask = df_comparison['composite_key'].isin(existing_keys)
        
        duplicates_count = duplicate_mask.sum()
        new_records_count = len(df_comparison) - duplicates_count
        
        print(f"Duplicate analysis complete:")
        print(f"  - Total records in upload: {len(df_comparison)}")
        print(f"  - Duplicate records found: {duplicates_count}")
        print(f"  - New records to insert: {new_records_count}")
        
        if duplicates_count > 0:
            print("Sample duplicate records:")
            duplicate_samples = df_comparison[duplicate_mask][unique_identifier_columns].head(3)
            print(duplicate_samples.to_string())
        
        # Filter out duplicates
        df_filtered = df_comparison[~duplicate_mask].copy()
        
        # Remove the temporary composite_key column
        if 'composite_key' in df_filtered.columns:
            df_filtered = df_filtered.drop('composite_key', axis=1)
        
        return df_filtered, new_records_count, duplicates_count
        
    except Exception as e:
        print(f"Error during duplicate check: {str(e)}")
        print("Proceeding without duplicate check...")
        return df_clean, len(df_clean), 0


def insert_sales_pmix_with_duplicate_check(
    db: Session, 
    df: pd.DataFrame, 
    company_id: int,
    file_name: str = None,  # ADD THIS PARAMETER
    dashboard: int = None   # ADD THIS PARAMETER
) -> dict:
    """
    Insert sales data with comprehensive duplicate checking.
    
    Args:
        db: Database session
        df: DataFrame to insert
        company_id: Company ID
        file_name: Optional filename to store with each record
        dashboard: Optional dashboard integer to store with each record
    
    Returns:
        Dictionary with insertion results
    """
    
    try:
        print(f"Starting insertion process for {len(df)} records...")
        
        # Validate DataFrame structure
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
        
        # Clean and prepare data
        df_clean = df.copy()
        
        # Handle Week column properly
        if 'Week' in df_clean.columns:
            df_clean['Week'] = pd.to_numeric(df_clean['Week'], errors='coerce').astype('Int64')
        
        # Convert datetime columns
        datetime_columns = ['Sent_Date']
        for col in datetime_columns:
            if col in df_clean.columns:
                df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')
        
        # Convert string columns
        string_columns = ['Date', 'Time', 'Order_Date']
        for col in string_columns:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
        
        # Check for duplicates
        df_filtered, new_records_count, duplicates_count = check_and_filter_duplicates_sales_pmix(
            db, df_clean, company_id
        )
        
        if len(df_filtered) == 0:
            print("No new records to insert after duplicate check.")
            return {
                'inserted_count': 0,
                'duplicate_count': duplicates_count,
                'total_processed': len(df),
                'status': 'success'
            }
        
        # Insert records in batches for better performance
        batch_size = 1000
        inserted_count = 0
        
        for i in range(0, len(df_filtered), batch_size):
            batch_df = df_filtered.iloc[i:i + batch_size]
            
            # Convert DataFrame to list of dictionaries
            records_to_insert = []
            for _, row in batch_df.iterrows():
                record_dict = row.to_dict()
                record_dict['company_id'] = company_id
                
                # ADD FILE_NAME AND DASHBOARD TO EACH RECORD
                if file_name:
                    record_dict['file_name'] = file_name
                if dashboard is not None:
                    record_dict['dashboard'] = dashboard
                
                # Handle NaN values
                for key, value in record_dict.items():
                    if pd.isna(value):
                        record_dict[key] = None
                
                records_to_insert.append(record_dict)
            
            # Bulk insert using SQLAlchemy
            db.bulk_insert_mappings(SalesPMix, records_to_insert)
            inserted_count += len(records_to_insert)
            
            print(f"Inserted batch {i//batch_size + 1}: {len(records_to_insert)} records")
        
        # Commit the transaction
        db.commit()
        print(f"Successfully inserted {inserted_count} new records into sales_pmix table")
        
        return {
            'inserted_count': inserted_count,
            'duplicate_count': duplicates_count,
            'total_processed': len(df),
            'status': 'success'
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error during insertion: {str(e)}")
        raise e


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
# Add these imports
from crud.financials_company_wide import insert_financials_with_duplicate_check
from crud.budget import insert_budget_with_duplicate_check

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
        
        # with open(file_path, "wb") as f:
        #     f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        if request.location:
            print('Location:', request.location)
            print("Dashboard:", request.dashboard) 

        excel_data_copy = io.BytesIO(file_content)

        if request.dashboard == "Sales Split and Product Mix" or request.dashboard == "Product Mix" or request.dashboard == "Sales Split":
            # Process the dashboard data using the separate module
            
            df = pd.read_excel(excel_data_copy)
            df.columns = df.columns.str.strip()
            
            # Strip whitespace from column names
            df.columns = df.columns.str.strip()

            print("---------------------------------------------------------")
            df["Location"] = df["Location"].str.lower()
            print("i am here printing the locations df columns:", df["Location"])
            
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
            print("i am here in excel upload printing the filename dashboard and company id and df head", file_name, request.dashboard, request.company_id, "\n", df.head())
            
            
            
            result = process_dashboard_data(request, df1= df, df2 = None, file_name = file_name, company_id = request.company_id)


        elif request.dashboard in ["Financials and Sales Wide", "Financials", "Sales Wide", "Companywide"]:
            # print("i am here in main excel upload printig the dashboad--", request.dashboard)
                    # Map dashboard name to integer
        
            
            try:
                if isinstance(excel_data_copy, io.BytesIO):
                    excel_data_copy.seek(0)
                    print("Reading Excel from BytesIO object.")
                    # df = pd.read_excel(file_data, sheet_name="Database")
                    df = pd.read_excel(excel_data_copy, sheet_name="Actuals")
                    excel_data_copy.seek(0)
                    # df_budget = pd.read_excel(file_data, sheet_name="Budget")
                    df_budget = pd.read_excel(excel_data_copy, sheet_name="Budget", header=1)

                if df.empty:
                    raise ValueError("The sheet 'Actuals' is empty or missing.")
            except ValueError as e:
                raise ValueError("Sheet named 'Actuals' not found in the uploaded Excel file.")




            # ------------------------------------------------------------
            # process for the financials filters
            # ------------------------------------------------------------
            # Strip whitespace from column names
            df.columns = df.columns.str.strip()
         
            
            # # ===== ADD HELPER COLUMN CHECK HERE =====
            # # Check if Helper 1 and Helper 4 exist, create them if they don't
            # if 'Helper 1' not in df.columns:
            #     print("Helper 1 column not found. Creating Helper 1 column...")
            #     # Find the position after Year column or at the end
            #     if 'Year' in df.columns:
            #         year_idx = df.columns.get_loc('Year')
            #         df.insert(year_idx + 1, 'Helper 1', '')
            #     else:
            #         print("Helper 1 column not found. Creating Helper 1 column at the end...")
            #         df['Helper 1'] = ''
            # else:
            #     print("Helper 1 column already exists.")
        
        
            # ===== ADD HELPER COLUMN CHECK HERE =====
            # Check if Helper 1 exists, create it if it doesn't
            if 'Helper 1' not in df.columns:
                print("Helper 1 column not found. Creating Helper 1 column...")
                # Find the position after Year column or at the end
                if 'Year' in df.columns:
                    year_idx = df.columns.get_loc('Year')
                    df.insert(year_idx + 1, 'Helper 1', '')
                else:
                    print("Helper 1 column not found. Creating Helper 1 column at the end...")
                    df['Helper 1'] = ''
            else:
                print("Helper 1 column already exists.")

            # ===== POPULATE HELPER 1 WITH DAY PATTERN =====
            # Create mapping dictionaries for day abbreviations to numbers and full names
            day_to_number = {
                'Mon': '1',
                'Tue': '2', 
                'Wed': '3',
                'Thu': '4',
                'Fri': '5',
                'Sat': '6',
                'Sun': '7'
            }

            day_to_full_name = {
                'Mon': 'Monday',
                'Tue': 'Tuesday',
                'Wed': 'Wednesday', 
                'Thu': 'Thursday',
                'Fri': 'Friday',
                'Sat': 'Saturday',
                'Sun': 'Sunday'
            }

            # Populate Helper 1 column with the pattern "number - full_day_name"
            if 'Day' in df.columns:
                print("Populating Helper 1 with day pattern...")
                df['Helper 1'] = df['Day'].map(lambda day: f"{day_to_number.get(day, '')} - {day_to_full_name.get(day, '')}" if day in day_to_number else '')
                print("Helper 1 column populated successfully.")
            else:
                print("Warning: Day column not found. Cannot populate Helper 1.")
                
            # Display sample of Helper 1 values
            if not df.empty and 'Helper 1' in df.columns:
                print("\nSample Helper 1 values:")
                print(df['Helper 1'].head(10).to_string())
                
            print("i am here __ checking the helper1", df.columns, "\n", df['Helper 1'], "\n", df.head())
            
            if 'Helper 4' not in df.columns:
                print("Helper 4 column not found. Creating Helper 4 column...")
                # Find the position after Helper columns
                helper_cols = [col for col in df.columns if col.startswith('Helper')]
                if helper_cols:
                    # Insert after the last existing Helper column
                    last_helper_col = max(helper_cols, key=lambda x: int(x.split()[-1]) if x.split()[-1].isdigit() else 0)
                    last_helper_idx = df.columns.get_loc(last_helper_col)
                    df.insert(last_helper_idx + 1, 'Helper 4', '')
                else:
                    df['Helper 4'] = ''
            else:
                print("Helper 4 column already exists.")
            # ===== END HELPER COLUMN CHECK =====

            # Define columns to exclude from filling
            exclude_cols = ['Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
                            'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4']

            # Get all columns that should be filled with 0
            fill_cols = [col for col in df.columns if col not in exclude_cols]

            # Replace NaN with 0 only in selected columns
            df[fill_cols] = df[fill_cols].fillna(0)

            # Fill excluded (metadata/helper) columns with empty string
            df[exclude_cols] = df[exclude_cols].fillna('')
            df["Store"] = df["Store"].str.replace(r'^\d{4}:\s*', '', regex=True)
            
            df["Store"] = df["Store"].str.lower()
            print("i am here printing the store df columns:", df["Store"])


            # Strip whitespace from column names for budget dataframe
            df_budget.columns = df_budget.columns.str.strip()
            



            # ===== ADD HELPER COLUMN CHECK HERE =====
            # Check if Helper 1 exists, create it if it doesn't
            if 'Helper 1' not in df_budget.columns:
                print("Helper 1 column not found. Creating Helper 1 column...")
                # Find the position after Year column or at the end
                if 'Year' in df_budget.columns:
                    year_idx = df_budget.columns.get_loc('Year')
                    df_budget.insert(year_idx + 1, 'Helper 1', '')
                else:
                    print("Helper 1 column not found. Creating Helper 1 column at the end...")
                    df_budget['Helper 1'] = ''
            else:
                print("Helper 1 column already exists.")

            # ===== POPULATE HELPER 1 WITH DAY PATTERN =====
            # Create mapping dictionaries for day abbreviations to numbers and full names
            day_to_number = {
                'Mon': '1',
                'Tue': '2', 
                'Wed': '3',
                'Thu': '4',
                'Fri': '5',
                'Sat': '6',
                'Sun': '7'
            }

            day_to_full_name = {
                'Mon': 'Monday',
                'Tue': 'Tuesday',
                'Wed': 'Wednesday', 
                'Thu': 'Thursday',
                'Fri': 'Friday',
                'Sat': 'Saturday',
                'Sun': 'Sunday'
            }

            # Populate Helper 1 column with the pattern "number - full_day_name"
            if 'Day' in df_budget.columns:
                print("Populating Helper 1 with day pattern...")
                df_budget['Helper 1'] = df_budget['Day'].map(lambda day: f"{day_to_number.get(day, '')} - {day_to_full_name.get(day, '')}" if day in day_to_number else '')
                print("Helper 1 column populated successfully.")
            else:
                print("Warning: Day column not found. Cannot populate Helper 1.")
                
            # Display sample of Helper 1 values
            if not df_budget.empty and 'Helper 1' in df_budget.columns:
                print("\nSample Helper 1 values:")
                print(df_budget['Helper 1'].head(10).to_string())

            if 'Helper 4' not in df_budget.columns:
                print("Helper 4 column not found in budget data. Creating Helper 4 column...")
                helper_cols = [col for col in df_budget.columns if col.startswith('Helper')]
                if helper_cols:
                    last_helper_col = max(helper_cols, key=lambda x: int(x.split()[-1]) if x.split()[-1].isdigit() else 0)
                    last_helper_idx = df_budget.columns.get_loc(last_helper_col)
                    df_budget.insert(last_helper_idx + 1, 'Helper 4', '')
                else:
                    df_budget['Helper 4'] = ''
            # ===== END HELPER COLUMN CHECK FOR BUDGET DF =====

            # Identify all column names
            cols = list(df_budget.columns)

            # Replace only the first occurrence of "Net Sales" with "Net Sales 1"
            found = False
            for i, col in enumerate(cols):
                if col.strip() == "Net Sales" and not found:
                    cols[i] = "Net Sales 1"
                    found = True

            # Assign the modified column names back
            df_budget.columns = cols

            
            # Define columns to exclude from numeric NaN filling
            exclude_cols = [
                'Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
                'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4', 'Helper'  # Include any actual column names in your sheet
            ]

            # Ensure all exclude columns that are present in df_budget
            exclude_cols = [col for col in exclude_cols if col in df_budget.columns]

            # Get all columns that should be filled with 0
            fill_cols = [col for col in df_budget.columns if col not in exclude_cols]

            # Replace NaN with 0 only in selected columns
            df_budget[fill_cols] = df_budget[fill_cols].fillna(0)

            # Fill excluded (metadata/helper) columns with empty string
            df_budget[exclude_cols] = df_budget[exclude_cols].fillna('')

            df_budget["Store"] = df_budget["Store"].str.replace(r'^\d{4}:\s*', '', regex=True)
            df_budget["Store"].unique()  # Display unique values in the 'stores' column

            df_budget["Store"] = df_budget["Store"].str.lower()
            print("i am here printing the store df_budget columns:", df_budget["Store"])

            years = df["Year"].unique().tolist()  # Display unique values in the 'Year' column
            dates = df["Helper 4"].unique().tolist()  # Display unique values in the 'Helper 4' column
            stores = df["Store"].unique().tolist()  # Display unique values in the 'stores' column
            df["Date"] = df["Date"].dt.date
            df_budget["Date"] = df_budget["Date"].dt.date

            df.rename (columns={
                    'Store': 'Store',
                    'Ly Date': 'Ly_Date',
                    'Date': 'Date',
                    'Day': 'Day',
                    'Week': 'Week',
                    'Month': 'Month',
                    'Quarter': 'Quarter',
                    'Year': 'Year',
                    'Helper 1': 'Helper_1',
                    'Helper 2': 'Helper_2',
                    'Helper 3': 'Helper_3',
                    'Helper 4': 'Helper_4',
                    'Tw Sales': 'Tw_Sales',
                    'Lw Sales': 'Lw_Sales',
                    'Ly Sales': 'Ly_Sales',
                    'Tw Orders': 'Tw_Orders',
                    'Lw Orders': 'Lw_Orders',
                    'Ly Orders': 'Ly_Orders',
                    'Tw Avg Tckt': 'Tw_Avg_Tckt',
                    'Lw Avg Tckt': 'Lw_Avg_Tckt',
                    'Ly Avg Tckt': 'Ly_Avg_Tckt',
                    'Tw Labor Hrs': 'Tw_Labor_Hrs',
                    'Lw Labor Hrs': 'Lw_Labor_Hrs',
                    'Tw Reg Pay': 'Tw_Reg_Pay',
                    'Lw Reg Pay': 'Lw_Reg_Pay',
                    'Tw SPMH': 'Tw_SPMH',
                    'Lw SPMH': 'Lw_SPMH',
                    'Tw LPMH': 'Tw_LPMH',
                    'Lw LPMH': 'Lw_LPMH',
                    'Tw COGS': 'Tw_COGS',
                    'TW Johns': 'TW_Johns',
                    'TW Terra': 'TW_Terra',
                    'TW Metro': 'TW_Metro',
                    'TW Victory': 'TW_Victory',
                    'TW Central Kitchen': 'TW_Central_Kitchen',
                    'TW Other': 'TW_Other',
                    'Unnamed: 36': 'Unnamed_36',
                    'Unnamed: 37': 'Unnamed_37',
                    'Unnamed: 38': 'Unnamed_38',
                    'Unnamed: 39': 'Unnamed_39',
                    'Lw COGS': 'Lw_COGS',
                    'LW Johns': 'LW_Johns',
                    'LW Terra': 'LW_Terra',
                    'LW Metro': 'LW_Metro',
                    'LW Victory': 'LW_Victory',
                    'LW Central Kitchen': 'LW_Central_Kitchen',
                    'LW Other': 'LW_Other'
                }, inplace=True)
            
            
            df_budget.rename(columns={
                'Store': 'Store',
                'Date': 'Date',
                'Week': 'Week',
                'Month': 'Month',
                'Quater': 'Quarter',  # Fixed spelling to match your previous pattern
                'Year': 'Year',
                'Helper 1': 'Helper_1',
                'Helper': 'Helper',
                'Helper 2': 'Helper_2',
                'Helper 4': 'Helper_4',
                'Sales % Contribution': 'Sales_Pct_Contribution',
                'Catering Sales': 'Catering_Sales',
                'In-House Sales': 'In_House_Sales',
                'Weekly (+/-)': 'Weekly_Plus_Minus',
                'Net Sales 1': 'Net_Sales_1',
                'Net Sales': 'Net_Sales',
                'Orders': 'Orders',
                'Food $ Cost': 'Food_Cost',
                'Johns': 'Johns',
                'Terra': 'Terra',
                'Metro': 'Metro',
                'Victory': 'Victory',
                'Central Kitchen': 'Central_Kitchen',
                'Other': 'Other',
                'LPMH': 'LPMH',
                'SPMH': 'SPMH',
                'LB Hours': 'LB_Hours',
                'Labor $ Cost': 'Labor_Cost',
                'Labor % Cost': 'Labor_Pct_Cost',
                'Prime $ Cost': 'Prime_Cost',
                'Prime % Cost': 'Prime_Pct_Cost',
                'Rent $': 'Rent',
                'Opex $ Cost': 'Opex_Cost',
                'TTL $ Expense': 'TTL_Expense',
                'Net $ Income': 'Net_Income',
                'Net % Income': 'Net_Pct_Income'
            }, inplace=True)

            print("i am here in excel upload printing the df_budget columns of the dataframe", df_budget.columns, "\n", df_budget.dtypes , "\n", df_budget.head())

            result = process_dashboard_data(request = request, df1 = df, df2 = df_budget, file_name=file_name, company_id = request.company_id)

        # Save file record to database *after* successful processing
        file_record = UploadedFileCreate(
            file_name=file_name,
            dashboard_name=request.dashboard,
            uploader_id=current_user.id,
            company_id=request.company_id,
        )
        upload_file_record(db, file_record)
        
        # print("i am here in excel uplaod printing the columns of the dataframe", df.columns, "\n", df.dtypes , "\n", df.head())
        
              
                
                
        if request.dashboard == "Sales Split and Product Mix" or request.dashboard == "Product Mix" or request.dashboard == "Sales Split":
            try:
                print(f"Starting database insertion for {len(df)} records...")
                
                # Use the improved insertion function with duplicate checking
                # insertion_result = insert_sales_pmix_with_duplicate_check(db, df, request.company_id)
                
                insertion_result = insert_sales_pmix_with_duplicate_check(
                    db=db,
                    df=df,
                    company_id=request.company_id,
                    file_name=file_name,  # EDIT: Pass the file_name here
                    dashboard=1 if request.dashboard == "Sales Split and Product Mix" else 
                            2  if request.dashboard == "Sales Split" else
                            3 if request.dashboard == "Product Mix" else None
                    )
                
                print(f"Sales Split Insertion completed:")
                print(f"  - New records inserted: {insertion_result['inserted_count']}")
                print(f"  - Duplicate records skipped: {insertion_result['duplicate_count']}")
                print(f"  - Total records processed: {insertion_result['total_processed']}")
                
                # Add results to the response if possible
                if hasattr(result, '__dict__'):
                    result.database_records_inserted = insertion_result['inserted_count']
                    result.duplicate_records_skipped = insertion_result['duplicate_count']
                    result.total_records_processed = insertion_result['total_processed']
                
            except Exception as db_error:
                print(f"Database insertion error: {str(db_error)}")
                db.rollback()
                
                # You can choose to raise the error or handle it gracefully
                raise HTTPException(
                    status_code=500, 
                    detail=f"Database insertion failed: {str(db_error)}"
                )
        
        
        # elif request.dashboard in ["Financials and Sales Wide", "Financials", "Sales Wide", "Companywide"]:
        #     try:
        #         # Your existing financials processing...
                
        #         # Insert actuals data into financials_company_wide table
        #         insertion_result = insert_financials_with_duplicate_check(db, df, request.company_id)
                
        #         # Insert budget data into budget table
        #         if not df_budget.empty:
        #             print(f"Starting budget data insertion: {len(df_budget)} records...")
                    
        #             # Insert budget data
        #             insert_budget = insert_budget_df_check(db, df_budget, request.company_id)
        #             budget_count = len(df_budget)
                    
        #             print(f"Successfully inserted {budget_count} budget records")
                    
        #             # Add to response if possible
        #             if hasattr(result, '__dict__'):
        #                 result.budget_records_inserted = budget_count
                        
        #     except Exception as db_error:
        #         db.rollback()
        #         raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(db_error)}")
                
        
        elif request.dashboard in ["Financials and Sales Wide", "Financials", "Sales Wide", "Companywide"]:
            try:
                print(f"Starting database insertion for financials data: {len(df)} records...")
                DASHBOARD_MAPPING = {
                    "Financials and Sales Wide": 4,
                    "Financials": 5,
                    "Sales Wide": 6,
                    "Companywide": 6
                }
            
                dashboard_id = DASHBOARD_MAPPING.get(request.dashboard, 4)
                
                
                # Insert actuals data into financials_company_wide table
                # insertion_result = insert_financials_with_duplicate_check(db, df, request.company_id)
                
                # Insert actuals data into financials_company_wide table
                insertion_result = insert_financials_with_duplicate_check(
                    db=db,
                    df=df,
                    company_id=request.company_id,
                    file_name=file_name,  # ADD THIS PARAMETER
                    dashboard=dashboard_id  # ADD THIS PARAMETER
                )
                
                print(f"Financials insertion completed:")
                print(f"  - New records inserted: {insertion_result['inserted_count']}")
                print(f"  - Duplicate records skipped: {insertion_result['duplicate_count']}")
                print(f"  - Total records processed: {insertion_result['total_processed']}")
                
                # Add results to the response if possible
                if hasattr(result, '__dict__'):
                    result.database_records_inserted = insertion_result['inserted_count']
                    result.duplicate_records_skipped = insertion_result['duplicate_count']
                    result.total_records_processed = insertion_result['total_processed']
                
                # Insert budget data into budget table
                if not df_budget.empty:
                    print(f"Starting budget data insertion: {len(df_budget)} records...")
                    
                    # Insert budget data with duplicate checking
                    # budget_insertion_result = insert_budget_with_duplicate_check(db, df_budget, request.company_id)
                    
                    # Insert budget data with duplicate checking AND new parameters
                    budget_insertion_result = insert_budget_with_duplicate_check(
                        db=db,
                        df=df_budget,
                        company_id=request.company_id,
                        file_name=file_name,  # ADD THIS PARAMETER
                        dashboard=dashboard_id  # ADD THIS PARAMETER
                    )
                    print(f"Budget insertion completed:")
                    print(f"  - New budget records inserted: {budget_insertion_result['inserted_count']}")
                    print(f"  - Duplicate budget records skipped: {budget_insertion_result['duplicate_count']}")
                    print(f"  - Total budget records processed: {budget_insertion_result['total_processed']}")
                    
                    # Add budget results to response if possible
                    if hasattr(result, '__dict__'):
                        result.budget_records_inserted = budget_insertion_result['inserted_count']
                        result.budget_duplicates_skipped = budget_insertion_result['duplicate_count']
                        result.budget_total_processed = budget_insertion_result['total_processed']
                else:
                    print("No budget data to insert (df_budget is empty)")
                    
            except Exception as db_error:
                print(f"Database insertion error: {str(db_error)}")
                db.rollback()
                
                # You can choose to raise the error or handle it gracefully
                raise HTTPException(
                    status_code=500, 
                    detail=f"Database insertion failed: {str(db_error)}"
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
