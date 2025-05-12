import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import io

def get_week_number(date_str: str) -> int:
    """
    Convert a date string to a week number (1-52)
    """
    try:
        # Try to parse the date from various formats
        try:
            date_obj = datetime.strptime(date_str, '%m/%d/%Y')
        except ValueError:
            try:
                date_obj = datetime.strptime(date_str, '%d/%m/%Y')
            except ValueError:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        
        # Get the ISO week number (1-53)
        week_num = date_obj.isocalendar()[1]
        return week_num
    except Exception:
        return 0  # Return 0 for invalid dates

def categorize_dining_option(option: str) -> str:
    """
    Categorize the dining option into one of the categories: 1P, Catering, DD, GH, In-House, UB
    """
    option = str(option).lower()
    
    if 'uber' in option or 'ub' in option:
        return 'UB'
    elif 'doordash' in option or 'dd' in option:
        return 'DD'
    elif 'grubhub' in option or 'gh' in option:
        return 'GH'
    elif 'catering' in option or 'cater' in option or 'ez cater' in option:
        return 'Catering'
    elif 'take out' in option or 'dine in' in option or 'cashier' in option:
        return 'In-House'
    else:
        return '1P'  # Default to 1P (first party) for anything else

def process_excel_data(file_data: io.BytesIO) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process the Excel file and create tables with the calculated fields.
    """
    try:
        # Read Excel file
        df = pd.read_excel(file_data)
        df = df.fillna('')
        
        # Clean and prepare data
        # Make sure date column is uniformly formatted and parsed
        date_col = None
        for col in df.columns:
            if 'date' in col.lower() and 'sent' not in col.lower():
                date_col = col
                break
        
        if not date_col and 'Date' in df.columns:
            date_col = 'Date'
        
        if date_col:
            # Try to convert to datetime format
            try:
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                df[date_col] = df[date_col].dt.strftime('%m/%d/%Y')
            except:
                pass
        
        # Find the dining option or category column
        dining_col = None
        category_col = None
        
        for col in df.columns:
            if 'dining' in col.lower() or 'option' in col.lower():
                dining_col = col
            if 'category' in col.lower():
                category_col = col
        
        # If we don't have proper category info, try to create it
        if category_col not in df.columns or df[category_col].isna().sum() > len(df) * 0.5:
            if dining_col:
                df['Category'] = df[dining_col].apply(categorize_dining_option)
                category_col = 'Category'
        
        # Find the price or amount column
        price_col = None
        for col in df.columns:
            if 'price' in col.lower() or 'amount' in col.lower() or 'net' in col.lower():
                price_col = col
                break
        
        if not price_col and 'Net Price' in df.columns:
            price_col = 'Net Price'
        
        # Get quantity column if available
        qty_col = None
        for col in df.columns:
            if 'qty' in col.lower() or 'quantity' in col.lower():
                qty_col = col
                break
        
        if not qty_col and 'Qty' in df.columns:
            qty_col = 'Qty'
        
        # Calculate total amount considering quantity if available
        if price_col:
            if qty_col:
                df['Total'] = df[price_col].astype(float) * df[qty_col].astype(float)
            else:
                df['Total'] = df[price_col].astype(float)
        
        # Add week number column
        if date_col:
            df['Week'] = df[date_col].apply(get_week_number)
        else:
            # Try to find a date in another column
            found_date = False
            for col in df.columns:
                if df[col].dtype == 'object':
                    try:
                        # Try to parse the first few values as dates
                        sample = df[col].dropna().head(5)
                        if len(sample) > 0:
                            parsed = pd.to_datetime(sample.iloc[0], errors='coerce')
                            if not pd.isna(parsed):
                                df['Week'] = df[col].apply(get_week_number)
                                found_date = True
                                break
                    except:
                        continue
            
            if not found_date:
                df['Week'] = 1  # Default to week 1
        
        # Group data by week
        if category_col:
            # Create result tables
            
            # Table 1: Raw Data Table
            raw_data = []
            weeks = sorted(df['Week'].unique())
            
            for week in weeks:
                week_df = df[df['Week'] == week]
                
                # Sum totals by category
                totals = {'Week': int(week)}
                
                # Check if the 'Total' column was created
                value_col = 'Total' if 'Total' in df.columns else price_col
                
                if category_col in week_df.columns:
                    # Get totals for each category
                    for category in ['1P', 'Catering', 'DD', 'GH', 'In-House', 'UB']:
                        cat_total = week_df[week_df[category_col] == category][value_col].astype(float).sum()
                        totals[category] = round(cat_total, 2) if cat_total > 0 else '####'
                    
                    # Calculate Sales (sum of all categories)
                    sales_total = sum([v for k, v in totals.items() if k != 'Week' and v != '####'])
                    totals['Sales'] = round(sales_total, 2) if sales_total > 0 else '####'
                
                raw_data.append(totals)
            
            # Table 2: Percentage Table
            pct_data = []
            
            # Loop through raw data and calculate percentages
            for i, week_data in enumerate(raw_data):
                week_pct = {'Week': week_data['Week']}
                
                # Skip calculation for first week since there's no comparison
                if i == 0:
                    for category in ['1P', 'Catering', 'DD', 'GH', 'In-House', 'UB']:
                        week_pct[category] = '####'
                    pct_data.append(week_pct)
                    continue
                
                # Get previous week data
                prev_week_data = raw_data[i-1]
                
                # Calculate percentage change for each category
                for category in ['1P', 'Catering', 'DD', 'GH', 'In-House', 'UB']:
                    current = week_data[category]
                    previous = prev_week_data[category]
                    
                    if current == '####' or previous == '####' or previous == 0:
                        week_pct[category] = '####'
                    else:
                        pct_change = ((current - previous) / previous) * 100
                        week_pct[category] = round(pct_change, 2)
                
                pct_data.append(week_pct)
            
            # Table 3: In-House Table (Percentage of each category relative to In-House)
            inhouse_data = []
            
            for week_data in raw_data:
                inhouse_pct = {'Week': week_data['Week']}
                
                # Get In-House value
                inhouse_value = week_data['In-House']
                
                # Skip calculation if In-House value is invalid
                if inhouse_value == '####' or inhouse_value == 0:
                    for category in ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']:
                        inhouse_pct[category] = '####'
                    inhouse_data.append(inhouse_pct)
                    continue
                
                # Calculate percentage of each category relative to In-House
                for category in ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']:
                    current = week_data[category]
                    
                    if current == '####':
                        inhouse_pct[category] = '####'
                    elif category == 'In-House':
                        inhouse_pct[category] = 100.00  # In-House is 100% of itself
                    else:
                        rel_pct = (current / inhouse_value) * 100
                        inhouse_pct[category] = round(rel_pct, 2)
                
                inhouse_data.append(inhouse_pct)
            
            # Table 4: Week-over-Week (WOW) Table
            wow_data = []
            
            # Calculate 3P (third-party) data first
            for week_data in raw_data:
                week_3p = {'Week': week_data['Week']}
                
                # 3P is the sum of DD, GH, and UB
                third_party_sum = 0
                valid_3p = True
                
                for category in ['DD', 'GH', 'UB']:
                    if week_data[category] == '####':
                        valid_3p = False
                        break
                    third_party_sum += week_data[category]
                
                # Add 3P value
                if valid_3p:
                    week_3p['3P'] = round(third_party_sum, 2)
                else:
                    week_3p['3P'] = '####'
                
                # Calculate 1P/3P ratio
                first_party = week_data['1P']
                if first_party != '####' and week_3p['3P'] != '####' and week_3p['3P'] != 0:
                    week_3p['1P/3P'] = round((first_party / week_3p['3P']) * 100, 2)
                else:
                    week_3p['1P/3P'] = '####'
                
                # Add other categories from percentage table
                for category in ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']:
                    if i < len(pct_data):
                        week_3p[category] = pct_data[i][category] if category in pct_data[i] else '####'
                    else:
                        week_3p[category] = '####'
                
                wow_data.append(week_3p)
            
            # Return all tables
            result = {
                "table1": raw_data,
                "table2": pct_data,
                "table3": inhouse_data,
                "table4": wow_data,
                "table5": []  # Empty for compatibility with original code
            }
            
            return result
        
        # If no category column found, return empty result
        return {
            "table1": [],
            "table2": [],
            "table3": [],
            "table4": [],
            "table5": []
        }
    
    except Exception as e:
        print(f"Error processing Excel file in data_processor: {str(e)}")
        return {
            "table1": [],
            "table2": [],
            "table3": [],
            "table4": [],
            "table5": []
        }

def fix_excel_errors(file_data: io.BytesIO) -> io.BytesIO:
    """
    Attempt to fix common errors in Excel files before processing
    """
    try:
        # Read the Excel file
        df = pd.read_excel(file_data)
        
        # Fix #NAME?, #VALUE!, and other Excel errors
        for col in df.columns:
            # Replace Excel error values with empty strings
            error_patterns = ['#NAME?', '#VALUE!', '#DIV/0!', '#REF!', '#NUM!', '#NULL!', '#N/A']
            for pattern in error_patterns:
                if df[col].dtype == 'object':
                    df[col] = df[col].astype(str).str.replace(pattern, '', regex=False)
            
            # Try to convert numeric columns
            try:
                if df[col].dtype == 'object':
                    df[col] = pd.to_numeric(df[col], errors='ignore')
            except:
                pass
        
        # Write the fixed data back to a BytesIO object
        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        return output
    
    except Exception as e:
        print(f"Error fixing Excel file: {str(e)}")
        # Return the original file if fixing failed
        file_data.seek(0)
        return file_data