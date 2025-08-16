import pandas as pd
import io
from typing import Union
import pandas as pd
# from pmix_dashboard.pmix_utils import overview_tables, detailed_analysis_tables
from sales_split_dashboard.sales_split_utils import (create_sales_pivot_tables, 
                                                     sales_analysis_tables, 
                                                    #  create_sales_overview_tables, 
                                                     create_sales_by_day_table, 
                                                     thirteen_week_category,
                                                     category_comparison_func, 
                                                     sales_by_category_func)
import numpy as np

def process_sales_split_file(file_data: Union[io.BytesIO, str, pd.DataFrame],location='All', start_date=None, end_date=None, category_filter='All'):
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
    
    # print("Type of file_data: i am here", type(file_data))
    
    try:
            if isinstance(file_data, pd.DataFrame):
                # print("Received DataFrame directly.")
                df = file_data
        
            if df.empty:
                raise ValueError("The sheet 'Database' is empty or missing.")
    except ValueError as e:
        raise ValueError("Sheet named 'Database' not found in the uploaded Excel file.")


    # print("df i am here in sales_split_processor_file----", "\n", df)
    # print( " i am here in sales_split_processor_file printing the dates", start_date, end_date, "start date_type", type(start_date), "end date type", type(end_date) ,  "and the location", location, "and the category_filter", category_filter)

    categories = df["Category"].unique().tolist()
    locations = df["Location"].unique().tolist()

    # sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df = companywide_tables(df, store_filter=store_filter, year_filter=year_filter, quarter_filter=quarter_filter, helper4_filter=helper4_filter)
 
    # p1 = overview_tables(df, location_filter=location_filter, order_date_filter=order_date_filter, server_filter=server_filter, dining_option_filter=dining_option_filter)
    
    pivot = create_sales_pivot_tables(df, location_filter=location, start_date=start_date, end_date=end_date, categories_filter=category_filter)
    
    
    # print("i am here in sales split processor pivot", "\n", pivot)
    pivot_table = pivot['pivot_table'] #value
    in_house_table = pivot['in_house_table'] #value
    week_over_week_table = pivot['week_over_week_table'] #value
    category_summary_table = pivot['category_summary_table']
   
    # print("pivot_table i am here in sales split processor", "\n", pivot_table.head())
    # p2 = detailed_analysis_tables(df, location_filter=location_filter, order_date_filter=order_date_filter, dining_option_filter=dining_option_filter, menu_item_filter=menu_item_filter)
    

    # # Get the latest date from your dataframe
    # current_date = df['Date'].max()

    # # Calculate start date as 28 days before the end date
    # start_date_sample = current_date - pd.Timedelta(days=28)

    # # Adjust start_date to the previous Monday (weekday 0 = Monday)
    # days_since_monday = start_date_sample.weekday()  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    # start_date_sample = start_date_sample - pd.Timedelta(days=days_since_monday)

    # end_date_sample =  start_date_sample + pd.Timedelta(days=27)
    # # Convert to string format
    # end_date_str = end_date_sample.strftime('%Y-%m-%d')
    # start_date_str = start_date_sample.strftime('%Y-%m-%d')
    
    # print("i am here in sales split processor start_date_str", start_date_str, "end_date_str", end_date_str, "current date", current_date)
    
    # sales_overview_analysis = create_sales_overview_tables(df, location_filter='All', start_date=start_date, end_date=end_date)

    analysis = sales_analysis_tables(df, location_filter=location, start_date=start_date, end_date=end_date, categories_filter=category_filter)

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

    sales_by_day = create_sales_by_day_table(df, location_filter=location, end_date=end_date, categories_filter=category_filter)
    sales_by_day_table = sales_by_day['sales_by_day_table']

    # print("sales_by_day_table i am here in sales split processor", "\n", sales_by_day_table.head())
    sales_by_category_table = sales_by_category_func(df, location_filter='All', start_date=start_date, end_date=end_date)
    category_comparison_table = category_comparison_func(df, location_filter='All', start_date=start_date, end_date=end_date)

    print("i am here in the sales split processor printing sales_by_category_table", sales_by_category_table)

    salesByWeek = analysis['sales_by_week']
    salesByDayOfWeek = analysis['sales_by_day']
    salesByTimeOfDay = analysis['sales_by_time']

    # # sales_by_day_table = sales_overview_analysis['sales_by_day_table'] 
    # sales_by_category_table = sales_overview_analysis['sales_by_category_table']
    # category_comparison_table = sales_overview_analysis['category_comparison_table']
    # thirteen_week_category_table = sales_overview_analysis['thirteen_week_category_table']
    
    
    # print("i am here in sales split processor printing sales by category", "\n", )
    
    thirteen_week_category_df = thirteen_week_category(df, location_filter=location, end_date=end_date, category_filter=category_filter)
    thirteen_week_category_table = thirteen_week_category_df['thirteen_week_category_table']
    
    # thirteen_week_category_table = sales_overview_analysis['category_comparison_table']
    return sales_by_day_table, sales_by_category_table, category_comparison_table, thirteen_week_category_table, pivot_table, in_house_table, week_over_week_table, category_summary_table, salesByWeek, salesByDayOfWeek, salesByTimeOfDay, categories, locations