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
    
    # print("----------------------------------------------------")
    # print("----------------------------------------------------")
    # print( "i am her in the pmix_utils.py printing the filtered_df columns ", filtered_df.columns, 
    #        "and the filtered_df shape is ", filtered_df.shape, "filtered df order_Id ", filtered_df['Order_Id'])
    
    
    # print("----------------------------------------------------")
    # print("----------------------------------------------------")
    
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])

    # Apply filters
    if location_filter != 'All':
        if isinstance(location_filter, list):
            filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    
    # if order_date_filter is not None:
    #     if isinstance(order_date_filter, list):
    #         filtered_df = filtered_df[filtered_df['Order_Date'].isin(order_date_filter)]  # Updated column name
    #     else:
    #         filtered_df = filtered_df[filtered_df['Order_Date'] == order_date_filter]  # Updated column name
        
    if server_filter != 'All':
        if isinstance(server_filter, list):
            filtered_df = filtered_df[filtered_df['Server'].isin(server_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Server'] == server_filter]
        
    if dining_option_filter != 'All':
        if isinstance(dining_option_filter, list):
            filtered_df = filtered_df[filtered_df['Dining_Option'].isin(dining_option_filter)]  # Updated column name
        else:
            filtered_df = filtered_df[filtered_df['Dining_Option'] == dining_option_filter]  # Updated column name
    
    # Add category filter
    if category_filter != 'All':
        if isinstance(category_filter, list):
            filtered_df = filtered_df[filtered_df['Category'].isin(category_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Category'] == category_filter]

    # Apply date range filter - convert string dates to pandas Timestamps
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)  # No format needed, no .date()
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]

    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)  # No format needed, no .date()
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
        
    
    # Create a change dataframe for comparison (e.g., previous day or week)
        
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
        
    # Ensure Date column is datetime type for change_filtered_df too
    if not pd.api.types.is_datetime64_any_dtype(change_filtered_df['Date']):
        change_filtered_df['Date'] = pd.to_datetime(change_filtered_df['Date'])
        
        
    # Create comparison period only if both start_date and end_date are provided
    if start_date is not None and end_date is not None:
        # Calculate the number of days in the original range
        days_diff = (end_date - start_date).days

        # # Set change period dates
        # change_end_date = start_date  # Change end date becomes the original start date
        # change_start_date = start_date - timedelta(days=days_diff + 1)  # Go back by the range duration

        # NEW CODE:
        if start_date is not None and end_date is not None:
            # Calculate the number of days in the original range
            days_diff = (end_date - start_date).days

            # Set change period dates
            change_end_date = start_date  # Change end date becomes the original start date
            change_start_date = start_date - pd.Timedelta(days=days_diff + 1)  # Use pd.Timedelta instead
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
    net_sales = round(filtered_df['Net_Price'].sum(), 2)  # Updated column name
    net_sales_change =  (round(change_filtered_df['Net_Price'].sum(), 2) - net_sales)/  net_sales  if net_sales != 0 else 0  # Updated column name
    # unique_orders = filtered_df['Order_number'].nunique()  # Updated column name
    # orders_change = round(change_filtered_df['Order_number'].nunique(), 2) - unique_orders / unique_orders  if unique_orders != 0 else 0  # Updated column name
   
    unique_orders = filtered_df['Order_Id'].nunique()  # Updated column name
    orders_change = round(change_filtered_df['Order_Id'].nunique(), 2) - unique_orders / unique_orders  if unique_orders != 0 else 0  # Updated column name
    
    print("----------------------------------------------------")
    print("----------------------------------------------------")
    print("\n", "i am here in the pmix utils printing the unique orders", unique_orders,"filtered_df['Order_Id'].nunique()", filtered_df['Order_Id'].nunique())
    print("----------------------------------------------------")
    print("----------------------------------------------------")
    
    qty_sold = filtered_df['Qty'].sum() 
    qty_sold_change = round(change_filtered_df['Qty'].sum(), 2) - qty_sold / qty_sold  if qty_sold != 0 else 0
    
    # net_sales_table = pd.DataFrame({'Value': [net_sales], 'Label': ['Net Sales']})
    # orders_table = pd.DataFrame({'Value': [unique_orders], 'Label': ['Orders']})
    # qty_sold_table = pd.DataFrame({'Value': [qty_sold], 'Label': ['Qty Sold']})
    
    # -------------------------------------------------------
    # 2. Sales by Category
    # -------------------------------------------------------
    # Use 'Sales_Category' from your columns
    sales_by_category = filtered_df.groupby('Sales_Category').agg({  # Updated column name
        'Net_Price': 'sum'  # Updated column name
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
    # Use 'Menu_Group' from your columns
    sales_by_menu_group = filtered_df.groupby('Menu_Group')['Net_Price'].sum().reset_index()  # Updated column names
    sales_by_menu_group.columns = ['Menu Group', 'Sales']
    
    # Round sales values to 2 decimal places
    sales_by_menu_group['Sales'] = sales_by_menu_group['Sales'].round(2)
    
    # -------------------------------------------------------
    # 4. Sales by Server
    # -------------------------------------------------------
    sales_by_server = filtered_df.groupby('Server')['Net_Price'].sum().reset_index()  # Updated column name
    sales_by_server.columns = ['Server', 'Sales']
    
    # Round sales values to 2 decimal places
    sales_by_server['Sales'] = sales_by_server['Sales'].round(2)
    
    # Get top 5 servers by sales
    sales_by_server = sales_by_server.sort_values(by='Sales', ascending=False).head(5)
    
    # -------------------------------------------------------
    # 5. Top Selling Items
    # -------------------------------------------------------
    # Grouping by menu item and server
    top_selling_items = filtered_df.groupby(['Menu_Item', 'Server']).agg({  # Updated column name
        'Qty': 'sum',
        'Net_Price': 'sum'  # Updated column name
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
            if not ((top_selling_items['Menu_Item'] == item) &   # Updated column name
                   (top_selling_items['Server'] == server)).any():
                additional_items.append({
                    'Menu_Item': item,  # Updated column name
                    'Server': server,
                    'Qty': 0,
                    'Net_Price': 0.00  # Updated column name
                })
    
    if additional_items:
        additional_df = pd.DataFrame(additional_items)
        top_selling_items = pd.concat([top_selling_items, additional_df], ignore_index=False)
    
    top_selling_items.columns = ['Item', 'Server', 'Quantity', 'Sales']
    
    # Round sales values to 2 decimal places
    top_selling_items['Sales'] = top_selling_items['Sales'].round(2)
    
    # Sort by Sales descending and get only top 5 items
    top_selling_items = top_selling_items.sort_values('Sales', ascending=False).head(5).reset_index(drop=True)
    
    net_sales_round =  round(net_sales, 2)
    # Return all tables in a dictionary
    return {
        # 'net_sales': net_sales,
        'net_sales': net_sales_round,
        'orders': unique_orders,
        'qty_sold': qty_sold,
        'sales_by_category': sales_by_category,
        'sales_by_menu_group': sales_by_menu_group,
        'sales_by_server': sales_by_server,
        'top_selling_items': top_selling_items,
        # "net_sales_change": net_sales_change,
        'net_sales_change': round(net_sales_change, 2),
        "orders_change": orders_change,
        'orders_change': round(orders_change, 2),
        # "qty_sold_change": qty_sold_change
        'qty_sold_change': round(qty_sold_change, 2),
        "avg_orders_value_correct": net_sales_round / unique_orders,
        "avg_orders_value_change_correct" : (
    0 if pd.isna(net_sales_change) or pd.isna(orders_change) or orders_change == 0
    else net_sales_change / orders_change
)
    }




def detailed_analysis_tables(df, location_filter='All', dining_option_filter='All', menu_item_filter='All', category_filter='All', start_date=None, end_date=None):
    """
    Create dashboard tables for restaurant visualization with optional filters.
    
    Parameters:
    -----------
    df : pd.DataFrame
        The raw data containing order information
    location_filter : str or list, optional
        Filter by specific location(s)
    dining_option_filter : str or list, optional
        Filter by specific dining option(s)
    menu_item_filter : str or list, optional
        Filter by specific menu item(s)
    category_filter : str or list, optional
        Filter by specific category(s)
    start_date : str or datetime, optional
        Start date for filtering
    end_date : str or datetime, optional
        End date for filtering
    
    Returns:
    --------
    Dict[str, pd.DataFrame or float]
        Dictionary containing all tables and metrics needed for the dashboard
    """
    # Make a copy of the dataframe
    filtered_df = df.copy()
    
    # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])

    # Apply filters
    if location_filter != 'All':
        if isinstance(location_filter, list):
            filtered_df = filtered_df[filtered_df['Location'].isin(location_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Location'] == location_filter]
    
    # Apply date range filter - convert string dates to pandas Timestamps
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
        
    # Add category filter
    if category_filter != 'All':
        if isinstance(category_filter, list):
            filtered_df = filtered_df[filtered_df['Category'].isin(category_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Category'] == category_filter]
        
    if dining_option_filter != 'All':
        if isinstance(dining_option_filter, list):
            filtered_df = filtered_df[filtered_df['Dining_Option'].isin(dining_option_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Dining_Option'] == dining_option_filter]
    
    if menu_item_filter != 'All':
        if isinstance(menu_item_filter, list):
            filtered_df = filtered_df[filtered_df['Menu_Item'].isin(menu_item_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Menu_Item'] == menu_item_filter]
    
    # If the dataframe is empty after filtering, return empty tables
    if filtered_df.empty:
        return {
            'sales_by_location': pd.DataFrame(columns=['Location', 'Sales']),
            'average_price_by_item': pd.DataFrame(columns=['Menu Item', 'Price']),
            'average_order_value': 0,
            'average_items_per_order': 0,
            'unique_orders': 0,
            'total_quantity': 0,
            'price_changes': pd.DataFrame(columns=['Item', 'Change', 'Direction', 'Category']),
            'top_items': pd.DataFrame(columns=['Item', 'Price']),
            'average_order_value_change': 0,
            'average_items_per_order_change': 0,
            'unique_orders_change': 0,
            'total_quantity_change': 0,
        }
    
    # Create a change dataframe for comparison (previous period)
    change_filtered_df = df.copy()
    
    # Ensure Date column is datetime type for change_filtered_df too
    if not pd.api.types.is_datetime64_any_dtype(change_filtered_df['Date']):
        change_filtered_df['Date'] = pd.to_datetime(change_filtered_df['Date'])
    
    # Create comparison period only if both start_date and end_date are provided
    if start_date is not None and end_date is not None:
        # Calculate the number of days in the original range
        days_diff = (end_date - start_date).days

        # Set change period dates (both as pandas Timestamps)
        change_end_date = start_date
        change_start_date = start_date - pd.Timedelta(days=days_diff + 1)

        # Apply date range filter for change period
        change_filtered_df = change_filtered_df[
            (change_filtered_df['Date'] >= change_start_date) &
            (change_filtered_df['Date'] <= change_end_date)
        ]
    # If no date range is specified, change_filtered_df remains as the full dataset
        
    # -------------------------------------------------------
    # 1. Sales per Location
    # -------------------------------------------------------
    sales_by_location = filtered_df.groupby('Location')['Net_Price'].sum().reset_index()
    sales_by_location.columns = ['Location', 'Sales']
    sales_by_location['Sales'] = sales_by_location['Sales'].round(2)
    
    # -------------------------------------------------------
    # 2. Average Price by Menu Item
    # -------------------------------------------------------
    # Calculate average price for each menu item
    if 'Avg_Price' not in filtered_df.columns:
        filtered_df['Avg_Price'] = filtered_df['Net_Price'] / filtered_df['Qty']

    average_price_by_item = filtered_df.groupby('Menu_Item')['Avg_Price'].mean().reset_index()
    average_price_by_item.columns = ['Menu Item', 'Price']
    average_price_by_item['Price'] = average_price_by_item['Price'].round(2)
    
    # Sort by price descending and get top items
    average_price_by_item = average_price_by_item.sort_values('Price', ascending=False).head(5).reset_index(drop=True)
    
    # -------------------------------------------------------
    # 3. Average Order Value & Items per Order
    # -------------------------------------------------------
    # Calculate total sales per order
    order_totals = filtered_df.groupby('Order_number')['Net_Price'].sum()
    average_order_value = order_totals.mean()
    
    # Calculate items per order
    items_per_order = filtered_df.groupby('Order_number')['Qty'].sum()
    average_items_per_order = items_per_order.mean()
    
    # Calculate change metrics for comparison period
    if not change_filtered_df.empty:
        change_order_totals = change_filtered_df.groupby('Order_number')['Net_Price'].sum()
        change_average_order_value = change_order_totals.mean()
        
        change_items_per_order = change_filtered_df.groupby('Order_number')['Qty'].sum()
        change_average_items_per_order = change_items_per_order.mean()
        
        # Calculate percentage changes with proper math
        average_order_value_change = (change_average_order_value - average_order_value) / average_order_value if average_order_value != 0 else 0
        average_items_per_order_change = (change_average_items_per_order - average_items_per_order) / average_items_per_order if average_items_per_order != 0 else 0
    else:
        average_order_value_change = 0
        average_items_per_order_change = 0
    
    # -------------------------------------------------------
    # 4. Price Changes (for the arrows in the dashboard)
    # -------------------------------------------------------
    # Initialize empty dataframe for price changes
    price_changes = pd.DataFrame(columns=['Item', 'Change', 'Direction', 'Category'])
    
    # Calculate NET PRICE change compared to previous period
    if not change_filtered_df.empty and 'Net_Price' in filtered_df.columns:
        current_avg_net_price = filtered_df['Net_Price'].mean()
        previous_avg_net_price = change_filtered_df['Net_Price'].mean()
        
        if previous_avg_net_price != 0:
            net_price_change = (current_avg_net_price - previous_avg_net_price) / previous_avg_net_price * 100
        else:
            net_price_change = 0
        
        # Determine direction
        direction = 'up' if net_price_change > 0 else ('down' if net_price_change < 0 else 'neutral')
        
        # Add to price changes
        price_change_row = {
            'Item': 'NET PRICE',
            'Change': abs(round(net_price_change, 2)),
            'Direction': direction,
            'Category': 'PRICE'
        }
        # price_changes = pd.concat([price_changes, pd.DataFrame([price_change_row])], ignore_index=True)
    
        price_changes = pd.DataFrame({
            'Item': pd.Series(dtype='str'),
            'Change': pd.Series(dtype='float'),
            'Direction': pd.Series(dtype='str'),
            'Category': pd.Series(dtype='str')
        })

    # Get top menu items for price change display
    if not filtered_df.empty:
        top_items_by_sales = filtered_df.groupby('Menu_Item')['Net_Price'].sum().nlargest(3).index.tolist()
        
        # Add sample menu items with price changes
        for item in top_items_by_sales:
            # Get sales category for this item
            category = 'N/A'
            if 'Sales_Category' in filtered_df.columns:
                item_data = filtered_df[filtered_df['Menu_Item'] == item]['Sales_Category']
                if not item_data.empty:
                    category = item_data.iloc[0]
            
            # Calculate actual price change if we have comparison data
            if not change_filtered_df.empty:
                current_item_price = filtered_df[filtered_df['Menu_Item'] == item]['Net_Price'].mean()
                previous_item_price = change_filtered_df[change_filtered_df['Menu_Item'] == item]['Net_Price'].mean()
                
                if previous_item_price > 0 and not pd.isna(previous_item_price):
                    item_price_change = (current_item_price - previous_item_price) / previous_item_price * 100
                else:
                    item_price_change = 0
            else:
                item_price_change = 0
            
            # Determine direction
            direction = 'up' if item_price_change > 0 else ('down' if item_price_change < 0 else 'neutral')
            
            # Add to price changes
            price_change_row = {
                'Item': item,
                'Change': abs(round(item_price_change, 2)),
                'Direction': direction,
                'Category': category
            }
            price_changes = pd.concat([price_changes, pd.DataFrame([price_change_row])], ignore_index=True)
    
    # -------------------------------------------------------
    # 5. Top Items (shown in the dashboard)
    # -------------------------------------------------------
    top_items = filtered_df.groupby('Menu_Item')['Net_Price'].sum().reset_index()
    top_items.columns = ['Item', 'Price']
    top_items['Price'] = top_items['Price'].round(2)
    top_items = top_items.sort_values('Price', ascending=False).head(5).reset_index(drop=True)
    
    # -------------------------------------------------------
    # 6. Additional Metrics
    # -------------------------------------------------------
    unique_orders = filtered_df['Order_number'].nunique()
    total_quantity = filtered_df['Qty'].sum()
    
    # Calculate change metrics with correct math
    if not change_filtered_df.empty:
        change_unique_orders = change_filtered_df['Order_number'].nunique()
        change_total_quantity = change_filtered_df['Qty'].sum()
        
        unique_orders_change = (change_unique_orders - unique_orders) / unique_orders if unique_orders != 0 else 0
        total_quantity_change = (change_total_quantity - total_quantity) / total_quantity if total_quantity != 0 else 0
    else:
        unique_orders_change = 0
        total_quantity_change = 0
    
    # Return all tables and metrics in a dictionary
    return {
        'sales_by_location': sales_by_location,
        'average_price_by_item': average_price_by_item,
        'average_order_value': round(average_order_value, 2),
        'average_items_per_order': round(average_items_per_order, 2),
        'price_changes': price_changes,
        'top_items': top_items,
        'unique_orders': unique_orders,
        'total_quantity': total_quantity,
        'average_order_value_change': round(average_order_value_change, 2),
        'average_items_per_order_change': round(average_items_per_order_change, 2),
        'unique_orders_change': round(unique_orders_change, 2),
        'total_quantity_change': round(total_quantity_change, 2)
    }

    


# def create_sales_by_category_tables(df, location_filter='All', start_date=None, end_date=None, category_filter='All', server_filter='All'):
#     """
#     Create sales by category tables with optional filters.
    
#     Parameters:
#     -----------
#     df : pd.DataFrame
#         The raw data containing order information
#     location_filter : str or list, optional
#         Filter by specific location(s)
#     start_date : str or datetime, optional
#         Start date for filtering
#     end_date : str or datetime, optional
#         End date for filtering
#     category_filter : str or list, optional
#         Filter by specific category(s)
#     server_filter : str or list, optional
#         Filter by specific server(s)
    
#     Returns:
#     --------
#     Dict[str, pd.DataFrame]
#         Dictionary containing sales by category tables
#     """
#     # Make a copy of the dataframe
#     df_copy = df.copy()
    
#     # Ensure Date column is datetime type
#     if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
#         df_copy['Date'] = pd.to_datetime(df_copy['Date'])

#     # Convert date strings to pandas datetime objects (not .date() objects)
#     if start_date is not None:
#         if isinstance(start_date, str):
#             start_date = pd.to_datetime(start_date)
    
#     if end_date is not None:
#         if isinstance(end_date, str):
#             end_date = pd.to_datetime(end_date)
#     else:
#         # If no end_date provided, use the latest date in the dataset
#         end_date = df_copy['Date'].max()
    
#     # Apply location filter to the entire dataset first
#     if location_filter != 'All':
#         if isinstance(location_filter, list):
#             df_copy = df_copy[df_copy['Location'].isin(location_filter)]
#         else:
#             df_copy = df_copy[df_copy['Location'] == location_filter]
    
#     # Apply server filter
#     if server_filter != 'All':
#         if isinstance(server_filter, list):
#             df_copy = df_copy[df_copy['Server'].isin(server_filter)]
#         else:
#             df_copy = df_copy[df_copy['Server'] == server_filter]
            
#     # Apply category filter
#     if category_filter != 'All':
#         if isinstance(category_filter, list):
#             df_copy = df_copy[df_copy['Category'].isin(category_filter)]
#         else:
#             df_copy = df_copy[df_copy['Category'] == category_filter]
    
#     # Calculate previous period dates (4 weeks before start_date)
#     if start_date is not None:
#         # Calculate 4 weeks (28 days) before start date
#         previous_end_date = start_date - pd.Timedelta(days=1)  # Day before start_date
#         previous_start_date = start_date - pd.Timedelta(days=28)  # 4 weeks before
#     else:
#         previous_start_date = None
#         previous_end_date = None
    
#     # Calculate 13-week period dates
#     if end_date is not None:
#         # Calculate 13 weeks (91 days) before end_date
#         thirteen_week_start_date = end_date - pd.Timedelta(days=90)  # 13 weeks = 91 days
#     else:
#         thirteen_week_start_date = None
    
#     # Filter current period data
#     filtered_df = df_copy.copy()
#     if start_date is not None:
#         filtered_df = filtered_df[filtered_df['Date'] >= start_date]
#     if end_date is not None:
#         filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    
#     # Filter previous period data for comparison
#     previous_df = df_copy.copy()
#     if previous_start_date is not None and previous_end_date is not None:
#         previous_df = previous_df[
#             (previous_df['Date'] >= previous_start_date) & 
#             (previous_df['Date'] <= previous_end_date)
#         ]
#     else:
#         previous_df = pd.DataFrame()  # Empty if no start date provided
    
#     # Filter 13-week period data
#     thirteen_week_df = df_copy.copy()
#     if thirteen_week_start_date is not None and end_date is not None:
#         thirteen_week_df = thirteen_week_df[
#             (thirteen_week_df['Date'] >= thirteen_week_start_date) & 
#             (thirteen_week_df['Date'] <= end_date)
#         ]
#     else:
#         thirteen_week_df = pd.DataFrame()  # Empty if no end date provided
    
#     # If the dataframe is empty after filtering, return empty tables
#     if filtered_df.empty:
#         return {
#             'sales_by_category_table': pd.DataFrame(),
#             'category_comparison_table': pd.DataFrame(),
#             'sales_by_category_by_day_table': pd.DataFrame(),
#         }
    
#     # Create day of week and week number columns
#     filtered_df['Day_of_Week'] = filtered_df['Date'].dt.day_name()
#     filtered_df['Week_Number'] = filtered_df['Date'].dt.isocalendar().week
    
#     # Create a more readable week identifier (e.g., "Week 16", "Week 17")
#     filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number'].astype(str)
    
#     # Define day order for proper sorting
#     day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
#     filtered_df['Day_of_Week'] = pd.Categorical(filtered_df['Day_of_Week'], categories=day_order, ordered=True)
    
#     # Sales by Category and Week pivot table
#     sales_by_category_table = pd.pivot_table(
#         filtered_df,
#         values='Net_Price',
#         index='Sales_Category',
#         columns='Week_Label',
#         aggfunc='sum',
#         fill_value=0,
#         margins=True,
#         margins_name='Grand Total'
#     )
    
#     # Reset index and round to 2 decimal places
#     sales_by_category_table = sales_by_category_table.round(2).fillna(0).reset_index()
    
#     # Sales by Category and Day of Week pivot table
#     sales_by_category_by_day_table = pd.pivot_table(
#         filtered_df,
#         values='Net_Price',
#         index='Sales_Category',
#         columns='Day_of_Week',
#         aggfunc='sum',
#         fill_value=0,
#         margins=True,
#         margins_name='Grand Total',
#         observed=False
#     )

#     # Reset index and round values
#     sales_by_category_by_day_table = sales_by_category_by_day_table.round(2).fillna(0).reset_index()

#     # Create category comparison table (current 4 weeks vs previous 4 weeks)
#     category_comparison_table = pd.DataFrame()
    
#     if not filtered_df.empty:
#         # Calculate sales for current period by category
#         current_sales = filtered_df.groupby('Sales_Category')['Net_Price'].sum().reset_index()
#         current_sales.columns = ['Sales Category', 'Current_4_Weeks_Sales']
        
#         # Calculate sales for previous period by category
#         if not previous_df.empty:
#             previous_sales = previous_df.groupby('Sales_Category')['Net_Price'].sum().reset_index()
#             previous_sales.columns = ['Sales Category', 'Previous_4_Weeks_Sales']
#         else:
#             # Create empty previous sales with same categories as current
#             previous_sales = pd.DataFrame({
#                 'Sales Category': current_sales['Sales Category'],
#                 'Previous_4_Weeks_Sales': 0
#             })
        
#         # Merge current and previous sales (outer join to include all categories)
#         category_comparison_table = pd.merge(current_sales, previous_sales, on='Sales Category', how='outer').fillna(0)
        
#         # # Calculate percentage change
#         # category_comparison_table['Percent_Change'] = category_comparison_table.apply(
#         #     lambda row: ((row['Current_4_Weeks_Sales'] - row['Previous_4_Weeks_Sales']) / row['Previous_4_Weeks_Sales'] * 100) 
#         #     if row['Previous_4_Weeks_Sales'] != 0 
#         #     else (100 if row['Current_4_Weeks_Sales'] > 0 else 0), 
#         #     axis=1
#         # )
        
#         category_comparison_table['Percent_Change'] = category_comparison_table.apply(
#             lambda row: ((row['Current_4_Weeks_Sales'] - row['Previous_4_Weeks_Sales']) / row['Previous_4_Weeks_Sales'] * 100) 
#             if row['Previous_4_Weeks_Sales'] != 0 
#             else 0, 
#             axis=1
#         )
        
#         # Round values
#         category_comparison_table['Current_4_Weeks_Sales'] = category_comparison_table['Current_4_Weeks_Sales'].round(2)
#         category_comparison_table['Previous_4_Weeks_Sales'] = category_comparison_table['Previous_4_Weeks_Sales'].round(2)
#         category_comparison_table['Percent_Change'] = category_comparison_table['Percent_Change'].round(2)
        
#         # Rename columns for better readability
#         category_comparison_table.columns = ['Sales Category', 'day_Sales', 'Previous_Sales', 'Percent_Change']
        
#         # Sort by current sales descending
#         category_comparison_table = category_comparison_table.sort_values('day_Sales', ascending=False).reset_index(drop=True)
        
#     return {
#         'sales_by_category_table': sales_by_category_table,
#         'category_comparison_table': category_comparison_table,
#         'sales_by_category_by_day_table': sales_by_category_by_day_table
#     }
    



def create_sales_by_category_tables(df, location_filter='All', start_date=None, end_date=None, category_filter='All', server_filter='All'):
    df_copy = df.copy()

    # Ensure Date column is datetime
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])

    if start_date is not None and isinstance(start_date, str):
        start_date = pd.to_datetime(start_date)
    if end_date is not None and isinstance(end_date, str):
        end_date = pd.to_datetime(end_date)
    else:
        end_date = df_copy['Date'].max()

    # Apply filters
    if location_filter != 'All':
        df_copy = df_copy[df_copy['Location'].isin(location_filter)] if isinstance(location_filter, list) else df_copy[df_copy['Location'] == location_filter]
    if server_filter != 'All':
        df_copy = df_copy[df_copy['Server'].isin(server_filter)] if isinstance(server_filter, list) else df_copy[df_copy['Server'] == server_filter]
    if category_filter != 'All':
        df_copy = df_copy[df_copy['Category'].isin(category_filter)] if isinstance(category_filter, list) else df_copy[df_copy['Category'] == category_filter]

    filtered_df = df_copy.copy()
    if start_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    if end_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]

    if filtered_df.empty:
        return {
            'sales_by_category_table': pd.DataFrame(),
            'sales_by_category_by_day_table': pd.DataFrame()
        }

    # Add extra columns
    filtered_df['Day_of_Week'] = filtered_df['Date'].dt.day_name()
    filtered_df['Week_Number'] = filtered_df['Date'].dt.isocalendar().week
    filtered_df['Week_Label'] = 'Week ' + filtered_df['Week_Number'].astype(str)

    day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    filtered_df['Day_of_Week'] = pd.Categorical(filtered_df['Day_of_Week'], categories=day_order, ordered=True)

    # Sales by Category and Week
    sales_by_category_table = pd.pivot_table(
        filtered_df,
        values='Net_Price',
        index='Sales_Category',
        columns='Week_Label',
        aggfunc='sum',
        fill_value=0,
        margins=True,
        margins_name='Grand Total'
    ).round(2).reset_index()

    # Sales by Category and Day
    sales_by_category_by_day_table = pd.pivot_table(
        filtered_df,
        values='Net_Price',
        index='Sales_Category',
        columns='Day_of_Week',
        aggfunc='sum',
        fill_value=0,
        margins=True,
        margins_name='Grand Total',
        observed=False
    ).round(2).reset_index()

    return {
        'sales_by_category_table': sales_by_category_table,
        'sales_by_category_by_day_table': sales_by_category_by_day_table
    }



def category_comparison_function(df, location_filter='All', start_date=None, end_date=None, category_filter='All', server_filter='All'):
    df_copy = df.copy()

    # Apply filters
    if location_filter != 'All':
        df_copy = df_copy[df_copy['Location'].isin(location_filter)] if isinstance(location_filter, list) else df_copy[df_copy['Location'] == location_filter]
    if server_filter != 'All':
        df_copy = df_copy[df_copy['Server'].isin(server_filter)] if isinstance(server_filter, list) else df_copy[df_copy['Server'] == server_filter]
    if category_filter != 'All':
        df_copy = df_copy[df_copy['Category'].isin(category_filter)] if isinstance(category_filter, list) else df_copy[df_copy['Category'] == category_filter]


    # if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
    #     df_copy['Date'] = pd.to_datetime(df_copy['Date'])

    # if start_date is not None and isinstance(start_date, str):
    #     start_date = pd.to_datetime(start_date)
    # if end_date is not None and isinstance(end_date, str):
    #     end_date = pd.to_datetime(end_date)
    # else:
    #     end_date = df_copy['Date'].max()

    # # Periods
    # if start_date is not None:
    #     previous_end_date = start_date - pd.Timedelta(days=1)
    #     previous_start_date = start_date - pd.Timedelta(days=28)
    # else:
    #     previous_start_date = previous_end_date = None




    # # Determine the end date
    # if end_date is not None:
    #     if isinstance(end_date, str):
    #         current_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    #     else:
    #         current_date = end_date
    # else:
    #     current_date = datetime.now().date()
    #     days_to_next_sunday = (6 - current_date.weekday()) % 7
    #     if days_to_next_sunday == 0:
    #         days_to_next_sunday = 7
    #     current_date = current_date + timedelta(days=days_to_next_sunday)
    #     if hasattr(current_date, 'date'):
    #         current_date = current_date.date()

    
    # # Week window for the given end date
    # days_since_monday = current_date.weekday()
    # week_start_of_end_date = current_date - pd.Timedelta(days=days_since_monday)
    # week_end = week_start_of_end_date + pd.Timedelta(days=6)

    # # Current 4-week period
    # start_date = week_start_of_end_date
    # end_date_final = week_end

    # # Previous 4-week period
    # previous_end_date = start_date - pd.Timedelta(days=1)
    # previous_start_date = start_date - pd.Timedelta(weeks=4)


    # # Ensure 'Date' column is datetime
    # if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
    #     df_copy['Date'] = pd.to_datetime(df_copy['Date'])


    # Determine the current date based on end_date or calculate next Sunday
    if end_date is not None:
        if isinstance(end_date, str):
            current_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            current_date = end_date
    else:
        current_date = datetime.now().date()
        days_to_next_sunday = (6 - current_date.weekday()) % 7 or 7
        current_date += timedelta(days=days_to_next_sunday)

    # Calculate the current 4-week window
    week_start_of_end_date = current_date - timedelta(days=current_date.weekday())
    week_end = week_start_of_end_date + timedelta(days=6)

    # Current period
    start_date = week_start_of_end_date
    end_date_final = week_end

    # Previous 4-week period
    previous_end_date = start_date - timedelta(days=1)
    previous_start_date = start_date - timedelta(weeks=4)


    print("-----------------------------------")
    print("-----------------------------------")
    print("i am here in the pmix utils printing the ", "start_date", start_date, "end_date_final", end_date_final)
    print("previous_start_date", previous_start_date, "previous_end_date", previous_end_date)
    print("-----------------------------------")
    print("-----------------------------------")



    filtered_df = df_copy.copy()
    if start_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    if end_date is not None:
        filtered_df = filtered_df[filtered_df['Date'] <= end_date_final]

    previous_df = df_copy.copy()
    if previous_start_date is not None and previous_end_date is not None:
        previous_df = previous_df[(previous_df['Date'] >= previous_start_date) & (previous_df['Date'] <= previous_end_date)]
    else:
        previous_df = pd.DataFrame()

    if filtered_df.empty:
        return {'category_comparison_table': pd.DataFrame()}

    current_sales = filtered_df.groupby('Sales_Category')['Net_Price'].sum().reset_index()
    current_sales.columns = ['Sales Category', 'Current_4_Weeks_Sales']

    if not previous_df.empty:
        previous_sales = previous_df.groupby('Sales_Category')['Net_Price'].sum().reset_index()
        previous_sales.columns = ['Sales Category', 'Previous_4_Weeks_Sales']
    else:
        previous_sales = pd.DataFrame({'Sales Category': current_sales['Sales Category'], 'Previous_4_Weeks_Sales': 0})

    category_comparison_table = pd.merge(current_sales, previous_sales, on='Sales Category', how='outer').fillna(0)
    category_comparison_table['Percent_Change'] = category_comparison_table.apply(
        lambda row: ((row['Current_4_Weeks_Sales'] - row['Previous_4_Weeks_Sales']) / row['Previous_4_Weeks_Sales'] * 100)
        if row['Previous_4_Weeks_Sales'] != 0 else 0,
        axis=1
    )

    category_comparison_table['Current_4_Weeks_Sales'] = category_comparison_table['Current_4_Weeks_Sales'].round(2)
    category_comparison_table['Previous_4_Weeks_Sales'] = category_comparison_table['Previous_4_Weeks_Sales'].round(2)
    category_comparison_table['Percent_Change'] = category_comparison_table['Percent_Change'].round(2)

    category_comparison_table.columns = ['Sales Category', 'day_Saler', 'Previous_Sales', 'Percent_Change']
    category_comparison_table = category_comparison_table.sort_values('day_Saler', ascending=False).reset_index(drop=True)

    return {'category_comparison_table': category_comparison_table}



def create_top_vs_bottom_comparison(df, location_filter='All', start_date=None, end_date=None, category_filter='All', server_filter='All'):
    """
    Create a comparison table of top 10 vs bottom 10 items by sales.
    The Difference_Sales now compares current period vs previous period for top 10 items.
    
    Parameters:
    -----------
    df : pd.DataFrame
        DataFrame with sales data
    location_filter : str or list, optional
        'All' or specific location(s)
    start_date : str or datetime, optional
        Start date as string 'YYYY-MM-DD' or datetime object
        If None and end_date is also None, uses current week based on max date
    end_date : str or datetime, optional
        End date as string 'YYYY-MM-DD' or datetime object
        If None and start_date is also None, uses current week based on max date
    category_filter : str or list, optional
        Filter by specific category(s)
    server_filter : str or list, optional
        Filter by specific server(s)
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with side-by-side comparison of top vs bottom items
        Difference_Sales compares current period vs previous period for top 10 items
        
    Notes:
    ------
    When both start_date and end_date are None:
    - Current period: 7 days ending on the maximum date in the dataset
    - Previous period: 7 days before the current period
    - Comparison shows current week vs last week performance
    """
    
    # Make a copy of the dataframe
    df_copy = df.copy()
    
    # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])

    # Apply location filter to the entire dataset first
    if location_filter != 'All':
        if isinstance(location_filter, list):
            df_copy = df_copy[df_copy['Location'].isin(location_filter)]
        else:
            df_copy = df_copy[df_copy['Location'] == location_filter]
    
    # Convert dates using pandas datetime (not Python date objects)
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
        
    # Apply category filter
    if category_filter != 'All':
        if isinstance(category_filter, list):
            df_copy = df_copy[df_copy['Category'].isin(category_filter)]
        else:
            df_copy = df_copy[df_copy['Category'] == category_filter]
            
    # Apply server filter
    if server_filter != 'All':
        if isinstance(server_filter, list):
            df_copy = df_copy[df_copy['Server'].isin(server_filter)]
        else:
            df_copy = df_copy[df_copy['Server'] == server_filter]
    
    # Column mapping for clarity
    item_column = 'Menu_Item'
    quantity_column = 'Qty'
    sales_column = 'Net_Price'
    
    # Determine date ranges for comparison
    if start_date is None and end_date is None:
        # If no dates provided, use current week and last week based on max date
        max_date = df_copy['Date'].max()
        
        # Define current week as the 7 days ending on max_date
        current_end_date = max_date
        current_start_date = max_date - pd.Timedelta(days=6)  # 7 days total including max_date
        
        # Define previous week as the 7 days before current week
        previous_end_date = current_start_date - pd.Timedelta(days=1)
        previous_start_date = previous_end_date - pd.Timedelta(days=6)  # 7 days total
        
        # Filter current week data
        current_period_df = df_copy[
            (df_copy['Date'] >= current_start_date) & (df_copy['Date'] <= current_end_date)
        ].copy()
        
        # Filter previous week data
        previous_period_df = df_copy[
            (df_copy['Date'] >= previous_start_date) & (df_copy['Date'] <= previous_end_date)
        ].copy()
        
    elif start_date is not None and end_date is not None:
        # Calculate the number of days in the current period
        period_days = (end_date - start_date).days + 1  # +1 to include both start and end dates
        
        # Calculate previous period dates
        previous_end_date = start_date - pd.Timedelta(days=1)
        previous_start_date = previous_end_date - pd.Timedelta(days=period_days-1)
        
        # Filter current period data
        current_period_df = df_copy[
            (df_copy['Date'] >= start_date) & (df_copy['Date'] <= end_date)
        ].copy()
        
        # Filter previous period data
        previous_period_df = df_copy[
            (df_copy['Date'] >= previous_start_date) & (df_copy['Date'] <= previous_end_date)
        ].copy()
        
    else:
        # If only one date is provided, use all data for current period
        current_period_df = df_copy.copy()
        previous_period_df = pd.DataFrame()  # Empty previous period
        
        # Apply date filters if only one is provided
        if start_date is not None:
            current_period_df = current_period_df[current_period_df['Date'] >= start_date]
        if end_date is not None:
            current_period_df = current_period_df[current_period_df['Date'] <= end_date]
    
    # If the current period dataframe is empty after filtering, return empty table
    if current_period_df.empty:
        return pd.DataFrame(columns=['Rank', 'Top_10_Items', 'T_Sales', 'T_Quantity', 
                                   'Bottom_10_Items', 'B_Sales', 'B_Quantity', 'Difference_Sales'])
    
    # Group by item and sum quantity and sales for current period
    current_items = current_period_df.groupby(item_column).agg({
        quantity_column: 'sum',
        sales_column: 'sum'
    }).reset_index()
    
    # Rename columns for clarity
    current_items.columns = ['Item', 'Quantity', 'Sales']
    
    # Round values appropriately
    current_items['Sales'] = current_items['Sales'].round(2)
    current_items['Quantity'] = current_items['Quantity'].round(0).astype(int)
    
    # Filter out items with zero or negative sales
    current_items = current_items[current_items['Sales'] > 0]
    
    # Check if we have enough items after filtering
    if current_items.empty:
        return pd.DataFrame(columns=['Rank', 'Top_10_Items', 'T_Sales', 'T_Quantity', 
                                   'Bottom_10_Items', 'B_Sales', 'B_Quantity', 'Difference_Sales'])
    
    # Get top 10 items (highest sales) from current period
    top_items = current_items.sort_values('Sales', ascending=False).head(10).reset_index(drop=True)
    
    # Get bottom 10 items (lowest sales) from current period
    if len(current_items) >= 10:
        bottom_items = current_items.sort_values('Sales', ascending=True).head(10).reset_index(drop=True)
    else:
        # If we have fewer than 10 items total, take the bottom half
        bottom_count = max(1, len(current_items) // 2)
        bottom_items = current_items.sort_values('Sales', ascending=True).head(bottom_count).reset_index(drop=True)
    
    # Calculate previous period sales for top 10 items
    if not previous_period_df.empty and (
        (start_date is not None and end_date is not None) or 
        (start_date is None and end_date is None)
    ):
        # Group by item and sum sales for previous period
        previous_items = previous_period_df.groupby(item_column).agg({
            sales_column: 'sum'
        }).reset_index()
        previous_items.columns = ['Item', 'Previous_Sales']
        previous_items['Previous_Sales'] = previous_items['Previous_Sales'].round(2)
        
        # Merge with top items to get previous period sales
        top_items_with_previous = top_items.merge(
            previous_items[['Item', 'Previous_Sales']], 
            on='Item', 
            how='left'
        )
        # Fill NaN values with 0 for items that didn't exist in previous period
        top_items_with_previous['Previous_Sales'] = top_items_with_previous['Previous_Sales'].fillna(0)
        
        # Calculate period-over-period difference for top items
        top_items_difference = (top_items_with_previous['Sales'] - top_items_with_previous['Previous_Sales']).round(2)
    else:
        # If no previous period data available, difference is 0
        top_items_difference = [0.0] * len(top_items)
    
    # Create comparison table
    max_rows = max(len(top_items), len(bottom_items), 10)  # Ensure at least 10 rows for formatting
    comparison_table = pd.DataFrame()
    comparison_table['Rank'] = range(1, max_rows + 1)
    
    # Helper function to pad lists with appropriate empty values
    def pad_list(original_list, target_length, fill_value):
        return list(original_list) + [fill_value] * (target_length - len(original_list))
    
    # Pad shorter lists with empty values
    comparison_table['Top_10_Items'] = pad_list(top_items['Item'].values, max_rows, '')
    comparison_table['T_Sales'] = pad_list(top_items['Sales'].values, max_rows, 0.0)
    comparison_table['T_Quantity'] = pad_list(top_items['Quantity'].values, max_rows, 0)
    
    comparison_table['Bottom_10_Items'] = pad_list(bottom_items['Item'].values, max_rows, '')
    comparison_table['B_Sales'] = pad_list(bottom_items['Sales'].values, max_rows, 0.0)
    comparison_table['B_Quantity'] = pad_list(bottom_items['Quantity'].values, max_rows, 0)
    
    # For Difference_Sales, use period-over-period comparison for top items, 0 for bottom items
    top_differences_padded = pad_list(top_items_difference, max_rows, 0.0)
    comparison_table['Difference_Sales'] = top_differences_padded
    
    # Clean up the table - remove rows where both top and bottom items are empty
    comparison_table = comparison_table[
        (comparison_table['Top_10_Items'] != '') | (comparison_table['Bottom_10_Items'] != '')
    ].reset_index(drop=True)
    
    # Update rank to be sequential
    comparison_table['Rank'] = range(1, len(comparison_table) + 1)
    
    return comparison_table



