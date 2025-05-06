from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import base64
import io
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import numpy as np

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic models
class ExcelUploadRequest(BaseModel):
    fileName: str
    fileContent: str  # base64 encoded file content
    startDate: Optional[str] = None  # Optional date filter start
    endDate: Optional[str] = None    # Optional date filter end
    location: Optional[str] = None   # Optional location filter

class ExcelFilterRequest(BaseModel):
    fileName: str  # Name of the previously uploaded file
    fileContent: Optional[str] = None  # Optional base64 content if re-uploading
    startDate: Optional[str] = None  # Date filter start
    endDate: Optional[str] = None    # Date filter end
    location: Optional[str] = None   # Location filter
    dateRangeType: Optional[str] = None  # Type of date range (e.g., "Last 7 Days")

class ExcelUploadResponse(BaseModel):
    table1: List[Dict[str, Any]]
    table2: List[Dict[str, Any]]
    table3: List[Dict[str, Any]]
    table4: List[Dict[str, Any]]
    table5: List[Dict[str, Any]]
    locations: List[str] = []
    dateRanges: List[str] = []


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


def calculate_raw_data_table(df):
    """
    TABLE 1: Raw Data Table (Week, 1P, Catering, DD, GH, In-House, UB, Grand Total)
    This table shows the raw sales numbers for each category.
    """
    # Group by Week and Sales_Category, sum the Net Price
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data to create the weekly summary table
    pivot_table = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_table.columns:
            pivot_table[col] = 0
    
    # Calculate 1P column (First Party) - equivalent to In-House sales
    pivot_table['1P'] = pivot_table['In-House']
    
    # Calculate Grand Total
    pivot_table['Grand Total'] = pivot_table[
        ['Catering', 'DD', 'GH', 'In-House', 'UB']
    ].sum(axis=1)
    
    # Reorder columns to match expected format
    column_order = ['Week', '1P', 'Catering', 'DD', 'GH', 'In-House', 'UB', 'Grand Total']
    pivot_table = pivot_table[
        [col for col in column_order if col in pivot_table.columns]
    ]
    
    # Format the currency values
    for col in pivot_table.columns:
        if col != 'Week':
            pivot_table[col] = pivot_table[col].apply(lambda x: f"${x:,.2f}")
    
    # Convert to records format for JSON serialization
    return pivot_table.to_dict(orient='records')


def calculate_percentage_table(df):
    """
    TABLE 2: Percentage Table (Week, 1P, Catering, DD, GH, In-House, UB)
    This table shows week-over-week percentage changes for each category.
    """
    # First, get the raw data table (without formatting)
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data
    pivot_raw = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_raw.columns:
            pivot_raw[col] = 0
    
    # Add 1P column (equivalent to In-House)
    pivot_raw['1P'] = pivot_raw['In-House']
    
    # Sort by Week
    pivot_raw = pivot_raw.sort_values('Week')
    
    # Initialize the percentage change table
    pct_change_cols = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']
    pct_table = pd.DataFrame()
    pct_table['Week'] = pivot_raw['Week']
    
    # Calculate percentage changes for each column
    for col in pct_change_cols:
        if col in pivot_raw.columns:
            # Calculate percentage change with shift
            pct_table[col] = pivot_raw[col].pct_change() * 100
            
    # Format the percentage values
    for col in pct_table.columns:
        if col != 'Week':
            pct_table[col] = pct_table[col].apply(lambda x: f"{x:.2f}%" if not pd.isna(x) else "####")
    
    # Convert to records format for JSON serialization
    return pct_table.to_dict(orient='records')


def calculate_inhouse_percentages(df):
    """
    TABLE 3: In-House Table (Week, 1P, In-House, Catering, DD, GH, UB)
    This table shows each category as a percentage of In-House sales.
    """
    # First, get the raw data table (without formatting)
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data
    pivot_raw = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_raw.columns:
            pivot_raw[col] = 0
    
    # Add 1P column (equivalent to In-House)
    pivot_raw['1P'] = pivot_raw['In-House']
    
    # Initialize the percentage of In-House table
    pct_ih_table = pd.DataFrame()
    pct_ih_table['Week'] = pivot_raw['Week']
    
    # Calculate as a percentage of In-House sales
    pct_cols = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']
    for col in pct_cols:
        if col in pivot_raw.columns:
            pct_ih_table[col] = (pivot_raw[col] / pivot_raw['In-House'] * 100)
    
    # Format the percentage values - using numpy.isinf instead of pd.isinf
    for col in pct_ih_table.columns:
        if col != 'Week':
            pct_ih_table[col] = pct_ih_table[col].apply(lambda x: f"{x:.2f}%" if not pd.isna(x) and not np.isinf(x) else "####")
    
    # Convert to records format for JSON serialization
    return pct_ih_table.to_dict(orient='records')

def calculate_wow_table(df):
    """
    TABLE 4: WOW Table (Week, 1P, In-House, Catering, DD, GH, UB, 3P, 1P/3P)
    Week-over-Week data with 3P (Third-Party) totals and 1P to 3P ratio.
    """
    # First, get the raw data table (without formatting)
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data
    pivot_raw = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_raw.columns:
            pivot_raw[col] = 0
    
    # Add 1P column (equivalent to In-House)
    pivot_raw['1P'] = pivot_raw['In-House']
    
    # Calculate 3P (Third Party) column - sum of DD, GH, UB
    pivot_raw['3P'] = pivot_raw['DD'] + pivot_raw['GH'] + pivot_raw['UB']
    
    # Calculate 1P/3P ratio
    pivot_raw['1P/3P'] = pivot_raw['1P'] / pivot_raw['3P'].replace(0, float('nan'))
    
    # Sort by Week
    pivot_raw = pivot_raw.sort_values('Week')
    
    # Create the WOW (Week over Week) table
    wow_table = pd.DataFrame()
    wow_table['Week'] = pivot_raw['Week']
    
    # Calculate week-over-week percentage changes
    wow_cols = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB', '3P', '1P/3P']
    for col in wow_cols:
        if col in pivot_raw.columns:
            wow_table[col] = pivot_raw[col].pct_change() * 100
    
    # Format the percentage values
    for col in wow_table.columns:
        if col != 'Week':
            wow_table[col] = wow_table[col].apply(lambda x: f"{x:.2f}%" if not pd.isna(x) else "####")
    
    # Convert to records format for JSON serialization
    return wow_table.to_dict(orient='records')


def calculate_category_summary(df):
    """
    TABLE 5: Category summary table
    This table summarizes sales by category with totals and percentages.
    """
    # Calculate summary by category
    category_summary = df.groupby('Sales_Category').agg(
        Amount=('Net Price', 'sum'),
        Transactions=('Net Price', 'count')
    ).reset_index()
    
    # Calculate 1P category (equivalent to In-House)
    inhouse_data = category_summary[category_summary['Sales_Category'] == 'In-House'].copy()
    if not inhouse_data.empty:
        inhouse_data['Sales_Category'] = '1P'
        category_summary = pd.concat([category_summary, inhouse_data], ignore_index=True)
    
    # Calculate total sales
    total_sales = df['Net Price'].sum()
    category_summary['% of Total'] = ((category_summary['Amount'] / total_sales) * 100).round(1)
    category_summary['Avg Transaction'] = (category_summary['Amount'] / category_summary['Transactions']).round(2)
    
    # Format for display
    category_summary['Amount'] = category_summary['Amount'].apply(lambda x: f"${x:,.2f}")
    category_summary['% of Total'] = category_summary['% of Total'].astype(str) + '%'
    category_summary['Avg Transaction'] = category_summary['Avg Transaction'].apply(lambda x: f"${x:,.2f}")
    
    return category_summary.to_dict(orient='records')


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
        output_path = os.path.join(UPLOAD_DIR, f"processed_{output_timestamp}.xlsx")
        df.to_excel(output_path, index=False)
        print(f"\nProcessed file saved to: {output_path}")
        
        # Get the list of locations if available
        locations = []
        if 'Location' in df.columns:
            locations = df['Location'].unique().tolist()
            # Filter out None or NaN values
            locations = [loc for loc in locations if loc is not None and not pd.isna(loc)]
        
        # Get available date ranges
        date_ranges = generate_date_ranges(df)
        
        # Check if dataframe is empty after filtering
        if len(df) == 0:
            print("Warning: DataFrame is empty after applying filters!")
            # Return empty tables
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
            "locations": locations,   # List of available locations
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


# Add this test endpoint to verify FastAPI routing
@app.get("/api/test")
async def test_endpoint():
    return {"status": "ok", "message": "Test endpoint is working"}


# Upload endpoint
@app.post("/api/excel/upload", response_model=ExcelUploadResponse)
async def upload_excel(request: ExcelUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        # Decode base64 file content
        file_content = base64.b64decode(request.fileContent)
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{request.fileName}")
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        
        # Process Excel file with optional filters
        result = process_excel_file(
            excel_data, 
            start_date=request.startDate,
            end_date=request.endDate,
            location=request.location
        )
        
        # Ensure each table exists in the result, even if empty
        for table in ['table1', 'table2', 'table3', 'table4', 'table5']:
            if table not in result:
                result[table] = []
        
        if 'locations' not in result:
            result['locations'] = []
            
        if 'dateRanges' not in result:
            result['dateRanges'] = []
        
        # Return the properly structured response
        return ExcelUploadResponse(**result)
        
    except Exception as e:
        # Log the full exception for debugging
        import traceback
        print(f"Error processing file: {str(e)}")
        print(traceback.format_exc())
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


# Filter endpoint
@app.post("/api/excel/filter", response_model=ExcelUploadResponse)
async def filter_excel_data(request: ExcelFilterRequest = Body(...)):
    """
    Endpoint to filter previously processed Excel data by date range and location.
    """
    try:
        print(f"Received filter request for file: {request.fileName}")
        print(f"Date range type: {request.dateRangeType}")
        print(f"Location: {request.location}")
        
        # Check if we have the file in the uploads directory
        file_path = None
        for filename in os.listdir(UPLOAD_DIR):
            if request.fileName in filename:  # Changed to search for partial filename match
                file_path = os.path.join(UPLOAD_DIR, filename)
                print(f"Found matching file: {filename}")
                break
        
        # If not found, check if fileContent is provided
        if not file_path and not request.fileContent:
            print(f"File not found in uploads directory: {request.fileName}")
            print(f"Files in directory: {os.listdir(UPLOAD_DIR)}")
            raise HTTPException(
                status_code=404, 
                detail=f"File not found: {request.fileName}. Please upload the file again."
            )
        
        # If fileContent is provided, use that instead
        if request.fileContent:
            # Decode base64 file content
            file_content = base64.b64decode(request.fileContent)
            excel_data = io.BytesIO(file_content)
        else:
            # Read the file from disk
            with open(file_path, "rb") as f:
                file_content = f.read()
            excel_data = io.BytesIO(file_content)
        
        # Handle date range types
        start_date = request.startDate
        end_date = request.endDate
        
        if request.dateRangeType and not (request.startDate and request.endDate):
            # Calculate date range based on type
            now = datetime.now()
            
            if request.dateRangeType == "Last 7 Days":
                start_date = (now - timedelta(days=7)).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
            
            elif request.dateRangeType == "Last 30 Days":
                start_date = (now - timedelta(days=30)).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
            
            elif "This Month" in request.dateRangeType:
                start_date = now.replace(day=1).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
                
            elif "Last Month" in request.dateRangeType:
                last_month = now.replace(day=1) - timedelta(days=1)
                start_date = last_month.replace(day=1).strftime("%Y-%m-%d")
                end_date = last_month.strftime("%Y-%m-%d")
                
            elif request.dateRangeType == "Last 3 Months":
                start_date = (now - timedelta(days=90)).strftime("%Y-%m-%d")
                end_date = now.strftime("%Y-%m-%d")
                
            print(f"Using date range: {start_date} to {end_date} based on type: {request.dateRangeType}")
        
        # Process Excel file with filters
        result = process_excel_file(
            excel_data, 
            start_date=start_date,
            end_date=end_date,
            location=request.location
        )
        
        # Ensure each table exists in the result, even if empty
        for table in ['table1', 'table2', 'table3', 'table4', 'table5']:
            if table not in result:
                result[table] = []
        
        if 'locations' not in result:
            result['locations'] = []
            
        if 'dateRanges' not in result:
            result['dateRanges'] = []
        
        # Return the properly structured response
        return ExcelUploadResponse(**result)
        
    except Exception as e:
        # Log the full exception for debugging
        import traceback
        print(f"Error filtering data: {str(e)}")
        print(traceback.format_exc())
        
        # Return a more specific error message
        error_message = str(e)
        if "NaTType does not support strftime" in error_message:
            error_message = "Date formatting error. This usually happens with invalid date values in your data."
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error filtering data: {error_message}")


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)