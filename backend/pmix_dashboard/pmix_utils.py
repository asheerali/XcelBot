import pandas as pd
import numpy as np
from datetime import datetime, timedelta


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
        
    # Create comparison period only if both start_date and end_date are provided
    if start_date is not None and end_date is not None:
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
    else:
        # If no date range is specified, use the entire dataset for comparison
        change_start_date = None
        change_end_date = None
    
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
    
    
        # Create comparison period only if both start_date and end_date are provided
    if start_date is not None and end_date is not None:
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
    else:
        # If no date range is specified, use the entire dataset for comparison
        change_start_date = None
        change_end_date = None
        
        
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




def create_sales_by_category_tables(df, location_filter='All', start_date=None, end_date=None):
    
    
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

            'sales_by_category_table': pd.DataFrame(),
            'category_comparison_table': pd.DataFrame(),
        }
    
    # Ensure Date column is datetime
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])
    
    
    # Create day of week and week number columns
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
        index='Sales Category',
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
        current_sales = filtered_df.groupby('Sales Category')['Net Price'].sum().reset_index()
        current_sales.columns = ['Sales Category', 'Current_4_Weeks_Sales']
        
        # Calculate sales for previous period by category
        if not previous_df.empty:
            previous_sales = previous_df.groupby('Sales Category')['Net Price'].sum().reset_index()
            previous_sales.columns = ['Sales Category', 'Previous_4_Weeks_Sales']
        else:
            # Create empty previous sales with same categories as current
            previous_sales = pd.DataFrame({
                'Sales Category': current_sales['Sales Category'],
                'Previous_4_Weeks_Sales': 0
            })
        
        # Merge current and previous sales (outer join to include all categories)
        category_comparison_table = pd.merge(current_sales, previous_sales, on='Sales Category', how='outer').fillna(0)
        
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
        category_comparison_table.columns = ['Sales Category', 'This_4_Weeks_Sales', 'Last_4_Weeks_Sales', 'Percent_Change']
        
        # Sort by current sales descending
        category_comparison_table = category_comparison_table.sort_values('This_4_Weeks_Sales', ascending=False).reset_index(drop=True)

    return {
        'sales_by_category_table': sales_by_category_table,
        'category_comparison_table': category_comparison_table,
    }
    

  
from datetime import datetime, timedelta
import pandas as pd

# def create_top_vs_bottom_comparison(df, location_filter='All', start_date=None, end_date=None):
#     """
#     Create a comparison table of top 10 vs bottom 10 items by sales.
    
#     Parameters:
#     df: DataFrame with sales data
#     location_filter: 'All' or specific location(s)
#     start_date: Start date as string 'YYYY-MM-DD'
#     end_date: End date as string 'YYYY-MM-DD'
    
#     Returns:
#     DataFrame with side-by-side comparison
#     """
    
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
    
#     # Filter current period data
#     filtered_df = df_copy.copy()
#     if start_date is not None:
#         filtered_df = filtered_df[filtered_df['Date'] >= start_date]
#     if end_date is not None:
#         filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
#     # If the dataframe is empty after filtering, return empty table
#     if filtered_df.empty:
#         return pd.DataFrame(columns=['Rank', 'Top_10_Items', 'T_Sales', 'T_Quantity', 
#                                    'Bottom_10_Items', 'B_Sales', 'B_Quantity', 'Difference_Sales'])
    
#     # Your actual column names:
#     item_column = 'Menu Item'
#     quantity_column = 'Qty'
#     sales_column = 'Net Price'
    
#     # Group by item and sum quantity and sales
#     all_items = filtered_df.groupby(item_column).agg({
#         quantity_column: 'sum',
#         sales_column: 'sum'
#     }).reset_index()
    
#     # Rename columns
#     all_items.columns = ['Item', 'Quantity', 'Sales']
    
#     # Round values
#     all_items['Sales'] = all_items['Sales'].round(2)
#     all_items['Quantity'] = all_items['Quantity'].round(0).astype(int)
    
#     # Get top 10 items (highest sales)
#     top_items = all_items.sort_values('Sales', ascending=False).head(10).reset_index(drop=True)
    
#     # Get bottom 10 items (lowest sales)
#     bottom_items = all_items.sort_values('Sales', ascending=True).head(10).reset_index(drop=True)
    
#     # Create comparison table
#     comparison_table = pd.DataFrame()
#     comparison_table['Rank'] = range(1, 11)
#     comparison_table['Top_10_Items'] = top_items['Item'].values
#     comparison_table['T_Sales'] = top_items['Sales'].values
#     comparison_table['T_Quantity'] = top_items['Quantity'].values
#     comparison_table['Bottom_10_Items'] = bottom_items['Item'].values
#     comparison_table['B_Sales'] = bottom_items['Sales'].values
#     comparison_table['B_Quantity'] = bottom_items['Quantity'].values
    
#     # Calculate difference in sales (Top - Bottom)
#     comparison_table['Difference_Sales'] = ((comparison_table['T_Sales'] - comparison_table['B_Sales']) / 100).round(2)
    
#     return comparison_table



def create_top_vs_bottom_comparison(df, location_filter='All', start_date=None, end_date=None):
    """
    Create a comparison table of top 10 vs bottom 10 items by sales.
    
    Parameters:
    df: DataFrame with sales data
    location_filter: 'All' or specific location(s)
    start_date: Start date as string 'YYYY-MM-DD'
    end_date: End date as string 'YYYY-MM-DD'
    
    Returns:
    DataFrame with side-by-side comparison
    """
    
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
    
    # Filter current period data
    filtered_df = df_copy.copy()
    if start_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    if end_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
    # If the dataframe is empty after filtering, return empty table
    if filtered_df.empty:
        return pd.DataFrame(columns=['Rank', 'Top_10_Items', 'T_Sales', 'T_Quantity', 
                                   'Bottom_10_Items', 'B_Sales', 'B_Quantity', 'Difference_Sales'])
    
    # Your actual column names:
    item_column = 'Menu Item'
    quantity_column = 'Qty'
    sales_column = 'Net Price'
    
    # Group by item and sum quantity and sales
    all_items = filtered_df.groupby(item_column).agg({
        quantity_column: 'sum',
        sales_column: 'sum'
    }).reset_index()
    
    # Rename columns
    all_items.columns = ['Item', 'Quantity', 'Sales']
    
    # Round values
    all_items['Sales'] = all_items['Sales'].round(2)
    all_items['Quantity'] = all_items['Quantity'].round(0).astype(int)
    
    # Filter out items with zero sales
    all_items = all_items[all_items['Sales'] > 0]
    
    # Check if we have enough items after filtering
    if all_items.empty:
        return pd.DataFrame(columns=['Rank', 'Top_10_Items', 'T_Sales', 'T_Quantity', 
                                   'Bottom_10_Items', 'B_Sales', 'B_Quantity', 'Difference_Sales'])
    
    # Get top 10 items (highest sales)
    top_items = all_items.sort_values('Sales', ascending=False).head(10).reset_index(drop=True)
    
    # Get bottom 10 items (lowest sales)
    bottom_items = all_items.sort_values('Sales', ascending=True).head(10).reset_index(drop=True)
    
    # Create comparison table
    max_rows = max(len(top_items), len(bottom_items))
    comparison_table = pd.DataFrame()
    comparison_table['Rank'] = range(1, max_rows + 1)
    
    # Pad shorter lists with empty values
    top_items_padded = list(top_items['Item'].values) + [''] * (max_rows - len(top_items))
    top_sales_padded = list(top_items['Sales'].values) + [0] * (max_rows - len(top_items))
    top_qty_padded = list(top_items['Quantity'].values) + [0] * (max_rows - len(top_items))
    
    bottom_items_padded = list(bottom_items['Item'].values) + [''] * (max_rows - len(bottom_items))
    bottom_sales_padded = list(bottom_items['Sales'].values) + [0] * (max_rows - len(bottom_items))
    bottom_qty_padded = list(bottom_items['Quantity'].values) + [0] * (max_rows - len(bottom_items))
    
    comparison_table['Top_10_Items'] = top_items_padded
    comparison_table['T_Sales'] = top_sales_padded
    comparison_table['T_Quantity'] = top_qty_padded
    comparison_table['Bottom_10_Items'] = bottom_items_padded
    comparison_table['B_Sales'] = bottom_sales_padded
    comparison_table['B_Quantity'] = bottom_qty_padded
    
    # Calculate difference in sales (Top - Bottom)
    comparison_table['Difference_Sales'] = ((comparison_table['T_Sales'] - comparison_table['B_Sales']) / 100).round(2)
    
    return comparison_table
# Usage:
# result = create_top_vs_bottom_comparison(df, location_filter='All', start_date='2025-04-21', end_date='2025-04-21')
# print(result)