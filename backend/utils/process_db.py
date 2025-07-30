# Updated section for excel_upload.py
# Replace the existing duplicate check logic with this improved version

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


# Updated section to replace in your excel_upload.py main function