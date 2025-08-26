import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, Union, Optional
from utils.utils import _to_date, days_between, _format_percent_change
pd.set_option('future.no_silent_downcasting', True)


def calculate_default_date_range():
    """
    Centralized date calculation logic to avoid duplication.
    Returns (start_date, end_date) as datetime.date objects.
    """
    current_date = datetime.now().date()
    
    # Calculate the number of days until the next Sunday
    days_to_next_sunday = (6 - current_date.weekday()) % 7
    if days_to_next_sunday == 0:
        days_to_next_sunday = 7  # If today is Sunday, find the next Sunday
    
    # Calculate the next Sunday
    end_date_dt = current_date + timedelta(days=days_to_next_sunday)
    start_date_dt = (end_date_dt - timedelta(weeks=4)) + timedelta(days=1)
    
    return start_date_dt, end_date_dt


def apply_filters_if_needed(df: pd.DataFrame, location_filter='All', start_date=None, end_date=None, categories_filter='All', skip_filtering=False):
    """
    Conditionally apply filters only if data hasn't been pre-filtered.
    Returns filtered dataframe or original if skip_filtering=True.
    """
    if skip_filtering:
        return df
    
    # Work with view initially
    filtered_df = df
    
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
    
    # Apply date range filter
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
    # If no date range provided, use default 4-week range
    if start_date is None and end_date is None:
        start_date_dt, end_date_dt = calculate_default_date_range()
        filtered_df = filtered_df[
            (filtered_df['Date'] >= start_date_dt) & 
            (filtered_df['Date'] <= end_date_dt)
        ]
    
    return filtered_df


def create_sales_pivot_tables_optimized(df, location_filter='All', start_date=None, end_date=None, categories_filter='All', skip_filtering=False):
    """
    Optimized version of create_sales_pivot_tables.
    
    Args:
        skip_filtering: If True, assumes df is already filtered and skips redundant operations
    """
    # Apply filters only if needed
    filtered_df = apply_filters_if_needed(df, location_filter, start_date, end_date, categories_filter, skip_filtering)
    
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
        values='Net_Price',
        aggfunc='sum',
        fill_value=0
    )
    
    # Handle missing category columns
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
    sales_pivot = sales_pivot.sort_index()
    
    # Store numeric version for calculations (avoid unnecessary copy)
    numeric_sales_pivot = sales_pivot
    
    # 1. Create percentage change table - vectorized operations
    pct_change = numeric_sales_pivot.pct_change() * 100
    pct_change.iloc[0] = 0  # First row zeros
    pct_change = pct_change.replace([np.inf, -np.inf], 0).fillna(0)
    
    # 2. Create category percentage of total table - vectorized
    category_pct_of_total = numeric_sales_pivot.div(numeric_sales_pivot['Grand Total'], axis=0) * 100
    category_pct_of_total = category_pct_of_total.drop('Grand Total', axis=1, errors='ignore').fillna(0)
    
    # 3. Create category summary table with week-over-week differences
    category_summary = pd.DataFrame(index=numeric_sales_pivot.index)
    
    # Initialize core category columns
    for category in expected_categories:
        if category in category_pct_of_total.columns:
            category_summary[category] = 0.0
    
    # Calculate week-over-week differences using vectorized operations
    for category in expected_categories:
        if category in category_pct_of_total.columns:
            category_summary[category] = category_pct_of_total[category].diff().fillna(0)
    
    # Add computed columns - 3P and 1P/3P - vectorized
    delivery_cats = ['UB', 'DD', 'GH']
    available_delivery_cats = [cat for cat in delivery_cats if cat in category_pct_of_total.columns]
    
    if available_delivery_cats:
        category_summary['3P'] = category_pct_of_total[available_delivery_cats].sum(axis=1)
    else:
        category_summary['3P'] = 0.0
    
    if '1P' in category_pct_of_total.columns:
        category_summary['1P/3P'] = category_pct_of_total['1P'] + category_summary['3P']
    else:
        category_summary['1P/3P'] = category_summary['3P']
    
    # Format all tables at once - more efficient string formatting
    def format_currency(df):
        return df.round(2).astype(str)
    
    def format_percentage(df):
        return (df.round(2).astype(str) + '%')
    
    return {
        'pivot_table': format_currency(numeric_sales_pivot).reset_index(),
        'in_house_table': format_percentage(pct_change).reset_index(),
        'week_over_week_table': format_percentage(category_pct_of_total).reset_index(),
        'category_summary_table': format_percentage(category_summary).reset_index()
    }


def sales_analysis_tables_optimized(df, location_filter='All', start_date=None, end_date=None, categories_filter='All', moving_avg_window=7, skip_filtering=False):
    """
    Optimized version of sales_analysis_tables.
    
    Args:
        skip_filtering: If True, assumes df is already filtered
    """
    # Apply filters only if needed
    filtered_df = apply_filters_if_needed(df, location_filter, start_date, end_date, categories_filter, skip_filtering)
    
    if filtered_df.empty:
        return {
            'sales_by_week': pd.DataFrame(columns=['Week', 'Sales', 'Orders', 'Moving_Avg']),
            'sales_by_day': pd.DataFrame(columns=['Day', 'Sales', 'Orders', 'Moving_Avg']),
            'sales_by_time': pd.DataFrame(columns=['Time Range', 'Sales', 'Orders', 'Moving_Avg'])
        }

    # -------------------------------------------------------
    # 1. Sales by Week (Last 4 Weeks Only) - Optimized
    # -------------------------------------------------------
    # Determine end date more efficiently
    if end_date is not None:
        end_date_dt = datetime.strptime(end_date, '%Y-%m-%d').date() if isinstance(end_date, str) else end_date
    else:
        end_date_dt = filtered_df['Date'].max()
        if hasattr(end_date_dt, 'date'):
            end_date_dt = end_date_dt.date()

    # Filter for 8 weeks for rolling average buffer
    start_8_weeks_ago = end_date_dt - timedelta(weeks=8)
    filtered_df_week = filtered_df[
        (filtered_df['Date'] >= start_8_weeks_ago) & 
        (filtered_df['Date'] <= end_date_dt)
    ]

    # Single groupby operation for weekly data
    if not filtered_df_week.empty:
        sales_by_week = filtered_df_week.groupby(['Year', 'Week']).agg({
            'Net_Price': 'sum',
            'Sent_Date': pd.Series.nunique
        }).reset_index()
        
        # Sort and keep last 4 weeks
        sales_by_week = sales_by_week.sort_values(['Year', 'Week']).tail(4).reset_index(drop=True)
        sales_by_week['Week Label'] = 'Week ' + sales_by_week['Week'].astype(str)
        sales_by_week = sales_by_week[['Week Label', 'Net_Price', 'Sent_Date', 'Year', 'Week']]
        sales_by_week.columns = ['Week', 'Sales', 'Orders', 'Year', 'Week_Num']
        
        # Calculate moving average
        sales_by_week = sales_by_week.sort_values(['Year', 'Week_Num'])
        sales_by_week['Moving_Avg'] = sales_by_week['Sales'].rolling(window=moving_avg_window, min_periods=1).mean()
        sales_by_week = sales_by_week[['Week', 'Sales', 'Orders', 'Moving_Avg']].round(2)
    else:
        sales_by_week = pd.DataFrame(columns=['Week', 'Sales', 'Orders', 'Moving_Avg'])

    # -------------------------------------------------------
    # 2. Sales by Day - Optimized
    # -------------------------------------------------------
    # Use vectorized mapping instead of individual apply calls
    day_mapping = {
        'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu',
        'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
    }
    
    # Make a copy only when needed for modification
    day_df = filtered_df.copy() if not skip_filtering else filtered_df
    day_df['Day'] = day_df['Day'].map(day_mapping)
    
    day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    day_df['Day'] = pd.Categorical(day_df['Day'], categories=day_order, ordered=True)

    sales_by_day = day_df.groupby('Day', observed=False).agg({
        'Net_Price': 'sum',
        'Sent_Date': pd.Series.nunique
    }).reset_index()

    sales_by_day.columns = ['Day', 'Sales', 'Orders']
    sales_by_day = sales_by_day.sort_values('Day')
    sales_by_day['Moving_Avg'] = sales_by_day['Sales'].rolling(
        window=min(moving_avg_window, len(sales_by_day)), min_periods=1).mean()
    sales_by_day = sales_by_day.round(2)

    # -------------------------------------------------------
    # 3. Sales by Time - Optimized with vectorized categorization
    # -------------------------------------------------------
    def categorize_time_vectorized(time_series):
        """Vectorized version of time categorization"""
        # Convert to string and extract hour
        time_str = time_series.astype(str)
        
        # Extract hour using vectorized operations
        hours = time_str.str.extract(r'(\d+):', expand=False).fillna('0').astype(int)
        
        # Use numpy.select for efficient categorization
        conditions = [
            hours < 6,
            (hours >= 6) & (hours < 11),
            (hours >= 11) & (hours < 14),
            (hours >= 14) & (hours < 17),
            (hours >= 17) & (hours < 20),
            (hours >= 20) & (hours < 24)
        ]
        choices = ['12AM-6AM', '6AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM', '8PM-12AM']
        
        return pd.Series(np.select(conditions, choices, default='Unknown'), index=time_series.index)

    # Apply vectorized time categorization
    time_df = filtered_df.copy() if not skip_filtering else filtered_df
    time_df['Time Range'] = categorize_time_vectorized(time_df['Time'])

    time_order = ['6AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM', '8PM-12AM', '12AM-6AM']
    time_df['Time Range'] = pd.Categorical(time_df['Time Range'], categories=time_order, ordered=True)

    sales_by_time = time_df.groupby('Time Range', observed=False).agg({
        'Net_Price': 'sum',
        'Sent_Date': pd.Series.nunique
    }).reset_index()

    sales_by_time.columns = ['Time Range', 'Sales', 'Orders']
    sales_by_time = sales_by_time.sort_values('Time Range')
    sales_by_time['Moving_Avg'] = sales_by_time['Sales'].rolling(
        window=min(moving_avg_window, len(sales_by_time)), min_periods=1).mean()
    sales_by_time = sales_by_time.round(2)

    return {
        'sales_by_week': sales_by_week,
        'sales_by_day': sales_by_day,
        'sales_by_time': sales_by_time
    }


def sales_by_category_func_optimized(df, location_filter='All', end_date=None, start_date=None, skip_filtering=False):
    """
    Optimized version of sales_by_category_func.
    """
    # Apply filters only if needed
    filtered_df = apply_filters_if_needed(df, location_filter, start_date, end_date, 'All', skip_filtering)
    
    if filtered_df.empty:
        return pd.DataFrame()
    
    # Ensure Date is datetime only if needed
    if not skip_filtering and not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df = filtered_df.copy()
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])
    
    # Vectorized week operations
    filtered_df = filtered_df.copy() if skip_filtering else filtered_df
    filtered_df['Week_Number'] = filtered_df['Date'].dt.isocalendar().week
    filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number'].astype(str)
    
    # Create pivot table
    sales_by_category_table = pd.pivot_table(
        filtered_df,
        values='Net_Price',
        index='Category',
        columns='Week_Label',
        aggfunc='sum',
        fill_value=0,
        margins=True,
        margins_name='Grand Total'
    )
    
    return sales_by_category_table.round(2).fillna(0).reset_index()


def category_comparison_func_optimized(df, location_filter='All', end_date=None, start_date=None, skip_filtering=False):
    """
    Optimized version of category_comparison_func.
    """
    empty_response = pd.DataFrame([{
        'Category': '', 'This_4_Weeks_Sales': 0, 'Last_4_Weeks_Sales': 0, 'Percent_Change': '0.00%'
    }])

    if df.empty:
        return empty_response

    # Apply location filter only if needed
    if not skip_filtering:
        if location_filter != 'All':
            if isinstance(location_filter, list):
                df = df[df['Location'].isin(location_filter)]
            else:
                df = df[df['Location'] == location_filter]

    # Date range calculation - optimized
    if start_date is not None and end_date is not None:
        sd = _to_date(start_date)
        ed = _to_date(end_date)
        if sd > ed:
            sd, ed = ed, sd

        start_date_final = sd
        end_date_final = ed
        period_len_inclusive = days_between(sd, ed, inclusive=True)
        previous_end_date = start_date_final - timedelta(days=1)
        previous_start_date = start_date_final - timedelta(days=period_len_inclusive)
    else:
        current_date = datetime.now().date()
        days_to_next_sunday = (6 - current_date.weekday()) % 7 or 7
        current_date += timedelta(days=days_to_next_sunday)

        week_start_of_end_date = current_date - timedelta(days=current_date.weekday())
        week_end = week_start_of_end_date + timedelta(days=6)

        start_date_final = week_start_of_end_date
        end_date_final = week_end
        previous_end_date = start_date_final - timedelta(days=1)
        previous_start_date = start_date_final - timedelta(weeks=1)

    # Filter dataframes efficiently
    current_mask = (df['Date'] >= start_date_final) & (df['Date'] <= end_date_final)
    previous_mask = (df['Date'] >= previous_start_date) & (df['Date'] <= previous_end_date)
    
    filtered_df = df[current_mask]
    previous_df = df[previous_mask]

    if filtered_df.empty and previous_df.empty:
        return empty_response

    # Vectorized aggregations
    current_sales = filtered_df.groupby('Category')['Net_Price'].sum().reset_index()
    current_sales.columns = ['Category', 'Current_4_Weeks_Sales']

    if not previous_df.empty:
        previous_sales = previous_df.groupby('Category')['Net_Price'].sum().reset_index()
        previous_sales.columns = ['Category', 'Previous_4_Weeks_Sales']
    else:
        previous_sales = pd.DataFrame({
            'Category': current_sales['Category'], 'Previous_4_Weeks_Sales': 0
        })

    # Merge and compute percent change vectorized
    category_comparison_table = pd.merge(current_sales, previous_sales, on='Category', how='outer').fillna(0)
    
    # Vectorized percent change calculation
    mask = category_comparison_table['Previous_4_Weeks_Sales'] != 0
    category_comparison_table.loc[mask, 'Percent_Change'] = (
        (category_comparison_table.loc[mask, 'Current_4_Weeks_Sales'] - category_comparison_table.loc[mask, 'Previous_4_Weeks_Sales']) 
        / category_comparison_table.loc[mask, 'Previous_4_Weeks_Sales'] * 100
    )
    category_comparison_table.loc[~mask, 'Percent_Change'] = 0

    # Format results
    category_comparison_table['Current_4_Weeks_Sales'] = category_comparison_table['Current_4_Weeks_Sales'].round(2)
    category_comparison_table['Previous_4_Weeks_Sales'] = category_comparison_table['Previous_4_Weeks_Sales'].round(2)
    category_comparison_table['Percent_Change'] = category_comparison_table['Percent_Change'].apply(lambda x: f"{x:.2f}%")
    category_comparison_table.columns = ['Category', 'This_4_Weeks_Sales', 'Last_4_Weeks_Sales', 'Percent_Change']

    return category_comparison_table.sort_values('This_4_Weeks_Sales', ascending=False).reset_index(drop=True)


def thirteen_week_category_optimized(df, location_filter='All', end_date=None, category_filter='All', skip_filtering=False):
    """
    Optimized version of thirteen_week_category.
    """
    # Apply filters only if needed
    if not skip_filtering:
        # Convert date types only if needed
        if not pd.api.types.is_datetime64_any_dtype(df['Date']):
            df = df.copy()
            df['Date'] = pd.to_datetime(df['Date'])

        if end_date is not None and isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        elif end_date is None:
            end_date = df['Date'].max().date()
        
        # Apply filters
        if category_filter != 'All':
            if isinstance(category_filter, list):
                df = df[df['Category'].isin(category_filter)]
            else:
                df = df[df['Category'] == category_filter]
        
        if location_filter != 'All':
            if isinstance(location_filter, list):
                df = df[df['Location'].isin(location_filter)]
            else:
                df = df[df['Location'] == location_filter]

    # Calculate 13-week range efficiently
    end_date = pd.Timestamp(end_date)
    thirteen_week_start_date = pd.Timestamp(end_date - timedelta(days=90))
    
    # Filter 13-week period
    thirteen_week_df = df[
        (df['Date'] >= thirteen_week_start_date) & 
        (df['Date'] <= end_date)
    ]
    
    if thirteen_week_df.empty:
        return {'thirteen_week_category_table': pd.DataFrame()}
    
    # Vectorized week operations
    thirteen_week_df = thirteen_week_df.copy()
    thirteen_week_df['Week_Number'] = thirteen_week_df['Date'].dt.isocalendar().week
    thirteen_week_df['Week_Label'] = 'Week ' + thirteen_week_df['Week_Number'].astype(str)
    
    # Single aggregation
    thirteen_week_summary = thirteen_week_df.groupby('Week_Label').agg({
        'Net_Price': ['sum', 'count']
    }).round(2)
    
    thirteen_week_summary.columns = ['Total_Sales', 'Total_Orders']
    thirteen_week_category_table = thirteen_week_summary.reset_index()
    thirteen_week_category_table.columns = ['Week', 'Total_Sales', 'Total_Orders']
    
    # Sort efficiently
    thirteen_week_category_table['Week_Num'] = thirteen_week_category_table['Week'].str.extract('(\d+)').astype(int)
    thirteen_week_category_table = thirteen_week_category_table.sort_values('Week_Num').drop('Week_Num', axis=1).reset_index(drop=True)
    
    # Add grand total
    grand_total_row = pd.DataFrame({
        'Week': ['Grand Total'],
        'Total_Sales': [thirteen_week_category_table['Total_Sales'].sum()],
        'Total_Orders': [thirteen_week_category_table['Total_Orders'].sum()],
    })
    
    thirteen_week_category_table = pd.concat([thirteen_week_category_table, grand_total_row], ignore_index=True)
    
    return {'thirteen_week_category_table': thirteen_week_category_table}


def create_sales_by_day_table_optimized(df, location_filter='All', end_date=None, categories_filter='All', moving_avg_days=7, skip_filtering=False):
    """
    Optimized version of create_sales_by_day_table.
    """
    # Apply filters only if needed
    if not skip_filtering:
        if not pd.api.types.is_datetime64_any_dtype(df['Date']):
            df = df.copy()
            df['Date'] = pd.to_datetime(df['Date'])

        if end_date is not None and isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        elif end_date is None:
            end_date = df['Date'].max().date()

        # Apply filters
        if categories_filter != 'All':
            df = df[
                df['Category'].isin(categories_filter)
                if isinstance(categories_filter, list)
                else df['Category'] == categories_filter
            ]

        if location_filter != 'All':
            df = df[
                df['Location'].isin(location_filter)
                if isinstance(location_filter, list)
                else df['Location'] == location_filter
            ]

    if df.empty:
        return {'sales_by_day_table': pd.DataFrame(columns=['Day_of_Week', 'Day', 'Date', 'Sales', 'Moving_Avg'])}

    # Calculate date ranges efficiently
    target_date = end_date if end_date else df['Date'].max().date()
    days_since_monday = target_date.weekday()
    week_start = target_date - timedelta(days=days_since_monday)
    week_end = week_start + timedelta(days=6)

    # Filter historical data
    historical_df = df[
        (df['Date'].dt.date >= week_start) &
        (df['Date'].dt.date <= week_end)
    ]

    # Vectorized daily aggregation
    daily_sales = historical_df.groupby(historical_df['Date'].dt.date)['Net_Price'].sum().reset_index()
    daily_sales.columns = ['Date', 'Sales']

    # Create complete date range and merge
    full_dates = pd.DataFrame({
        'Date': pd.date_range(week_start, week_end).date
    })
    
    complete_data = full_dates.merge(daily_sales, on='Date', how='left')
    complete_data['Sales'] = complete_data['Sales'].fillna(0)
    complete_data = complete_data.sort_values('Date').reset_index(drop=True)

    # Calculate moving average
    complete_data['Moving_Avg'] = complete_data['Sales'].rolling(
        window=moving_avg_days, min_periods=1).mean()

    # Add day information vectorized
    complete_data['Day_of_Week'] = pd.to_datetime(complete_data['Date']).dt.day_name()
    complete_data['Day'] = pd.to_datetime(complete_data['Date']).dt.strftime('%a, %b %d, %Y')

    # Reindex to ensure all days are present
    final_df = complete_data[['Day_of_Week', 'Day', 'Date', 'Sales', 'Moving_Avg']]
    final_df = final_df.set_index('Day_of_Week').reindex(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    ).reset_index()

    final_df['Sales'] = final_df['Sales'].round(2)
    final_df['Moving_Avg'] = final_df['Moving_Avg'].round(2)

    return {'sales_by_day_table': final_df}


# Backward compatibility wrappers
def create_sales_pivot_tables(df, location_filter='All', start_date=None, end_date=None, categories_filter='All'):
    return create_sales_pivot_tables_optimized(df, location_filter, start_date, end_date, categories_filter, skip_filtering=False)

def sales_analysis_tables(df, location_filter='All', start_date=None, end_date=None, categories_filter='All', moving_avg_window=7):
    return sales_analysis_tables_optimized(df, location_filter, start_date, end_date, categories_filter, moving_avg_window, skip_filtering=False)

def sales_by_category_func(df, location_filter='All', end_date=None, start_date=None):
    return sales_by_category_func_optimized(df, location_filter, end_date, start_date, skip_filtering=False)

def category_comparison_func(df, location_filter='All', end_date=None, start_date=None):
    return category_comparison_func_optimized(df, location_filter, end_date, start_date, skip_filtering=False)

def thirteen_week_category(df, location_filter='All', end_date=None, category_filter='All'):
    return thirteen_week_category_optimized(df, location_filter, end_date, category_filter, skip_filtering=False)

def create_sales_by_day_table(df, location_filter='All', end_date=None, categories_filter='All', moving_avg_days=7):
    return create_sales_by_day_table_optimized(df, location_filter, end_date, categories_filter, moving_avg_days, skip_filtering=False)