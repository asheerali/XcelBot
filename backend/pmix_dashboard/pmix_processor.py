import pandas as pd
import io
from typing import Union
import pandas as pd
from pmix_dashboard.pmix_utils import overview_tables, detailed_analysis_tables



def process_pmix_file(file_data: Union[io.BytesIO, str], location_filter='All', order_date_filter=None, server_filter='All', dining_option_filter='All',  menu_item_filter='All'):
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
            if isinstance(file_data, io.BytesIO):
                file_data.seek(0)
                print("Reading Excel from BytesIO object.")
                df = pd.read_excel(file_data)
            elif isinstance(file_data, str):
                print("Reading Excel from file path.")
                df = pd.read_excel(file_data)
          
            if df.empty:
                raise ValueError("The sheet 'Database' is empty or missing.")
    except ValueError as e:
        raise ValueError("Sheet named 'Database' not found in the uploaded Excel file.")

    
    # Strip whitespace from column names
    df.columns = df.columns.str.strip()

    # Define special columns with specific fill values
    int_cols = ['Qty']
    bool_cols = ['Void?', 'Deferred', 'Tax Exempt']

    # Fill 'Qty' with 0 and convert to int
    df[int_cols] = df[int_cols].fillna(0).astype(int)

    # Fill boolean columns with False and convert to bool
    df[bool_cols] = df[bool_cols].fillna(False).astype(bool)

    # Define columns to exclude from general filling
    exclude_cols = ['Location', 'Order Id', 'Sent Date', 'Order Date',
        'Check Id', 'Server', 'Table', 'Dining Area', 'Service',
        'Dining Option', 'Item Selection Id', 'Item Id', 'Master Id', 'SKU',
        'PLU', 'Menu Item', 'Menu Subgroup(s)', 'Menu Group', 'Menu',
        'Sales Category', 'Tax Inclusion Option', 'Dining Option Tax', 'Tab Name']

    # Columns eligible for generic fill (excluding specific fills above)
    fill_cols = [col for col in df.columns if col not in exclude_cols + int_cols + bool_cols]

    # Replace NaN with 0 only in selected columns
    df[fill_cols] = df[fill_cols].fillna(0)

    # Fill excluded (metadata/helper) columns with empty string
    df[exclude_cols] = df[exclude_cols].fillna('')


    df["Order Date"] = pd.to_datetime(df["Order Date"], dayfirst=False).dt.strftime('%m-%d-%Y')

 
    # sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df = companywide_tables(df, store_filter=store_filter, year_filter=year_filter, quarter_filter=quarter_filter, helper4_filter=helper4_filter)
 
    p1 = overview_tables(df, location_filter=location_filter, order_date_filter=order_date_filter, server_filter=server_filter, dining_option_filter=dining_option_filter)
    
    net_sales = p1['net_sales'] #value
    orders = p1['orders'] #value
    qty_sold = p1['qty_sold'] #value
    sales_by_category_df = p1['sales_by_category']
    sales_by_menu_group_df = p1['sales_by_menu_group']
    sales_by_server_df = p1['sales_by_server']
    top_selling_items_df = p1['top_selling_items']
    
    p2 = detailed_analysis_tables(df, location_filter=location_filter, order_date_filter=order_date_filter, dining_option_filter=dining_option_filter, menu_item_filter=menu_item_filter)
    
    
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
     
    
 
    return net_sales, orders, qty_sold, sales_by_category_df, sales_by_menu_group_df, sales_by_server_df, top_selling_items_df, sales_by_location_df, average_price_by_item_df, average_order_value, average_items_per_order, price_changes_df, top_items_df, unique_orders, total_quantity