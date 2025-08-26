# sales_split_dashboard/sales_split_utils.py

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from utils.utils import _to_date, days_between, _format_percent_change

pd.set_option('future.no_silent_downcasting', True)

# Helper Functions for Code Reuse
def _apply_filters(df, location_filter='All', categories_filter='All'):
    """Apply location and category filters to dataframe"""
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
    
    return filtered_df

def _apply_date_filters(df, start_date=None, end_date=None):
    """Apply date range filters to dataframe"""
    filtered_df = df.copy()
    
    # Convert string dates to datetime.date objects
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
    return filtered_df

def _get_default_date_range():
    """Calculate default 4-week date range ending on next Sunday"""
    current_date = datetime.now().date()
    
    # Calculate the number of days until the next Sunday
    days_to_next_sunday = (6 - current_date.weekday()) % 7
    if days_to_next_sunday == 0:
        days_to_next_sunday = 7  # If today is Sunday, find the next Sunday
    
    end_date_dt = current_date + timedelta(days=days_to_next_sunday)
    start_date_dt = (end_date_dt - timedelta(weeks=4)) + timedelta(days=1)
    
    return start_date_dt, end_date_dt

def _apply_default_date_range(df, start_date=None, end_date=None):
    """Apply date filters with default 4-week range if no dates provided"""
    if start_date is None and end_date is None:
        start_date_dt, end_date_dt = _get_default_date_range()
        return df[(df['Date'] >= start_date_dt) & (df['Date'] <= end_date_dt)]
    else:
        return _apply_date_filters(df, start_date, end_date)

def _format_dataframe_columns(df, format_type='currency', decimal_places=2):
    """Format dataframe columns based on type"""
    formatted_df = df.copy()
    
    if format_type == 'currency':
        for col in formatted_df.columns:
            if col not in ['Week', 'Day', 'Time Range', 'Category']:
                formatted_df[col] = formatted_df[col].apply(lambda x: f"{x:.{decimal_places}f}")
    elif format_type == 'percentage':
        for col in formatted_df.columns:
            if col not in ['Week', 'Day', 'Time Range', 'Category']:
                formatted_df[col] = formatted_df[col].apply(lambda x: f"{x:.{decimal_places}f}%")
    
    return formatted_df

# Main Functions (keeping original names)
def create_sales_pivot_tables(df, location_filter='All', start_date=None, end_date=None, categories_filter='All'):
    # Apply all filters
    filtered_df = _apply_filters(df, location_filter, categories_filter)
    filtered_df = _apply_default_date_range(filtered_df, start_date, end_date)
    
    # Return empty tables if no data
    if filtered_df.empty:
        empty_df = pd.DataFrame()
        return {
            'pivot_table': empty_df, 'in_house_table': empty_df,
            'week_over_week_table': empty_df, 'category_summary_table': empty_df
        }

    # Create pivot table
    expected_categories = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']
    sales_pivot = filtered_df.pivot_table(
        index='Week', columns='Category', values='Net_Price',
        aggfunc='sum', fill_value=0
    )
    
    # Add missing categories and reorder
    for category in expected_categories:
        if category not in sales_pivot.columns:
            sales_pivot[category] = 0
    
    ordered_columns = [col for col in expected_categories if col in sales_pivot.columns]
    other_columns = [col for col in sales_pivot.columns if col not in expected_categories and col != 'Grand Total']
    sales_pivot = sales_pivot[ordered_columns + other_columns]
    
    # Add Grand Total and sort
    sales_pivot['Grand Total'] = sales_pivot.sum(axis=1)
    sales_pivot = sales_pivot.sort_index()
    numeric_sales_pivot = sales_pivot.copy()
    
    # Calculate percentage changes
    pct_change = numeric_sales_pivot.pct_change() * 100
    pct_change.iloc[0] = 0
    pct_change = pct_change.replace([np.inf, -np.inf], 0).fillna(0)
    
    # Calculate category percentages of total
    category_pct_of_total = pd.DataFrame(index=numeric_sales_pivot.index, 
                                        columns=numeric_sales_pivot.columns)
    
    for week in numeric_sales_pivot.index:
        grand_total = numeric_sales_pivot.loc[week, 'Grand Total']
        if grand_total > 0:
            for category in numeric_sales_pivot.columns:
                if category != 'Grand Total':
                    category_value = numeric_sales_pivot.loc[week, category]
                    category_pct_of_total.loc[week, category] = (category_value / grand_total) * 100
    
    category_pct_of_total = category_pct_of_total.fillna(0)
    if 'Grand Total' in category_pct_of_total.columns:
        category_pct_of_total = category_pct_of_total.drop('Grand Total', axis=1)
    
    # Create category summary with week-over-week differences
    category_summary = pd.DataFrame(index=numeric_sales_pivot.index)
    
    for category in expected_categories:
        if category in category_pct_of_total.columns:
            category_summary[category] = 0.0
    
    # Calculate differences
    for i, week in enumerate(numeric_sales_pivot.index):
        if i > 0:
            prev_week = numeric_sales_pivot.index[i-1]
            for category in expected_categories:
                if category in category_pct_of_total.columns:
                    current_pct = category_pct_of_total.loc[week, category]
                    prev_pct = category_pct_of_total.loc[prev_week, category]
                    category_summary.at[week, category] = current_pct - prev_pct
    
    # Add computed columns
    category_summary['3P'] = 0.0
    category_summary['1P/3P'] = 0.0
    
    for week in category_summary.index:
        # 3P calculation
        category_summary.at[week, '3P'] = sum(
            category_pct_of_total.loc[week, cat] for cat in ['UB', 'DD', 'GH'] 
            if cat in category_pct_of_total.columns
        )
        # 1P/3P calculation
        first_p = category_pct_of_total.loc[week, '1P'] if '1P' in category_pct_of_total.columns else 0
        category_summary.at[week, '1P/3P'] = first_p + category_summary.at[week, '3P']
    
    # Format all tables
    return {
        'pivot_table': _format_dataframe_columns(numeric_sales_pivot, 'currency').reset_index(),
        'in_house_table': _format_dataframe_columns(pct_change, 'percentage').reset_index(),
        'week_over_week_table': _format_dataframe_columns(category_pct_of_total, 'percentage').reset_index(),
        'category_summary_table': _format_dataframe_columns(category_summary, 'percentage').reset_index()
    }

def sales_analysis_tables(df, location_filter='All', start_date=None, end_date=None, categories_filter='All', moving_avg_window=7):
    # Apply all filters
    filtered_df = _apply_filters(df, location_filter, categories_filter)
    filtered_df = _apply_default_date_range(filtered_df, start_date, end_date)
    
    # Return empty tables if no data
    if filtered_df.empty:
        empty_cols = ['Sales', 'Orders', 'Moving_Avg']
        return {
            'sales_by_week': pd.DataFrame(columns=['Week'] + empty_cols),
            'sales_by_day': pd.DataFrame(columns=['Day'] + empty_cols),
            'sales_by_time': pd.DataFrame(columns=['Time Range'] + empty_cols)
        }

    # Sales by Week (optimized)
    if end_date is not None:
        end_date_dt = datetime.strptime(end_date, '%Y-%m-%d').date() if isinstance(end_date, str) else end_date
    else:
        end_date_dt = filtered_df['Date'].max()

    # Get last 4 weeks only
    start_8_weeks_ago = end_date_dt - timedelta(weeks=8)
    filtered_df_week = filtered_df[(filtered_df['Date'] >= start_8_weeks_ago) & (filtered_df['Date'] <= end_date_dt)]
    
    sales_by_week = filtered_df_week.groupby(['Year', 'Week']).agg({
        'Net_Price': 'sum', 'Sent_Date': pd.Series.nunique
    }).reset_index()
    
    sales_by_week = sales_by_week.sort_values(['Year', 'Week']).tail(4).reset_index(drop=True)
    sales_by_week['Week Label'] = sales_by_week.apply(lambda row: f"Week {int(row['Week'])}", axis=1)
    sales_by_week = sales_by_week[['Week Label', 'Net_Price', 'Sent_Date', 'Year', 'Week']]
    sales_by_week.columns = ['Week', 'Sales', 'Orders', 'Year', 'Week_Num']
    
    sales_by_week = sales_by_week.sort_values(['Year', 'Week_Num'])
    sales_by_week['Moving_Avg'] = sales_by_week['Sales'].rolling(window=moving_avg_window, min_periods=1).mean()
    sales_by_week = sales_by_week[['Week', 'Sales', 'Orders', 'Moving_Avg']].round(2)

    # Sales by Day (optimized with categorical mapping)
    day_mapping = {'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 
                   'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'}
    day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    filtered_df['Day'] = pd.Categorical(filtered_df['Day'].map(day_mapping), categories=day_order, ordered=True)
    sales_by_day = filtered_df.groupby('Day', observed=False).agg({
        'Net_Price': 'sum', 'Sent_Date': pd.Series.nunique
    }).reset_index()
    
    sales_by_day.columns = ['Day', 'Sales', 'Orders']
    sales_by_day['Moving_Avg'] = sales_by_day['Sales'].rolling(
        window=min(moving_avg_window, len(sales_by_day)), min_periods=1
    ).mean().round(2)
    sales_by_day['Sales'] = sales_by_day['Sales'].round(2)

    # Sales by Time (optimized with vectorized operation)
    def categorize_time_vectorized(time_series):
        def categorize_single_time(time_str):
            if not isinstance(time_str, str):
                time_str = str(time_str)
            try:
                hour = int(time_str.split(':')[0]) if ':' in time_str else int(float(time_str))
                if hour < 6: return '12AM-6AM'
                elif hour < 11: return '6AM-11AM'
                elif hour < 14: return '11AM-2PM'
                elif hour < 17: return '2PM-5PM'
                elif hour < 20: return '5PM-8PM'
                elif hour < 24: return '8PM-12AM'
                else: return 'Unknown'
            except:
                return 'Unknown'
        
        return time_series.apply(categorize_single_time)

    time_order = ['6AM-11AM', '11AM-2PM', '2PM-5PM', '5PM-8PM', '8PM-12AM', '12AM-6AM']
    filtered_df['Time Range'] = pd.Categorical(
        categorize_time_vectorized(filtered_df['Time']), categories=time_order, ordered=True
    )
    
    sales_by_time = filtered_df.groupby('Time Range', observed=False).agg({
        'Net_Price': 'sum', 'Sent_Date': pd.Series.nunique
    }).reset_index()
    
    sales_by_time.columns = ['Time Range', 'Sales', 'Orders']
    sales_by_time['Moving_Avg'] = sales_by_time['Sales'].rolling(
        window=min(moving_avg_window, len(sales_by_time)), min_periods=1
    ).mean().round(2)
    sales_by_time['Sales'] = sales_by_time['Sales'].round(2)

    return {
        'sales_by_week': sales_by_week,
        'sales_by_day': sales_by_day,
        'sales_by_time': sales_by_time
    }

def sales_by_category_func(df, location_filter='All', end_date=None, start_date=None):
    # Apply filters
    filtered_df = _apply_filters(df, location_filter)
    filtered_df = _apply_default_date_range(filtered_df, start_date, end_date)
    
    if filtered_df.empty:
        return pd.DataFrame()
    
    # Ensure Date is datetime and create week labels
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])
    
    filtered_df['Week_Number'] = filtered_df['Date'].dt.isocalendar().week
    filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number'].astype(str)
    
    # Create pivot table
    sales_by_category_table = pd.pivot_table(
        filtered_df, values='Net_Price', index='Category', columns='Week_Label',
        aggfunc='sum', fill_value=0, margins=True, margins_name='Grand Total'
    )
    
    return sales_by_category_table.round(2).fillna(0).reset_index()

def category_comparison_func(df, location_filter='All', end_date=None, start_date=None):
    # Empty response structure
    empty_response = pd.DataFrame([{
        'Category': '', 'This_4_Weeks_Sales': 0, 'Last_4_Weeks_Sales': 0, 'Percent_Change': '0.00%'
    }])

    if df.empty:
        return empty_response

    # Apply location filter
    df_copy = _apply_filters(df, location_filter)

    # Calculate date ranges
    if start_date is not None and end_date is not None:
        sd = _to_date(start_date)
        ed = _to_date(end_date)
        if sd > ed:
            sd, ed = ed, sd
        
        start_date, end_date_final = sd, ed
        period_len_inclusive = days_between(sd, ed, inclusive=True)
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = start_date - timedelta(days=period_len_inclusive)
    else:
        current_date = datetime.now().date()
        days_to_next_sunday = (6 - current_date.weekday()) % 7 or 7
        current_date += timedelta(days=days_to_next_sunday)

        week_start = current_date - timedelta(days=current_date.weekday())
        week_end = week_start + timedelta(days=6)

        start_date, end_date_final = week_start, week_end
        previous_end_date = start_date - timedelta(days=1)
        previous_start_date = start_date - timedelta(weeks=1)

    # Filter periods
    current_period = df_copy[(df_copy['Date'] >= start_date) & (df_copy['Date'] <= end_date_final)]
    previous_period = df_copy[(df_copy['Date'] >= previous_start_date) & (df_copy['Date'] <= previous_end_date)]

    if current_period.empty and previous_period.empty:
        return empty_response

    # Aggregate sales
    current_sales = current_period.groupby('Category')['Net_Price'].sum().reset_index()
    current_sales.columns = ['Category', 'Current_4_Weeks_Sales']

    if not previous_period.empty:
        previous_sales = previous_period.groupby('Category')['Net_Price'].sum().reset_index()
        previous_sales.columns = ['Category', 'Previous_4_Weeks_Sales']
    else:
        previous_sales = pd.DataFrame({
            'Category': current_sales['Category'], 'Previous_4_Weeks_Sales': 0
        })

    # Merge and calculate percentage change
    category_comparison_table = pd.merge(current_sales, previous_sales, on='Category', how='outer').fillna(0)
    category_comparison_table['Percent_Change'] = category_comparison_table.apply(
        lambda row: ((row['Current_4_Weeks_Sales'] - row['Previous_4_Weeks_Sales']) / row['Previous_4_Weeks_Sales'] * 100) 
        if row['Previous_4_Weeks_Sales'] != 0 else 0.0, axis=1
    )

    # Format results
    category_comparison_table[['Current_4_Weeks_Sales', 'Previous_4_Weeks_Sales']] = \
        category_comparison_table[['Current_4_Weeks_Sales', 'Previous_4_Weeks_Sales']].round(2)
    category_comparison_table['Percent_Change'] = category_comparison_table['Percent_Change'].apply(
        lambda x: f"{x:.2f}%"
    )
    
    category_comparison_table.columns = ['Category', 'This_4_Weeks_Sales', 'Last_4_Weeks_Sales', 'Percent_Change']
    return category_comparison_table.sort_values('This_4_Weeks_Sales', ascending=False).reset_index(drop=True)

def thirteen_week_category(df, location_filter='All', end_date=None, category_filter='All'):
    # Apply filters
    df_copy = _apply_filters(df, location_filter, category_filter)
    
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])

    # Determine end date
    if end_date is not None and isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    elif end_date is None:
        end_date = df_copy['Date'].max().date()
    
    end_date = pd.Timestamp(end_date)
    thirteen_week_start_date = pd.Timestamp(end_date - timedelta(days=90))

    # Filter 13-week period
    thirteen_week_df = df_copy[
        (df_copy['Date'] >= thirteen_week_start_date) & (df_copy['Date'] <= end_date)
    ]
    
    if thirteen_week_df.empty:
        return {'thirteen_week_category_table': pd.DataFrame()}
    
    # Create week labels and aggregate
    thirteen_week_df['Week_Number'] = thirteen_week_df['Date'].dt.isocalendar().week
    thirteen_week_df['Week_Label'] = 'Week ' + thirteen_week_df['Week_Number'].astype(str)
    
    thirteen_week_summary = thirteen_week_df.groupby('Week_Label').agg({
        'Net_Price': ['sum', 'count']
    }).round(2)
    
    thirteen_week_summary.columns = ['Total_Sales', 'Total_Orders']
    thirteen_week_category_table = thirteen_week_summary.reset_index()
    thirteen_week_category_table.columns = ['Week', 'Total_Sales', 'Total_Orders']
    
    # Sort by week number
    thirteen_week_category_table['Week_Num'] = thirteen_week_category_table['Week'].str.extract('(\d+)').astype(int)
    thirteen_week_category_table = thirteen_week_category_table.sort_values('Week_Num').drop('Week_Num', axis=1)
    
    # Add grand total
    grand_total_row = pd.DataFrame({
        'Week': ['Grand Total'],
        'Total_Sales': [thirteen_week_category_table['Total_Sales'].sum()],
        'Total_Orders': [thirteen_week_category_table['Total_Orders'].sum()],
    })
    
    thirteen_week_category_table = pd.concat([thirteen_week_category_table, grand_total_row], ignore_index=True)
    
    return {'thirteen_week_category_table': thirteen_week_category_table}

def create_sales_by_day_table(df, location_filter='All', end_date=None, categories_filter='All', moving_avg_days=7):
    # Apply filters
    df_copy = _apply_filters(df, location_filter, categories_filter)
    
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])

    # Determine end date and week boundaries
    if end_date is not None and isinstance(end_date, str):
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    elif end_date is None:
        end_date = df_copy['Date'].max().date()

    target_date = end_date
    days_since_monday = target_date.weekday()
    week_start = target_date - timedelta(days=days_since_monday)
    week_end = week_start + timedelta(days=6)

    if df_copy.empty:
        return {'sales_by_day_table': pd.DataFrame(columns=['Day_of_Week', 'Day', 'Date', 'Sales', 'Moving_Avg'])}

    # Get historical data for moving average
    historical_df = df_copy[(df_copy['Date'].dt.date >= week_start) & (df_copy['Date'].dt.date <= week_end)]
    
    # Aggregate daily sales
    daily_sales = historical_df.groupby(historical_df['Date'].dt.date)['Net_Price'].sum().reset_index()
    daily_sales.columns = ['Date', 'Sales']

    # Create complete date range and merge
    full_dates = pd.DataFrame({'Date': pd.date_range(week_start, week_end).date})
    complete_data = full_dates.merge(daily_sales, on='Date', how='left')
    complete_data['Sales'] = complete_data['Sales'].fillna(0)
    complete_data = complete_data.sort_values('Date')

    # Calculate moving average
    complete_data['Moving_Avg'] = complete_data['Sales'].rolling(
        window=moving_avg_days, min_periods=1
    ).mean()

    # Prepare final output
    target_week_data = complete_data[
        (complete_data['Date'] >= week_start) & (complete_data['Date'] <= week_end)
    ].copy()

    target_week_data['Day_of_Week'] = pd.to_datetime(target_week_data['Date']).dt.day_name()
    target_week_data['Day'] = pd.to_datetime(target_week_data['Date']).dt.strftime('%a, %b %d, %Y')

    final_df = target_week_data[['Day_of_Week', 'Day', 'Date', 'Sales', 'Moving_Avg']]
    final_df = final_df.set_index('Day_of_Week').reindex(
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    ).reset_index()

    final_df[['Sales', 'Moving_Avg']] = final_df[['Sales', 'Moving_Avg']].round(2)

    return {'sales_by_day_table': final_df}