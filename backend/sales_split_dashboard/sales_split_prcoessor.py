import pandas as pd
import io
from typing import Union
import pandas as pd
# from pmix_dashboard.pmix_utils import overview_tables, detailed_analysis_tables
from sales_split_dashboard.sales_split_utils import create_sales_pivot_tables, sales_analysis_tables, create_sales_overview_tables
import numpy as np

def process_sales_split_file(file_data: Union[io.BytesIO, str],location='All', start_date=None, end_date=None):
    """
    Process the uploaded Excel file and transform the data.
    Returns data tables for the frontend including the 1P column.
    
    Parameters:
    - file_data: Excel file as BytesIO object
    - start_date: Optional start date for filtering (str format: 'YYYY-MM-DD')
    - end_date: Optional end date for filtering (str format: 'YYYY-MM-DD')
    - location: Optional location name for filtering
    """
    # Read the Excel file
    # df = pd.read_excel(file_data)
    
    print("Type of file_data: i am here", type(file_data))
    

    try:
            if isinstance(file_data, io.BytesIO):
                print("i am here in io.BytesIO")
                file_data.seek(0)
                print("Reading Excel from BytesIO object.")
                needed_columns = ["Location", "Sent Date", "Dining Option", "Net Price", "Qty"]
                df = pd.read_excel(file_data, usecols=needed_columns)
                print("df im here prnting df in sales_split_processor_file", "\n", df.head())
                # df = pd.read_excel(file_data)
            elif isinstance(file_data, str):
                print("Reading Excel from file path.")
                needed_columns = ["Location", "Sent Date", "Dining Option", "Net Price", "Qty"]
                df = pd.read_excel(file_data, usecols=needed_columns)
                # df = pd.read_excel(file_data)
          
            if df.empty:
                raise ValueError("The sheet 'Database' is empty or missing.")
    except ValueError as e:
        raise ValueError("Sheet named 'Database' not found in the uploaded Excel file.")

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # # Step 1: Check for any NaN values
    # nan_summary = df.isna().sum()
    # print("NaN values per column:\n", nan_summary[nan_summary > 0])

    # Step 2: Define specific column types and fill logic
    int_cols = ['Qty']
    float_cols = ['Net Price']
    date_cols = ['Sent Date']
    text_cols = ['Location', 'Dining Option']

    # Fill integers with 0
    df[int_cols] = df[int_cols].fillna(0).astype(int)

    # Fill floats with 0.0
    df[float_cols] = df[float_cols].fillna(0.0)

    # Convert date columns with error coercion
    for col in date_cols:
        df[col] = pd.to_datetime(df[col], errors='coerce')

    # Fill text columns with empty strings
    df[text_cols] = df[text_cols].fillna('')

    # Create derived columns
    df['Date'] = df['Sent Date'].dt.date
    df['Time'] = df['Sent Date'].dt.time
    df['Day'] = df['Sent Date'].dt.day_name()          # e.g., Monday
    df['Week'] = df['Sent Date'].dt.isocalendar().week
    df['Month'] = df['Sent Date'].dt.month_name()      # e.g., April
    df['Quarter'] = df['Sent Date'].dt.quarter
    df['Year'] = df['Sent Date'].dt.year
    
    # Define groups
    in_house = [
        "Kiosk - Dine In", "Kiosk - Take Out", "Take Out - Cashier",
        "Take Out  - Cashier", "Pick Up - Phone", "Inkind - Take Out"
    ]
    one_p = [
        "Delivery - Phone", "ChowNow: Pick Up", "Lunchbox Delivery",
        "Lunchbox Pick Up", "ChowNow: Delivery"
    ]
    dd = [
        "DoorDash Pick Up", "DoorDash Self-Delivery"
    ]
    catering = [
        "EZ Cater - Pick Up", "LB Catering Delivery", "Catering Delivery - Phone",
        "LB Catering Pick Up", "Ez Cater - Delivery", "Catering Pick Up - Phone",
        "CaterCow - Delivery", "Fooda Pick up", "Sharebite - Pick Up"
    ]
    gh = [
        "Grubhub Pick Up", "Grubhub Self - Delivery"
    ]
    ub = [
        "UberEats Pick Up", "UberEats Self-Delivery"
    ]

    # Create conditions and corresponding values
    conditions = [
        df["Dining Option"].isin(in_house),
        df["Dining Option"].isin(one_p),
        df["Dining Option"].isin(dd),
        df["Dining Option"].isin(catering),
        df["Dining Option"].isin(gh),
        df["Dining Option"].isin(ub)
    ]

    choices = ["In-House", "1P", "DD", "Catering", "GH", "UB"]

    # Apply the mapping
    df["Category"] = np.select(conditions, choices, default="")
    df["Category"] = df["Category"].replace({"": "Others"})
    
    categories = df["Category"].unique().tolist()
    locations = df["Location"].unique().tolist()


 
 
    print("df i am here in sales split procesor after df cleanign and transforming", "\n", df.head())
    # sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df = companywide_tables(df, store_filter=store_filter, year_filter=year_filter, quarter_filter=quarter_filter, helper4_filter=helper4_filter)
 
    # p1 = overview_tables(df, location_filter=location_filter, order_date_filter=order_date_filter, server_filter=server_filter, dining_option_filter=dining_option_filter)
    
    pivot = create_sales_pivot_tables(df, location_filter=location, start_date=start_date, end_date=end_date)
    
    pivot_table = pivot['pivot_table'] #value
    in_house_table = pivot['in_house_table'] #value
    week_over_week_table = pivot['week_over_week_table'] #value
    category_summary_table = pivot['category_summary_table']
   
    print("pivot_table i am here in sales split processor", "\n", pivot_table.head())
    # p2 = detailed_analysis_tables(df, location_filter=location_filter, order_date_filter=order_date_filter, dining_option_filter=dining_option_filter, menu_item_filter=menu_item_filter)
    
        
    # Get the latest date from your dataframe
    current_date = df['Date'].max()

    # Calculate start date as 28 days before the end date
    start_date_sample = current_date - pd.Timedelta(days=28)

    # Adjust start_date to the previous Monday (weekday 0 = Monday)
    days_since_monday = start_date_sample.weekday()  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    start_date_sample = start_date_sample - pd.Timedelta(days=days_since_monday)

    end_date_sample =  start_date_sample + pd.Timedelta(days=27)
    # Convert to string format
    end_date_str = end_date_sample.strftime('%Y-%m-%d')
    start_date_str = start_date_sample.strftime('%Y-%m-%d')
    
    sales_overview_analysis = create_sales_overview_tables(df, location_filter='All', start_date=start_date_str, end_date=end_date_str)

    analysis = sales_analysis_tables(df, location_filter=location, start_date=start_date, end_date=end_date)
    
    #    # Return all tables and metrics in a dictionary
    # return {
    #     'sales_by_location': sales_by_location,
    #     'average_price_by_item': average_price_by_item,
    #     'average_order_value': average_order_value,
    #     'average_items_per_order': average_items_per_order,
    #     'price_changes': price_changes,
    #     'top_items': top_items,
    #     'unique_orders': unique_orders,
    #     'total_quantity': total_quantity
    # }

    salesByWeek = analysis['sales_by_week']
    salesByDayOfWeek = analysis['sales_by_day']
    salesByTimeOfDay = analysis['sales_by_time'] #value
     
    sales_by_day_table = sales_overview_analysis['sales_by_day_table']
    sales_by_category_table = sales_overview_analysis['sales_by_category_table']
    category_comparison_table = sales_overview_analysis['category_comparison_table']
    thirteen_week_category_table = sales_overview_analysis['thirteen_week_category_table']
    
 
    return sales_by_day_table, sales_by_category_table, category_comparison_table, thirteen_week_category_table, pivot_table, in_house_table, week_over_week_table, category_summary_table, salesByWeek, salesByDayOfWeek, salesByTimeOfDay, categories, locations