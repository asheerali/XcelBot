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
    
        
    df["Order Date"] = pd.to_datetime(df["Order Date"], dayfirst=False)
    # Create derived columns
    df['Date'] = df['Order Date'].dt.date


    df["Order Date"] = pd.to_datetime(df["Order Date"], dayfirst=False).dt.strftime('%m-%d-%Y')

    # Define groups
    in_house = [
        "Kiosk - Dine In", "Kiosk - Take Out", "Take Out - Cashier",
        "Take Out  - Cashier", "Pick Up - Phone", "Inkind - Take Out",
        "Dine In", "Take Out"
    ]
    one_p = [
        "Delivery - Phone", "ChowNow: Pick Up", "Lunchbox Delivery",
        "Lunchbox Pick Up", "ChowNow: Delivery", "Online Ordering - Takeout"
    ]
    dd = [
        "DoorDash Pick Up", "DoorDash Self-Delivery", "DoorDash - Takeout",
        "DoorDash - Delivery", "DoorDash - Pick Up", "DoorDash - Self-Delivery",
    ]
    catering = [
        "EZ Cater - Pick Up", "LB Catering Delivery", "Catering Delivery - Phone",
        "LB Catering Pick Up", "Ez Cater - Delivery", "Catering Pick Up - Phone",
        "CaterCow - Delivery", "Fooda Pick up", "Sharebite - Pick Up"
    ]
    gh = [
        "Grubhub Pick Up", "Grubhub Self - Delivery", "Grubhub - Takeout",
        "Grubhub - Delivery", "Grubhub - Pick Up", "Grubhub - Self-Delivery",
    ]
    ub = [
        "UberEats Pick Up", "UberEats Self-Delivery", "UberEats - Takeout",
        "UberEats - Delivery", "UberEats - Pick Up", "UberEats - Self-Delivery",
        "Uber Eats - Delivery", "Uber Eats - Takeout", "Uber Eats - Pick Up",
        "Uber Eats - Self-Delivery", "Uber Eats - Delivery",
        "Uber Eats - Takeout", "Uber Eats - Pick Up", "Uber Eats - Self-Delivery"
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

    
    return net_sales, orders, qty_sold, sales_by_category_df, sales_by_menu_group_df, sales_by_server_df, top_selling_items_df, sales_by_location_df, average_price_by_item_df, average_order_value, average_items_per_order, price_changes_df, top_items_df, unique_orders, total_quantity, locations, server, category, net_sales_change, orders_change, qty_sold_change, average_order_value_change, average_items_per_order_change, unique_orders_change, total_quantity_change, sales_by_category_tables_df, category_comparison_table_df, sales_by_category_by_day_table_df, top_vs_bottom_comparison_df