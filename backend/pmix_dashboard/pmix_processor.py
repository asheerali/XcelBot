import pandas as pd
import numpy as np
import io
from typing import Union
from pmix_dashboard.pmix_utils import overview_tables, detailed_analysis_tables, create_sales_by_category_tables, create_top_vs_bottom_comparison


def process_pmix_file(file_data: Union[io.BytesIO, str],start_date=None, end_date=None , location_filter='All', server_filter='All', category_filter='All',  menu_item_filter='All'):
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
    
    print("Type of file_data:", type(file_data))

    try:
            if isinstance(file_data, pd.DataFrame):
                print("Received DataFrame directly.")
                df = file_data
          
            if df.empty:
                raise ValueError("The sheet 'Database' is empty or missing.")
    except ValueError as e:
        raise ValueError("Sheet named 'Database' not found in the uploaded Excel file.")
    
    
    # locations = df["Location"].unique()
    locations = df["Location"].unique().tolist()
    server = df["Server"].unique().tolist()
    category = df["Category"].unique().tolist()

    print("i am here in pmix_processor.py printing request", df.head(), location_filter, server_filter, category_filter, start_date, end_date)   
    # sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df = companywide_tables(df, store_filter=store_filter, year_filter=year_filter, quarter_filter=quarter_filter, helper4_filter=helper4_filter)
 
    p1 = overview_tables(df, location_filter=location_filter, server_filter=server_filter, category_filter=category_filter,  start_date=start_date, end_date=end_date)
    
    net_sales = p1['net_sales'] #value
    orders = p1['orders'] #value
    qty_sold = p1['qty_sold'] #value
    sales_by_category_df = p1['sales_by_category']
    sales_by_menu_group_df = p1['sales_by_menu_group']
    sales_by_server_df = p1['sales_by_server']
    top_selling_items_df = p1['top_selling_items']
    net_sales_change = p1['net_sales_change'] #value
    orders_change = p1['orders_change'] #value
    qty_sold_change = p1['qty_sold_change'] #value
    
    # p2 = detailed_analysis_tables(df, location_filter=location_filter, menu_item_filter=menu_item_filter)
    p2 = detailed_analysis_tables(df, location_filter=location_filter ,category_filter=category_filter, start_date=start_date, end_date=end_date)
    
    
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

    sales_by_location_df = p2['sales_by_location']
    average_price_by_item_df = p2['average_price_by_item']
    average_order_value = p2['average_order_value'] #value
    average_items_per_order = p2['average_items_per_order'] #value
    price_changes_df = p2['price_changes']
    top_items_df = p2['top_items']
    unique_orders = p2['unique_orders'] #value
    total_quantity = p2['total_quantity'] #value
    average_order_value_change = p2['average_order_value_change'] #value
    average_items_per_order_change = p2['average_items_per_order_change'] #value
    unique_orders_change = p2['unique_orders_change'] #value
    total_quantity_change = p2['total_quantity_change'] #value
     
    p3 = create_sales_by_category_tables(df, location_filter=location_filter, start_date=start_date, end_date=end_date, category_filter=category_filter , server_filter=server_filter)
    
    sales_by_category_tables_df = p3['sales_by_category_table']
    category_comparison_table_df = p3['category_comparison_table']
    sales_by_category_by_day_table_df = p3['sales_by_category_by_day_table']

    top_vs_bottom_comparison_df  = create_top_vs_bottom_comparison(df, location_filter=location_filter, start_date=start_date, end_date=end_date, category_filter=category_filter , server_filter=server_filter)

    print("i am here in pmix_processor.py printing the sales_by_category_by_day_table_df", sales_by_category_by_day_table_df)
    
    return net_sales, orders, qty_sold, sales_by_category_df, sales_by_menu_group_df, sales_by_server_df, top_selling_items_df, sales_by_location_df, average_price_by_item_df, average_order_value, average_items_per_order, price_changes_df, top_items_df, unique_orders, total_quantity, locations, server, category, net_sales_change, orders_change, qty_sold_change, average_order_value_change, average_items_per_order_change, unique_orders_change, total_quantity_change, sales_by_category_tables_df, category_comparison_table_df, sales_by_category_by_day_table_df, top_vs_bottom_comparison_df