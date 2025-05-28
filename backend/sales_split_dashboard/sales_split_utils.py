import pandas as pd
import numpy as np
from datetime import datetime



def create_sales_pivot_tables(df, location_filter='All', start_date=None, end_date=None):
    """
    Create pivot tables showing:
    1. Sales by week and category with grand totals
    2. Week-over-week percentage change
    3. Category percentage of total for each week
    4. Category summary with week-over-week changes and calculated columns
    
    Parameters:
    -----------
    df : pd.DataFrame
        The raw data containing order information
    location_filter : str or list, optional
        Filter by specific location(s)
    start_date : str, optional
        Start date for filtering (format: 'YYYY-MM-DD')
    end_date : str, optional
        End date for filtering (format: 'YYYY-MM-DD')
    
    Returns:
    --------
    Dict containing four DataFrames:
        'sales_table': Pivot table with weeks as rows, categories as columns, and Net Price as values
        'percentage_change_table': Table showing week-over-week percentage changes
        'category_percent_of_total': Table showing each category as percentage of weekly total
        'category_summary': Table with week-over-week differences and calculated columns (3P, 1P/3P)
    """
    # Make a copy of the dataframe
    filtered_df = df.copy()
    
    # Apply location filter
    if location_filter != 'All':
        if isinstance(location_filter, list):
            filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    

    if start_date is not None:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
    # If the dataframe is empty after filtering, return empty tables
    if filtered_df.empty:
        return {
    'pivot_table': pd.DataFrame(),
    'in_house_table': pd.DataFrame(),
    'week_over_week_table': pd.DataFrame(),
    'category_summary_table': pd.DataFrame()
}

    # Create a pivot table using Category for columns
    sales_pivot = filtered_df.pivot_table(
        index='Week',
        columns='Category',
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    )
    
    # Handle missing category columns
    # List of expected categories based on your image
    expected_categories = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']
    
    # Add missing categories as columns with zeros
    for category in expected_categories:
        if category not in sales_pivot.columns:
            sales_pivot[category] = 0
    
    # Reorder columns to match expected order
    ordered_columns = [col for col in expected_categories if col in sales_pivot.columns]
    other_columns = [col for col in sales_pivot.columns if col not in expected_categories and col != 'Grand Total']
    sales_pivot = sales_pivot[ordered_columns + other_columns]
    
    # Add a Grand Total column
    sales_pivot['Grand Total'] = sales_pivot.sum(axis=1)
    
    # Sort by week
    sales_pivot = sales_pivot.sort_index()
    
    # Create a copy for numeric values before formatting
    numeric_sales_pivot = sales_pivot.copy()
    
    # 1. Create percentage change table
    pct_change = numeric_sales_pivot.pct_change() * 100
    
    # Replace NaN in first row with zeros
    pct_change.iloc[0] = 0
    
    # Replace inf and -inf values with 0
    pct_change = pct_change.replace([np.inf, -np.inf], 0)
    
    # 2. Create category percentage of total table
    category_pct_of_total = pd.DataFrame(index=numeric_sales_pivot.index, 
                                        columns=numeric_sales_pivot.columns)
    
    # Calculate each category as percentage of grand total for each week
    for week in numeric_sales_pivot.index:
        grand_total = numeric_sales_pivot.loc[week, 'Grand Total']
        
        if grand_total > 0:  # Avoid division by zero
            for category in numeric_sales_pivot.columns:
                if category != 'Grand Total':  # Skip calculating percentage for Grand Total
                    category_value = numeric_sales_pivot.loc[week, category]
                    category_pct_of_total.loc[week, category] = (category_value / grand_total) * 100
    
    # Fill NaN values with 0
    category_pct_of_total = category_pct_of_total.fillna(0)
    
    # Drop the Grand Total column as it will always be 100%
    if 'Grand Total' in category_pct_of_total.columns:
        category_pct_of_total = category_pct_of_total.drop('Grand Total', axis=1)
    
    # 3. Create category summary table with week-over-week differences and calculated columns
    category_summary = pd.DataFrame(index=numeric_sales_pivot.index)
    
    # Add the core category columns
    for category in expected_categories:
        if category in category_pct_of_total.columns:
            category_summary[category] = 0.0  # Initialize with zeros
    
    # Calculate the week-over-week differences of category percentages
    for i, week in enumerate(numeric_sales_pivot.index):
        if i == 0:  # First week, no differences
            for category in expected_categories:
                if category in category_pct_of_total.columns:
                    # First row uses the actual percentage value
                    category_summary.at[week, category] = 0.0
        else:
            prev_week = numeric_sales_pivot.index[i-1]
            for category in expected_categories:
                if category in category_pct_of_total.columns:
                    # Calculate week-over-week difference using category percentages
                    # Simple subtraction: current percentage - previous percentage
                    current_pct = category_pct_of_total.loc[week, category]
                    prev_pct = category_pct_of_total.loc[prev_week, category]
                    category_summary.at[week, category] = current_pct - prev_pct
    
    # Add the 3P column (computed value) - sum of the delivery service percentages
    category_summary['3P'] = 0.0
    
    # Calculate 3P values - the sum of percentages for delivery services (Catering, DD, GH)
    for i, week in enumerate(numeric_sales_pivot.index):
        if i == 0:  # First week
            # Use the actual category percentage value from the first week
            category_summary.at[week, '3P'] = sum(category_pct_of_total.loc[week, cat] for cat in ['UB', 'DD', 'GH'] 
                                              if cat in category_pct_of_total.columns)
        else:
            # Use the actual category percentage value
            category_summary.at[week, '3P'] = sum(category_pct_of_total.loc[week, cat] for cat in ['UB', 'DD', 'GH'] 
                                              if cat in category_pct_of_total.columns)
    
    # Add the 1P/3P column - sum of 1P percentage and 3P value
    category_summary['1P/3P'] = 0.0
    
    # Calculate 1P/3P values - combines first-party and third-party percentages
    for i, week in enumerate(numeric_sales_pivot.index):
        if i == 0:  # First week
            # For first week, use the sum of 1P + 3P directly from category_pct_of_total and calculated 3P
            first_p = category_pct_of_total.loc[week, '1P'] if '1P' in category_pct_of_total.columns else 0
            category_summary.at[week, '1P/3P'] = first_p + category_summary.at[week, '3P']
        else:
            # For subsequent weeks, same formula
            first_p = category_pct_of_total.loc[week, '1P'] if '1P' in category_pct_of_total.columns else 0
            category_summary.at[week, '1P/3P'] = first_p + category_summary.at[week, '3P']
    
    # Create formatted display version
    formatted_category_summary = category_summary.copy()
    # Format all values as percentages with 2 decimal places
    for col in formatted_category_summary.columns:
        formatted_category_summary[col] = formatted_category_summary[col].apply(lambda x: f"{x:.2f}")
    
    # Return all tables in a dictionary - only numeric values, no formatted strings
    return {
        'pivot_table': numeric_sales_pivot.reset_index(),
        'in_house_table': pct_change.reset_index(),
        'week_over_week_table': category_pct_of_total.reset_index(),
        'category_summary_table': category_summary.reset_index()
    }

# Example usage:
# result = create_sales_pivot_tables(df, location_filter='Lenox Hill', start_date='2025-04-01', end_date='2025-04-30')
# sales_table = result['sales_table']
# pct_change_table = result['percentage_change_table']
# category_pct_table = result['category_percent_of_total']
# category_summary = result['category_summary']



def sales_analysis_tables(df, location_filter='All', start_date=None, end_date=None):
    """
    Create sales analysis tables by week, day, and time with optional filters.
    
    Parameters:
    -----------
    df : pd.DataFrame
        The raw data containing order information
    location_filter : str or list, optional
        Filter by specific location(s)
    start_date : str, optional
        Start date for filtering (format: 'YYYY-MM-DD')
    end_date : str, optional
        End date for filtering (format: 'YYYY-MM-DD')
    
    Returns:
    --------
    Dict[str, pd.DataFrame]
        Dictionary containing sales by week, day, and time tables
    """
    # Make a copy of the dataframe
    filtered_df = df.copy()
    
    # Apply location filter
    if location_filter != 'All':
        if isinstance(location_filter, list):
            filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    
    # Apply date range filter - convert string dates to datetime.date objects
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
    # If the dataframe is empty after filtering, return empty tables
    if filtered_df.empty:
        return {
            'sales_by_week': pd.DataFrame(columns=['Week', 'Sales', 'Orders']),
            'sales_by_day': pd.DataFrame(columns=['Day', 'Sales', 'Orders']),
            'sales_by_time': pd.DataFrame(columns=['Time Range', 'Sales', 'Orders'])
        }
    
    # -------------------------------------------------------
    # 1. Sales by Week
    # -------------------------------------------------------
    sales_by_week = filtered_df.groupby(['Year', 'Week']).agg({
        'Net Price': 'sum',
        'Sent Date': pd.Series.nunique
    }).reset_index()
    
    # Format week label
    sales_by_week['Week Label'] = sales_by_week.apply(
        # lambda row: f"Week {int(row['Week'])}, {int(row['Year'])}", axis=1
        lambda row: f"Week {int(row['Week'])}", axis=1
    )
    
    # Final table format
    sales_by_week = sales_by_week[['Week Label', 'Net Price', 'Sent Date']]
    sales_by_week.columns = ['Week', 'Sales', 'Orders']
    
    # Round sales values to 2 decimal places
    sales_by_week['Sales'] = sales_by_week['Sales'].round(2)
    
    # Sort by year and week
    sales_by_week = sales_by_week.sort_values(['Week'], ascending=True)
    
    # -------------------------------------------------------
    # 2. Sales by Day
    # -------------------------------------------------------
    # Custom sort order for days
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    # Create categorical type with custom order
    filtered_df['Day'] = pd.Categorical(filtered_df['Day'], categories=day_order, ordered=True)
    
    # Explicitly specify observed=False to maintain current behavior
    sales_by_day = filtered_df.groupby('Day', observed=False).agg({
        'Net Price': 'sum',
        'Sent Date': pd.Series.nunique
    }).reset_index()
    
    sales_by_day.columns = ['Day', 'Sales', 'Orders']
    
    # Round sales values to 2 decimal places
    sales_by_day['Sales'] = sales_by_day['Sales'].round(2)
    
    # Sort by the custom day order
    sales_by_day = sales_by_day.sort_values('Day')
    
    # -------------------------------------------------------
    # 3. Sales by Time
    # -------------------------------------------------------
    # Create time bins
    def categorize_time(time_str):
        # Check if time_str is already a string
        if not isinstance(time_str, str):
            time_str = str(time_str)
            
        # Handle different time formats
        if ':' in time_str:
            hour = int(time_str.split(':')[0])
        else:
            # If time is stored as a float or other format
            try:
                hour = int(float(time_str))
            except:
                return 'Unknown'
        
        if hour < 6:
            return '12AM-6AM'
        elif hour < 11:
            return '6AM-11AM'
        elif hour < 14:
            return '11AM-2PM'
        elif hour < 17:
            return '2PM-5PM'
        elif hour < 20:
            return '5PM-8PM'
        elif hour < 24:
            return '8PM-12AM'
        else:
            return 'Unknown'
    
    # Apply time categorization
    filtered_df['Time Range'] = filtered_df['Time'].apply(categorize_time)
    
    # Define the order of time ranges
    time_order = [
        '6AM-11AM', 
        '11AM-2PM', 
        '2PM-5PM', 
        '5PM-8PM', 
        '8PM-12AM', 
        '12AM-6AM'
    ]
    
    # Convert to categorical with the defined order
    filtered_df['Time Range'] = pd.Categorical(
        filtered_df['Time Range'], 
        categories=time_order, 
        ordered=True
    )
    
    # Explicitly specify observed=False to maintain current behavior
    sales_by_time = filtered_df.groupby('Time Range', observed=False).agg({
        'Net Price': 'sum',
        'Sent Date': pd.Series.nunique
    }).reset_index()
    
    sales_by_time.columns = ['Time Range', 'Sales', 'Orders']
    
    # Round sales values to 2 decimal places
    sales_by_time['Sales'] = sales_by_time['Sales'].round(2)
    
    # Sort by the time range order
    sales_by_time = sales_by_time.sort_values('Time Range')
    
    # Return all tables in a dictionary
    return {
        'sales_by_week': sales_by_week,
        'sales_by_day': sales_by_day,
        'sales_by_time': sales_by_time
    }

# Example usage:
# result = sales_analysis_tables(df, location_filter='Lenox Hill', start_date='2025-04-01', end_date='2025-04-30')