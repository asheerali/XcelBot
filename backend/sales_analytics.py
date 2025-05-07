import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import io

def calculate_sales_by_day_of_week(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales aggregated by day of week.
    Returns data in format suitable for charts.
    """
    try:
        # Ensure the Date column is in datetime format
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            
            # Extract day of week (0=Monday, 6=Sunday)
            df['DayOfWeek'] = df['Date'].dt.dayofweek
            df['DayName'] = df['Date'].dt.day_name()
            
            # Group by day of week and sum the Net Price
            day_of_week_sales = df.groupby(['DayOfWeek', 'DayName'])['Net Price'].sum().reset_index()
            
            # Sort by day of week (Monday first)
            day_of_week_sales = day_of_week_sales.sort_values('DayOfWeek')
            
            # Format the output for the frontend chart
            result = []
            day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            day_abbrev = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            
            # Create a dictionary for easy lookup
            sales_dict = dict(zip(day_of_week_sales['DayName'], day_of_week_sales['Net Price']))
            
            # Ensure we have data for all days of the week
            for i, day in enumerate(day_order):
                value = sales_dict.get(day, 0)
                result.append({
                    "day": day_abbrev[i],
                    "value": round(value, 2),
                    "fullDay": day
                })
            
            return result
        else:
            # If Date column doesn't exist, return empty result
            print("Date column not found in dataframe")
            return get_default_day_of_week_data()
    except Exception as e:
        print(f"Error calculating sales by day of week: {str(e)}")
        return get_default_day_of_week_data()

def calculate_sales_by_time_of_day(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales aggregated by time of day.
    Returns data in format suitable for charts.
    """
    try:
        # Check if Time column exists
        time_column = None
        for col in df.columns:
            if 'time' in col.lower() or 'hour' in col.lower():
                time_column = col
                break
        
        if time_column and time_column in df.columns:
            # Convert time column to datetime format if it's not already
            try:
                df[time_column] = pd.to_datetime(df[time_column], errors='coerce')
                # Extract hour of day
                df['HourOfDay'] = df[time_column].dt.hour
                
                # Group by hour of day and sum the Net Price
                hourly_sales = df.groupby('HourOfDay')['Net Price'].sum().reset_index()
                
                # Format the output for the frontend chart
                result = []
                
                # Create bins for time periods
                time_bins = [
                    (4, "4 AM"), (6, "6 AM"), (8, "8 AM"), (10, "10 AM"),
                    (12, "12 PM"), (14, "2 PM"), (16, "4 PM"), (18, "6 PM"),
                    (20, "8 PM"), (22, "10 PM"), (0, "12 AM"), (2, "2 AM")
                ]
                
                # Process each time bin
                for hour, label in time_bins:
                    # Find sales in this hour
                    hour_data = hourly_sales[hourly_sales['HourOfDay'] == hour]
                    value = hour_data['Net Price'].sum() if not hour_data.empty else 0
                    
                    result.append({
                        "hour": label,
                        "value": round(value, 2)
                    })
                
                return result
            except Exception as e:
                print(f"Error processing time column: {str(e)}")
                return get_default_time_of_day_data()
        else:
            # If no time column exists, estimate based on typical restaurant patterns
            print("Time column not found in dataframe, using estimated distribution")
            return get_default_time_of_day_data()
    except Exception as e:
        print(f"Error calculating sales by time of day: {str(e)}")
        return get_default_time_of_day_data()

def calculate_sales_by_week(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales aggregated by week.
    Returns data in format suitable for charts.
    """
    try:
        # If Week column already exists
        if 'Week' in df.columns:
            # Group by Week and sum the Net Price
            weekly_sales = df.groupby('Week').agg({
                'Net Price': 'sum',
                'Dining Option': lambda x: x.value_counts().index[0] if len(x) > 0 else 'Unknown'
            }).reset_index()
            
            # Format the output for the frontend chart
            result = []
            for _, row in weekly_sales.iterrows():
                result.append({
                    "week": f"Week {int(row['Week'])}",
                    "value": round(row['Net Price'], 2)
                })
            
            return result
        
        # If Date column exists but Week doesn't
        elif 'Date' in df.columns:
            # Ensure Date is in datetime format
            df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
            
            # Extract week number (ISO week)
            df['Week'] = df['Date'].dt.isocalendar().week
            
            # Group by Week and sum the Net Price
            weekly_sales = df.groupby('Week')['Net Price'].sum().reset_index()
            
            # Format the output for the frontend chart
            result = []
            for _, row in weekly_sales.iterrows():
                result.append({
                    "week": f"Week {int(row['Week'])}",
                    "value": round(row['Net Price'], 2)
                })
            
            return result
        else:
            # If neither Week nor Date column exists, return empty result
            print("Neither Week nor Date column found in dataframe")
            return []
    except Exception as e:
        print(f"Error calculating sales by week: {str(e)}")
        return []

def calculate_sales_by_category(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate sales by category per week.
    Returns data in format suitable for stacked charts.
    """
    try:
        # Ensure Week column exists
        if 'Week' not in df.columns:
            if 'Date' in df.columns:
                df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
                df['Week'] = df['Date'].dt.isocalendar().week
            else:
                # If no Date column, we can't calculate weeks
                print("Week and Date columns not found in dataframe")
                return []
        
        # Create a categorical mapping for dining options
        df['Sales_Category'] = 'Other'
        
        # Map dining options to categories
        dining_map = {
            'doordash': 'DD',
            'door dash': 'DD',
            'grubhub': 'GH',
            'grub hub': 'GH',
            'uber': 'UB',
            'ubereats': 'UB',
            'catering': 'Catering',
            'cater': 'Catering'
        }
        
        for option, category in dining_map.items():
            mask = df['Dining Option'].str.lower().str.contains(option, na=False)
            df.loc[mask, 'Sales_Category'] = category
        
        # Mark remaining entries as In-House
        in_house_mask = (df['Sales_Category'] == 'Other')
        df.loc[in_house_mask, 'Sales_Category'] = 'In-House'
        
        # Group by Week and Sales_Category, summing Net Price
        category_sales = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
        
        # Pivot the data to get categories as columns
        pivot_table = category_sales.pivot_table(
            index='Week', 
            columns='Sales_Category', 
            values='Net Price',
            fill_value=0
        ).reset_index()
        
        # Make sure all required columns exist
        required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
        for col in required_columns:
            if col not in pivot_table.columns:
                pivot_table[col] = 0
        
        # Format the output for the frontend chart
        result = []
        for _, row in pivot_table.iterrows():
            week_data = {
                "week": f"Week {int(row['Week'])}",
                "inHouse": round(row['In-House'], 2),
                "catering": round(row.get('Catering', 0), 2),
                "doordash": round(row.get('DD', 0), 2),
                "grubhub": round(row.get('GH', 0), 2),
                "uber": round(row.get('UB', 0), 2)
            }
            result.append(week_data)
        
        return result
    except Exception as e:
        print(f"Error calculating sales by category: {str(e)}")
        return []

def get_default_day_of_week_data() -> List[Dict[str, Any]]:
    """
    Returns default data for day of week sales when actual data is unavailable.
    """
    day_abbrev = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    day_full = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    values = [1000, 1200, 1300, 1500, 2000, 1800, 800]
    
    return [
        {"day": day_abbrev[i], "value": values[i], "fullDay": day_full[i]}
        for i in range(7)
    ]

def get_default_time_of_day_data() -> List[Dict[str, Any]]:
    """
    Returns default data for time of day sales when actual data is unavailable.
    """
    hours = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM']
    values = [100, 250, 500, 1250, 900, 600, 1000, 750, 400]
    
    return [
        {"hour": hours[i], "value": values[i]}
        for i in range(len(hours))
    ]

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
        # Read the Excel file
        df = pd.read_excel(file_data)
        
        # Reset the file pointer for further operations
        file_data.seek(0)
        
        # Data cleaning and preparation
        # Convert numeric columns
        if 'Net Price' in df.columns:
            df['Net Price'] = pd.to_numeric(df['Net Price'], errors='coerce')
        
        # Convert date columns to proper datetime format if they exist
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
            # Apply location filter with case-insensitive comparison
            try:
                df = df[df['Location'].str.lower() == location.lower()]
                print(f"After location filter, {len(df)} rows remain")
            except Exception as e:
                print(f"Error during location filtering: {e}")
        
        # Check if dataframe is empty after filtering
        if len(df) == 0:
            print("Warning: DataFrame is empty after applying filters!")
            # Return default data
            return {
                "salesByWeek": [],
                "salesByDayOfWeek": get_default_day_of_week_data(),
                "salesByTimeOfDay": get_default_time_of_day_data(),
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
        import traceback
        print(traceback.format_exc())
        # Return empty/default results
        return {
            "salesByWeek": [],
            "salesByDayOfWeek": get_default_day_of_week_data(),
            "salesByTimeOfDay": get_default_time_of_day_data(),
            "salesByCategory": []
        }