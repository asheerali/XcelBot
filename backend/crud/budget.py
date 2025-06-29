# # crud/budget.py

# from sqlalchemy.orm import Session
# from models.budget import Budget
# from schemas.budget import BudgetCreate
# import pandas as pd

# def create_budget(db: Session, obj_in: BudgetCreate):
#     db_obj = Budget(**obj_in.dict())
#     db.add(db_obj)
#     db.commit()
#     db.refresh(db_obj)
#     return db_obj

# def insert_budget_df(db: Session, df: pd.DataFrame, company_id: int):
#     for _, row in df.iterrows():
#         data = row.to_dict()
#         data["company_id"] = company_id
        
#         # Handle NaN values
#         for key, value in data.items():
#             if pd.isna(value):
#                 data[key] = None
        
#         db_obj = Budget(**data)
#         db.add(db_obj)
#     db.commit()


# Add these functions to your crud/budget.py file

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models.budget import Budget
from typing import List, Tuple

def check_and_filter_duplicates_budget(
    db: Session, 
    df_clean: pd.DataFrame, 
    company_id: int
) -> Tuple[pd.DataFrame, int, int]:
    """
    Check for duplicate budget records and filter them out before database insertion.
    """
    
    if df_clean.empty:
        return df_clean, 0, 0
    
    print(f"Starting duplicate check for {len(df_clean)} budget records...")
    
    # Define the columns that make up a unique budget record
    unique_identifier_columns = [
        'Store', 'Date', 'Week', 'Year', 'Quarter'
    ]
    
    # Get the date range from the new data to optimize the query
    if 'Year' in df_clean.columns:
        min_year = df_clean['Year'].min()
        max_year = df_clean['Year'].max()
    else:
        min_year = max_year = None
    
    print(f"Checking for budget duplicates in year range: {min_year} to {max_year}")
    
    try:
        # Query existing records from database using SQLAlchemy ORM
        existing_records_query = db.query(Budget).filter(
            Budget.company_id == company_id
        )
        
        # Add year filtering if available
        if min_year and max_year:
            existing_records_query = existing_records_query.filter(
                and_(
                    Budget.Year >= min_year,
                    Budget.Year <= max_year
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
        print(f"Found {len(existing_df)} existing budget records in database for comparison")
        
        if existing_df.empty:
            print("No existing budget records found. All records will be inserted.")
            return df_clean, len(df_clean), 0
        
        # Normalize data types for comparison
        df_comparison = df_clean.copy()
        
        # Handle string date columns
        for col in ['Date']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = existing_df[col].astype(str).replace('None', '').replace('nan', '')
                df_comparison[col] = df_comparison[col].astype(str).replace('None', '').replace('nan', '')
        
        # Handle numeric columns
        for col in ['Week', 'Year', 'Quarter']:
            if col in existing_df.columns and col in df_comparison.columns:
                existing_df[col] = pd.to_numeric(existing_df[col], errors='coerce').fillna(0)
                df_comparison[col] = pd.to_numeric(df_comparison[col], errors='coerce').fillna(0)
        
        # Handle string columns
        for col in ['Store']:
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
        
        print(f"Budget duplicate analysis complete:")
        print(f"  - Total records in upload: {len(df_comparison)}")
        print(f"  - Duplicate records found: {duplicates_count}")
        print(f"  - New records to insert: {new_records_count}")
        
        if duplicates_count > 0:
            print("Sample duplicate budget records:")
            duplicate_samples = df_comparison[duplicate_mask][unique_identifier_columns].head(3)
            print(duplicate_samples.to_string())
        
        # Filter out duplicates
        df_filtered = df_comparison[~duplicate_mask].copy()
        
        # Remove the temporary composite_key column
        if 'composite_key' in df_filtered.columns:
            df_filtered = df_filtered.drop('composite_key', axis=1)
        
        return df_filtered, new_records_count, duplicates_count
        
    except Exception as e:
        print(f"Error during budget duplicate check: {str(e)}")
        print("Proceeding without duplicate check...")
        return df_clean, len(df_clean), 0


def insert_budget_with_duplicate_check(
    db: Session, 
    df: pd.DataFrame, 
    company_id: int
) -> dict:
    """
    Insert budget data with comprehensive duplicate checking.
    Same pattern as insert_sales_pmix_with_duplicate_check.
    """
    
    try:
        print(f"Starting budget insertion process for {len(df)} records...")
        
        # Clean and prepare data
        df_clean = df.copy()
        
        # Handle Week column properly
        if 'Week' in df_clean.columns:
            df_clean['Week'] = pd.to_numeric(df_clean['Week'], errors='coerce').astype('Int64')
        
        # Convert string columns
        string_columns = ['Date', 'Month']
        for col in string_columns:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].astype(str).replace('nan', None).replace('NaT', None)
        
        # Check for duplicates
        df_filtered, new_records_count, duplicates_count = check_and_filter_duplicates_budget(
            db, df_clean, company_id
        )
        
        if len(df_filtered) == 0:
            print("No new budget records to insert after duplicate check.")
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
            db.bulk_insert_mappings(Budget, records_to_insert)
            inserted_count += len(records_to_insert)
            
            print(f"Inserted budget batch {i//batch_size + 1}: {len(records_to_insert)} records")
        
        # Commit the transaction
        db.commit()
        print(f"Successfully inserted {inserted_count} new budget records into budget table")
        
        return {
            'inserted_count': inserted_count,
            'duplicate_count': duplicates_count,
            'total_processed': len(df),
            'status': 'success'
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error during budget insertion: {str(e)}")
        raise e