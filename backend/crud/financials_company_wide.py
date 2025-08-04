# import pandas as pd
# from sqlalchemy.orm import Session
# from sqlalchemy import and_, or_
# from models.financials_company_wide import FinancialsCompanyWide
# from typing import List, Tuple

# def check_and_filter_duplicates_financials(
#     db: Session, 
#     df_clean: pd.DataFrame, 
#     company_id: int
# ) -> Tuple[pd.DataFrame, int, int]:
#     """
#     Check for duplicate financial records and filter them out before database insertion.
#     """
    
#     if df_clean.empty:
#         return df_clean, 0, 0
    
#     print(f"Starting duplicate check for {len(df_clean)} financial records...")
    
#     # Define the columns that make up a unique financial record
#     unique_identifier_columns = [
#         'Store', 'Date', 'Week', 'Year', 'Quarter'
#     ]
    
#     # Get the date range from the new data to optimize the query
#     if 'Year' in df_clean.columns:
#         min_year = df_clean['Year'].min()
#         max_year = df_clean['Year'].max()
#     else:
#         min_year = max_year = None
    
#     print(f"Checking for financial duplicates in year range: {min_year} to {max_year}")
    
#     try:
#         # Query existing records from database using SQLAlchemy ORM
#         existing_records_query = db.query(FinancialsCompanyWide).filter(
#             FinancialsCompanyWide.company_id == company_id
#         )
        
#         # Add year filtering if available
#         if min_year and max_year:
#             existing_records_query = existing_records_query.filter(
#                 and_(
#                     FinancialsCompanyWide.Year >= min_year,
#                     FinancialsCompanyWide.Year <= max_year
#                 )
#             )
        
#         # Convert to DataFrame for easier comparison
#         existing_records = []
#         for record in existing_records_query:
#             record_dict = {}
#             for col in unique_identifier_columns:
#                 record_dict[col] = getattr(record, col, None)
#             existing_records.append(record_dict)
        
#         existing_df = pd.DataFrame(existing_records)
#         print(f"Found {len(existing_df)} existing financial records in database for comparison")
        
#         if existing_df.empty:
#             print("No existing financial records found. All records will be inserted.")
#             return df_clean, len(df_clean), 0
        
#         # Normalize data types for comparison
#         df_comparison = df_clean.copy()
        
#         # Handle string date columns
#         for col in ['Date']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = existing_df[col].astype(str).replace('None', '').replace('nan', '')
#                 df_comparison[col] = df_comparison[col].astype(str).replace('None', '').replace('nan', '')
        
#         # Handle numeric columns
#         for col in ['Week', 'Year', 'Quarter']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = pd.to_numeric(existing_df[col], errors='coerce').fillna(0)
#                 df_comparison[col] = pd.to_numeric(df_comparison[col], errors='coerce').fillna(0)
        
#         # Handle string columns
#         for col in ['Store']:
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
        
#         print(f"Financial duplicate analysis complete:")
#         print(f"  - Total records in upload: {len(df_comparison)}")
#         print(f"  - Duplicate records found: {duplicates_count}")
#         print(f"  - New records to insert: {new_records_count}")
        
#         if duplicates_count > 0:
#             print("Sample duplicate financial records:")
#             duplicate_samples = df_comparison[duplicate_mask][unique_identifier_columns].head(3)
#             print(duplicate_samples.to_string())
        
#         # Filter out duplicates
#         df_filtered = df_comparison[~duplicate_mask].copy()
        
#         # Remove the temporary composite_key column
#         if 'composite_key' in df_filtered.columns:
#             df_filtered = df_filtered.drop('composite_key', axis=1)
        
#         return df_filtered, new_records_count, duplicates_count
        
#     except Exception as e:
#         print(f"Error during financial duplicate check: {str(e)}")
#         print("Proceeding without duplicate check...")
#         return df_clean, len(df_clean), 0


# def insert_financials_with_duplicate_check(
#     db: Session, 
#     df: pd.DataFrame, 
#     company_id: int
# ) -> dict:
#     """
#     Insert financial data with comprehensive duplicate checking.
#     Same pattern as insert_sales_pmix_with_duplicate_check.
#     """
    
#     try:
#         print(f"Starting financial insertion process for {len(df)} records...")
        
#         # Clean and prepare data
#         df_clean = df.copy()
        
#         # Handle Week column properly
#         if 'Week' in df_clean.columns:
#             df_clean['Week'] = pd.to_numeric(df_clean['Week'], errors='coerce').astype('Int64')
        
#         # Convert datetime columns
#         datetime_columns = ['Ly_Date']
#         for col in datetime_columns:
#             if col in df_clean.columns:
#                 df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')
        
#         # Convert string columns
#         string_columns = ['Date', 'Day', 'Month']
#         for col in string_columns:
#             if col in df_clean.columns:
#                 df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
        
#         # Check for duplicates
#         df_filtered, new_records_count, duplicates_count = check_and_filter_duplicates_financials(
#             db, df_clean, company_id
#         )
        
#         if len(df_filtered) == 0:
#             print("No new financial records to insert after duplicate check.")
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
#             db.bulk_insert_mappings(FinancialsCompanyWide, records_to_insert)
#             inserted_count += len(records_to_insert)
            
#             print(f"Inserted financial batch {i//batch_size + 1}: {len(records_to_insert)} records")
        
#         # Commit the transaction
#         db.commit()
#         print(f"Successfully inserted {inserted_count} new financial records into financials_company_wide table")
        
#         return {
#             'inserted_count': inserted_count,
#             'duplicate_count': duplicates_count,
#             'total_processed': len(df),
#             'status': 'success'
#         }
        
#     except Exception as e:
#         db.rollback()
#         print(f"Error during financial insertion: {str(e)}")
#         raise e



import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from models.financials_company_wide import FinancialsCompanyWide
from schemas.financials_company_wide import FinancialsCompanyWideCreate
from typing import List, Tuple, Optional, Dict, Any
from utils.parse_datetime import parse_datetime_from_filename, extract_clean_filename
from models.companies import Company


# def check_and_filter_duplicates_financials(
#     db: Session, 
#     df_clean: pd.DataFrame, 
#     company_id: int
# ) -> Tuple[pd.DataFrame, int, int]:
#     """
#     Check for duplicate financial records and filter them out before database insertion.
#     """
    
#     if df_clean.empty:
#         return df_clean, 0, 0
    
#     print(f"Starting duplicate check for {len(df_clean)} financial records...")
    
#     # Define the columns that make up a unique financial record
#     unique_identifier_columns = [
#         'Store', 'Date', 'Week', 'Year', 'Quarter'
#     ]
    
#     # Get the date range from the new data to optimize the query
#     if 'Year' in df_clean.columns:
#         min_year = df_clean['Year'].min()
#         max_year = df_clean['Year'].max()
#     else:
#         min_year = max_year = None
    
#     print(f"Checking for financial duplicates in year range: {min_year} to {max_year}")
    
#     try:
#         # Query existing records from database using SQLAlchemy ORM
#         existing_records_query = db.query(FinancialsCompanyWide).filter(
#             FinancialsCompanyWide.company_id == company_id
#         )
        
#         # Add year filtering if available
#         if min_year and max_year:
#             existing_records_query = existing_records_query.filter(
#                 and_(
#                     FinancialsCompanyWide.Year >= min_year,
#                     FinancialsCompanyWide.Year <= max_year
#                 )
#             )
        
#         # Convert to DataFrame for easier comparison
#         existing_records = []
#         for record in existing_records_query:
#             record_dict = {}
#             for col in unique_identifier_columns:
#                 record_dict[col] = getattr(record, col, None)
#             existing_records.append(record_dict)
        
#         existing_df = pd.DataFrame(existing_records)
#         print(f"Found {len(existing_df)} existing financial records in database for comparison")
        
#         if existing_df.empty:
#             print("No existing financial records found. All records will be inserted.")
#             return df_clean, len(df_clean), 0
        
#         # Normalize data types for comparison
#         df_comparison = df_clean.copy()
        
#         # Handle string date columns
#         for col in ['Date']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = existing_df[col].astype(str).replace('None', '').replace('nan', '')
#                 df_comparison[col] = df_comparison[col].astype(str).replace('None', '').replace('nan', '')
        
#         # Handle numeric columns
#         for col in ['Week', 'Year', 'Quarter']:
#             if col in existing_df.columns and col in df_comparison.columns:
#                 existing_df[col] = pd.to_numeric(existing_df[col], errors='coerce').fillna(0)
#                 df_comparison[col] = pd.to_numeric(df_comparison[col], errors='coerce').fillna(0)
        
#         # Handle string columns
#         for col in ['Store']:
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
        
#         print(f"Financial duplicate analysis complete:")
#         print(f"  - Total records in upload: {len(df_comparison)}")
#         print(f"  - Duplicate records found: {duplicates_count}")
#         print(f"  - New records to insert: {new_records_count}")
        
#         if duplicates_count > 0:
#             print("Sample duplicate financial records:")
#             duplicate_samples = df_comparison[duplicate_mask][unique_identifier_columns].head(3)
#             print(duplicate_samples.to_string())
        
#         # Filter out duplicates
#         df_filtered = df_comparison[~duplicate_mask].copy()
        
#         # Remove the temporary composite_key column
#         if 'composite_key' in df_filtered.columns:
#             df_filtered = df_filtered.drop('composite_key', axis=1)
        
#         return df_filtered, new_records_count, duplicates_count
        
#     except Exception as e:
#         print(f"Error during financial duplicate check: {str(e)}")
#         print("Proceeding without duplicate check...")
#         return df_clean, len(df_clean), 0


# def insert_financials_with_duplicate_check(
#     db: Session, 
#     df: pd.DataFrame, 
#     company_id: int,
#     file_name: str = None,  # ADD THIS PARAMETER
#     dashboard: int = None   # ADD THIS PARAMETER
# ) -> dict:
#     """
#     Insert financial data with comprehensive duplicate checking.
#     Same pattern as insert_sales_pmix_with_duplicate_check.
#     """
    
#     try:
#         print(f"Starting financial insertion process for {len(df)} records...")
        
#         # Clean and prepare data
#         df_clean = df.copy()
        
#         # Handle Week column properly
#         if 'Week' in df_clean.columns:
#             df_clean['Week'] = pd.to_numeric(df_clean['Week'], errors='coerce').astype('Int64')
        
#         # Convert datetime columns
#         datetime_columns = ['Ly_Date']
#         for col in datetime_columns:
#             if col in df_clean.columns:
#                 df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')
        
#         # Convert string columns
#         string_columns = ['Date', 'Day', 'Month']
#         for col in string_columns:
#             if col in df_clean.columns:
#                 df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
        
#         # Check for duplicates
#         df_filtered, new_records_count, duplicates_count = check_and_filter_duplicates_financials(
#             db, df_clean, company_id
#         )
        
#         if len(df_filtered) == 0:
#             print("No new financial records to insert after duplicate check.")
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
                
#                 # ADD FILE_NAME AND DASHBOARD TO EACH RECORD
#                 if file_name:
#                     record_dict['file_name'] = file_name
#                 if dashboard is not None:
#                     record_dict['dashboard'] = dashboard
                
#                 # Handle NaN values
#                 for key, value in record_dict.items():
#                     if pd.isna(value):
#                         record_dict[key] = None
                
#                 records_to_insert.append(record_dict)
            
#             # Bulk insert using SQLAlchemy
#             db.bulk_insert_mappings(FinancialsCompanyWide, records_to_insert)
#             inserted_count += len(records_to_insert)
            
#             print(f"Inserted financial batch {i//batch_size + 1}: {len(records_to_insert)} records")
        
#         # Commit the transaction
#         db.commit()
#         print(f"Successfully inserted {inserted_count} new financial records into financials_company_wide table")
        
#         return {
#             'inserted_count': inserted_count,
#             'duplicate_count': duplicates_count,
#             'total_processed': len(df),
#             'status': 'success'
#         }
        
#     except Exception as e:
#         db.rollback()
#         print(f"Error during financial insertion: {str(e)}")
#         raise e

# ============================================================================
# BASIC CRUD OPERATIONS
# ============================================================================

def create_financials_record(db: Session, obj_in: FinancialsCompanyWideCreate):
    """Create a new financials record"""
    db_obj = FinancialsCompanyWide(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_financials_record(db: Session, record_id: int):
    """Get a specific financials record by ID"""
    return db.query(FinancialsCompanyWide).filter(FinancialsCompanyWide.id == record_id).first()

def get_financials_records(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    company_id: Optional[int] = None,
    store: Optional[str] = None,
    file_name: Optional[str] = None,
    dashboard: Optional[int] = None,
    year: Optional[int] = None
):
    """Get financials records with optional filtering"""
    query = db.query(FinancialsCompanyWide)
    
    # Apply filters
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    if store:
        query = query.filter(FinancialsCompanyWide.Store.ilike(f"%{store}%"))
    if file_name:
        query = query.filter(FinancialsCompanyWide.file_name.ilike(f"%{file_name}%"))
    if dashboard is not None:
        query = query.filter(FinancialsCompanyWide.dashboard == dashboard)
    if year is not None:
        query = query.filter(FinancialsCompanyWide.Year == year)
    
    return query.offset(skip).limit(limit).all()

def update_financials_record(db: Session, record_id: int, obj_in: FinancialsCompanyWideCreate):
    """Update a specific financials record"""
    db_obj = db.query(FinancialsCompanyWide).filter(FinancialsCompanyWide.id == record_id).first()
    if db_obj:
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
    return db_obj

def delete_financials_record(db: Session, record_id: int):
    """Delete a specific financials record"""
    db_obj = db.query(FinancialsCompanyWide).filter(FinancialsCompanyWide.id == record_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
        return True
    return False

# ============================================================================
# BULK DELETION OPERATIONS
# ============================================================================

def delete_all_financials_records(db: Session, company_id: Optional[int] = None):
    """Delete all financials records (optionally filtered by company)"""
    query = db.query(FinancialsCompanyWide)
    
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

def delete_financials_by_dashboard(db: Session, dashboard: int, company_id: Optional[int] = None):
    """Delete all financials records for a specific dashboard"""
    query = db.query(FinancialsCompanyWide).filter(FinancialsCompanyWide.dashboard == dashboard)
    
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

def delete_financials_by_filename(db: Session, file_name: str, company_id: Optional[int] = None):
    """Delete all financials records for a specific file name"""
    query = db.query(FinancialsCompanyWide).filter(FinancialsCompanyWide.file_name == file_name)
    
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

def delete_financials_by_store(db: Session, store: str, company_id: Optional[int] = None):
    """Delete all financials records for a specific store"""
    query = db.query(FinancialsCompanyWide).filter(FinancialsCompanyWide.Store == store)
    
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

# ============================================================================
# ANALYTICS AND SUMMARY OPERATIONS
# ============================================================================

def get_financials_summary(
    db: Session,
    company_id: Optional[int] = None,
    dashboard: Optional[int] = None,
    file_name: Optional[str] = None,
    store: Optional[str] = None,
    year: Optional[int] = None
) -> Dict[str, Any]:
    """Get summary statistics for financials records"""
    query = db.query(FinancialsCompanyWide)
    
    # Apply filters
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    if dashboard is not None:
        query = query.filter(FinancialsCompanyWide.dashboard == dashboard)
    if file_name:
        query = query.filter(FinancialsCompanyWide.file_name == file_name)
    if store:
        query = query.filter(FinancialsCompanyWide.Store == store)
    if year is not None:
        query = query.filter(FinancialsCompanyWide.Year == year)
    
    # Get basic counts
    total_records = query.count()
    
    # Get financial summaries
    financial_summary = query.with_entities(
        func.sum(FinancialsCompanyWide.Tw_Sales).label('total_tw_sales'),
        func.sum(FinancialsCompanyWide.Lw_Sales).label('total_lw_sales'),
        func.sum(FinancialsCompanyWide.Ly_Sales).label('total_ly_sales'),
        func.sum(FinancialsCompanyWide.Tw_Orders).label('total_tw_orders'),
        func.avg(FinancialsCompanyWide.Tw_Avg_Tckt).label('avg_tw_ticket'),
        func.sum(FinancialsCompanyWide.Tw_Labor_Hrs).label('total_tw_labor_hrs')
    ).first()
    
    return {
        "total_records": total_records,
        "total_tw_sales": float(financial_summary.total_tw_sales or 0),
        "total_lw_sales": float(financial_summary.total_lw_sales or 0),
        "total_ly_sales": float(financial_summary.total_ly_sales or 0),
        "total_tw_orders": float(financial_summary.total_tw_orders or 0),
        "average_tw_ticket": float(financial_summary.avg_tw_ticket or 0),
        "total_tw_labor_hours": float(financial_summary.total_tw_labor_hrs or 0),
        "filters_applied": {
            "company_id": company_id,
            "dashboard": dashboard,
            "file_name": file_name,
            "store": store,
            "year": year
        }
    }

# def get_financials_uploaded_files_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
#     """Get list of all uploaded files with record counts"""
#     query = db.query(
#         FinancialsCompanyWide.file_name,
#         func.count(FinancialsCompanyWide.id).label('record_count'),
#         func.min(FinancialsCompanyWide.Year).label('earliest_year'),
#         func.max(FinancialsCompanyWide.Year).label('latest_year'),
#         func.sum(FinancialsCompanyWide.Tw_Sales).label('total_sales')
#     ).filter(FinancialsCompanyWide.file_name.isnot(None))
    
#     if company_id:
#         query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
#     query = query.group_by(FinancialsCompanyWide.file_name).order_by(FinancialsCompanyWide.file_name)
    
#     results = []
#     for row in query.all():
#         results.append({
#             "file_name": row.file_name,
#             "record_count": row.record_count,
#             "earliest_year": row.earliest_year,
#             "latest_year": row.latest_year,
#             "total_sales": float(row.total_sales or 0)
#         })
    
#     return results



# def get_financials_uploaded_files_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
#     """Get list of all uploaded financial files with record counts and parsed datetime"""
#     query = db.query(
#         FinancialsCompanyWide.file_name,
#         func.count(FinancialsCompanyWide.id).label('record_count'),
#         func.min(FinancialsCompanyWide.Year).label('earliest_year'),
#         func.max(FinancialsCompanyWide.Year).label('latest_year'),
#         func.sum(FinancialsCompanyWide.Tw_Sales).label('total_sales')
#     ).filter(FinancialsCompanyWide.file_name.isnot(None))
    
#     if company_id:
#         query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
#     query = query.group_by(FinancialsCompanyWide.file_name).order_by(FinancialsCompanyWide.file_name)
    
#     results = []
#     for row in query.all():
#         file_timestamp = parse_datetime_from_filename(row.file_name)
#         results.append({
#             "file_name": row.file_name,
#             "file_timestamp": file_timestamp,
#             "record_count": row.record_count,
#             "earliest_year": row.earliest_year,
#             "latest_year": row.latest_year,
#             "total_sales": float(row.total_sales or 0)
#         })
    
#     return results


# def get_financials_uploaded_files_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
#     """Get list of all uploaded financial files with record counts and parsed datetime including company name"""
#     query = db.query(
#         FinancialsCompanyWide.file_name,
#         func.count(FinancialsCompanyWide.id).label('record_count'),
#         func.min(FinancialsCompanyWide.Year).label('earliest_year'),
#         func.max(FinancialsCompanyWide.Year).label('latest_year'),
#         func.sum(FinancialsCompanyWide.Tw_Sales).label('total_sales'),
#         Company.name.label('company_name')
#     ).join(Company, FinancialsCompanyWide.company_id == Company.id) \
#      .filter(FinancialsCompanyWide.file_name.isnot(None))
    
#     if company_id:
#         query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
#     query = query.group_by(FinancialsCompanyWide.file_name, Company.name).order_by(FinancialsCompanyWide.file_name)
    
#     results = []
#     for row in query.all():
#         file_timestamp = parse_datetime_from_filename(row.file_name)
#         results.append({
#             "file_name": row.file_name,
#             "file_timestamp": file_timestamp,
#             "company_name": row.company_name,
#             "record_count": row.record_count,
#             "earliest_year": row.earliest_year,
#             "latest_year": row.latest_year,
#             "total_sales": float(row.total_sales or 0)
#         })
    
#     return results



# Add this new function to your CRUD file:
def delete_financials_by_store_and_company(db: Session, store: str, company_name: str) -> Dict[str, Any]:
    """Delete all financials records for a specific store and company name"""
    
    # First, get the company_id from company name
    company = db.query(Company).filter(Company.name == company_name).first()
    
    if not company:
        return {
            "deleted_count": 0,
            "company_id": None
        }
    
    company_id = company.id
    
    # Delete records matching both store and company_id
    query = db.query(FinancialsCompanyWide).filter(
        and_(
            FinancialsCompanyWide.Store == store,
            FinancialsCompanyWide.company_id == company_id
        )
    )
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return {
        "deleted_count": deleted_count,
        "company_id": company_id
    }

# Updated file list function with store breakdown
def get_financials_uploaded_files_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all uploaded financial files with record counts broken down by store and company name"""
    
    # Get detailed breakdown by file, store, and company
    query = db.query(
        FinancialsCompanyWide.file_name,
        FinancialsCompanyWide.Store,
        Company.name.label('company_name'),
        func.count(FinancialsCompanyWide.id).label('store_record_count'),
        func.sum(FinancialsCompanyWide.Tw_Sales).label('store_total_sales'),
        func.min(FinancialsCompanyWide.Year).label('store_earliest_year'),
        func.max(FinancialsCompanyWide.Year).label('store_latest_year')
    ).join(Company, FinancialsCompanyWide.company_id == Company.id) \
     .filter(FinancialsCompanyWide.file_name.isnot(None))

    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)

    query = query.group_by(
        FinancialsCompanyWide.file_name, 
        FinancialsCompanyWide.Store, 
        Company.name
    ).order_by(FinancialsCompanyWide.file_name, FinancialsCompanyWide.Store)

    # Group results by file
    files_dict = {}
    for row in query.all():
        file_key = row.file_name
        
        if file_key not in files_dict:
            file_timestamp = parse_datetime_from_filename(row.file_name)
            # clean_file_name = extract_clean_filename(row.file_name)
            clean_file_name = row.file_name
            files_dict[file_key] = {
                "file_name": clean_file_name,
                "file_timestamp": file_timestamp,
                "company_name": row.company_name,
                "record_count": 0,
                "total_sales": 0.0,
                "earliest_year": None,
                "latest_year": None,
                "stores": []
            }
        
        # Update file totals
        files_dict[file_key]["record_count"] += row.store_record_count
        files_dict[file_key]["total_sales"] += float(row.store_total_sales or 0)
        
        # Update year ranges
        if files_dict[file_key]["earliest_year"] is None or (row.store_earliest_year and row.store_earliest_year < files_dict[file_key]["earliest_year"]):
            files_dict[file_key]["earliest_year"] = row.store_earliest_year
        if files_dict[file_key]["latest_year"] is None or (row.store_latest_year and row.store_latest_year > files_dict[file_key]["latest_year"]):
            files_dict[file_key]["latest_year"] = row.store_latest_year
        
        # Add store details
        files_dict[file_key]["stores"].append({
            "store": row.Store or "Unknown Store",
            "record_count": row.store_record_count,
            "total_sales": float(row.store_total_sales or 0),
            "earliest_year": row.store_earliest_year,
            "latest_year": row.store_latest_year,
        })

    # Convert to list and sort stores
    results = []
    for file_data in files_dict.values():
        # Sort stores by record count (descending)
        file_data["stores"].sort(key=lambda x: x["record_count"], reverse=True)
        
        results.append(file_data)

    return results


def get_financials_stores_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all stores with record counts"""
    query = db.query(
        FinancialsCompanyWide.Store,
        func.count(FinancialsCompanyWide.id).label('record_count'),
        func.sum(FinancialsCompanyWide.Tw_Sales).label('total_sales'),
        func.avg(FinancialsCompanyWide.Tw_Sales).label('avg_sales')
    ).filter(FinancialsCompanyWide.Store.isnot(None))
    
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
    query = query.group_by(FinancialsCompanyWide.Store).order_by(FinancialsCompanyWide.Store)
    
    results = []
    for row in query.all():
        results.append({
            "store": row.Store,
            "record_count": row.record_count,
            "total_sales": float(row.total_sales or 0),
            "average_sales": float(row.avg_sales or 0)
        })
    
    return results

def get_financials_dashboards_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all dashboards with record counts"""
    query = db.query(
        FinancialsCompanyWide.dashboard,
        func.count(FinancialsCompanyWide.id).label('record_count'),
        func.sum(FinancialsCompanyWide.Tw_Sales).label('total_sales')
    ).filter(FinancialsCompanyWide.dashboard.isnot(None))
    
    if company_id:
        query = query.filter(FinancialsCompanyWide.company_id == company_id)
    
    query = query.group_by(FinancialsCompanyWide.dashboard).order_by(FinancialsCompanyWide.dashboard)
    
    results = []
    for row in query.all():
        results.append({
            "dashboard": row.dashboard,
            "record_count": row.record_count,
            "total_sales": float(row.total_sales or 0)
        })
    
    return results

# ============================================================================
# DATAFRAME INSERTION FUNCTIONS
# ============================================================================

def insert_financials_df(db: Session, df: pd.DataFrame, company_id: int, file_name: str = None, dashboard: int = None):
    """
    Insert financials data from DataFrame into database.
    
    Args:
        db: Database session
        df: DataFrame containing financials data
        company_id: Company ID to associate with the data
        file_name: Optional filename to store with each record
        dashboard: Optional dashboard integer to store with each record
    """
    for _, row in df.iterrows():
        data = row.to_dict()
        data["company_id"] = company_id
        
        # Add new fields if provided
        if file_name:
            data["file_name"] = file_name
        if dashboard is not None:
            data["dashboard"] = dashboard
            
        db_obj = FinancialsCompanyWide(**data)
        db.add(db_obj)
    db.commit()

def insert_financials_df_with_metadata(db: Session, df: pd.DataFrame, company_id: int, metadata: dict):
    """
    Insert financials data from DataFrame with metadata applied to all records.
    
    Args:
        db: Database session
        df: DataFrame containing financials data
        company_id: Company ID to associate with the data
        metadata: Dictionary containing metadata fields like file_name, dashboard, etc.
    """
    for _, row in df.iterrows():
        data = row.to_dict()
        data["company_id"] = company_id
        
        # Apply metadata to each record
        data.update(metadata)
            
        db_obj = FinancialsCompanyWide(**data)
        db.add(db_obj)
    db.commit()
    
    
   


def check_and_filter_duplicates_financials(
    db: Session, 
    df_clean: pd.DataFrame, 
    company_id: int
) -> Tuple[pd.DataFrame, int, int]:
    """
    Check for duplicate financial records and filter them out before database insertion.
    """
    
    if df_clean.empty:
        return df_clean, 0, 0
    
    print(f"Starting duplicate check for {len(df_clean)} financial records...")
    
    # Define the columns that make up a unique financial record
    unique_identifier_columns = [
        'Store', 'Date', 'Week', 'Year', 'Quarter'
    ]
    
    # Get the date range from the new data to optimize the query
    min_date = None
    max_date = None
    
    if 'Date' in df_clean.columns:
        # Convert Date column to datetime if it's not already
        df_clean['Date'] = pd.to_datetime(df_clean['Date'], errors='coerce')
        min_date = df_clean['Date'].min()
        max_date = df_clean['Date'].max()
    
    print(f"Checking for financial duplicates in date range: {min_date} to {max_date}")
    
    try:
        # Query existing records from database using SQLAlchemy ORM
        existing_records_query = db.query(FinancialsCompanyWide).filter(
            FinancialsCompanyWide.company_id == company_id
        )
        
        # Add date filtering if available
        if min_date and max_date:
            existing_records_query = existing_records_query.filter(
                and_(
                    FinancialsCompanyWide.Date >= min_date.date() if hasattr(min_date, 'date') else min_date,
                    FinancialsCompanyWide.Date <= max_date.date() if hasattr(max_date, 'date') else max_date
                )
            )
        
        print("Executing database query...")
        existing_records = existing_records_query.all()
        print(f"Found {len(existing_records)} existing records in date range")
        
        # Convert to DataFrame for easier comparison
        existing_data = []
        for record in existing_records:
            record_dict = {}
            for col in unique_identifier_columns:
                value = getattr(record, col, None)
                # Handle date conversion
                if col == 'Date' and value:
                    if hasattr(value, 'strftime'):
                        record_dict[col] = value
                    else:
                        record_dict[col] = pd.to_datetime(value, errors='coerce')
                else:
                    record_dict[col] = value
            existing_data.append(record_dict)
        
        existing_df = pd.DataFrame(existing_data)
        print(f"Converted {len(existing_df)} existing records to DataFrame for comparison")
        
        if existing_df.empty:
            print("No existing financial records found. All records will be inserted.")
            return df_clean, len(df_clean), 0
        
        # Normalize data types for comparison
        df_comparison = df_clean.copy()
        
        # Handle datetime columns - normalize both dataframes to date objects
        for col in ['Date']:
            if col in existing_df.columns and col in df_comparison.columns:
                # Convert existing_df dates to date objects for comparison
                existing_df[col] = pd.to_datetime(existing_df[col], errors='coerce').dt.date
                # Convert comparison df dates to date objects  
                df_comparison[col] = pd.to_datetime(df_comparison[col], errors='coerce').dt.date
        
        # Handle numeric columns
        for col in ['Week', 'Year', 'Quarter']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = pd.to_numeric(existing_df[col], errors='coerce').fillna(0).astype(int)
                df_comparison[col] = pd.to_numeric(df_comparison[col], errors='coerce').fillna(0).astype(int)
        
        # Handle string columns
        for col in ['Store']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = existing_df[col].astype(str).fillna('').str.strip().str.lower()
                df_comparison[col] = df_comparison[col].astype(str).fillna('').str.strip().str.lower()
        
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
        
        print("Sample existing keys:", existing_df['composite_key'].head().tolist())
        print("Sample new keys:", df_comparison['composite_key'].head().tolist())
        
        # Find duplicates
        existing_keys = set(existing_df['composite_key'].tolist())
        duplicate_mask = df_comparison['composite_key'].isin(existing_keys)
        
        duplicates_count = duplicate_mask.sum()
        new_records_count = len(df_comparison) - duplicates_count
        
        print(f"Financial duplicate analysis complete:")
        print(f"  - Total records in upload: {len(df_comparison)}")
        print(f"  - Duplicate records found: {duplicates_count}")
        print(f"  - New records to insert: {new_records_count}")
        
        if duplicates_count > 0:
            print("Sample duplicate financial records:")
            duplicate_samples = df_comparison[duplicate_mask][unique_identifier_columns].head(3)
            print(duplicate_samples.to_string())
            print("\nCorresponding composite keys:")
            print(df_comparison[duplicate_mask]['composite_key'].head(3).tolist())
        
        # Filter out duplicates
        df_filtered = df_comparison[~duplicate_mask].copy()
        
        # Remove the temporary composite_key column and restore original Date format
        if 'composite_key' in df_filtered.columns:
            df_filtered = df_filtered.drop('composite_key', axis=1)
            
        # Convert Date back to the format expected by the database
        if 'Date' in df_filtered.columns:
            df_filtered['Date'] = pd.to_datetime(df_filtered['Date'], errors='coerce')
        
        return df_filtered, new_records_count, duplicates_count
        
    except Exception as e:
        print(f"Error during financial duplicate check: {str(e)}")
        import traceback
        traceback.print_exc()
        print("Proceeding without duplicate check...")
        return df_clean, len(df_clean), 0


def insert_financials_with_duplicate_check(
    db: Session, 
    df: pd.DataFrame, 
    company_id: int,
    file_name: str = None,
    dashboard: int = None
) -> dict:
    """
    Insert financial data with comprehensive duplicate checking.
    """
    
    try:
        print(f"Starting financial insertion process for {len(df)} records...")
        
        # Clean and prepare data
        df_clean = df.copy()
        
        # Handle Week column properly
        if 'Week' in df_clean.columns:
            df_clean['Week'] = pd.to_numeric(df_clean['Week'], errors='coerce').astype('Int64')
        
        # Handle date columns properly
        if 'Date' in df_clean.columns:
            df_clean['Date'] = pd.to_datetime(df_clean['Date'], errors='coerce')
        
        # Convert datetime columns
        datetime_columns = ['Ly_Date']
        for col in datetime_columns:
            if col in df_clean.columns:
                df_clean[col] = pd.to_datetime(df_clean[col], errors='coerce')
        
        # Convert string columns
        string_columns = ['Day', 'Month']
        for col in string_columns:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
        
        # Check for duplicates
        df_filtered, new_records_count, duplicates_count = check_and_filter_duplicates_financials(
            db, df_clean, company_id
        )
        
        if len(df_filtered) == 0:
            print("No new financial records to insert after duplicate check.")
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
                
                # Add file_name and dashboard to each record
                if file_name:
                    record_dict['file_name'] = file_name
                if dashboard is not None:
                    record_dict['dashboard'] = dashboard
                
                # Handle NaN values and date conversion
                for key, value in record_dict.items():
                    if pd.isna(value):
                        record_dict[key] = None
                    elif key == 'Date' and value is not None:
                        # Convert to date object if it's a datetime
                        if hasattr(value, 'date'):
                            record_dict[key] = value.date()
                    elif key == 'Ly_Date' and value is not None:
                        # Keep Ly_Date as datetime object
                        if not hasattr(value, 'strftime'):
                            record_dict[key] = pd.to_datetime(value, errors='coerce')
                
                records_to_insert.append(record_dict)
            
            # Bulk insert using SQLAlchemy
            db.bulk_insert_mappings(FinancialsCompanyWide, records_to_insert)
            inserted_count += len(records_to_insert)
            
            print(f"Inserted financial batch {i//batch_size + 1}: {len(records_to_insert)} records")
        
        # Commit the transaction
        db.commit()
        print(f"Successfully inserted {inserted_count} new financial records into financials_company_wide table")
        
        return {
            'inserted_count': inserted_count,
            'duplicate_count': duplicates_count,
            'total_processed': len(df),
            'status': 'success'
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error during financial insertion: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e


