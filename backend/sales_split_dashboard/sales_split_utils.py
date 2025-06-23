import pandas as pd
import numpy as np
from datetime import datetime, timedelta



# def create_sales_pivot_tables(df, location_filter='All', start_date=None, end_date=None):
#     """
#     Create pivot tables showing:
#     1. Sales by week and category with grand totals
#     2. Week-over-week percentage change
#     3. Category percentage of total for each week
#     4. Category summary with week-over-week changes and calculated columns
    
#     Parameters:
#     -----------
#     df : pd.DataFrame
#         The raw data containing order information
#     location_filter : str or list, optional
#         Filter by specific location(s)
#     start_date : str, optional
#         Start date for filtering (format: 'YYYY-MM-DD')
#     end_date : str, optional
#         End date for filtering (format: 'YYYY-MM-DD')
    
#     Returns:
#     --------
#     Dict containing four DataFrames:
#         'sales_table': Pivot table with weeks as rows, categories as columns, and Net Price as values
#         'percentage_change_table': Table showing week-over-week percentage changes
#         'category_percent_of_total': Table showing each category as percentage of weekly total
#         'category_summary': Table with week-over-week differences and calculated columns (3P, 1P/3P)
#     """
#     # Make a copy of the dataframe
#     filtered_df = df.copy()
    
#     # Apply location filter
#     if location_filter != 'All':
#         if isinstance(location_filter, list):
#             filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
#         else:
#             filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    

#     if start_date is not None:
#         if isinstance(start_date, str):
#             start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
#         filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
#     if end_date is not None:
#         if isinstance(end_date, str):
#             end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
#         filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
#     # If the dataframe is empty after filtering, return empty tables
#     if filtered_df.empty:
#         return {
#     'pivot_table': pd.DataFrame(),
#     'in_house_table': pd.DataFrame(),
#     'week_over_week_table': pd.DataFrame(),
#     'category_summary_table': pd.DataFrame()
# }

#     # Create a pivot table using Category for columns
#     sales_pivot = filtered_df.pivot_table(
#         index='Week',
#         columns='Category',
#         values='Net Price',
#         aggfunc='sum',
#         fill_value=0
#     )
    
#     # Handle missing category columns
#     # List of expected categories based on your image
#     expected_categories = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']
    
#     # Add missing categories as columns with zeros
#     for category in expected_categories:
#         if category not in sales_pivot.columns:
#             sales_pivot[category] = 0
    
#     # Reorder columns to match expected order
#     ordered_columns = [col for col in expected_categories if col in sales_pivot.columns]
#     other_columns = [col for col in sales_pivot.columns if col not in expected_categories and col != 'Grand Total']
#     sales_pivot = sales_pivot[ordered_columns + other_columns]
    
#     # Add a Grand Total column
#     sales_pivot['Grand Total'] = sales_pivot.sum(axis=1)
    
#     # Sort by week
#     sales_pivot = sales_pivot.sort_index()
    
#     # Create a copy for numeric values before formatting
#     numeric_sales_pivot = sales_pivot.copy()
    
#     # 1. Create percentage change table
#     pct_change = numeric_sales_pivot.pct_change() * 100
    
#     # Replace NaN in first row with zeros
#     pct_change.iloc[0] = 0
    
#     # Replace inf and -inf values with 0
#     pct_change = pct_change.replace([np.inf, -np.inf], 0)
#     # Replace all NaN values (including first row) with 0
#     pct_change = pct_change.fillna(0)
    
#     # 2. Create category percentage of total table
#     category_pct_of_total = pd.DataFrame(index=numeric_sales_pivot.index, 
#                                         columns=numeric_sales_pivot.columns)
    
#     # Calculate each category as percentage of grand total for each week
#     for week in numeric_sales_pivot.index:
#         grand_total = numeric_sales_pivot.loc[week, 'Grand Total']
        
#         if grand_total > 0:  # Avoid division by zero
#             for category in numeric_sales_pivot.columns:
#                 if category != 'Grand Total':  # Skip calculating percentage for Grand Total
#                     category_value = numeric_sales_pivot.loc[week, category]
#                     category_pct_of_total.loc[week, category] = (category_value / grand_total) * 100
    
#     # Fill NaN values with 0
#     category_pct_of_total = category_pct_of_total.fillna(0)
    
#     # Drop the Grand Total column as it will always be 100%
#     if 'Grand Total' in category_pct_of_total.columns:
#         category_pct_of_total = category_pct_of_total.drop('Grand Total', axis=1)
    
#     # 3. Create category summary table with week-over-week differences and calculated columns
#     category_summary = pd.DataFrame(index=numeric_sales_pivot.index)
    
#     # Add the core category columns
#     for category in expected_categories:
#         if category in category_pct_of_total.columns:
#             category_summary[category] = 0.0  # Initialize with zeros
    
#     # Calculate the week-over-week differences of category percentages
#     for i, week in enumerate(numeric_sales_pivot.index):
#         if i == 0:  # First week, no differences
#             for category in expected_categories:
#                 if category in category_pct_of_total.columns:
#                     # First row uses the actual percentage value
#                     category_summary.at[week, category] = 0.0
#         else:
#             prev_week = numeric_sales_pivot.index[i-1]
#             for category in expected_categories:
#                 if category in category_pct_of_total.columns:
#                     # Calculate week-over-week difference using category percentages
#                     # Simple subtraction: current percentage - previous percentage
#                     current_pct = category_pct_of_total.loc[week, category]
#                     prev_pct = category_pct_of_total.loc[prev_week, category]
#                     category_summary.at[week, category] = current_pct - prev_pct
    
#     # Add the 3P column (computed value) - sum of the delivery service percentages
#     category_summary['3P'] = 0.0
    
#     # Calculate 3P values - the sum of percentages for delivery services (Catering, DD, GH)
#     for i, week in enumerate(numeric_sales_pivot.index):
#         if i == 0:  # First week
#             # Use the actual category percentage value from the first week
#             category_summary.at[week, '3P'] = sum(category_pct_of_total.loc[week, cat] for cat in ['UB', 'DD', 'GH'] 
#                                               if cat in category_pct_of_total.columns)
#         else:
#             # Use the actual category percentage value
#             category_summary.at[week, '3P'] = sum(category_pct_of_total.loc[week, cat] for cat in ['UB', 'DD', 'GH'] 
#                                               if cat in category_pct_of_total.columns)
    
#     # Add the 1P/3P column - sum of 1P percentage and 3P value
#     category_summary['1P/3P'] = 0.0
    
#     # Calculate 1P/3P values - combines first-party and third-party percentages
#     for i, week in enumerate(numeric_sales_pivot.index):
#         if i == 0:  # First week
#             # For first week, use the sum of 1P + 3P directly from category_pct_of_total and calculated 3P
#             first_p = category_pct_of_total.loc[week, '1P'] if '1P' in category_pct_of_total.columns else 0
#             category_summary.at[week, '1P/3P'] = first_p + category_summary.at[week, '3P']
#         else:
#             # For subsequent weeks, same formula
#             first_p = category_pct_of_total.loc[week, '1P'] if '1P' in category_pct_of_total.columns else 0
#             category_summary.at[week, '1P/3P'] = first_p + category_summary.at[week, '3P']
    
#     # Create formatted display version
#     formatted_category_summary = category_summary.copy()
#     # Format all values as percentages with 2 decimal places
#     for col in formatted_category_summary.columns:
#         formatted_category_summary[col] = formatted_category_summary[col].apply(lambda x: f"{x:.2f}")
    
#     print("-------------------------------------------------------")
#     print("i am here in sales split utils printing numeric_sales_pivot", numeric_sales_pivot)
#     print("-------------------------------------------------------")
#     print("i am here in sales split utils printing pct_change", pct_change)
#     print("-------------------------------------------------------")
#     print("i am here in sales split utils printing category_pct_of_total", category_pct_of_total)
#     print("-------------------------------------------------------")
#     print("i am here in sales split utils printing category_summary", category_summary)
#     print("-------------------------------------------------------")
#     # Return all tables in a dictionary - only numeric values, no formatted strings
#     return {
#         'pivot_table': numeric_sales_pivot.reset_index(),
#         'in_house_table': pct_change.reset_index(),
#         'week_over_week_table': category_pct_of_total.reset_index(),
#         'category_summary_table': category_summary.reset_index()
#     }

# Example usage:
# result = create_sales_pivot_tables(df, location_filter='Lenox Hill', start_date='2025-04-01', end_date='2025-04-30')
# sales_table = result['sales_table']
# pct_change_table = result['percentage_change_table']
# category_pct_table = result['category_percent_of_total']
# category_summary = result['category_summary']

def create_sales_pivot_tables(df, location_filter='All', start_date=None, end_date=None, categories_filter='All'):
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
    
    # Apply category filter
    if categories_filter != 'All':
        if isinstance(categories_filter, list):
            filtered_df = filtered_df[filtered_df['Category'].isin(categories_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Category'] == categories_filter]

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
    # Replace all NaN values (including first row) with 0
    pct_change = pct_change.fillna(0)
    
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
    
    # Format numeric_sales_pivot to 2 decimal places (no percent sign)
    formatted_numeric_sales_pivot = numeric_sales_pivot.copy()
    for col in formatted_numeric_sales_pivot.columns:
        formatted_numeric_sales_pivot[col] = formatted_numeric_sales_pivot[col].apply(lambda x: f"{x:.2f}")
    
    # Format pct_change with 2 decimal places and percent sign
    formatted_pct_change = pct_change.copy()
    for col in formatted_pct_change.columns:
        formatted_pct_change[col] = formatted_pct_change[col].apply(lambda x: f"{x:.2f}%")
    
    # Format category_pct_of_total with 2 decimal places and percent sign
    formatted_category_pct_of_total = category_pct_of_total.copy()
    for col in formatted_category_pct_of_total.columns:
        formatted_category_pct_of_total[col] = formatted_category_pct_of_total[col].apply(lambda x: f"{x:.2f}%")
    
    # Format category_summary with 2 decimal places and percent sign
    formatted_category_summary = category_summary.copy()
    for col in formatted_category_summary.columns:
        formatted_category_summary[col] = formatted_category_summary[col].apply(lambda x: f"{x:.2f}%")
    
    print("-------------------------------------------------------")
    print("i am here in sales split utils printing numeric_sales_pivot", formatted_numeric_sales_pivot)
    print("-------------------------------------------------------")
    print("i am here in sales split utils printing pct_change", formatted_pct_change)
    print("-------------------------------------------------------")
    print("i am here in sales split utils printing category_pct_of_total", formatted_category_pct_of_total)
    print("-------------------------------------------------------")
    print("i am here in sales split utils printing category_summary", formatted_category_summary)
    print("-------------------------------------------------------")
    
    # Return all tables in a dictionary with formatting applied
    return {
        'pivot_table': formatted_numeric_sales_pivot.reset_index(),
        'in_house_table': formatted_pct_change.reset_index(),
        'week_over_week_table': formatted_category_pct_of_total.reset_index(),
        'category_summary_table': formatted_category_summary.reset_index()
    }

def sales_analysis_tables(df, location_filter='All', start_date=None, end_date=None, categories_filter='All'):
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
    
    # Apply category filter
    if categories_filter != 'All':
        if isinstance(categories_filter, list):
            filtered_df = filtered_df[filtered_df['Category'].isin(categories_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Category'] == categories_filter]
            
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
    
    # # -------------------------------------------------------
    # # 2. Sales by Day
    # # -------------------------------------------------------
    # # Custom sort order for days
    # day_order1 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    # day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    # # Create categorical type with custom order
    # filtered_df['Day'] = pd.Categorical(filtered_df['Day'], categories=day_order, ordered=True)
    
    # # Explicitly specify observed=False to maintain current behavior
    # sales_by_day = filtered_df.groupby('Day', observed=False).agg({
    #     'Net Price': 'sum',
    #     'Sent Date': pd.Series.nunique
    # }).reset_index()
    
    # sales_by_day.columns = ['Day', 'Sales', 'Orders']
    
    # # Round sales values to 2 decimal places
    # sales_by_day['Sales'] = sales_by_day['Sales'].round(2)
    
    # # Sort by the custom day order
    # sales_by_day = sales_by_day.sort_values('Day')
    
        
        # Step 1: Create a mapping from full day name to short form
    day_mapping = {
        'Monday': 'Mon',
        'Tuesday': 'Tue',
        'Wednesday': 'Wed',
        'Thursday': 'Thu',
        'Friday': 'Fri',
        'Saturday': 'Sat',
        'Sunday': 'Sun'
    }

    # Step 2: Apply the mapping
    filtered_df['Day'] = filtered_df['Day'].map(day_mapping)

    # Step 3: Create categorical type with custom order
    day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    filtered_df['Day'] = pd.Categorical(filtered_df['Day'], categories=day_order, ordered=True)

    # Step 4: Group and aggregate
    sales_by_day = filtered_df.groupby('Day', observed=False).agg({
        'Net Price': 'sum',
        'Sent Date': pd.Series.nunique
    }).reset_index()

    # Step 5: Rename columns and round values
    sales_by_day.columns = ['Day', 'Sales', 'Orders']
    sales_by_day['Sales'] = sales_by_day['Sales'].round(2)

    # Step 6: Sort by custom day order
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





# def create_sales_overview_tables(df, location_filter='All', start_date=None, end_date=None):
    
#     # Make a copy of the dataframe
#     df_copy = df.copy()
    
#     # Apply location filter to the entire dataset first
#     if location_filter != 'All':
#         if isinstance(location_filter, list):
#             df_copy = df_copy[df_copy['Location'].isin(location_filter)]
#         else:
#             df_copy = df_copy[df_copy['Location'] == location_filter]
    
#     # Convert dates if they're strings
#     if start_date is not None and isinstance(start_date, str):
#         start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
#     if end_date is not None and isinstance(end_date, str):
#         end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
#     # Calculate previous period dates (4 weeks before start_date)
#     if start_date is not None:
#         # Calculate 4 weeks (28 days) before start date
#         previous_end_date = start_date - timedelta(days=1)  # Day before start_date
#         previous_start_date = start_date - timedelta(days=28)  # 4 weeks before
#     else:
#         previous_start_date = None
#         previous_end_date = None
    
#     # Calculate 13-week period dates
#     if end_date is not None:
#         # Calculate 13 weeks (91 days) before end_date
#         thirteen_week_start_date = end_date - timedelta(days=90)  # 13 weeks = 91 days
#     else:
#         thirteen_week_start_date = None
    
#     # Filter current period data
#     filtered_df = df_copy.copy()
#     if start_date is not None:
#         filtered_df = filtered_df[filtered_df['Date'] >= start_date]
#     if end_date is not None:
#         filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
#     # Filter previous period data for comparison
#     previous_df = df_copy.copy()
#     if previous_start_date is not None and previous_end_date is not None:
#         previous_df = previous_df[
#             (previous_df['Date'] >= previous_start_date) & 
#             (previous_df['Date'] <= previous_end_date)
#         ]
#     else:
#         previous_df = pd.DataFrame()  # Empty if no start date provided
    
#     # Filter 13-week period data
#     thirteen_week_df = df_copy.copy()
#     if thirteen_week_start_date is not None and end_date is not None:
#         thirteen_week_df = thirteen_week_df[
#             (thirteen_week_df['Date'] >= thirteen_week_start_date) & 
#             (thirteen_week_df['Date'] <= end_date)
#         ]
#     else:
#         thirteen_week_df = pd.DataFrame()  # Empty if no end date provided
    
#     # If the dataframe is empty after filtering, return empty tables
#     if filtered_df.empty:
#         return {
#             'sales_by_day_table': pd.DataFrame(),
#             'sales_by_category_table': pd.DataFrame(),
#             'category_comparison_table': pd.DataFrame(),
#             'thirteen_week_category_table': pd.DataFrame(),
#         }
    
#     # Ensure Date column is datetime
#     if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
#         filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])
    
    
#     # Create day of week and week number columns
#     filtered_df['Day_of_Week'] = filtered_df['Date'].dt.day_name()
#     filtered_df['Week_Number1'] = filtered_df['Date'].dt.isocalendar().week
    
#     # Create a more readable week identifier (e.g., "Week 16", "Week 17")
#     filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number1'].astype(str)
    
#     # Define day order for proper sorting
#     day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
#     filtered_df['Day_of_Week'] = pd.Categorical(filtered_df['Day_of_Week'], categories=day_order, ordered=True)
    
#     # 1. Sales by Day of Week and Week pivot table
#     sales_by_day_table = pd.pivot_table(
#         filtered_df,
#         values='Net Price',
#         index='Day_of_Week',
#         columns='Week_Label',
#         aggfunc='sum',
#         fill_value=0,
#         margins=True,
#         margins_name='Grand Total'
#     )
    
#     # sales_by_day_table = sales_by_day_table.reset_index()
#     sales_by_day_table = sales_by_day_table.round(2).fillna(0).reset_index()


     
    
#     # Create week number columns
#     filtered_df['Week_Number'] = filtered_df['Date'].dt.isocalendar().week
    
#     # Create a more readable week identifier (e.g., "Week 16", "Week 17")
#     filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number'].astype(str)
    
#     # Sales by Category and Week pivot table
#     sales_by_category_table = pd.pivot_table(
#         filtered_df,
#         values='Net Price',
#         index='Category',
#         columns='Week_Label',
#         aggfunc='sum',
#         fill_value=0,
#         margins=True,
#         margins_name='Grand Total'
#     )
    
#     # Reset index and round to 2 decimal places
#     sales_by_category_table = sales_by_category_table.round(2).fillna(0).reset_index()
    
#     # Create category comparison table (current 4 weeks vs previous 4 weeks)
#     category_comparison_table = pd.DataFrame()
    
#     if not filtered_df.empty:
#         # Calculate sales for current period by category
#         current_sales = filtered_df.groupby('Category')['Net Price'].sum().reset_index()
#         current_sales.columns = ['Category', 'Current_4_Weeks_Sales']
        
#         # Calculate sales for previous period by category
#         if not previous_df.empty:
#             previous_sales = previous_df.groupby('Category')['Net Price'].sum().reset_index()
#             previous_sales.columns = ['Category', 'Previous_4_Weeks_Sales']
#         else:
#             # Create empty previous sales with same categories as current
#             previous_sales = pd.DataFrame({
#                 'Category': current_sales['Category'],
#                 'Previous_4_Weeks_Sales': 0
#             })
        
#         # Merge current and previous sales (outer join to include all categories)
#         category_comparison_table = pd.merge(current_sales, previous_sales, on='Category', how='outer').fillna(0)
        
#         # Calculate percentage change
#         category_comparison_table['Percent_Change'] = category_comparison_table.apply(
#             lambda row: ((row['Current_4_Weeks_Sales'] - row['Previous_4_Weeks_Sales']) / row['Previous_4_Weeks_Sales'] * 100) 
#             if row['Previous_4_Weeks_Sales'] != 0 
#             else (100 if row['Current_4_Weeks_Sales'] > 0 else 0), 
#             axis=1
#         )
        
#         # Round values
#         category_comparison_table['Current_4_Weeks_Sales'] = category_comparison_table['Current_4_Weeks_Sales'].round(2)
#         category_comparison_table['Previous_4_Weeks_Sales'] = category_comparison_table['Previous_4_Weeks_Sales'].round(2)
#         category_comparison_table['Percent_Change'] = category_comparison_table['Percent_Change'].round(2)
        
#         # Rename columns for better readability
#         category_comparison_table.columns = ['Category', 'This_4_Weeks_Sales', 'Last_4_Weeks_Sales', 'Percent_Change']
        
#         # Sort by current sales descending
#         category_comparison_table = category_comparison_table.sort_values('This_4_Weeks_Sales', ascending=False).reset_index(drop=True)

#     # Create 13-week table with sales, orders, and average ticket by week
#     thirteen_week_category_table = pd.DataFrame()
    
#     if not thirteen_week_df.empty:
#         # Ensure Date column is datetime for 13-week data
#         if not pd.api.types.is_datetime64_any_dtype(thirteen_week_df['Date']):
#             thirteen_week_df['Date'] = pd.to_datetime(thirteen_week_df['Date'])
        
#         # Create week number and week label for 13-week data
#         thirteen_week_df['Week_Number'] = thirteen_week_df['Date'].dt.isocalendar().week
#         thirteen_week_df['Week_Label'] = 'Week ' + thirteen_week_df['Week_Number'].astype(str)
        
#         # Group by week and calculate metrics
#         thirteen_week_summary = thirteen_week_df.groupby('Week_Label').agg({
#             'Net Price': ['sum', 'count'],  # sum for total sales, count for number of orders
#         }).round(2)
        
#         # Flatten column names
#         thirteen_week_summary.columns = ['Total_Sales', 'Total_Orders']
        
#         # # Calculate average ticket (sales per order)
#         # thirteen_week_summary['Avg_Ticket'] = (
#         #     thirteen_week_summary['Total_Sales'] / thirteen_week_summary['Total_Orders']
#         # ).round(2)
        
#         # Reset index to make Week_Label a column
#         thirteen_week_category_table = thirteen_week_summary.reset_index()
#         thirteen_week_category_table.columns = ['Week', 'Total_Sales', 'Total_Orders']
        
#         # Sort by week number (extract number from 'Week X' format for proper sorting)
#         thirteen_week_category_table['Week_Num'] = thirteen_week_category_table['Week'].str.extract('(\d+)').astype(int)
#         thirteen_week_category_table = thirteen_week_category_table.sort_values('Week_Num').drop('Week_Num', axis=1).reset_index(drop=True)
        
#         # Add a grand total row
#         grand_total_row = pd.DataFrame({
#             'Week': ['Grand Total'],
#             'Total_Sales': [thirteen_week_category_table['Total_Sales'].sum()],
#             'Total_Orders': [thirteen_week_category_table['Total_Orders'].sum()],
#             # 'Avg_Ticket': [(thirteen_week_category_table['Total_Sales'].sum() / 
#             #                thirteen_week_category_table['Total_Orders'].sum()).round(2)]
#         })
        
#         thirteen_week_category_table = pd.concat([thirteen_week_category_table, grand_total_row], ignore_index=True)

#     print("i am here in sales split utils printing for sales by categories dates", start_date, end_date,"thirteen_week_start_date" ,thirteen_week_start_date, previous_start_date, previous_end_date)

#     return {
#         'sales_by_day_table': sales_by_day_table,
#         'sales_by_category_table': sales_by_category_table,
#         'category_comparison_table': category_comparison_table,
#         'thirteen_week_category_table': thirteen_week_category_table,
#     }
    
def create_sales_overview_tables(df, location_filter='All', start_date=None, end_date=None):
    
    # Make a copy of the dataframe
    df_copy = df.copy()
    
    # Apply location filter to the entire dataset first
    if location_filter != 'All':
        if isinstance(location_filter, list):
            df_copy = df_copy[df_copy['Location'].isin(location_filter)]
        else:
            df_copy = df_copy[df_copy['Location'] == location_filter]
    
    # Convert dates if they're strings
    if start_date is not None and isinstance(start_date, str):
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    if end_date is not None and isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    # Calculate previous period dates (4 weeks before start_date)
    if start_date is not None:
        # Calculate 4 weeks (28 days) before start date
        previous_end_date = start_date - timedelta(days=1)  # Day before start_date
        previous_start_date = start_date - timedelta(days=28)  # 4 weeks before
    else:
        previous_start_date = None
        previous_end_date = None
    
    # Calculate 13-week period dates
    if end_date is not None:
        # Calculate 13 weeks (91 days) before end_date
        thirteen_week_start_date = end_date - timedelta(days=90)  # 13 weeks = 91 days
    else:
        thirteen_week_start_date = None
    
    # Filter current period data
    filtered_df = df_copy.copy()
    if start_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    if end_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
    # Filter previous period data for comparison
    previous_df = df_copy.copy()
    if previous_start_date is not None and previous_end_date is not None:
        previous_df = previous_df[
            (previous_df['Date'] >= previous_start_date) & 
            (previous_df['Date'] <= previous_end_date)
        ]
    else:
        previous_df = pd.DataFrame()  # Empty if no start date provided
    
    # Filter 13-week period data
    thirteen_week_df = df_copy.copy()
    if thirteen_week_start_date is not None and end_date is not None:
        thirteen_week_df = thirteen_week_df[
            (thirteen_week_df['Date'] >= thirteen_week_start_date) & 
            (thirteen_week_df['Date'] <= end_date)
        ]
    else:
        thirteen_week_df = pd.DataFrame()  # Empty if no end date provided
    
    # If the dataframe is empty after filtering, return empty tables
    if filtered_df.empty:
        return {
            'sales_by_day_table': pd.DataFrame(),
            'sales_by_category_table': pd.DataFrame(),
            'category_comparison_table': pd.DataFrame(),
            'thirteen_week_category_table': pd.DataFrame(),
        }
    
    # Ensure Date column is datetime
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])
    
    # ===== MODIFIED SALES BY DAY TABLE CREATION =====
    # Determine the target week (latest week)
    if end_date is not None:
        target_date = end_date
    else:
        # Find the latest date in the dataframe
        target_date = filtered_df['Date'].max().date()
    
    # Find the Monday of the target week
    days_since_monday = target_date.weekday()  # Monday = 0, Sunday = 6
    week_start = target_date - timedelta(days=days_since_monday)
    week_end = week_start + timedelta(days=6)  # Sunday
    
    # Filter data for the target week only
    week_df = filtered_df[
        (filtered_df['Date'].dt.date >= week_start) & 
        (filtered_df['Date'].dt.date <= week_end)
    ].copy()
    
    # Create a complete week template with all 7 days
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    week_dates = [week_start + timedelta(days=i) for i in range(7)]
    
    # Create base template
    sales_by_day_template = pd.DataFrame({
        'Day_of_Week': day_order,
        'Date': week_dates,
        'Sales': 0.0
    })
    
    # Aggregate sales by date from the filtered week data
    if not week_df.empty:
        daily_sales = week_df.groupby(week_df['Date'].dt.date)['Net Price'].sum().reset_index()
        daily_sales.columns = ['Date', 'Sales']
        
        # Merge with template to ensure all days are included
        sales_by_day_table = sales_by_day_template.merge(
            daily_sales, 
            on='Date', 
            how='left', 
            suffixes=('', '_actual')
        )
        
        # Use actual sales where available, otherwise keep 0
        sales_by_day_table['Sales'] = sales_by_day_table['Sales_actual'].fillna(sales_by_day_table['Sales'])
        sales_by_day_table = sales_by_day_table[['Day_of_Week', 'Date', 'Sales']]
    else:
        sales_by_day_table = sales_by_day_template
    
    # Round sales to 2 decimal places
    sales_by_day_table['Sales'] = sales_by_day_table['Sales'].round(2)
    
    # ===== END OF MODIFIED SECTION =====
    
    # Create day of week and week number columns for other tables
    filtered_df['Day_of_Week'] = filtered_df['Date'].dt.day_name()
    filtered_df['Week_Number1'] = filtered_df['Date'].dt.isocalendar().week
    
    # Create a more readable week identifier (e.g., "Week 16", "Week 17")
    filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number1'].astype(str)
    
    # Define day order for proper sorting
    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    filtered_df['Day_of_Week'] = pd.Categorical(filtered_df['Day_of_Week'], categories=day_order, ordered=True)
    
    # Create week number columns
    filtered_df['Week_Number'] = filtered_df['Date'].dt.isocalendar().week
    
    # Create a more readable week identifier (e.g., "Week 16", "Week 17")
    filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number'].astype(str)
    
    # Sales by Category and Week pivot table
    sales_by_category_table = pd.pivot_table(
        filtered_df,
        values='Net Price',
        index='Category',
        columns='Week_Label',
        aggfunc='sum',
        fill_value=0,
        margins=True,
        margins_name='Grand Total'
    )
    
    # Reset index and round to 2 decimal places
    sales_by_category_table = sales_by_category_table.round(2).fillna(0).reset_index()
    
    # Create category comparison table (current 4 weeks vs previous 4 weeks)
    category_comparison_table = pd.DataFrame()
    
    if not filtered_df.empty:
        # Calculate sales for current period by category
        current_sales = filtered_df.groupby('Category')['Net Price'].sum().reset_index()
        current_sales.columns = ['Category', 'Current_4_Weeks_Sales']
        
        # Calculate sales for previous period by category
        if not previous_df.empty:
            previous_sales = previous_df.groupby('Category')['Net Price'].sum().reset_index()
            previous_sales.columns = ['Category', 'Previous_4_Weeks_Sales']
        else:
            # Create empty previous sales with same categories as current
            previous_sales = pd.DataFrame({
                'Category': current_sales['Category'],
                'Previous_4_Weeks_Sales': 0
            })
        
        # Merge current and previous sales (outer join to include all categories)
        category_comparison_table = pd.merge(current_sales, previous_sales, on='Category', how='outer').fillna(0)
        
        # Calculate percentage change
        category_comparison_table['Percent_Change'] = category_comparison_table.apply(
            lambda row: ((row['Current_4_Weeks_Sales'] - row['Previous_4_Weeks_Sales']) / row['Previous_4_Weeks_Sales'] * 100) 
            if row['Previous_4_Weeks_Sales'] != 0 
            else (100 if row['Current_4_Weeks_Sales'] > 0 else 0), 
            axis=1
        )
        
        # Round values
        category_comparison_table['Current_4_Weeks_Sales'] = category_comparison_table['Current_4_Weeks_Sales'].round(2)
        category_comparison_table['Previous_4_Weeks_Sales'] = category_comparison_table['Previous_4_Weeks_Sales'].round(2)
        category_comparison_table['Percent_Change'] = category_comparison_table['Percent_Change'].round(2)
        
        # Rename columns for better readability
        category_comparison_table.columns = ['Category', 'This_4_Weeks_Sales', 'Last_4_Weeks_Sales', 'Percent_Change']
        
        # Sort by current sales descending
        category_comparison_table = category_comparison_table.sort_values('This_4_Weeks_Sales', ascending=False).reset_index(drop=True)

    # Create 13-week table with sales, orders, and average ticket by week
    thirteen_week_category_table = pd.DataFrame()
    
    if not thirteen_week_df.empty:
        # Ensure Date column is datetime for 13-week data
        if not pd.api.types.is_datetime64_any_dtype(thirteen_week_df['Date']):
            thirteen_week_df['Date'] = pd.to_datetime(thirteen_week_df['Date'])
        
        # Create week number and week label for 13-week data
        thirteen_week_df['Week_Number'] = thirteen_week_df['Date'].dt.isocalendar().week
        thirteen_week_df['Week_Label'] = 'Week ' + thirteen_week_df['Week_Number'].astype(str)
        
        # Group by week and calculate metrics
        thirteen_week_summary = thirteen_week_df.groupby('Week_Label').agg({
            'Net Price': ['sum', 'count'],  # sum for total sales, count for number of orders
        }).round(2)
        
        # Flatten column names
        thirteen_week_summary.columns = ['Total_Sales', 'Total_Orders']
        
        # Reset index to make Week_Label a column
        thirteen_week_category_table = thirteen_week_summary.reset_index()
        thirteen_week_category_table.columns = ['Week', 'Total_Sales', 'Total_Orders']
        
        # Sort by week number (extract number from 'Week X' format for proper sorting)
        thirteen_week_category_table['Week_Num'] = thirteen_week_category_table['Week'].str.extract('(\d+)').astype(int)
        thirteen_week_category_table = thirteen_week_category_table.sort_values('Week_Num').drop('Week_Num', axis=1).reset_index(drop=True)
        
        # Add a grand total row
        grand_total_row = pd.DataFrame({
            'Week': ['Grand Total'],
            'Total_Sales': [thirteen_week_category_table['Total_Sales'].sum()],
            'Total_Orders': [thirteen_week_category_table['Total_Orders'].sum()],
        })
        
        thirteen_week_category_table = pd.concat([thirteen_week_category_table, grand_total_row], ignore_index=True)

    # print("i am here in sales split utils printing for sales by categories dates", start_date, end_date,"thirteen_week_start_date" ,thirteen_week_start_date, previous_start_date, previous_end_date)

    return {
        # 'sales_by_day_table': sales_by_day_table,
        'sales_by_category_table': sales_by_category_table,
        'category_comparison_table': category_comparison_table,
        'thirteen_week_category_table': thirteen_week_category_table,
    }


# def create_sales_by_day_table(df, location_filter='All', end_date=None, categories_filter='All', moving_avg_days=7):
#     """
#     Create sales by day table showing only the latest week with Day_of_Week, Date, Sales, and Moving Average columns
    
#     Parameters:
#     - moving_avg_days: Number of days to calculate moving average over (default: 7)
#     """
#     # Make a copy of the dataframe
#     df_copy = df.copy()
    
#     # Ensure Date column is datetime
#     if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
#         df_copy['Date'] = pd.to_datetime(df_copy['Date'])
    
#     # Convert end_date if it's a string
#     if end_date is not None and isinstance(end_date, str):
#         end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
#     # ===== DETERMINE TARGET DATES FROM FULL DATASET =====
#     # Determine the target week (latest week) from the full dataset
#     if end_date is not None:
#         target_date = end_date
#     else:
#         # Find the latest date in the full dataframe
#         target_date = df_copy['Date'].max().date()
    
#     # Find the Monday of the target week
#     days_since_monday = target_date.weekday()  # Monday = 0, Sunday = 6
#     week_start = target_date - timedelta(days=days_since_monday)
#     week_end = week_start + timedelta(days=6)  # Sunday
    
#     # Get historical data range for moving average calculation
#     # We need data from (moving_avg_days - 1) days before the week starts
#     historical_start = week_start - timedelta(days=moving_avg_days - 1)
    
#     # ===== NOW APPLY FILTERS TO THE DATASET =====
#     # Apply category filter
#     if categories_filter != 'All':
#         if isinstance(categories_filter, list):
#             df_copy = df_copy[df_copy['Category'].isin(categories_filter)]
#         else:
#             df_copy = df_copy[df_copy['Category'] == categories_filter]
    
#     # Apply location filter
#     if location_filter != 'All':
#         if isinstance(location_filter, list):
#             df_copy = df_copy[df_copy['Location'].isin(location_filter)]
#         else:
#             df_copy = df_copy[df_copy['Location'] == location_filter]
    
#     # If the dataframe is empty after filtering, return empty table with the determined date range
#     if df_copy.empty:
#         return pd.DataFrame(columns=['Day_of_Week', 'Date', 'Sales', 'Moving_Avg'])
    
#     # ===== PREPARE HISTORICAL DATA FOR MOVING AVERAGE =====
    
#     # Get all daily sales data from historical_start to week_end (using filtered data)
#     historical_df = df_copy[
#         (df_copy['Date'].dt.date >= historical_start) & 
#         (df_copy['Date'].dt.date <= week_end)
#     ].copy()
    
#     # Aggregate historical sales by date
#     if not historical_df.empty:
#         historical_daily_sales = historical_df.groupby(historical_df['Date'].dt.date)['Net Price'].sum().reset_index()
#         historical_daily_sales.columns = ['Date', 'Sales']
        
#         # Create a complete date range from historical_start to week_end
#         date_range = pd.date_range(start=historical_start, end=week_end, freq='D')
#         complete_historical = pd.DataFrame({
#             'Date': date_range.date,
#             'Sales': 0.0
#         })
        
#         # Merge with actual sales data
#         complete_historical = complete_historical.merge(
#             historical_daily_sales, 
#             on='Date', 
#             how='left', 
#             suffixes=('', '_actual')
#         )
#         complete_historical['Sales'] = complete_historical['Sales_actual'].fillna(complete_historical['Sales'])
#         complete_historical = complete_historical[['Date', 'Sales']]
        
#         # Calculate moving average
#         complete_historical['Moving_Avg'] = complete_historical['Sales'].rolling(
#             window=moving_avg_days, 
#             min_periods=1
#         ).mean()
#     else:
#         # If no historical data, create empty structure
#         date_range = pd.date_range(start=historical_start, end=week_end, freq='D')
#         complete_historical = pd.DataFrame({
#             'Date': date_range.date,
#             'Sales': 0.0,
#             'Moving_Avg': 0.0
#         })
    
#     # ===== SALES BY DAY TABLE CREATION =====
#     # Create a complete week template with all 7 days
#     day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
#     week_dates = [week_start + timedelta(days=i) for i in range(7)]
    
#     # Create base template
#     sales_by_day_template = pd.DataFrame({
#         'Day_of_Week': day_order,
#         'Date': week_dates,
#         'Sales': 0.0,
#         'Moving_Avg': 0.0
#     })
    
#     # Filter the complete historical data to just the target week
#     week_data = complete_historical[
#         (complete_historical['Date'] >= week_start) & 
#         (complete_historical['Date'] <= week_end)
#     ].copy()
    
#     if not week_data.empty:
#         # Merge with template to ensure all days are included
#         sales_by_day_table = sales_by_day_template.merge(
#             week_data, 
#             on='Date', 
#             how='left', 
#             suffixes=('', '_actual')
#         )
        
#         # Use actual data where available, otherwise keep 0
#         sales_by_day_table['Sales'] = sales_by_day_table['Sales_actual'].fillna(sales_by_day_table['Sales'])
#         sales_by_day_table['Moving_Avg'] = sales_by_day_table['Moving_Avg_actual'].fillna(sales_by_day_table['Moving_Avg'])
#         sales_by_day_table = sales_by_day_table[['Day_of_Week', 'Date', 'Sales', 'Moving_Avg']]
#     else:
#         sales_by_day_table = sales_by_day_template
    
#     # Round values to 2 decimal places
#     sales_by_day_table['Sales'] = sales_by_day_table['Sales'].round(2)
#     sales_by_day_table['Moving_Avg'] = sales_by_day_table['Moving_Avg'].round(2)
    
#     return {
#         'sales_by_day_table': sales_by_day_table
#     }
    
    
    
def create_sales_by_day_table(df, location_filter='All', end_date=None, categories_filter='All', moving_avg_days=7):
    df_copy = df.copy()

    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])

    if end_date is not None and isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

    target_date = end_date if end_date else df_copy['Date'].max().date()
    days_since_monday = target_date.weekday()
    week_start = target_date - timedelta(days=days_since_monday)
    week_end = week_start + timedelta(days=6)
    # Only use current week data, no historical data
    historical_start = week_start

    if categories_filter != 'All':
        df_copy = df_copy[df_copy['Category'].isin(categories_filter) if isinstance(categories_filter, list) else df_copy['Category'] == categories_filter]

    if location_filter != 'All':
        df_copy = df_copy[df_copy['Location'].isin(location_filter) if isinstance(location_filter, list) else df_copy['Location'] == location_filter]

    if df_copy.empty:
        return pd.DataFrame(columns=['Day_of_Week', 'Date', 'Sales', 'Moving_Avg'])

    # Get only current week data (no historical data beyond current week)
    historical_df = df_copy[(df_copy['Date'].dt.date >= historical_start) & (df_copy['Date'].dt.date <= week_end)].copy()

    # Create daily sales by summing Net Price for each date
    daily_sales = historical_df.groupby(historical_df['Date'].dt.date)['Net Price'].sum().reset_index()
    daily_sales.columns = ['Date', 'Sales']  # This creates the 'Sales' column

    # Create date range for current week only (Monday to Sunday)
    full_dates = pd.DataFrame({'Date': pd.date_range(historical_start, week_end)})
    full_dates['Date'] = full_dates['Date'].dt.date

    complete_data = full_dates.merge(daily_sales, on='Date', how='left')
    complete_data['Sales'] = complete_data['Sales'].fillna(0)
    
    # Sort by date before calculating moving average
    complete_data = complete_data.sort_values('Date').reset_index(drop=True)
    
    # Calculate moving average SPECIFICALLY for the 'Sales' column
    # Using only current week data with minimum periods of 1
    complete_data['Moving_Avg'] = complete_data['Sales'].rolling(
        window=moving_avg_days, 
        min_periods=1  # Allow calculation even with fewer days available
    ).mean()

    target_week_data = complete_data[(complete_data['Date'] >= week_start) & (complete_data['Date'] <= week_end)].copy()
    target_week_data['Day_of_Week'] = pd.to_datetime(target_week_data['Date']).dt.day_name()

    # Final dataframe with Sales and its moving average
    final_df = target_week_data[['Day_of_Week', 'Date', 'Sales', 'Moving_Avg']]
    final_df = final_df.set_index('Day_of_Week').reindex(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    ).reset_index()

    final_df['Sales'] = final_df['Sales'].round(2)
    final_df['Moving_Avg'] = final_df['Moving_Avg'].round(2)

    return {'sales_by_day_table': final_df}