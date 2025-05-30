import pandas as pd
import numpy as np
from datetime import datetime


def overview_tables(df, location_filter='All', order_date_filter=None, server_filter='All', dining_option_filter='All', category_filter='All', start_date=None, end_date=None  ):
    """
    Create dashboard tables for restaurant visualization with optional filters.
    
    Parameters:
    -----------
    df : pd.DataFrame
        The raw data containing order information
    location_filter : str or list, optional
        Filter by specific location(s)
    order_date_filter : str or list, optional
        Filter by specific order date(s)
    server_filter : str or list, optional
        Filter by specific server(s)
    dining_option_filter : str or list, optional
        Filter by specific dining option(s)
    category_filter : str or list, optional
        Filter by specific category(s). Options: ['In-House', 'DD', '1P', 'GH', 'Catering', 'UB', 'Others']
    
    Returns:
    --------
    Dict[str, pd.DataFrame]
        Dictionary containing all tables needed for the dashboard
    """
    # Make a copy of the dataframe
    filtered_df = df.copy()
    
    # Apply filters
    if location_filter != 'All':
        if isinstance(location_filter, list):
            filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    
    # if order_date_filter is not None:
    #     if isinstance(order_date_filter, list):
    #         filtered_df = filtered_df[filtered_df['Order Date'].isin(order_date_filter)]
    #     else:
    #         filtered_df = filtered_df[filtered_df['Order Date'] == order_date_filter]
        
    if server_filter != 'All':
        if isinstance(server_filter, list):
            filtered_df = filtered_df[filtered_df['Server'].isin(server_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Server'] == server_filter]
        
    if dining_option_filter != 'All':
        if isinstance(dining_option_filter, list):
            filtered_df = filtered_df[filtered_df['Dining Option'].isin(dining_option_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Dining Option'] == dining_option_filter]
    
    # Add category filter
    if category_filter != 'All':
        if isinstance(category_filter, list):
            filtered_df = filtered_df[filtered_df['Category'].isin(category_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Category'] == category_filter]

    # Apply date range filter - convert string dates to datetime.date objects
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
        
    # Create a change dataframe for comparison (e.g., previous day or week)
    
    # If the dataframe is empty after filtering, return empty tables
    if filtered_df.empty:
        return {
            'net_sales': 0,
            'orders': 0,
            'qty_sold':0,
            'sales_by_category': pd.DataFrame(columns=['Category', 'Percentage', 'Sales']),
            'sales_by_menu_group': pd.DataFrame(columns=['Menu Group', 'Sales']),
            'sales_by_server': pd.DataFrame(columns=['Server', 'Sales']),
            'top_selling_items': pd.DataFrame(columns=['Item', 'Server', 'Quantity', 'Sales']),
            "net_sales_change":0 ,
            "orders_change": 0,
            "qty_sold_change": 0
            
        }
    
    change_filtered_df = df.copy()
    
    
        
    # Calculate the number of days in the original range
    days_diff = (end_date - start_date).days

    # Set change period dates
    change_end_date = start_date  # Change end date becomes the original start date
    change_start_date = start_date - timedelta(days=days_diff + 1)  # Go back by the range duration

    # Apply date range filter for change period
    if change_start_date is not None:
        change_filtered_df = change_filtered_df[change_filtered_df['Date'] >= change_start_date]

    if change_end_date is not None:
        change_filtered_df = change_filtered_df[change_filtered_df['Date'] <= change_end_date]

    
        # Apply date range filter - convert string dates to datetime.date objects
    if change_start_date is not None:
        if isinstance(change_start_date, str):
            change_start_date = datetime.strptime(change_start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= change_start_date]
    
    if change_end_date is not None:
        if isinstance(change_end_date, str):
            change_end_date = datetime.strptime(change_end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= change_end_date]
    
    
    # -------------------------------------------------------
    # 1. Overview Metrics Tables
    # -------------------------------------------------------
    net_sales = round(filtered_df['Net Price'].sum(), 2)
    net_sales_change =  (round(change_filtered_df['Net Price'].sum(), 2) - net_sales)/  net_sales  if net_sales != 0 else 0
    unique_orders = filtered_df['Order #'].nunique()
    orders_change = round(change_filtered_df['Order #'].nunique(), 2) - unique_orders / unique_orders  if unique_orders != 0 else 0
    qty_sold = filtered_df['Qty'].sum() 
    qty_sold_change = round(change_filtered_df['Qty'].sum(), 2) - qty_sold / qty_sold  if qty_sold != 0 else 0
    
    # net_sales_table = pd.DataFrame({'Value': [net_sales], 'Label': ['Net Sales']})
    # orders_table = pd.DataFrame({'Value': [unique_orders], 'Label': ['Orders']})
    # qty_sold_table = pd.DataFrame({'Value': [qty_sold], 'Label': ['Qty Sold']})
    
    # -------------------------------------------------------
    # 2. Sales by Category
    # -------------------------------------------------------
    # Use 'Sales Category' from your columns
    sales_by_category = filtered_df.groupby('Sales Category').agg({
        'Net Price': 'sum'
    }).reset_index()
    sales_by_category.columns = ['Category', 'Sales']
    
    # Replace empty category values with "Others"
    sales_by_category['Category'] = sales_by_category['Category'].fillna('Others')
    sales_by_category.loc[sales_by_category['Category'] == '', 'Category'] = 'Others'
    
    # Round sales values to 2 decimal places
    sales_by_category['Sales'] = sales_by_category['Sales'].round(2)
    
    # Calculate percentages
    total_sales = sales_by_category['Sales'].sum()
    if total_sales > 0:
        sales_by_category['Percentage'] = (sales_by_category['Sales'] / total_sales * 100).round(2).astype(float)
    else:
        sales_by_category['Percentage'] = 0
    
    # -------------------------------------------------------
    # 3. Sales by Menu Group
    # -------------------------------------------------------
    # Use 'Menu Group' from your columns
    sales_by_menu_group = filtered_df.groupby('Menu Group')['Net Price'].sum().reset_index()
    sales_by_menu_group.columns = ['Menu Group', 'Sales']
    
    # Round sales values to 2 decimal places
    sales_by_menu_group['Sales'] = sales_by_menu_group['Sales'].round(2)
    
    # -------------------------------------------------------
    # 4. Sales by Server
    # -------------------------------------------------------
    sales_by_server = filtered_df.groupby('Server')['Net Price'].sum().reset_index()
    sales_by_server.columns = ['Server', 'Sales']
    
    # Round sales values to 2 decimal places
    sales_by_server['Sales'] = sales_by_server['Sales'].round(2)
    
    # Get top 5 servers by sales
    sales_by_server = sales_by_server.sort_values(by='Sales', ascending=False).head(5)
    
    # -------------------------------------------------------
    # 5. Top Selling Items
    # -------------------------------------------------------
    # Grouping by menu item and server
    top_selling_items = filtered_df.groupby(['Menu Item', 'Server']).agg({
        'Qty': 'sum',
        'Net Price': 'sum'
    }).reset_index()
    
    # Add standard items that might not be in the filtered data
    standard_items = [
        'Grilled Chicken Breast',
        'Sophie\'s Spicy Chicken Sandwich',
        'AM Beef',
        'AM Chicken',
        'AM Guava and Cheese'
    ]
    
    standard_servers = filtered_df['Server'].unique().tolist()
    
    # Create combinations of items and servers that aren't already in the results
    additional_items = []
    for item in standard_items:
        for server in standard_servers:
            if not ((top_selling_items['Menu Item'] == item) & 
                   (top_selling_items['Server'] == server)).any():
                additional_items.append({
                    'Menu Item': item,
                    'Server': server,
                    'Qty': 0,
                    'Net Price': 0.00
                })
    
    if additional_items:
        additional_df = pd.DataFrame(additional_items)
        top_selling_items = pd.concat([top_selling_items, additional_df], ignore_index=False)
    
    top_selling_items.columns = ['Item', 'Server', 'Quantity', 'Sales']
    
    # Round sales values to 2 decimal places
    top_selling_items['Sales'] = top_selling_items['Sales'].round(2)
    
    # Sort by Sales descending and get only top 5 items
    top_selling_items = top_selling_items.sort_values('Sales', ascending=False).head(5).reset_index(drop=True)
    
    # Return all tables in a dictionary
    return {
        'net_sales': net_sales,
        'orders': unique_orders,
        'qty_sold': qty_sold,
        'sales_by_category': sales_by_category,
        'sales_by_menu_group': sales_by_menu_group,
        'sales_by_server': sales_by_server,
        'top_selling_items': top_selling_items,
        "net_sales_change": net_sales_change,
        "orders_change": orders_change,
        "qty_sold_change": qty_sold_change
    }



# def detailed_analysis_tables(df, location_filter='All', order_date_filter=None, dining_option_filter='All', menu_item_filter='All'):
#     """
#     Create dashboard tables for restaurant visualization with optional filters.
    
#     Parameters:
#     -----------
#     df : pd.DataFrame
#         The raw data containing order information
#     location_filter : str or list, optional
#         Filter by specific location(s)
#     order_date_filter : str or list, optional
#         Filter by specific order date(s)
#     dining_option_filter : str or list, optional
#         Filter by specific dining option(s)
#     menu_item_filter : str or list, optional
#         Filter by specific menu item(s)
    
#     Returns:
#     --------
#     Dict[str, pd.DataFrame or float]
#         Dictionary containing all tables and metrics needed for the dashboard
#     """
#     # Make a copy of the dataframe
#     filtered_df = df.copy()
    
#     # Apply filters
#     if location_filter != 'All':
#         if isinstance(location_filter, list):
#             filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
#         else:
#             filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    
#     if order_date_filter is not None:
#         if isinstance(order_date_filter, list):
#             filtered_df = filtered_df[filtered_df['Order Date'].isin(order_date_filter)]
#         else:
#             filtered_df = filtered_df[filtered_df['Order Date'] == order_date_filter]
        
#     if dining_option_filter != 'All':
#         if isinstance(dining_option_filter, list):
#             filtered_df = filtered_df[filtered_df['Dining Option'].isin(dining_option_filter)]
#         else:
#             filtered_df = filtered_df[filtered_df['Dining Option'] == dining_option_filter]
    
#     if menu_item_filter != 'All':
#         if isinstance(menu_item_filter, list):
#             filtered_df = filtered_df[filtered_df['Menu Item'].isin(menu_item_filter)]
#         else:
#             filtered_df = filtered_df[filtered_df['Menu Item'] == menu_item_filter]
    
#     # If the dataframe is empty after filtering, return empty tables
#     if filtered_df.empty:
#         return {
#             'sales_by_location': pd.DataFrame(columns=['Location', 'Sales']),
#             'average_price_by_item': pd.DataFrame(columns=['Menu Item', 'Price']),
#             'average_order_value': 0,
#             'average_items_per_order': 0,
#             'price_changes': pd.DataFrame(columns=['Item', 'Change', 'Direction', 'Category']),
#             'top_items': pd.DataFrame(columns=['Item', 'Price'])
#         }
    
#     # -------------------------------------------------------
#     # 1. Sales per Location
#     # -------------------------------------------------------
#     sales_by_location = filtered_df.groupby('Location')['Net Price'].sum().reset_index()
#     sales_by_location.columns = ['Location', 'Sales']
    
#     # -------------------------------------------------------
#     # 2. Average Price by Menu Item
#     # -------------------------------------------------------
#     # Calculate average price for each menu item
#     average_price_by_item = filtered_df.groupby('Menu Item')['Avg Price'].mean().reset_index()
#     average_price_by_item.columns = ['Menu Item', 'Price']
    
#     # Sort by price descending and get top items
#     average_price_by_item = average_price_by_item.sort_values('Price', ascending=False).head(5).reset_index(drop=True)
    
#     # -------------------------------------------------------
#     # 3. Average Order Value & Items per Order
#     # -------------------------------------------------------
#     # Calculate total sales per order
#     order_totals = filtered_df.groupby('Order #')['Net Price'].sum()
#     average_order_value = round(order_totals.mean(), 2)
    
#     # Calculate items per order
#     items_per_order = filtered_df.groupby('Order #')['Qty'].sum()
#     average_items_per_order = round(items_per_order.mean(), 1)
    
#     # -------------------------------------------------------
#     # 4. Price Changes (for the arrows in the dashboard)
#     # -------------------------------------------------------
#     # Calculate price changes compared to historical or baseline data
#     # This would need a time comparison - using a simple approach here
#     # This assumes df has some historical data for comparison
    
#     # Get unique items for price change calculation
#     unique_items = filtered_df['Menu Item'].unique()
    
#     # Initialize empty dataframe for price changes
#     price_changes = pd.DataFrame(columns=['Item', 'Change', 'Direction', 'Category'])
    
#     # For NET PRICE change, calculate the relative change in average net price
#     # (This is just an example calculation - adjust based on your actual requirements)
#     if 'Net Price' in filtered_df.columns:
#         current_avg_net_price = filtered_df['Net Price'].mean()
        
#         # Calculate change from previous period if you have that data
#         # For now, just use a random small value as placeholder
#         net_price_change = round(np.random.uniform(-2, 2), 2)  # Replace with actual calculation
        
#         # Determine direction
#         direction = 'up' if net_price_change > 0 else ('down' if net_price_change < 0 else 'neutral')
        
#         # Add to price changes
#         price_change_row = {
#             'Item': 'NET PRICE',
#             'Change': abs(net_price_change),
#             'Direction': direction,
#             'Category': 'PRICE'
#         }
#         price_changes = pd.concat([price_changes, pd.DataFrame([price_change_row])], ignore_index=True)
    
#     # Get a few sample menu items for price change display
#     sample_items = filtered_df.groupby('Menu Item')['Net Price'].mean().nlargest(3).index.tolist()
    
#     # Add sample menu items with price changes
#     for item in sample_items:
#         if item in filtered_df['Menu Item'].unique():
#             # Get sales category for this item
#             category = filtered_df[filtered_df['Menu Item'] == item]['Sales Category'].iloc[0] \
#                 if 'Sales Category' in filtered_df.columns else 'N/A'
            
#             # Calculate or simulate price change
#             # Replace with actual calculation if you have historical data
#             item_price_change = round(np.random.uniform(-3, 3), 2)  # Replace with actual calculation
            
#             # Determine direction
#             direction = 'up' if item_price_change > 0 else ('down' if item_price_change < 0 else 'neutral')
            
#             # Add to price changes
#             price_change_row = {
#                 'Item': item,
#                 'Change': abs(item_price_change),
#                 'Direction': direction,
#                 'Category': category
#             }
#             price_changes = pd.concat([price_changes, pd.DataFrame([price_change_row])], ignore_index=True)
    
#     # -------------------------------------------------------
#     # 5. Top Items (shown in the dashboard)
#     # -------------------------------------------------------
#     # Extract top items by sales volume or price
#     top_items = filtered_df.groupby('Menu Item')['Net Price'].sum().reset_index()
#     top_items.columns = ['Item', 'Price']
#     top_items = top_items.sort_values('Price', ascending=False).head(5).reset_index(drop=True)
    
#     # -------------------------------------------------------
#     # 6. Additional Metrics
#     # -------------------------------------------------------
#     # Calculate the key metrics shown in the dashboard
#     unique_orders = filtered_df['Order #'].nunique()
#     total_quantity = filtered_df['Qty'].sum()
    
#     # Return all tables and metrics in a dictionary
#     return {
#         'sales_by_location': sales_by_location,
#         'average_price_by_item': average_price_by_item,
#         'average_order_value': average_order_value, #value
#         'average_items_per_order': average_items_per_order,
#         'price_changes': price_changes,
#         'top_items': top_items,
#         'unique_orders': unique_orders,
#         'total_quantity': total_quantity
#     }


def detailed_analysis_tables(df, location_filter='All', dining_option_filter='All', menu_item_filter='All',category_filter='All', start_date=None, end_date=None):
    """
    Create dashboard tables for restaurant visualization with optional filters.
    
    Parameters:
    -----------
    df : pd.DataFrame
        The raw data containing order information
    location_filter : str or list, optional
        Filter by specific location(s)
    order_date_filter : str or list, optional
        Filter by specific order date(s)
    dining_option_filter : str or list, optional
        Filter by specific dining option(s)
    menu_item_filter : str or list, optional
        Filter by specific menu item(s)
    
    Returns:
    --------
    Dict[str, pd.DataFrame or float]
        Dictionary containing all tables and metrics needed for the dashboard
    """
    # Make a copy of the dataframe
    filtered_df = df.copy()
    
    # Apply filters
    if location_filter != 'All':
        if isinstance(location_filter, list):
            filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    
    # if order_date_filter is not None:
    #     if isinstance(order_date_filter, list):
    #         filtered_df = filtered_df[filtered_df['Order Date'].isin(order_date_filter)]
    #     else:
    #         filtered_df = filtered_df[filtered_df['Order Date'] == order_date_filter]
    
    # Apply date range filter - convert string dates to datetime.date objects
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
        
    # Add category filter
    if category_filter != 'All':
        if isinstance(category_filter, list):
            filtered_df = filtered_df[filtered_df['Category'].isin(category_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Category'] == category_filter]
        
    if dining_option_filter != 'All':
        if isinstance(dining_option_filter, list):
            filtered_df = filtered_df[filtered_df['Dining Option'].isin(dining_option_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Dining Option'] == dining_option_filter]
    
    if menu_item_filter != 'All':
        if isinstance(menu_item_filter, list):
            filtered_df = filtered_df[filtered_df['Menu Item'].isin(menu_item_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Menu Item'] == menu_item_filter]
    
        change_filtered_df = df.copy()
    
    
        
    # Calculate the number of days in the original range
    days_diff = (end_date - start_date).days

    # Set change period dates
    change_end_date = start_date  # Change end date becomes the original start date
    change_start_date = start_date - timedelta(days=days_diff + 1)  # Go back by the range duration

    # Apply date range filter for change period
    if change_start_date is not None:
        change_filtered_df = change_filtered_df[change_filtered_df['Date'] >= change_start_date]

    if change_end_date is not None:
        change_filtered_df = change_filtered_df[change_filtered_df['Date'] <= change_end_date]

    
        # Apply date range filter - convert string dates to datetime.date objects
    if change_start_date is not None:
        if isinstance(change_start_date, str):
            change_start_date = datetime.strptime(change_start_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] >= change_start_date]
    
    if change_end_date is not None:
        if isinstance(change_end_date, str):
            change_end_date = datetime.strptime(change_end_date, '%Y-%m-%d').date()
        filtered_df = filtered_df[filtered_df['Date'] <= change_end_date]
    
    # If the dataframe is empty after filtering, return empty tables
    if filtered_df.empty:
        return {
            'sales_by_location': pd.DataFrame(columns=['Location', 'Sales']),
            'average_price_by_item': pd.DataFrame(columns=['Menu Item', 'Price']),
            'average_order_value': 0,
            'average_items_per_order': 0,
            "unique_orders": 0,
            'total_quantity': 0,
            'price_changes': pd.DataFrame(columns=['Item', 'Change', 'Direction', 'Category']),
            'top_items': pd.DataFrame(columns=['Item', 'Price']),
            "average_order_value_change": 0,
            "average_items_per_order_change": 0,
            "unique_orders_change": 0,
            "total_quantity_change": 0,
            
        }
    
    # -------------------------------------------------------
    # 1. Sales per Location
    # -------------------------------------------------------
    sales_by_location = filtered_df.groupby('Location')['Net Price'].sum().reset_index()
    sales_by_location.columns = ['Location', 'Sales']
    
    # -------------------------------------------------------
    # 2. Average Price by Menu Item
    # -------------------------------------------------------
    # Calculate average price for each menu item
    average_price_by_item = filtered_df.groupby('Menu Item')['Avg Price'].mean().reset_index()
    average_price_by_item.columns = ['Menu Item', 'Price']
    
    # Sort by price descending and get top items
    average_price_by_item = average_price_by_item.sort_values('Price', ascending=False).head(5).reset_index(drop=True)
    
    # -------------------------------------------------------
    # 3. Average Order Value & Items per Order
    # -------------------------------------------------------
    # Calculate total sales per order
    order_totals = filtered_df.groupby('Order #')['Net Price'].sum()
    average_order_value = round(order_totals.mean(), 2)
    average_order_value_change = round(change_filtered_df.groupby('Order #')['Net Price'].sum().mean(), 2) - average_order_value / average_order_value if average_order_value != 0 else 0
    
    # Calculate items per order
    items_per_order = filtered_df.groupby('Order #')['Qty'].sum()
    average_items_per_order = round(items_per_order.mean(), 1)
    average_items_per_order_change = round(change_filtered_df.groupby('Order #')['Qty'].sum().mean(), 1) - average_items_per_order / average_items_per_order if average_items_per_order != 0 else 0
    
    
    # -------------------------------------------------------
    # 4. Price Changes (for the arrows in the dashboard)
    # -------------------------------------------------------
    # Calculate price changes compared to historical or baseline data
    # This would need a time comparison - using a simple approach here
    # This assumes df has some historical data for comparison
    
    # Get unique items for price change calculation
    unique_items = filtered_df['Menu Item'].unique()
    
    # Initialize empty dataframe for price changes
    price_changes = pd.DataFrame(columns=['Item', 'Change', 'Direction', 'Category'])
    
    # For NET PRICE change, calculate the relative change in average net price
    # (This is just an example calculation - adjust based on your actual requirements)
    if 'Net Price' in filtered_df.columns:
        current_avg_net_price = filtered_df['Net Price'].mean()
        
        # Calculate change from previous period if you have that data
        # For now, just use a random small value as placeholder
        net_price_change = round(np.random.uniform(-2, 2), 2)  # Replace with actual calculation
        
        # Determine direction
        direction = 'up' if net_price_change > 0 else ('down' if net_price_change < 0 else 'neutral')
        
        # Add to price changes
        price_change_row = {
            'Item': 'NET PRICE',
            'Change': abs(net_price_change),
            'Direction': direction,
            'Category': 'PRICE'
        }
        price_changes = pd.concat([price_changes, pd.DataFrame([price_change_row])], ignore_index=True)
    
    # Get a few sample menu items for price change display
    sample_items = filtered_df.groupby('Menu Item')['Net Price'].mean().nlargest(3).index.tolist()
    
    # Add sample menu items with price changes
    for item in sample_items:
        if item in filtered_df['Menu Item'].unique():
            # Get sales category for this item
            category = filtered_df[filtered_df['Menu Item'] == item]['Sales Category'].iloc[0] \
                if 'Sales Category' in filtered_df.columns else 'N/A'
            
            # Calculate or simulate price change
            # Replace with actual calculation if you have historical data
            item_price_change = round(np.random.uniform(-3, 3), 2)  # Replace with actual calculation
            
            # Determine direction
            direction = 'up' if item_price_change > 0 else ('down' if item_price_change < 0 else 'neutral')
            
            # Add to price changes
            price_change_row = {
                'Item': item,
                'Change': abs(item_price_change),
                'Direction': direction,
                'Category': category
            }
            price_changes = pd.concat([price_changes, pd.DataFrame([price_change_row])], ignore_index=True)
    
    # -------------------------------------------------------
    # 5. Top Items (shown in the dashboard)
    # -------------------------------------------------------
    # Extract top items by sales volume or price
    top_items = filtered_df.groupby('Menu Item')['Net Price'].sum().reset_index()
    top_items.columns = ['Item', 'Price']
    top_items = top_items.sort_values('Price', ascending=False).head(5).reset_index(drop=True)
    
    # -------------------------------------------------------
    # 6. Additional Metrics
    # -------------------------------------------------------
    # Calculate the key metrics shown in the dashboard
    unique_orders = filtered_df['Order #'].nunique()
    total_quantity = filtered_df['Qty'].sum()
    unique_orders_change = round(change_filtered_df['Order #'].nunique(), 2) - unique_orders / unique_orders if unique_orders != 0 else 0
    total_quantity_change = round(change_filtered_df['Qty'].sum(), 2) - total_quantity / total_quantity if total_quantity != 0 else 0
    
    # Return all tables and metrics in a dictionary
    return {
        'sales_by_location': sales_by_location,
        'average_price_by_item': average_price_by_item,
        'average_order_value': average_order_value,
        'average_items_per_order': average_items_per_order,
        'price_changes': price_changes,
        'top_items': top_items,
        'unique_orders': unique_orders,
        'total_quantity': total_quantity,
        "average_order_value_change": average_order_value_change,
        "average_items_per_order_change": average_items_per_order_change,
        "unique_orders_change": unique_orders_change,
        "total_quantity_change": total_quantity_change
    }


# # Example usage (commented out since actual dataframe is not provided):
# result = detailed_analysis_tables(df, location_filter='Lenox Hill')
# result = overview_tables(df, location_filter='Lenox Hill', order_date_filter='04-21-2025')