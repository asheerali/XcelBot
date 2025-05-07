import pandas as pd
import io
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

# Import from local modules
from table_calculator import (
    calculate_raw_data_table,
    calculate_percentage_table, 
    calculate_inhouse_percentages,
    calculate_wow_table,
    calculate_category_summary
)

def categorize_dining_option(option):
    """
    Helper function to categorize dining options into standard categories
    1P, Catering, DD, GH, In-House, UB
    """
    option = str(option).lower()
    if 'cater' in option:
        return 'Catering'
    elif 'doordash' in option or 'door dash' in option:
        return 'DD'
    elif 'grubhub' in option or 'grub hub' in option:
        return 'GH'
    elif 'uber' in option or 'ubereats' in option:
        return 'UB'
    else:
        return 'In-House'

def generate_date_ranges(df):
    """
    Generate a list of date ranges for filtering based on the data
    """
    if 'Date' not in df.columns:
        return []
    
    try:
        # Get min and max dates, with error handling
        min_date = df['Date'].min()
        max_date = df['Date'].max()
        
        # Check if min_date is valid (not NaT)
        if pd.isna(min_date):
            # Use current date if min_date is NaT
            min_date = pd.Timestamp.now()
            print("Warning: Min date was NaT, using current date instead")
        
        # Generate monthly ranges
        date_ranges = []
        
        # Last 7 days
        date_ranges.append("Last 7 Days")
        
        # Last 30 days
        date_ranges.append("Last 30 Days")
        
        # This month
        # Use try-except to handle potential strftime errors
        try:
            date_ranges.append(f"This Month ({min_date.strftime('%B %Y')})")
        except Exception as e:
            print(f"Error formatting 'This Month': {e}")
            date_ranges.append("This Month")
        
        # Last month
        try:
            last_month = min_date - pd.Timedelta(days=30)
            date_ranges.append(f"Last Month ({last_month.strftime('%B %Y')})")
        except Exception as e:
            print(f"Error formatting 'Last Month': {e}")
            date_ranges.append("Last Month")
        
        # Last 3 months
        date_ranges.append("Last 3 Months")
        
        # Custom (encourages custom date range selection)
        date_ranges.append("Custom Date Range")
        
        return date_ranges
    except Exception as e:
        print(f"Error generating date ranges: {e}")
        # Return basic date ranges if there was an error
        return ["Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Last 3 Months", "Custom Date Range"]

def process_excel_file(file_data: io.BytesIO, start_date=None, end_date=None, location=None) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process the uploaded Excel file and transform the data.
    Returns data tables for the frontend including the 1P column.
    
    Parameters:
    - file_data: Excel file as BytesIO object
    - start_date: Optional start date for filtering (str format: 'YYYY-MM-DD')
    - end_date: Optional end date for filtering (str format: 'YYYY-MM-DD')
    - location: Optional location name for filtering
    """
    try:
        # Read the Excel file
        df = pd.read_excel(file_data)
        
        # Reset the file pointer for further operations
        file_data.seek(0)
        
        # Store all locations before filtering for later use
        all_locations = []
        if 'Location' in df.columns:
            all_locations = df['Location'].unique().tolist()
            # Filter out None or NaN values
            all_locations = [loc for loc in all_locations if loc is not None and not pd.isna(loc)]
        
        # Data cleaning and preparation
        # Convert numeric columns
        df['Net Price'] = pd.to_numeric(df['Net Price'], errors='coerce')
        
        # Convert date columns to proper datetime format if they exist
        if 'Sent Date' in df.columns:
            df['Sent Date'] = pd.to_datetime(df['Sent Date'], errors='coerce')
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        
        # Apply date filters if provided
        if start_date and 'Date' in df.columns:
            try:
                start_date = pd.to_datetime(start_date)
                df = df[df['Date'] >= start_date]
            except Exception as e:
                print(f"Error applying start date filter: {e}")
        
        if end_date and 'Date' in df.columns:
            try:
                end_date = pd.to_datetime(end_date)
                df = df[df['Date'] <= end_date]
            except Exception as e:
                print(f"Error applying end date filter: {e}")
        
        # Make a copy of the original dataframe after date filtering but before location filtering
        df_before_location = df.copy()
        
        # Apply location filter if provided
        if location and location != "" and 'Location' in df.columns:
            print(f"Filtering by location: '{location}'")
            # Debug log unique locations
            unique_locations = df['Location'].unique()
            print(f"Available locations: {unique_locations}")
            
            # Apply location filter with case-insensitive comparison
            try:
                df = df[df['Location'].str.lower() == location.lower()]
                print(f"After location filter, {len(df)} rows remain")
            except Exception as e:
                print(f"Error during location filtering: {e}")
                # If there's an error, don't apply the filter
        
        # Extract week information
        if 'Week' not in df.columns:
            if 'Date' in df.columns:
                # Handle potential NaT values in the Date column
                try:
                    df['Week'] = df['Date'].dt.isocalendar().week
                except Exception as e:
                    print(f"Error extracting week from Date: {e}")
                    df['Week'] = 1
            elif 'Sent Date' in df.columns:
                try:
                    df['Week'] = df['Sent Date'].dt.isocalendar().week
                except Exception as e:
                    print(f"Error extracting week from Sent Date: {e}")
                    df['Week'] = 1
            else:
                df['Week'] = 1
        
        # Apply categorization
        df['Sales_Category'] = df['Dining Option'].apply(categorize_dining_option)
        
        # Save the processed DataFrame to a new Excel file for reference
        output_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        output_path = os.path.join(upload_dir, f"processed_{output_timestamp}.xlsx")
        df.to_excel(output_path, index=False)
        print(f"\nProcessed file saved to: {output_path}")
        
        # Keep all locations from before filtering
        locations = all_locations
        
        # Get available date ranges
        date_ranges = generate_date_ranges(df)
        
        # Check if dataframe is empty after filtering
        if len(df) == 0:
            print("Warning: DataFrame is empty after applying filters!")
            # Return empty tables but include all locations
            result = {
                "table1": [],
                "table2": [],
                "table3": [],
                "table4": [],
                "table5": [],
                "locations": locations,
                "dateRanges": date_ranges
            }
            return result
            
        # Calculate all tables
        # TABLE 1: Raw Data Table
        table1_data = calculate_raw_data_table(df)
        
        # TABLE 2: Percentage Table
        table2_data = calculate_percentage_table(df)
        
        # TABLE 3: In-House Table
        table3_data = calculate_inhouse_percentages(df)
        
        # TABLE 4: WOW Table
        table4_data = calculate_wow_table(df)
        
        # TABLE 5: Category summary
        table5_data = calculate_category_summary(df)
        
        # Return the data needed by the frontend
        result = {
            "table1": table1_data,    # Raw data table
            "table2": table2_data,    # Percentage table
            "table3": table3_data,    # In-House percentages
            "table4": table4_data,    # Week-over-Week table
            "table5": table5_data,    # Category summary
            "locations": locations,   # List of all locations (not just filtered ones)
            "dateRanges": date_ranges # List of available date ranges
        }
        
        return result
    
    except Exception as e:
        # Log the error
        print(f"Error processing Excel file: {str(e)}")
        import traceback
        print(traceback.format_exc())
        # Re-raise to be caught by the endpoint handler
        raise