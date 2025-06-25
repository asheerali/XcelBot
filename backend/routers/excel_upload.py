
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models.sales_pmix import SalesPMix
from typing import List, Tuple

def check_and_filter_duplicates(
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
    company_id: int
) -> dict:
    """
    Insert sales data with comprehensive duplicate checking.
    
    Args:
        db: Database session
        df: DataFrame to insert
        company_id: Company ID
    
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
        df_filtered, new_records_count, duplicates_count = check_and_filter_duplicates(
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
            print("i am here in excel upload printing the filename dashboard and company id and df head", file_name, request.dashboard, request.company_id, "\n", df.head())
            result = process_dashboard_data(request, df, file_name, request.company_id)
        else:
            result = process_dashboard_data(request, df, file_name, request.company_id)

        # Save file record to database *after* successful processing
        file_record = UploadedFileCreate(
            file_name=file_name,
            dashboard_name=request.dashboard,
            uploader_id=current_user.id,
            company_id=request.company_id,
        )
        upload_file_record(db, file_record)
        
        print("i am here in excel uplaod printing the columns of the dataframe", df.columns, "\n", df.dtypes , "\n", df.head())
        
                
        
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
                
        #         print("I am here in excel upload printing the columns of the dataframe and checking if something is wrong", df.columns, "\n", df.dtypes, "\n", df.head())
                
        #         # Clean and validate data before insertion
        #         df_clean = df.copy()

        #         # Ensure proper data types for problematic fields
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
                
        #         print(f"Data validation completed. Checking for existing records...")
                
        #         # ===== DUPLICATE CHECK LOGIC =====
        #         # Define the columns that make up the unique combination
        #         duplicate_check_columns = ['Sent_Date', 'Order_Date', 'Net_Price', 'Location', 'Qty']
                
        #         # Get the date range from the new data to limit the query scope
        #         min_sent_date = df_clean['Sent_Date'].min()
        #         max_sent_date = df_clean['Sent_Date'].max()
        #         min_order_date = df_clean['Order_Date'].min()
        #         max_order_date = df_clean['Order_Date'].max()
                
        #         print(f"Checking for duplicates in date range: {min_sent_date} to {max_sent_date}")
                
        #         # Query existing records from database for the company and date range
        #         # Note: You'll need to adjust the table name and query structure based on your database setup
        #         existing_records_query = """
        #         SELECT company_id, sent_date, order_date, net_price, location, qty
        #         FROM sales_pmix 
        #         WHERE company_id = %(company_id)s 
        #         AND (sent_date BETWEEN %(min_sent_date)s AND %(max_sent_date)s
        #             OR order_date BETWEEN %(min_order_date)s AND %(max_order_date)s)
        #         """
                
        #         # Execute the query to get existing records
        #         try:
        #             existing_df = pd.read_sql(
        #                 existing_records_query, 
        #                 con=db.connection(),  # Adjust based on your DB connection method
        #                 params={
        #                     'company_id': request.company_id,
        #                     'min_sent_date': min_sent_date,
        #                     'max_sent_date': max_sent_date,
        #                     'min_order_date': min_order_date,
        #                     'max_order_date': max_order_date
        #                 }
        #             )
                    
        #             print(f"Found {len(existing_df)} existing records in the database for comparison")
                    
        #         except Exception as query_error:
        #             print(f"Error querying existing records: {str(query_error)}")
        #             # If we can't query existing records, proceed with insertion (you may want to handle this differently)
        #             existing_df = pd.DataFrame()
                
        #         # Add company_id to the new data for comparison
        #         df_clean['company_id'] = request.company_id
                
        #         # Prepare comparison columns (convert to same data types)
        #         comparison_columns = ['company_id'] + duplicate_check_columns
                
        #         if not existing_df.empty:
        #             # Normalize column names for comparison (handle case sensitivity)
        #             existing_df.columns = [col.lower() if col.lower() in [c.lower() for c in comparison_columns] 
        #                                 else col for col in existing_df.columns]
        #             df_clean_comparison = df_clean.copy()
                    
        #             # Convert data types to match for proper comparison
        #             for col in duplicate_check_columns:
        #                 if col in existing_df.columns and col in df_clean_comparison.columns:
        #                     # Handle datetime columns
        #                     if col in ['Sent_Date', 'Order_Date']:
        #                         existing_df[col] = pd.to_datetime(existing_df[col], errors='coerce')
        #                         df_clean_comparison[col] = pd.to_datetime(df_clean_comparison[col], errors='coerce')
        #                     # Handle numeric columns
        #                     elif col in ['Net_Price', 'Qty']:
        #                         existing_df[col] = pd.to_numeric(existing_df[col], errors='coerce')
        #                         df_clean_comparison[col] = pd.to_numeric(df_clean_comparison[col], errors='coerce')
        #                     # Handle string columns
        #                     else:
        #                         existing_df[col] = existing_df[col].astype(str)
        #                         df_clean_comparison[col] = df_clean_comparison[col].astype(str)
                    
        #             # Create a composite key for comparison
        #             existing_df['composite_key'] = existing_df[comparison_columns].apply(
        #                 lambda row: '|'.join([str(val) for val in row]), axis=1
        #             )
                    
        #             df_clean_comparison['composite_key'] = df_clean_comparison[comparison_columns].apply(
        #                 lambda row: '|'.join([str(val) for val in row]), axis=1
        #             )
                    
        #             # Find duplicates
        #             existing_keys = set(existing_df['composite_key'].tolist())
        #             duplicate_mask = df_clean_comparison['composite_key'].isin(existing_keys)
                    
        #             duplicates_count = duplicate_mask.sum()
        #             new_records_count = len(df_clean_comparison) - duplicates_count
                    
        #             print(f"Duplicate analysis complete:")
        #             print(f"  - Total records in upload: {len(df_clean_comparison)}")
        #             print(f"  - Duplicate records found: {duplicates_count}")
        #             print(f"  - New records to insert: {new_records_count}")
                    
        #             if duplicates_count > 0:
        #                 print("Sample duplicate records:")
        #                 duplicate_samples = df_clean_comparison[duplicate_mask][comparison_columns].head(3)
        #                 print(duplicate_samples.to_string())
                    
        #             # Filter out duplicates
        #             df_clean = df_clean_comparison[~duplicate_mask].copy()
                    
        #             # Remove the temporary composite_key and company_id columns if they weren't in original data
        #             if 'composite_key' in df_clean.columns:
        #                 df_clean = df_clean.drop('composite_key', axis=1)
        #             if 'company_id' in df_clean.columns and 'company_id' not in df.columns:
        #                 df_clean = df_clean.drop('company_id', axis=1)
                    
        #         else:
        #             new_records_count = len(df_clean)
        #             duplicates_count = 0
        #             print(f"No existing records found for comparison. All {new_records_count} records will be inserted.")
                
        #         # ===== END DUPLICATE CHECK LOGIC =====
                
        #         if len(df_clean) == 0:
        #             print("No new records to insert after duplicate check.")
        #             inserted_count = 0
        #         else:
        #             # Insert the processed DataFrame into the database with error handling
        #             inserted_count = insert_sales_pmix_df(db, df_clean, request.company_id)
        #             print(f"Successfully inserted {inserted_count} new records into sales_pmix table")
                
        #         # Optional: Add to result for user feedback
        #         if hasattr(result, '__dict__'):
        #             result.database_records_inserted = inserted_count
        #             result.duplicate_records_skipped = duplicates_count
        #             result.total_records_processed = len(df)
                
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
                
                # Use the improved insertion function with duplicate checking
                insertion_result = insert_sales_pmix_with_duplicate_check(db, df, request.company_id)
                
                print(f"Insertion completed:")
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
