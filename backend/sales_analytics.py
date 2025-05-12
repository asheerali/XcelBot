import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import io
import re
import traceback

def process_raw_excel_data(file_data: io.BytesIO) -> pd.DataFrame:
    """
    Process unformatted Excel data by identifying column types and reformatting.
    This is designed to handle Excel files that don't have proper headers.
    """
    try:
        # First try to read with default settings
        df = pd.read_excel(file_data)
        
        # Print sample data to debug
        print("Initial data read:")
        # print(df.head(3))
        # print(f"Columns: {df.columns.tolist()}")
        
        # If we have valid headers, return the DataFrame
        if len(df.columns) >= 6 and not all(isinstance(col, int) for col in df.columns):
            print("Found valid headers, using standard format")
            return df
        
        # If headers are numeric or missing, try to infer columns from data
        print("Headers missing or invalid, attempting to identify columns from data")
        
        # Reset file pointer
        file_data.seek(0)
        
        # Try reading without headers
        df = pd.read_excel(file_data, header=None)
        
        # Sample the first few rows to identify patterns
        sample_rows = df.head(5)
        # print("Sample data with no headers:")
        # print(sample_rows)
        
        # If we have at least 6 columns, try to infer the structure
        if len(df.columns) >= 6:
            # Define expected column names based on observed data patterns
            column_names = [
                'Restaurant', 'Timestamp', 'Dining Option', 'Net Price', 'Qty', 'Location', 'Date'
            ]
            
            # If we have fewer columns than expected, pad the list
            while len(column_names) < len(df.columns):
                column_names.append(f'Column_{len(column_names)+1}')
                
            # Trim if we have more names than columns
            column_names = column_names[:len(df.columns)]
            
            # Assign column names
            df.columns = column_names
            
            # Check if the first row looks like headers
            first_row = df.iloc[0]
            if first_row['Restaurant'] == 'Restaurant' or isinstance(first_row['Restaurant'], str) and 'restaurant' in first_row['Restaurant'].lower():
                print("First row appears to be headers, dropping")
                df = df.iloc[1:].reset_index(drop=True)
            
            # Ensure numeric columns are numeric
            if 'Net Price' in df.columns:
                df['Net Price'] = pd.to_numeric(df['Net Price'], errors='coerce')
            
            if 'Qty' in df.columns:
                df['Qty'] = pd.to_numeric(df['Qty'], errors='coerce')
                df['Qty'] = df['Qty'].fillna(1)  # Default to 1 if quantity is missing
                
            # Convert timestamp to datetime
            if 'Timestamp' in df.columns:
                df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
                
            # Convert date to datetime if present
            if 'Date' in df.columns:
                df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            
            # print("After processing:")
            # print(df.head(3))
            return df
        else:
            # Not enough columns, try to read with Excel's default handling
            print("Not enough columns identified, using original data")
            file_data.seek(0)
            return pd.read_excel(file_data)
            
    except Exception as e:
        print(f"Error processing raw Excel data: {str(e)}")
        print(traceback.format_exc())
        # Return the original data as a fallback
        file_data.seek(0)
        return pd.read_excel(file_data)

def categorize_dining_option(option: str) -> str:
    """
    Categorize the dining option into one of the standard categories.
    
    Categories:
    - In-House: All dine-in, take-out, cashier, kiosk orders
    - 1P: First-party delivery services handled by the restaurant
    - Catering: All catering services
    - DD: DoorDash
    - GH: GrubHub
    - UB: UberEats
    """
    if not option or not isinstance(option, str):
        return 'In-House'  # Default category

    option_lower = option.lower()
    
    # Catering
    if any(x in option_lower for x in ['cater', 'catering']):
        return 'Catering'
    
    # DoorDash
    if any(x in option_lower for x in ['doordash', 'door dash']):
        return 'DD'
    
    # GrubHub
    if any(x in option_lower for x in ['grubhub', 'grub hub']):
        return 'GH'
    
    # UberEats
    if any(x in option_lower for x in ['uber', 'ubereats']):
        return 'UB'
    
    # 1P (First Party Delivery)
    if any(x in option_lower for x in ['delivery - phone', 'phone delivery', '1p']):
        return '1P'
    
    # In-House (default for all other types)
    return 'In-House'

def calculate_sales_by_day_of_week(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales aggregated by day of week.
    Returns data in format suitable for charts.
    """
    try:
        # print("=== DEBUGGING DAY OF WEEK CALCULATION ===")
        # print(f"DataFrame columns: {df.columns.tolist()}")
        # print(f"DataFrame shape: {df.shape}")
        # print(f"First few rows: {df.head(2)}")
        
        # Ensure the Date column is in datetime format
        date_column = None
        
        # First try to use the Date column if it exists
        if 'Date' in df.columns:
            date_column = 'Date'
        else:
            # Try to find a date column
            for col in df.columns:
                if 'date' in str(col).lower() and col != 'Timestamp':
                    # Check if it looks like a date column
                    sample = df[col].iloc[0] if len(df) > 0 else None
                    if isinstance(sample, pd.Timestamp) or (
                        isinstance(sample, str) and 
                        (re.match(r'\d{1,2}/\d{1,2}/\d{4}', sample) or 
                         re.match(r'\d{4}-\d{1,2}-\d{1,2}', sample))
                    ):
                        date_column = col
                        break
        
        # If no date column, try using the timestamp
        if not date_column and 'Timestamp' in df.columns:
            # Use timestamp to extract the date
            df['Date'] = pd.to_datetime(df['Timestamp']).dt.date
            date_column = 'Date'
        
        # If still no date column, check if there's a value in the last column that looks like a date
        if not date_column and len(df.columns) >= 6:
            last_col = df.columns[-1]
            sample = df[last_col].iloc[0] if len(df) > 0 else None
            if isinstance(sample, str) and '/' in sample:
                try:
                    df['Date'] = pd.to_datetime(df[last_col], format='%m/%d/%Y', errors='coerce')
                    date_column = 'Date'
                except:
                    pass
        
        if date_column:
            # print(f"Date column found: {date_column}")
            # print(f"Date sample values: {df[date_column].head()}")
            
            # Convert to datetime if not already
            if not pd.api.types.is_datetime64_dtype(df[date_column]):
                # print("Converting Date column to datetime...")
                df['Date'] = pd.to_datetime(df[date_column], errors='coerce')
                # print(f"After conversion - Date sample: {df['Date'].head()}")
                # print(f"NaN values in Date: {df['Date'].isna().sum()}/{len(df)}")
                date_column = 'Date'
            
            # Extract day of week (0=Monday, 6=Sunday)
            # print("Extracting day of week...")
            df['DayOfWeek'] = df[date_column].dt.dayofweek
            df['DayName'] = df[date_column].dt.day_name()
            
            # print(f"Day of week sample: {df[['Date', 'DayOfWeek', 'DayName']].head()}")
            
            # Calculate the total price for each row (price * quantity)
            price_col = None
            qty_col = None
            
            # Find price column
            for col in ['Net Price', 'Price', 'Amount', 'Total']:
                if col in df.columns:
                    price_col = col
                    break
            
            # If still no price column, look for columns with 'price' in name
            if not price_col:
                for col in df.columns:
                    if 'price' in str(col).lower():
                        price_col = col
                        break
            
            # Find quantity column
            for col in ['Qty', 'Quantity', 'Count']:
                if col in df.columns:
                    qty_col = col
                    break
            
            # If still no quantity column, look for columns with 'qty' in name
            if not qty_col:
                for col in df.columns:
                    if 'qty' in str(col).lower() or 'quantity' in str(col).lower():
                        qty_col = col
                        break
            
            # Log what we found
            # print(f"Price column found: {price_col}")
            # print(f"Quantity column found: {qty_col}")
            
            # Calculate total price
            if price_col:
                if qty_col:
                    # print(f"Calculating total price as {price_col} * {qty_col}")
                    df['TotalPrice'] = pd.to_numeric(df[price_col], errors='coerce') * pd.to_numeric(df[qty_col], errors='coerce').fillna(1)
                else:
                    # print(f"Using {price_col} directly as total price")
                    df['TotalPrice'] = pd.to_numeric(df[price_col], errors='coerce')
                
                # print(f"Total price sample: {df['TotalPrice'].head()}")
                
                # Check for invalid values
                if df['TotalPrice'].isna().any():
                    print(f"Warning: {df['TotalPrice'].isna().sum()} NaN values in TotalPrice")
                    # Replace NaN with 0
                    df['TotalPrice'] = df['TotalPrice'].fillna(0)
                
                # Group by day of week and sum the Total Price
                # print("Grouping by day of week...")
                day_of_week_sales = df.groupby(['DayOfWeek', 'DayName'])['TotalPrice'].sum().reset_index()
                
                # print(f"Day of week sales: {day_of_week_sales}")
                
                # Sort by day of week (Monday first)
                day_of_week_sales = day_of_week_sales.sort_values('DayOfWeek')
                
                # Check if we got any results
                if len(day_of_week_sales) == 0:
                    print("No day of week sales data after grouping!")
                    # Return empty array instead of defaults
                    return []
                
                # Format the output for the frontend chart
                result = []
                day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                day_abbrev = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                
                # Create a dictionary for easy lookup
                sales_dict = dict(zip(day_of_week_sales['DayName'], day_of_week_sales['TotalPrice']))
                
                # Ensure we have data for all days of the week
                for i, day in enumerate(day_order):
                    value = sales_dict.get(day, 0)
                    result.append({
                        "day": day_abbrev[i],
                        "value": round(float(value), 2),
                        "fullDay": day
                    })
                
                return result
            else:
                print("No price column found!")
                # Return empty array instead of defaults
                return []
        else:
            print("No date column found!")
            # Return empty array instead of defaults
            return []
    except Exception as e:
        print(f"Error calculating sales by day of week: {str(e)}")
        print(traceback.format_exc())
        # Return empty array instead of defaults
        return []

def calculate_sales_by_time_of_day(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales aggregated by time of day with improved time handling.
    Returns data in format suitable for charts.
    """
    try:
        print("Calculating sales by time of day")
        print(f"DataFrame columns: {df.columns.tolist()}")
        
        # Identify the time column - specifically look for columns that might contain timestamp info
        time_column = None
        
        # First, try to find a column with "time" or "date" in its name that contains datetime values
        for col in df.columns:
            if any(x in col.lower() for x in ['time', 'date']):
                # Check a sample value to see if it contains time information
                sample_value = df[col].iloc[0] if len(df) > 0 else None
                print(f"Checking column {col}, sample value: {sample_value}, type: {type(sample_value)}")
                
                # If it's already a datetime type or contains something that looks like a time
                if isinstance(sample_value, pd.Timestamp) or (isinstance(sample_value, str) and ':' in sample_value):
                    time_column = col
                    print(f"Using column {col} as time column")
                    break
        
        # If we haven't found a usable time column, look for columns with timestamp format
        if not time_column:
            for col in df.columns:
                # Check a sample value
                sample_value = df[col].iloc[0] if len(df) > 0 else None
                
                # If it's a string that contains time information
                if isinstance(sample_value, str) and ':' in sample_value:
                    time_column = col
                    print(f"Using column {col} as time column based on time format")
                    break
        
        # If we still haven't found a time column, look for a specific pattern in the data
        # Your data seems to have a timestamp like "2025-04-25 15:48:00" in the second column
        if not time_column and len(df.columns) >= 2:
            # Check the second column
            second_col = df.columns[1]
            sample_value = df[second_col].iloc[0] if len(df) > 0 else None
            
            # If it's a string that has a date-time pattern
            if isinstance(sample_value, str) and re.match(r'\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}', sample_value):
                time_column = second_col
                print(f"Using column {second_col} as time column based on date-time pattern")
        
        print(f"Selected time column: {time_column}")
        
        # If we found a time column, use it
        if time_column:
            # Convert to datetime if it's not already
            if not pd.api.types.is_datetime64_dtype(df[time_column]):
                try:
                    df['timestamp'] = pd.to_datetime(df[time_column], errors='coerce')
                    print(f"Converted {time_column} to datetime")
                    # Extract hour
                    df['HourOfDay'] = df['timestamp'].dt.hour
                    print(f"Sample hour values: {df['HourOfDay'].head()}")
                except Exception as e:
                    print(f"Error converting time column: {e}")
                    # If conversion fails, create an "hour" column by extracting from string
                    if isinstance(df[time_column].iloc[0], str) and ':' in df[time_column].iloc[0]:
                        # Extract hour from strings like "15:48:00" or "2025-04-25 15:48:00"
                        try:
                            df['HourOfDay'] = df[time_column].str.extract(r'(\d{2}):', expand=False).astype(int)
                            print(f"Extracted hours from string format: {df['HourOfDay'].head()}")
                        except Exception as e:
                            print(f"Error extracting hour from string: {e}")
                            # Return empty array instead of defaults
                            return []
            else:
                # It's already a datetime column
                df['HourOfDay'] = df[time_column].dt.hour
            
            # Calculate total price
            price_column = get_price_column(df)
            qty_column = get_quantity_column(df)
            
            if price_column and qty_column:
                df['TotalPrice'] = pd.to_numeric(df[price_column], errors='coerce') * pd.to_numeric(df[qty_column], errors='coerce').fillna(1)
            elif price_column:
                df['TotalPrice'] = pd.to_numeric(df[price_column], errors='coerce')
            else:
                print("Could not find price column")
                # Return empty array instead of defaults
                return []
            
            # Check that we have some valid hour values
            if df['HourOfDay'].isna().all():
                print("All hour values are NaN")
                # Return empty array instead of defaults
                return []
            
            # Group by hour and sum prices
            hour_sales = df.groupby('HourOfDay')['TotalPrice'].sum().reset_index()
            print(f"Hour sales: {hour_sales}")
            
            # Create a 24-hour distribution with all hours
            result = []
            for hour in range(24):
                hour_data = hour_sales[hour_sales['HourOfDay'] == hour]
                value = hour_data['TotalPrice'].sum() if not hour_data.empty else 0
                
                # Format the hour label
                if hour == 0:
                    hour_label = "12 AM"
                elif hour < 12:
                    hour_label = f"{hour} AM"
                elif hour == 12:
                    hour_label = "12 PM"
                else:
                    hour_label = f"{hour-12} PM"
                
                # Only include non-zero values and common business hours
                if value > 0 or (hour >= 6 and hour <= 22):
                    result.append({
                        "hour": hour_label,
                        "value": round(float(value), 2)
                    })
            
            # Sort by hour
            result = sorted(result, key=lambda x: get_hour_value(x["hour"]))
            print(f"Formatted result: {result}")
            return result
        else:
            print("No suitable time column found")
            # Return empty array instead of defaults
            return []
    except Exception as e:
        print(f"Error in calculate_sales_by_time_of_day: {str(e)}")
        print(traceback.format_exc())
        # Return empty array instead of defaults
        return []

def get_hour_value(hour_label):
    """Helper function to convert hour labels to numeric values for sorting"""
    if "AM" in hour_label:
        if hour_label == "12 AM":
            return 0
        return int(hour_label.replace(" AM", ""))
    else:  # PM
        if hour_label == "12 PM":
            return 12
        return int(hour_label.replace(" PM", "")) + 12

def get_price_column(df):
    """Find the most likely price column in the dataframe"""
    price_candidates = ['Net Price', 'Price', 'Amount', 'Total']
    
    # First check exact matches
    for col in price_candidates:
        if col in df.columns:
            return col
    
    # Then check partial matches
    for col in df.columns:
        for candidate in ['price', 'amount', 'total', 'cost']:
            if candidate in col.lower():
                return col
    
    # If we have a numeric column in index position 3 (0-indexed), it might be price
    if len(df.columns) >= 4 and pd.api.types.is_numeric_dtype(df[df.columns[3]]):
        return df.columns[3]
    
    # Look for any numeric column
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            return col
    
    return None

def get_quantity_column(df):
    """Find the most likely quantity column in the dataframe"""
    qty_candidates = ['Qty', 'Quantity', 'Count']
    
    # First check exact matches
    for col in qty_candidates:
        if col in df.columns:
            return col
    
    # Then check partial matches
    for col in df.columns:
        for candidate in ['qty', 'quantity', 'count']:
            if candidate in col.lower():
                return col
    
    # If we have a numeric column in index position 4 (0-indexed), it might be quantity
    if len(df.columns) >= 5 and pd.api.types.is_numeric_dtype(df[df.columns[4]]):
        return df.columns[4]
    
    return None

def calculate_sales_by_week(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales aggregated by week.
    Returns data in format suitable for charts.
    """
    try:
        # Find price and quantity columns
        price_col = get_price_column(df)
        qty_col = get_quantity_column(df)
        
        if not price_col:
            print("No price column found for weekly sales calculation")
            return []
        
        # Calculate the net price for each row (price * quantity)
        if qty_col:
            print(f"Calculating TotalPrice as {price_col} * {qty_col}")
            df['TotalPrice'] = pd.to_numeric(df[price_col], errors='coerce') * pd.to_numeric(df[qty_col], errors='coerce').fillna(1)
        else:
            print(f"Using {price_col} directly as TotalPrice")
            df['TotalPrice'] = pd.to_numeric(df[price_col], errors='coerce')
        
        # If Week column already exists
        if 'Week' in df.columns:
            # Group by Week and sum the Total Price
            weekly_sales = df.groupby('Week').agg({
                'TotalPrice': 'sum'
            }).reset_index()
            
            # Format the output for the frontend chart
            result = []
            for _, row in weekly_sales.iterrows():
                result.append({
                    "week": f"Week {int(row['Week'])}",
                    "value": round(float(row['TotalPrice']), 2)
                })
            
            return result
        
        # If Date column exists but Week doesn't
        elif 'Date' in df.columns:
            # Ensure Date is in datetime format
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            
            # Extract week number (ISO week)
            df['Week'] = df['Date'].dt.isocalendar().week
            
            # Group by Week and sum the Total Price
            weekly_sales = df.groupby('Week')['TotalPrice'].sum().reset_index()
            
            # Format the output for the frontend chart
            result = []
            for _, row in weekly_sales.iterrows():
                result.append({
                    "week": f"Week {int(row['Week'])}",
                    "value": round(float(row['TotalPrice']), 2)
                })
            
            return result
        else:
            # If neither Week nor Date column exists, return empty result
            print("Neither Week nor Date column found in dataframe")
            return []
    except Exception as e:
        print(f"Error calculating sales by week: {str(e)}")
        print(traceback.format_exc())
        return []

def calculate_sales_by_category(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales by category per week.
    Returns data in format suitable for stacked charts.
    """
    try:
        # Find price and quantity columns
        price_col = get_price_column(df)
        qty_col = get_quantity_column(df)
        
        if not price_col:
            print("No price column found for category sales calculation")
            return []
        
        # Calculate the net price for each row (price * quantity)
        if qty_col:
            print(f"Calculating TotalPrice as {price_col} * {qty_col}")
            df['TotalPrice'] = pd.to_numeric(df[price_col], errors='coerce') * pd.to_numeric(df[qty_col], errors='coerce').fillna(1)
        else:
            print(f"Using {price_col} directly as TotalPrice")
            df['TotalPrice'] = pd.to_numeric(df[price_col], errors='coerce')
            
        # Ensure Week column exists
        if 'Week' not in df.columns:
            if 'Date' in df.columns:
                df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
                df['Week'] = df['Date'].dt.isocalendar().week
            else:
                # If no Date column, we can't calculate weeks
                print("Week and Date columns not found in dataframe")
                return []
        
        # Find the dining option column
        dining_col = None
        for col in df.columns:
            if 'dining' in str(col).lower() or 'option' in str(col).lower():
                dining_col = col
                break
                
        # Create Sales_Category column using the categorize_dining_option function
        if dining_col:
            print(f"Using {dining_col} for Sales_Category")
            df['Sales_Category'] = df[dining_col].apply(categorize_dining_option)
        else:
            print("No dining option column found - defaulting to In-House")
            df['Sales_Category'] = 'In-House'  # Default if dining option not available
        
        # Group by Week and Sales_Category, summing TotalPrice
        category_sales = df.groupby(['Week', 'Sales_Category'])['TotalPrice'].sum().reset_index()
        
        # Pivot the data to get categories as columns
        pivot_table = category_sales.pivot_table(
            index='Week', 
            columns='Sales_Category', 
            values='TotalPrice',
            fill_value=0
        ).reset_index()
        
        # Make sure all required columns exist
        required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB', '1P']
        for col in required_columns:
            if col not in pivot_table.columns:
                pivot_table[col] = 0
        
        # Format the output for the frontend chart
        result = []
        for _, row in pivot_table.iterrows():
            week_data = {
                "week": f"Week {int(row['Week'])}",
                "inHouse": round(float(row['In-House']), 2),
                "catering": round(float(row.get('Catering', 0)), 2),
                "doordash": round(float(row.get('DD', 0)), 2),
                "grubhub": round(float(row.get('GH', 0)), 2),
                "uber": round(float(row.get('UB', 0)), 2),
                "firstParty": round(float(row.get('1P', 0)), 2)
            }
            result.append(week_data)
        
        return result
    except Exception as e:
        print(f"Error calculating sales by category: {str(e)}")
        print(traceback.format_exc())
        return []

def generate_sales_analytics(file_data: io.BytesIO, start_date=None, end_date=None, location=None) -> Dict[str, Any]:
    """
    Generate comprehensive sales analytics from Excel data.
    
    Parameters:
    - file_data: Excel file as BytesIO object
    - start_date: Optional start date for filtering (str format: 'YYYY-MM-DD')
    - end_date: Optional end date for filtering (str format: 'YYYY-MM-DD')
    - location: Optional location name for filtering
    
    Returns: 
    - Dictionary with various analytics results
    """
    try:
        # Process the raw Excel data to identify columns
        df = process_raw_excel_data(file_data)
        
        # Print a sample of the processed data
        print("Processed data sample:")
        print(df.head(3))
        print("Columns:", df.columns.tolist())
        
        # Reset the file pointer for further operations if needed
        file_data.seek(0)
        
        # Ensure Net Price column is numeric
        if 'Net Price' in df.columns:
            df['Net Price'] = pd.to_numeric(df['Net Price'], errors='coerce')
        else:
            # Try to find a price column
            price_col = None
            for col in df.columns:
                if 'price' in str(col).lower() or 'amount' in str(col).lower():
                    price_col = col
                    break
                    
            # If we found a price column, rename it
            if price_col:
                df['Net Price'] = pd.to_numeric(df[price_col], errors='coerce')
        
        # Ensure Qty column is numeric
        if 'Qty' in df.columns:
            df['Qty'] = pd.to_numeric(df['Qty'], errors='coerce')
            df['Qty'] = df['Qty'].fillna(1)  # Default to 1 if quantity is missing
        else:
            # Try to find a quantity column
            qty_col = None
            for col in df.columns:
                if 'qty' in str(col).lower() or 'quantity' in str(col).lower():
                    qty_col = col
                    break
                    
            # If we found a quantity column, rename it
            if qty_col:
                df['Qty'] = pd.to_numeric(df[qty_col], errors='coerce')
                df['Qty'] = df['Qty'].fillna(1)
            else:
                # Add a default quantity column
                df['Qty'] = 1
        
        # Process date and time information
        # First check if we have a timestamp column
        if 'Timestamp' in df.columns:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
            if 'Date' not in df.columns:
                df['Date'] = df['Timestamp'].dt.date
        
        # If we don't have a Date column, look for one
        if 'Date' not in df.columns:
            date_col = None
            for col in df.columns:
                if 'date' in str(col).lower():
                    date_col = col
                    break
                    
            # If we found a date column, rename it
            if date_col:
                df['Date'] = pd.to_datetime(df[date_col], errors='coerce')
        else:
            # Ensure Date
            
            # Ensure Date is datetime
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
            # Apply location filter with case-insensitive comparison
            try:
                df = df[df['Location'].str.lower() == location.lower()]
                print(f"After location filter, {len(df)} rows remain")
            except Exception as e:
                print(f"Error during location filtering: {e}")
        
        # Make sure we have a valid Week column for grouping
        if 'Week' not in df.columns and 'Date' in df.columns:
            # Extract ISO week number
            df['Week'] = df['Date'].dt.isocalendar().week
        
        # Check if dataframe is empty after filtering
        if len(df) == 0:
            print("Warning: DataFrame is empty after applying filters!")
            # Return empty arrays instead of defaults
            return {
                "salesByWeek": [],
                "salesByDayOfWeek": [],
                "salesByTimeOfDay": [],
                "salesByCategory": []
            }
            
        # Calculate all analytics
        sales_by_week = calculate_sales_by_week(df)
        sales_by_day_of_week = calculate_sales_by_day_of_week(df)
        sales_by_time_of_day = calculate_sales_by_time_of_day(df)
        sales_by_category = calculate_sales_by_category(df)
        
        # Return the data needed by the frontend
        result = {
            "salesByWeek": sales_by_week,
            "salesByDayOfWeek": sales_by_day_of_week,
            "salesByTimeOfDay": sales_by_time_of_day,
            "salesByCategory": sales_by_category
        }
        
        return result
    
    except Exception as e:
        # Log the error
        print(f"Error generating sales analytics: {str(e)}")
        print(traceback.format_exc())
        # Return empty arrays instead of defaults
        return {
            "salesByWeek": [],
            "salesByDayOfWeek": [],
            "salesByTimeOfDay": [],
            "salesByCategory": []
        }