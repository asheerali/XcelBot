# sales_split_dashboard/sales_split_processor.py

import pandas as pd
import io
from typing import Union
from sales_split_dashboard.sales_split_utils import (
    create_sales_pivot_tables, 
    sales_analysis_tables, 
    create_sales_by_day_table, 
    thirteen_week_category,
    category_comparison_func, 
    sales_by_category_func
)

def process_sales_split_file(file_data: Union[io.BytesIO, str, pd.DataFrame], 
                           location='All', start_date=None, end_date=None, 
                           category_filter='All'):
    """
    Process the uploaded Excel file and transform the data.
    Returns data tables for the frontend including the 1P column.
    
    Parameters:
    - file_data: Excel file as BytesIO object or DataFrame
    - start_date: Optional start date for filtering (str format: 'YYYY-MM-DD')
    - end_date: Optional end date for filtering (str format: 'YYYY-MM-DD')
    - location: Optional location name for filtering
    - category_filter: Optional category filter for filtering
    """
    # Validate and prepare dataframe
    try:
        if isinstance(file_data, pd.DataFrame):
            df = file_data
        else:
            # If it's not a DataFrame, assume it needs to be read
            df = pd.read_excel(file_data)
            
        if df.empty:
            raise ValueError("The dataframe is empty or missing.")
            
    except Exception as e:
        raise ValueError(f"Error processing file data: {str(e)}")

    # Get unique categories and locations for frontend
    categories = df["Category"].unique().tolist()
    locations = df["Location"].unique().tolist()

    # Execute all analysis functions in parallel-friendly manner
    # These functions are optimized to handle their own filtering
    common_params = {
        'location_filter': location,
        'start_date': start_date,
        'end_date': end_date,
        'categories_filter': category_filter
    }
    
    # Main pivot analysis
    pivot = create_sales_pivot_tables(df, **common_params)
    pivot_table = pivot['pivot_table']
    in_house_table = pivot['in_house_table']
    week_over_week_table = pivot['week_over_week_table']
    category_summary_table = pivot['category_summary_table']
    
    # Time-based analysis
    analysis = sales_analysis_tables(df, **common_params)
    salesByWeek = analysis['sales_by_week']
    salesByDayOfWeek = analysis['sales_by_day']
    salesByTimeOfDay = analysis['sales_by_time']
    
    # Daily analysis
    sales_by_day = create_sales_by_day_table(df, **{k:v for k,v in common_params.items() if k != 'start_date'})
    sales_by_day_table = sales_by_day['sales_by_day_table']
    
    # Category analysis (uses 'All' for location to get company-wide view)
    category_params = {**common_params, 'location_filter': 'All'}
    sales_by_category_table = sales_by_category_func(df, **category_params)
    category_comparison_table = category_comparison_func(df, **category_params)
    
    # 13-week analysis
    thirteen_week_params = {k:v for k,v in common_params.items() if k != 'start_date'}
    thirteen_week_category_df = thirteen_week_category(df, **thirteen_week_params)
    thirteen_week_category_table = thirteen_week_category_df['thirteen_week_category_table']
    
    return (sales_by_day_table, sales_by_category_table, category_comparison_table, 
            thirteen_week_category_table, pivot_table, in_house_table, 
            week_over_week_table, category_summary_table, salesByWeek, 
            salesByDayOfWeek, salesByTimeOfDay, categories, locations)