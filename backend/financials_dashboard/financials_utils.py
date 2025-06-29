import pandas as pd
import numpy as np
from datetime import datetime

def parse_date(date_str):
    for fmt in ('%Y-%m-%d', '%m/%d/%Y'):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    raise ValueError("Date must be in one of the following formats: 'YYYY-MM-DD' or 'MM/DD/YYYY'")


def financials_filters(df):
    # finding the unique values in the 'Helper 4' column
    unique_weeks = df['Helper_4'].unique()
    # Remove empty strings from unique_weeks
    unique_weeks = [week for week in unique_weeks if str(week).strip() != '']

    unique_years = df['Year'].unique()
    # Remove empty strings and convert to int
    unique_years = [int(year) for year in unique_years if str(year).strip() != '']

    unique_stores = df['Store'].unique()
    unique_stores = [store for store in unique_stores if str(store).strip() != '']
    unique_stores = [store.split(':', 1)[1].strip() for store in unique_stores if ':' in store]
    
    return unique_weeks, unique_years, unique_stores


def day_of_the_week_tables(df, store='All', start_date=None, end_date=None):  



    # sales_table
    # Clean column names
    df.columns = df.columns.str.strip()
        
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = parse_date(start_date)
        df = df[df['Date'] >= start_date]

    if end_date is not None:
        if isinstance(end_date, str):
            end_date = parse_date(end_date)
        df = df[df['Date'] <= end_date]
    
    # Apply filters to main dataframe
    if store != 'All':
        if isinstance(store, list):
            df = df[df['Store'].isin(store)]
        else:
            df = df[df['Store'] == store]
     
    # Define columns to clean
    sales_cols = ['Tw_Sales', 'Lw_Sales', 'Ly_Sales']
    df[sales_cols] = df[sales_cols].fillna(0)

    # Remove $ and , and convert to float
    for col in sales_cols:
        df[col] = df[col].astype(str).str.replace(r'[\$,]', '', regex=True)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Group by Helper 1
    grouped = df.groupby('Helper_1')[sales_cols].sum().reset_index()

    # # Calculate percentage differences and round to 2 decimal places
    # grouped['Tw/Lw (+/-)'] = (((grouped['Tw Sales'] - grouped['Lw Sales']) / grouped['Lw Sales'].replace(0, pd.NA)) * 100).round(2)
    # grouped['Tw/Ly (+/-)'] = (((grouped['Tw Sales'] - grouped['Ly Sales']) / grouped['Ly Sales'].replace(0, pd.NA)) * 100).round(2)

    grouped['Tw/Lw (+/-)'] = np.where(
        grouped['Lw_Sales'] == 0,
        0.0,
        ((grouped['Tw_Sales'] - grouped['Lw_Sales']) / grouped['Lw_Sales']) * 100
    ).round(2)

    grouped['Tw/Ly (+/-)'] = np.where(
        grouped['Ly_Sales'] == 0,
        0.0,
        ((grouped['Tw_Sales'] - grouped['Ly_Sales']) / grouped['Ly_Sales']) * 100
    ).round(2)

    # Grand total values
    total_tw = df['Tw_Sales'].sum()
    total_lw = df['Lw_Sales'].sum()
    total_ly = df['Ly_Sales'].sum()
    tw_lw_diff = round((total_tw - total_lw) / total_lw * 100, 2) if total_lw != 0 else 0.00
    tw_ly_diff = round((total_tw - total_ly) / total_ly * 100, 2) if total_ly != 0 else 0.00

    # Grand total row (all floats)
    grand_total = pd.DataFrame([{
        'Helper_1': 'Grand Total',
        'Tw_Sales': round(total_tw, 2),
        'Lw_Sales': round(total_lw, 2),
        'Ly_Sales': round(total_ly, 2),
        'Tw/Lw (+/-)': tw_lw_diff,
        'Tw/Ly (+/-)': tw_ly_diff
    }])

    # Define expected rows in correct order
    expected_days = [
        '1 - Monday',
        '2 - Tuesday',
        '3 - Wednesday',
        '4 - Thursday',
        '5 - Friday',
        '6 - Saturday',
        '7 - Sunday',
        'Grand Total'
    ]

    # Combine and sort
    sales_table = pd.concat([grouped, grand_total], ignore_index=True)
    sales_table = sales_table[sales_table['Helper_1'].isin(expected_days)]
    sales_table['Helper_1'] = pd.Categorical(sales_table['Helper_1'], categories=expected_days, ordered=True)
    sales_table = sales_table.sort_values('Helper_1').reset_index(drop=True)

    # Rename column
    sales_table = sales_table.rename(columns={'Helper_1': 'Day of the Week'})
    print("sales_table", sales_table)
    cols_to_round = ['Tw_Sales', 'Lw_Sales', 'Ly_Sales', 'Tw/Lw (+/-)', 'Tw/Ly (+/-)']
    sales_table[cols_to_round] = sales_table[cols_to_round].astype(float).round(2)


    # orders_table
    # Define order-related columns
    order_cols = ['Tw_Orders', 'Lw_Orders', 'Ly_Orders']
    df[order_cols] = df[order_cols].fillna(0)

    # Remove commas and convert to float
    for col in order_cols:
        df[col] = df[col].astype(str).str.replace(',', '', regex=False)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Group by 'Helper 1'
    grouped_orders = df.groupby('Helper_1')[order_cols].sum().reset_index()

    # # Calculate percentage differences
    # grouped_orders['Tw/Lw (+/-)'] = (((grouped_orders['Tw Orders'] - grouped_orders['Lw Orders']) / grouped_orders['Lw Orders'].replace(0, pd.NA)) * 100).round(2)
    # grouped_orders['Tw/Ly (+/-)'] = (((grouped_orders['Tw Orders'] - grouped_orders['Ly Orders']) / grouped_orders['Ly Orders'].replace(0, pd.NA)) * 100).round(2)


    grouped_orders['Tw/Lw (+/-)'] = np.where(
        grouped_orders['Lw_Orders'] == 0,
        0.0,
        ((grouped_orders['Tw_Orders'] - grouped_orders['Lw_Orders']) / grouped_orders['Lw_Orders']) * 100
    ).round(2)

    grouped_orders['Tw/Ly (+/-)'] = np.where(
        grouped_orders['Ly_Orders'] == 0,
        0.0,
        ((grouped_orders['Tw_Orders'] - grouped_orders['Ly_Orders']) / grouped_orders['Ly_Orders']) * 100
    ).round(2)

    # Grand total values
    total_tw_orders = df['Tw_Orders'].sum()
    total_lw_orders = df['Lw_Orders'].sum()
    total_ly_orders = df['Ly_Orders'].sum()
    tw_lw_orders_diff = round((total_tw_orders - total_lw_orders) / total_lw_orders * 100, 2) if total_lw_orders != 0 else 0.00
    tw_ly_orders_diff = round((total_tw_orders - total_ly_orders) / total_ly_orders * 100, 2) if total_ly_orders != 0 else 0.00

    # Grand total row
    grand_total_orders = pd.DataFrame([{
        'Helper_1': 'Grand Total',
        'Tw_Orders': round(total_tw_orders, 2),
        'Lw_Orders': round(total_lw_orders, 2),
        'Ly_Orders': round(total_ly_orders, 2),
        'Tw/Lw (+/-)': tw_lw_orders_diff,
        'Tw/Ly (+/-)': tw_ly_orders_diff
    }])

    # Define correct order
    expected_days = [
        '1 - Monday',
        '2 - Tuesday',
        '3 - Wednesday',
        '4 - Thursday',
        '5 - Friday',
        '6 - Saturday',
        '7 - Sunday',
        'Grand Total'
    ]

    # Combine, filter, sort
    orders_table = pd.concat([grouped_orders, grand_total_orders], ignore_index=True)
    orders_table = orders_table[orders_table['Helper_1'].isin(expected_days)]
    orders_table['Helper_1'] = pd.Categorical(orders_table['Helper_1'], categories=expected_days, ordered=True)
    orders_table = orders_table.sort_values('Helper_1').reset_index(drop=True)

    # Rename column
    orders_table = orders_table.rename(columns={'Helper_1': 'Day of The Week'})
    cols_to_round = ['Tw_Orders', 'Lw_Orders', 'Ly_Orders', 'Tw/Lw (+/-)', 'Tw/Ly (+/-)']
    orders_table[cols_to_round] = orders_table[cols_to_round].astype(float).round(2)

    
    
    
    # avg_ticket_table
    # Ticket columns (though named 'Avg', treat them as total amounts to be summed)
    ticket_cols = ['Tw_Avg_Tckt', 'Lw_Avg_Tckt', 'Ly_Avg_Tckt']
    df[ticket_cols] = df[ticket_cols].fillna(0)

    # Clean $, commas and convert to float
    for col in ticket_cols:
        df[col] = df[col].astype(str).str.replace(r'[\$,]', '', regex=True)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Group by 'Helper 1' and sum (not average)
    grouped_tckt = df.groupby('Helper_1')[ticket_cols].sum().reset_index()

    # # Calculate % differences
    # grouped_tckt['Tw/Lw (+/-)'] = (((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Lw Avg Tckt']) / grouped_tckt['Lw Avg Tckt'].replace(0, pd.NA)) * 100).round(2)
    # grouped_tckt['Tw/Ly (+/-)'] = (((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Ly Avg Tckt']) / grouped_tckt['Ly Avg Tckt'].replace(0, pd.NA)) * 100).round(2)


    grouped_tckt['Tw/Lw (+/-)'] = np.where(
        grouped_tckt['Lw_Avg_Tckt'] == 0,
        0.0,
        ((grouped_tckt['Tw_Avg_Tckt'] - grouped_tckt['Lw_Avg_Tckt']) / grouped_tckt['Lw_Avg_Tckt']) * 100
    ).round(2)

    grouped_tckt['Tw/Ly (+/-)'] = np.where(
        grouped_tckt['Ly_Avg_Tckt'] == 0,
        0.0,
        ((grouped_tckt['Tw_Avg_Tckt'] - grouped_tckt['Ly_Avg_Tckt']) / grouped_tckt['Ly_Avg_Tckt']) * 100
    ).round(2)

    # Grand total values (averaged)
    tw_avg = round(df['Tw_Avg_Tckt'].mean(), 2)
    lw_avg = round(df['Lw_Avg_Tckt'].mean(), 2)
    ly_avg = round(df['Ly_Avg_Tckt'].mean(), 2)

    tw_lw_diff = round((tw_avg - lw_avg) / lw_avg * 100, 2) if lw_avg != 0 else 0.00
    tw_ly_diff = round((tw_avg - ly_avg) / ly_avg * 100, 2) if ly_avg != 0 else 0.00

    # Grand total row
    grand_total = pd.DataFrame([{
        'Helper_1': 'Grand Total',
        'Tw_Avg_Tckt': tw_avg,
        'Lw_Avg_Tckt': lw_avg,
        'Ly_Avg_Tckt': ly_avg,
        'Tw/Lw (+/-)': tw_lw_diff,
        'Tw/Ly (+/-)': tw_ly_diff
    }])


    # Combine and finalize
    avg_ticket_table = pd.concat([grouped_tckt, grand_total], ignore_index=True)
    avg_ticket_table = avg_ticket_table[avg_ticket_table['Helper_1'].isin(expected_days)]
    avg_ticket_table['Helper_1'] = pd.Categorical(avg_ticket_table['Helper_1'], categories=expected_days, ordered=True)
    avg_ticket_table = avg_ticket_table.sort_values('Helper_1').reset_index(drop=True)
    avg_ticket_table = avg_ticket_table.rename(columns={'Helper_1': 'Day of The Week'})
    # Round all numeric columns to 2 decimal places
    cols_to_round = ['Tw_Avg_Tckt', 'Lw_Avg_Tckt', 'Ly_Avg_Tckt', 'Tw/Lw (+/-)', 'Tw/Ly (+/-)']
    # avg_ticket_table[cols_to_round] = avg_ticket_table[cols_to_round].round(2)
    avg_ticket_table[cols_to_round] = avg_ticket_table[cols_to_round].astype(float).round(2)
    
    

    tw_sales_grand_total =sales_table.loc[sales_table["Day of the Week"] == "Grand Total", "Tw_Sales"].values[0]
    lw_sales_grand_total =sales_table.loc[sales_table["Day of the Week"] == "Grand Total", "Lw_Sales"].values[0]
    ly_sales_grand_total =sales_table.loc[sales_table["Day of the Week"] == "Grand Total", "Ly_Sales"].values[0]

    tw_orders_grand_total =orders_table.loc[orders_table["Day of The Week"] == "Grand Total", "Tw_Orders"].values[0]
    lw_orders_grand_total =orders_table.loc[orders_table["Day of The Week"] == "Grand Total", "Lw_Orders"].values[0]
    ly_orders_grand_total =orders_table.loc[orders_table["Day of The Week"] == "Grand Total", "Ly_Orders"].values[0]

    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Tw_Avg_Tckt"] = tw_sales_grand_total / tw_orders_grand_total
    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Lw_Avg_Tckt"] = lw_sales_grand_total / lw_orders_grand_total
    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Ly_Avg_Tckt"] = ly_sales_grand_total / ly_orders_grand_total

    tw_avg_tckt_grand_total = avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total","Tw_Avg_Tckt"].values[0]
    lw_avg_tckt_grand_total = avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total","Lw_Avg_Tckt"].values[0]
    ly_avg_tckt_grand_total = avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total","Ly_Avg_Tckt"].values[0]

    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Tw/Lw (+/-)"] = ((tw_avg_tckt_grand_total - lw_avg_tckt_grand_total) / lw_avg_tckt_grand_total * 100).round(2)
    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Tw/Ly (+/-)"] = ((tw_avg_tckt_grand_total - ly_avg_tckt_grand_total) / ly_avg_tckt_grand_total * 100).round(2)
        
        
    print("in am here in financila utils printing the tables ", sales_table, orders_table, avg_ticket_table)    
    return sales_table, orders_table, avg_ticket_table



# def calculate_tw_lw_bdg_comparison(df, df_budget, store='All', year='All', week_range='All', start_date=None, end_date=None):
#     # Clean both dataframes columns
#     df.columns = df.columns.str.strip()
#     df_budget.columns = df_budget.columns.str.strip()
    
#     # Make copies of the dataframes
#     filtered_df = df.copy()
#     filtered_budget_df = df_budget.copy()
    
#     if start_date is not None:
#         if isinstance(start_date, str):
#             start_date = parse_date(start_date)
#         filtered_df = filtered_df[filtered_df['Date'] >= start_date]
#         filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] >= start_date]

#     if end_date is not None:
#         if isinstance(end_date, str):
#             end_date = parse_date(end_date)
#         filtered_df = filtered_df[filtered_df['Date'] <= end_date]
#         filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] <= end_date]
    
#     # Apply filters to main dataframe
#     if store != 'All':
#         if isinstance(store, list):
#             filtered_df = filtered_df[filtered_df['Store'].isin(store)]
#         else:
#             filtered_df = filtered_df[filtered_df['Store'] == store]
            
#     print("i am here in the financials_utils.py file checking the year", year, "and the store", store, filtered_df['Store'].unique(), filtered_df.head())
#     # Filter by year

#     if year != 'All':
#         if isinstance(year, list):
#             filtered_df = filtered_df[filtered_df['Year'].isin(year)]
#         else:
#             filtered_df = filtered_df[filtered_df['Year'] == year]
    
#     # if week_range != 'All':
#     #     if isinstance(week_range, list):
#     #         filtered_df = filtered_df[filtered_df['Helper 4'].isin(week_range)]
#     #     else:
#     #         filtered_df = filtered_df[filtered_df['Helper 4'] == week_range]
    
#     # Apply filters to budget dataframe
#     if store != 'All':
#         if isinstance(store, list):
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Store'].isin(store)]
#         else:
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Store'] == store]
    
#     if year != 'All':
#         if isinstance(year, list):
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Year'].isin(year)]
#         else:
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Year'] == year]
    
#     # if week_range != 'All':
#     #     if isinstance(week_range, list):
#     #         filtered_budget_df = filtered_budget_df[filtered_budget_df['Helper 2'].isin(week_range)]
#     #     else:
#     #         filtered_budget_df = filtered_budget_df[filtered_budget_df['Helper 2'] == week_range]
    
#     # Clean function
#     def clean_currency(df, col):
#         return pd.to_numeric(
#             df[col].astype(str).str.replace(r'[\$,]', '', regex=True),
#             errors='coerce'
#         ).fillna(0)
    
#     # Define matching columns - UPDATED COLUMN NAMES
#     metrics = {
#         'Net Sales': ('Tw Sales', 'Lw Sales', 'Net Sales'),
#         'Orders': ('Tw Orders', 'Lw Orders', 'Orders'),
#         'Lbr hrs': ('Tw Labor Hrs', 'Lw Labor Hrs', 'LB Hours'),
#         'Lbr Pay': ('Tw Reg Pay', 'Lw Reg Pay', 'Labor $ Cost'),
#         'SPMH': ('Tw SPMH', 'Lw SPMH', 'SPMH'),
#         'LPMH': ('Tw LPMH', 'Lw LPMH', 'LPMH'),
#         'Johns': ('TW Johns', 'LW Johns', 'Johns'),
#         'Terra': ('TW Terra', 'LW Terra', 'Terra'),
#         'Metro': ('TW Metro', 'LW Metro', 'Metro'),
#         'Victory': ('TW Victory', 'LW Victory', 'Victory'),
#         'Central Kitchen': ('TW Central Kitchen', 'LW Central Kitchen', 'Central Kitchen'),
#         'Other': ('TW Other', 'LW Other', 'Other'),
#     }
    
#     # Process actual data columns
#     for tw_col, lw_col, _ in metrics.values():
#         if tw_col in filtered_df.columns:
#             filtered_df[tw_col] = clean_currency(filtered_df, tw_col)
#         if lw_col in filtered_df.columns:
#             filtered_df[lw_col] = clean_currency(filtered_df, lw_col)
    
#     # Process budget data columns from df_budget
#     budget_values = {}
#     for metric, (_, _, bdg_col) in metrics.items():
#         if filtered_budget_df.empty:
#             budget_values[metric] = 0
#         else:
#             budget_values[metric] = clean_currency(filtered_budget_df, bdg_col).sum() if bdg_col in filtered_budget_df.columns else 0
    
#     # Calculate values
#     rows = []
#     for label, (tw_col, lw_col, _) in metrics.items():
#         tw = filtered_df[tw_col].sum() if tw_col in filtered_df.columns else 0
#         lw = filtered_df[lw_col].sum() if lw_col in filtered_df.columns else 0
#         bdg = budget_values[label]
        
#         tw_lw_pct = ((tw - lw) / lw * 100) if lw != 0 else 0
#         tw_bdg_pct = ((tw - bdg) / bdg * 100) if bdg != 0 else 0
        
#         rows.append((
#             label, 
#             f"{tw:.2f}", 
#             f"{lw:.2f}", 
#             f"{tw_lw_pct:.2f}",
#             f"{bdg:.2f}",
#             f"{tw_bdg_pct:.2f}"
#         ))
    
#     # Additional Calculations
#     tw_lbr_pay = filtered_df['Tw Reg Pay'].sum() if 'Tw Reg Pay' in filtered_df.columns else 0
#     tw_net_sales = filtered_df['Tw Sales'].sum() if 'Tw Sales' in filtered_df.columns else 0
#     lw_lbr_pay = filtered_df['Lw Reg Pay'].sum() if 'Lw Reg Pay' in filtered_df.columns else 0
#     lw_net_sales = filtered_df['Lw Sales'].sum() if 'Lw Sales' in filtered_df.columns else 0
#     bdg_lbr_pay = budget_values['Lbr Pay']
#     bdg_net_sales = budget_values['Net Sales']
    
#     # Labor percentage calculations
#     tw_lbr_pct = tw_lbr_pay / tw_net_sales * 100 if tw_net_sales != 0 else 0
#     lw_lbr_pct = lw_lbr_pay / lw_net_sales * 100 if lw_net_sales != 0 else 0
#     bdg_lbr_pct = bdg_lbr_pay / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
#     lbr_tw_lw_diff = tw_lbr_pct - lw_lbr_pct
#     lbr_tw_bdg_diff = tw_lbr_pct - bdg_lbr_pct
    
#     rows.insert(4, (
#         "Lbr %", 
#         f"{tw_lbr_pct:.2f}", 
#         f"{lw_lbr_pct:.2f}", 
#         f"{lbr_tw_lw_diff:.2f}",
#         f"{bdg_lbr_pct:.2f}",
#         f"{lbr_tw_bdg_diff:.2f}"
#     ))
    
#     # TTL calculations - UPDATED COLUMN NAMES
#     tw_food_columns = ['TW Johns', 'TW Terra', 'TW Metro', 'TW Victory', 'TW Central Kitchen', 'TW Other']
#     lw_food_columns = ['LW Johns', 'LW Terra', 'LW Metro', 'LW Victory', 'LW Central Kitchen', 'LW Other']
    
#     tw_ttl = sum(filtered_df[col].sum() for col in tw_food_columns if col in filtered_df.columns)
#     lw_ttl = sum(filtered_df[col].sum() for col in lw_food_columns if col in filtered_df.columns)
#     bdg_ttl = sum(budget_values[m] for m in ['Johns', 'Terra', 'Metro', 'Victory', 'Central Kitchen', 'Other'])
    
#     ttl_tw_lw_diff = ((tw_ttl - lw_ttl) / lw_ttl * 100) if lw_ttl != 0 else 0
#     ttl_tw_bdg_diff = ((tw_ttl - bdg_ttl) / bdg_ttl * 100) if bdg_ttl != 0 else 0
    
#     rows.append((
#         "TTL", 
#         f"{tw_ttl:.2f}", 
#         f"{lw_ttl:.2f}", 
#         f"{ttl_tw_lw_diff:.2f}",
#         f"{bdg_ttl:.2f}",
#         f"{ttl_tw_bdg_diff:.2f}"
#     ))
    
#     # Food Cost percentage calculations
#     tw_food_pct = tw_ttl / tw_net_sales * 100 if tw_net_sales != 0 else 0
#     lw_food_pct = lw_ttl / lw_net_sales * 100 if lw_net_sales != 0 else 0
#     bdg_food_pct = bdg_ttl / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
#     food_tw_lw_diff = tw_food_pct - lw_food_pct
#     food_tw_bdg_diff = tw_food_pct - bdg_food_pct
    
#     rows.append((
#         "Food Cost %", 
#         f"{tw_food_pct:.2f}", 
#         f"{lw_food_pct:.2f}", 
#         f"{food_tw_lw_diff:.2f}",
#         f"{bdg_food_pct:.2f}",
#         f"{food_tw_bdg_diff:.2f}"
#     ))
    
#     # Prime Cost $ calculations
#     tw_prime = tw_lbr_pay + tw_ttl
#     lw_prime = lw_lbr_pay + lw_ttl
#     bdg_prime = bdg_lbr_pay + bdg_ttl
    
#     prime_tw_lw_diff = ((tw_prime - lw_prime) / lw_prime * 100) if lw_prime != 0 else 0
#     prime_tw_bdg_diff = ((tw_prime - bdg_prime) / bdg_prime * 100) if bdg_prime != 0 else 0
    
#     rows.append((
#         "Prime Cost $", 
#         f"{tw_prime:.2f}", 
#         f"{lw_prime:.2f}", 
#         f"{prime_tw_lw_diff:.2f}",
#         f"{bdg_prime:.2f}",
#         f"{prime_tw_bdg_diff:.2f}"
#     ))
    
#     # Prime Cost % calculations
#     tw_prime_pct = tw_prime / tw_net_sales * 100 if tw_net_sales != 0 else 0
#     lw_prime_pct = lw_prime / lw_net_sales * 100 if lw_net_sales != 0 else 0
#     bdg_prime_pct = bdg_prime / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
#     prime_pct_tw_lw_diff = tw_prime_pct - lw_prime_pct
#     prime_pct_tw_bdg_diff = tw_prime_pct - bdg_prime_pct
    
#     rows.append((
#         "Prime Cost %", 
#         f"{tw_prime_pct:.2f}", 
#         f"{lw_prime_pct:.2f}", 
#         f"{prime_pct_tw_lw_diff:.2f}",
#         f"{bdg_prime_pct:.2f}",
#         f"{prime_pct_tw_bdg_diff:.2f}"
#     ))
    
#     # Calculate Avg Ticket values
#     tw_orders = filtered_df['Tw Orders'].sum() if 'Tw Orders' in filtered_df.columns else 0
#     lw_orders = filtered_df['Lw Orders'].sum() if 'Lw Orders' in filtered_df.columns else 0
    
#     tw_avg_ticket = tw_net_sales / tw_orders if tw_orders != 0 else 0
#     lw_avg_ticket = lw_net_sales / lw_orders if lw_orders != 0 else 0
#     bdg_avg_ticket = bdg_net_sales / budget_values['Orders'] if budget_values['Orders'] != 0 else 0
    
#     avg_ticket_tw_lw_diff = ((tw_avg_ticket - lw_avg_ticket) / lw_avg_ticket * 100) if lw_avg_ticket != 0 else 0
#     avg_ticket_tw_bdg_diff = ((tw_avg_ticket - bdg_avg_ticket) / bdg_avg_ticket * 100) if bdg_avg_ticket != 0 else 0
    
#     # Insert the Avg Ticket row after Orders (at index 2)
#     rows.insert(2, (
#         "Avg Ticket", 
#         f"{tw_avg_ticket:.2f}", 
#         f"{lw_avg_ticket:.2f}", 
#         f"{avg_ticket_tw_lw_diff:.2f}",
#         f"{bdg_avg_ticket:.2f}",
#         f"{avg_ticket_tw_bdg_diff:.2f}"
#     ))
    
#     # Final DataFrame
#     result = pd.DataFrame(
#         rows, 
#         columns=["Metric", "This Week", "Last Week", "Tw/Lw (+/-)", "Budget", "Tw/Bdg (+/-)"]
#     )
    
#     print( " i am here in the financials_utils.py file checking the result", result)
#     return result


# def calculate_tw_lw_bdg_comparison(df, df_budget, store='All', year='All', week_range='All', start_date=None, end_date=None):
#     # Clean both dataframes columns
#     df.columns = df.columns.str.strip()
#     df_budget.columns = df_budget.columns.str.strip()
    
#     # Make copies of the dataframes
#     filtered_df = df.copy()
#     filtered_budget_df = df_budget.copy()
    
#     if start_date is not None:
#         if isinstance(start_date, str):
#             start_date = parse_date(start_date)
#         filtered_df = filtered_df[filtered_df['Date'] >= start_date]
#         filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] >= start_date]

#     if end_date is not None:
#         if isinstance(end_date, str):
#             end_date = parse_date(end_date)
#         filtered_df = filtered_df[filtered_df['Date'] <= end_date]
#         filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] <= end_date]
    
#     # Apply filters to main dataframe
#     if store != 'All':
#         if isinstance(store, list):
#             filtered_df = filtered_df[filtered_df['Store'].isin(store)]
#         else:
#             filtered_df = filtered_df[filtered_df['Store'] == store]
            
#     print("i am here in the financials_utils.py file checking the year", year, "and the store", store, filtered_df['Store'].unique(), filtered_df.head())
#     # Filter by year

#     if year != 'All':
#         if isinstance(year, list):
#             filtered_df = filtered_df[filtered_df['Year'].isin(year)]
#         else:
#             filtered_df = filtered_df[filtered_df['Year'] == year]
    
#     # Apply filters to budget dataframe
#     if store != 'All':
#         if isinstance(store, list):
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Store'].isin(store)]
#         else:
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Store'] == store]
    
#     if year != 'All':
#         if isinstance(year, list):
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Year'].isin(year)]
#         else:
#             filtered_budget_df = filtered_budget_df[filtered_budget_df['Year'] == year]
    
#     # Clean function
#     def clean_currency(df, col):
#         return pd.to_numeric(
#             df[col].astype(str).str.replace(r'[\$,]', '', regex=True),
#             errors='coerce'
#         ).fillna(0)
    
#     # Define matching columns - UPDATED COLUMN NAMES
#     metrics = {
#         'Net Sales': ('Tw Sales', 'Lw Sales', 'Net Sales'),
#         'Orders': ('Tw Orders', 'Lw Orders', 'Orders'),
#         'Lbr hrs': ('Tw Labor Hrs', 'Lw Labor Hrs', 'LB Hours'),
#         'Lbr Pay': ('Tw Reg Pay', 'Lw Reg Pay', 'Labor $ Cost'),
#         'LPMH': ('Tw LPMH', 'Lw LPMH', 'LPMH'),
#         'Johns': ('TW Johns', 'LW Johns', 'Johns'),
#         'Terra': ('TW Terra', 'LW Terra', 'Terra'),
#         'Metro': ('TW Metro', 'LW Metro', 'Metro'),
#         'Victory': ('TW Victory', 'LW Victory', 'Victory'),
#         'Central Kitchen': ('TW Central Kitchen', 'LW Central Kitchen', 'Central Kitchen'),
#         'Other': ('TW Other', 'LW Other', 'Other'),
#     }
    
#     # Process actual data columns
#     for tw_col, lw_col, _ in metrics.values():
#         if tw_col in filtered_df.columns:
#             filtered_df[tw_col] = clean_currency(filtered_df, tw_col)
#         if lw_col in filtered_df.columns:
#             filtered_df[lw_col] = clean_currency(filtered_df, lw_col)
    
#     # Process budget data columns from df_budget
#     budget_values = {}
#     for metric, (_, _, bdg_col) in metrics.items():
#         if filtered_budget_df.empty:
#             budget_values[metric] = 0
#         else:
#             budget_values[metric] = clean_currency(filtered_budget_df, bdg_col).sum() if bdg_col in filtered_budget_df.columns else 0
    
#     # Calculate values
#     rows = []
#     for label, (tw_col, lw_col, _) in metrics.items():
#         tw = filtered_df[tw_col].sum() if tw_col in filtered_df.columns else 0
#         lw = filtered_df[lw_col].sum() if lw_col in filtered_df.columns else 0
#         bdg = budget_values[label]
        
#         tw_lw_pct = ((tw - lw) / lw * 100) if lw != 0 else 0
#         tw_bdg_pct = ((tw - bdg) / bdg * 100) if bdg != 0 else 0
        
#         rows.append((
#             label, 
#             f"{tw:.2f}", 
#             f"{lw:.2f}", 
#             f"{tw_lw_pct:.2f}",
#             f"{bdg:.2f}",
#             f"{tw_bdg_pct:.2f}"
#         ))
    
#     # Calculate SPMH (Sales Per Man Hour) = Net Sales / Labor Hours
#     tw_sales = filtered_df['Tw Sales'].sum() if 'Tw Sales' in filtered_df.columns else 0
#     lw_sales = filtered_df['Lw Sales'].sum() if 'Lw Sales' in filtered_df.columns else 0
#     tw_labor_hrs = filtered_df['Tw Labor Hrs'].sum() if 'Tw Labor Hrs' in filtered_df.columns else 0
#     lw_labor_hrs = filtered_df['Lw Labor Hrs'].sum() if 'Lw Labor Hrs' in filtered_df.columns else 0
#     bdg_sales = budget_values['Net Sales']
#     bdg_labor_hrs = budget_values['Lbr hrs']
    
#     tw_spmh = tw_sales / tw_labor_hrs if tw_labor_hrs != 0 else 0
#     lw_spmh = lw_sales / lw_labor_hrs if lw_labor_hrs != 0 else 0
#     bdg_spmh = bdg_sales / bdg_labor_hrs if bdg_labor_hrs != 0 else 0
    
#     spmh_tw_lw_pct = ((tw_spmh - lw_spmh) / lw_spmh * 100) if lw_spmh != 0 else 0
#     spmh_tw_bdg_pct = ((tw_spmh - bdg_spmh) / bdg_spmh * 100) if bdg_spmh != 0 else 0
    
#     # Insert SPMH row after Lbr Pay (at index 4)
#     rows.insert(4, (
#         "SPMH", 
#         f"{tw_spmh:.2f}", 
#         f"{lw_spmh:.2f}", 
#         f"{spmh_tw_lw_pct:.2f}",
#         f"{bdg_spmh:.2f}",
#         f"{spmh_tw_bdg_pct:.2f}"
#     ))
    
#     # Additional Calculations
#     tw_lbr_pay = filtered_df['Tw Reg Pay'].sum() if 'Tw Reg Pay' in filtered_df.columns else 0
#     tw_net_sales = filtered_df['Tw Sales'].sum() if 'Tw Sales' in filtered_df.columns else 0
#     lw_lbr_pay = filtered_df['Lw Reg Pay'].sum() if 'Lw Reg Pay' in filtered_df.columns else 0
#     lw_net_sales = filtered_df['Lw Sales'].sum() if 'Lw Sales' in filtered_df.columns else 0
#     bdg_lbr_pay = budget_values['Lbr Pay']
#     bdg_net_sales = budget_values['Net Sales']
    
#     # Labor percentage calculations
#     tw_lbr_pct = tw_lbr_pay / tw_net_sales * 100 if tw_net_sales != 0 else 0
#     lw_lbr_pct = lw_lbr_pay / lw_net_sales * 100 if lw_net_sales != 0 else 0
#     bdg_lbr_pct = bdg_lbr_pay / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
#     lbr_tw_lw_diff = tw_lbr_pct - lw_lbr_pct
#     lbr_tw_bdg_diff = tw_lbr_pct - bdg_lbr_pct
    
#     rows.insert(5, (  # Updated index due to SPMH insertion
#         "Lbr %", 
#         f"{tw_lbr_pct:.2f}", 
#         f"{lw_lbr_pct:.2f}", 
#         f"{lbr_tw_lw_diff:.2f}",
#         f"{bdg_lbr_pct:.2f}",
#         f"{lbr_tw_bdg_diff:.2f}"
#     ))
    
#     # TTL calculations - UPDATED COLUMN NAMES
#     tw_food_columns = ['TW Johns', 'TW Terra', 'TW Metro', 'TW Victory', 'TW Central Kitchen', 'TW Other']
#     lw_food_columns = ['LW Johns', 'LW Terra', 'LW Metro', 'LW Victory', 'LW Central Kitchen', 'LW Other']
    
#     tw_ttl = sum(filtered_df[col].sum() for col in tw_food_columns if col in filtered_df.columns)
#     lw_ttl = sum(filtered_df[col].sum() for col in lw_food_columns if col in filtered_df.columns)
#     bdg_ttl = sum(budget_values[m] for m in ['Johns', 'Terra', 'Metro', 'Victory', 'Central Kitchen', 'Other'])
    
#     ttl_tw_lw_diff = ((tw_ttl - lw_ttl) / lw_ttl * 100) if lw_ttl != 0 else 0
#     ttl_tw_bdg_diff = ((tw_ttl - bdg_ttl) / bdg_ttl * 100) if bdg_ttl != 0 else 0
    
#     rows.append((
#         "TTL", 
#         f"{tw_ttl:.2f}", 
#         f"{lw_ttl:.2f}", 
#         f"{ttl_tw_lw_diff:.2f}",
#         f"{bdg_ttl:.2f}",
#         f"{ttl_tw_bdg_diff:.2f}"
#     ))
    
#     # Food Cost percentage calculations
#     tw_food_pct = tw_ttl / tw_net_sales * 100 if tw_net_sales != 0 else 0
#     lw_food_pct = lw_ttl / lw_net_sales * 100 if lw_net_sales != 0 else 0
#     bdg_food_pct = bdg_ttl / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
#     food_tw_lw_diff = tw_food_pct - lw_food_pct
#     food_tw_bdg_diff = tw_food_pct - bdg_food_pct
    
#     rows.append((
#         "Food Cost %", 
#         f"{tw_food_pct:.2f}", 
#         f"{lw_food_pct:.2f}", 
#         f"{food_tw_lw_diff:.2f}",
#         f"{bdg_food_pct:.2f}",
#         f"{food_tw_bdg_diff:.2f}"
#     ))
    
#     # Prime Cost $ calculations
#     tw_prime = tw_lbr_pay + tw_ttl
#     lw_prime = lw_lbr_pay + lw_ttl
#     bdg_prime = bdg_lbr_pay + bdg_ttl
    
#     prime_tw_lw_diff = ((tw_prime - lw_prime) / lw_prime * 100) if lw_prime != 0 else 0
#     prime_tw_bdg_diff = ((tw_prime - bdg_prime) / bdg_prime * 100) if bdg_prime != 0 else 0
    
#     rows.append((
#         "Prime Cost $", 
#         f"{tw_prime:.2f}", 
#         f"{lw_prime:.2f}", 
#         f"{prime_tw_lw_diff:.2f}",
#         f"{bdg_prime:.2f}",
#         f"{prime_tw_bdg_diff:.2f}"
#     ))
    
#     # Prime Cost % calculations
#     tw_prime_pct = tw_prime / tw_net_sales * 100 if tw_net_sales != 0 else 0
#     lw_prime_pct = lw_prime / lw_net_sales * 100 if lw_net_sales != 0 else 0
#     bdg_prime_pct = bdg_prime / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
#     prime_pct_tw_lw_diff = tw_prime_pct - lw_prime_pct
#     prime_pct_tw_bdg_diff = tw_prime_pct - bdg_prime_pct
    
#     rows.append((
#         "Prime Cost %", 
#         f"{tw_prime_pct:.2f}", 
#         f"{lw_prime_pct:.2f}", 
#         f"{prime_pct_tw_lw_diff:.2f}",
#         f"{bdg_prime_pct:.2f}",
#         f"{prime_pct_tw_bdg_diff:.2f}"
#     ))
    
#     # Calculate Avg Ticket values
#     tw_orders = filtered_df['Tw Orders'].sum() if 'Tw Orders' in filtered_df.columns else 0
#     lw_orders = filtered_df['Lw Orders'].sum() if 'Lw Orders' in filtered_df.columns else 0
    
#     tw_avg_ticket = tw_net_sales / tw_orders if tw_orders != 0 else 0
#     lw_avg_ticket = lw_net_sales / lw_orders if lw_orders != 0 else 0
#     bdg_avg_ticket = bdg_net_sales / budget_values['Orders'] if budget_values['Orders'] != 0 else 0
    
#     avg_ticket_tw_lw_diff = ((tw_avg_ticket - lw_avg_ticket) / lw_avg_ticket * 100) if lw_avg_ticket != 0 else 0
#     avg_ticket_tw_bdg_diff = ((tw_avg_ticket - bdg_avg_ticket) / bdg_avg_ticket * 100) if bdg_avg_ticket != 0 else 0
    
#     # Insert the Avg Ticket row after Orders (at index 2)
#     rows.insert(2, (
#         "Avg Ticket", 
#         f"{tw_avg_ticket:.2f}", 
#         f"{lw_avg_ticket:.2f}", 
#         f"{avg_ticket_tw_lw_diff:.2f}",
#         f"{bdg_avg_ticket:.2f}",
#         f"{avg_ticket_tw_bdg_diff:.2f}"
#     ))
    
#     # Final DataFrame
#     result = pd.DataFrame(
#         rows, 
#         columns=["Metric", "This Week", "Last Week", "Tw/Lw (+/-)", "Budget", "Tw/Bdg (+/-)"]
#     )
    
#     # print( " i am here in the financials_utils.py file checking the result", result)
#     return result


def calculate_tw_lw_bdg_comparison(df, df_budget, store='All', year='All', week_range='All', start_date=None, end_date=None):
    # Clean both dataframes columns
    df.columns = df.columns.str.strip()
    df_budget.columns = df_budget.columns.str.strip()
    
    # Make copies of the dataframes
    filtered_df = df.copy()
    filtered_budget_df = df_budget.copy()
    
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = parse_date(start_date)
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]
        filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] >= start_date]

    if end_date is not None:
        if isinstance(end_date, str):
            end_date = parse_date(end_date)
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]
        filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] <= end_date]
    
    # Apply filters to main dataframe
    if store != 'All':
        if isinstance(store, list):
            filtered_df = filtered_df[filtered_df['Store'].isin(store)]
        else:
            filtered_df = filtered_df[filtered_df['Store'] == store]
            
    print("i am here in the financials_utils.py file checking the year", year, "and the store", store, filtered_df['Store'].unique(), filtered_df.head())
    # Filter by year

    if year != 'All':
        if isinstance(year, list):
            filtered_df = filtered_df[filtered_df['Year'].isin(year)]
        else:
            filtered_df = filtered_df[filtered_df['Year'] == year]
    
    # Apply filters to budget dataframe
    if store != 'All':
        if isinstance(store, list):
            filtered_budget_df = filtered_budget_df[filtered_budget_df['Store'].isin(store)]
        else:
            filtered_budget_df = filtered_budget_df[filtered_budget_df['Store'] == store]
    
    if year != 'All':
        if isinstance(year, list):
            filtered_budget_df = filtered_budget_df[filtered_budget_df['Year'].isin(year)]
        else:
            filtered_budget_df = filtered_budget_df[filtered_budget_df['Year'] == year]
    
    # Clean function
    def clean_currency(df, col):
        return pd.to_numeric(
            df[col].astype(str).str.replace(r'[\$,]', '', regex=True),
            errors='coerce'
        ).fillna(0)
    
    # Define matching columns - UPDATED COLUMN NAMES (LPMH removed since we'll calculate it)
    metrics = {
        'Net_Sales': ('Tw_Sales', 'Lw_Sales', 'Net_Sales'),
        'Orders': ('Tw_Orders', 'Lw_Orders', 'Orders'),
        'Lbr_hrs': ('Tw_Labor_Hrs', 'Lw_Labor_Hrs', 'LB_Hours'),
        'Lbr_Pay': ('Tw_Reg_Pay', 'Lw_Reg_Pay', 'Labor_Cost'),
        'Johns': ('TW_Johns', 'LW_Johns', 'Johns'),
        'Terra': ('TW_Terra', 'LW_Terra', 'Terra'),
        'Metro': ('TW_Metro', 'LW_Metro', 'Metro'),
        'Victory': ('TW_Victory', 'LW_Victory', 'Victory'),
        'Central Kitchen': ('TW_Central_Kitchen', 'LW_Central_Kitchen', 'Central Kitchen'),
        'Other': ('TW_Other', 'LW_Other', 'Other'),
    }
    
    # Process actual data columns
    for tw_col, lw_col, _ in metrics.values():
        if tw_col in filtered_df.columns:
            filtered_df[tw_col] = clean_currency(filtered_df, tw_col)
        if lw_col in filtered_df.columns:
            filtered_df[lw_col] = clean_currency(filtered_df, lw_col)
    
    # Process budget data columns from df_budget
    budget_values = {}
    for metric, (_, _, bdg_col) in metrics.items():
        if filtered_budget_df.empty:
            budget_values[metric] = 0
        else:
            budget_values[metric] = clean_currency(filtered_budget_df, bdg_col).sum() if bdg_col in filtered_budget_df.columns else 0
    
    # Calculate values
    rows = []
    for label, (tw_col, lw_col, _) in metrics.items():
        tw = filtered_df[tw_col].sum() if tw_col in filtered_df.columns else 0
        lw = filtered_df[lw_col].sum() if lw_col in filtered_df.columns else 0
        bdg = budget_values[label]
        
        tw_lw_pct = ((tw - lw) / lw * 100) if lw != 0 else 0
        tw_bdg_pct = ((tw - bdg) / bdg * 100) if bdg != 0 else 0
        
        rows.append((
            label, 
            f"{tw:.2f}", 
            f"{lw:.2f}", 
            f"{tw_lw_pct:.2f}",
            f"{bdg:.2f}",
            f"{tw_bdg_pct:.2f}"
        ))
    
    # Calculate SPMH (Sales Per Man Hour) = Net Sales / Labor Hours
    tw_sales = filtered_df['Tw_Sales'].sum() if 'Tw_Sales' in filtered_df.columns else 0
    lw_sales = filtered_df['Lw_Sales'].sum() if 'Lw_Sales' in filtered_df.columns else 0
    tw_labor_hrs = filtered_df['Tw_Labor_Hrs'].sum() if 'Tw_Labor_Hrs' in filtered_df.columns else 0
    lw_labor_hrs = filtered_df['Lw_Labor_Hrs'].sum() if 'Lw_Labor_Hrs' in filtered_df.columns else 0
    
    bdg_sales = budget_values['Net_Sales']
    bdg_labor_hrs = budget_values['Lbr_hrs']

    tw_spmh = tw_sales / tw_labor_hrs if tw_labor_hrs != 0 else 0
    lw_spmh = lw_sales / lw_labor_hrs if lw_labor_hrs != 0 else 0
    bdg_spmh = bdg_sales / bdg_labor_hrs if bdg_labor_hrs != 0 else 0
    
    spmh_tw_lw_pct = ((tw_spmh - lw_spmh) / lw_spmh * 100) if lw_spmh != 0 else 0
    spmh_tw_bdg_pct = ((tw_spmh - bdg_spmh) / bdg_spmh * 100) if bdg_spmh != 0 else 0
    
    # Insert SPMH row after Lbr Pay (at index 4)
    rows.insert(4, (
        "SPMH", 
        f"{tw_spmh:.2f}", 
        f"{lw_spmh:.2f}", 
        f"{spmh_tw_lw_pct:.2f}",
        f"{bdg_spmh:.2f}",
        f"{spmh_tw_bdg_pct:.2f}"
    ))
    
    # Calculate LPMH (Labor Pay Per Man Hour) = Lbr Pay / Lbr Hrs
    tw_lbr_pay = filtered_df['Tw_Reg_Pay'].sum() if 'Tw_Reg_Pay' in filtered_df.columns else 0
    lw_lbr_pay = filtered_df['Lw_Reg_Pay'].sum() if 'Lw_Reg_Pay' in filtered_df.columns else 0
    bdg_lbr_pay = budget_values['Lbr_Pay']

    tw_lpmh = tw_lbr_pay / tw_labor_hrs if tw_labor_hrs != 0 else 0
    lw_lpmh = lw_lbr_pay / lw_labor_hrs if lw_labor_hrs != 0 else 0
    bdg_lpmh = bdg_lbr_pay / bdg_labor_hrs if bdg_labor_hrs != 0 else 0
    
    lpmh_tw_lw_pct = ((tw_lpmh - lw_lpmh) / lw_lpmh * 100) if lw_lpmh != 0 else 0
    lpmh_tw_bdg_pct = ((tw_lpmh - bdg_lpmh) / bdg_lpmh * 100) if bdg_lpmh != 0 else 0
    
    # Insert LPMH row after SPMH (at index 5)
    rows.insert(5, (
        "LPMH", 
        f"{tw_lpmh:.2f}", 
        f"{lw_lpmh:.2f}", 
        f"{lpmh_tw_lw_pct:.2f}",
        f"{bdg_lpmh:.2f}",
        f"{lpmh_tw_bdg_pct:.2f}"
    ))
    
    # Additional Calculations
    tw_net_sales = filtered_df['Tw_Sales'].sum() if 'Tw_Sales' in filtered_df.columns else 0
    lw_net_sales = filtered_df['Lw_Sales'].sum() if 'Lw_Sales' in filtered_df.columns else 0
    bdg_net_sales = budget_values['Net_Sales']

    # Labor percentage calculations
    tw_lbr_pct = tw_lbr_pay / tw_net_sales * 100 if tw_net_sales != 0 else 0
    lw_lbr_pct = lw_lbr_pay / lw_net_sales * 100 if lw_net_sales != 0 else 0
    bdg_lbr_pct = bdg_lbr_pay / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
    lbr_tw_lw_diff = tw_lbr_pct - lw_lbr_pct
    lbr_tw_bdg_diff = tw_lbr_pct - bdg_lbr_pct
    
    rows.insert(6, (  # Updated index due to SPMH and LPMH insertions
        "Lbr %", 
        f"{tw_lbr_pct:.2f}", 
        f"{lw_lbr_pct:.2f}", 
        f"{lbr_tw_lw_diff:.2f}",
        f"{bdg_lbr_pct:.2f}",
        f"{lbr_tw_bdg_diff:.2f}"
    ))
    
    # TTL calculations - UPDATED COLUMN NAMES
    tw_food_columns = ['TW_Johns', 'TW_Terra', 'TW_Metro', 'TW_Victory', 'TW_Central_Kitchen', 'TW_Other']
    lw_food_columns = ['LW_Johns', 'LW_Terra', 'LW_Metro', 'LW_Victory', 'LW_Central_Kitchen', 'LW_Other']

    tw_ttl = sum(filtered_df[col].sum() for col in tw_food_columns if col in filtered_df.columns)
    lw_ttl = sum(filtered_df[col].sum() for col in lw_food_columns if col in filtered_df.columns)
    bdg_ttl = sum(budget_values[m] for m in ['Johns', 'Terra', 'Metro', 'Victory', 'Central Kitchen', 'Other'])
    
    ttl_tw_lw_diff = ((tw_ttl - lw_ttl) / lw_ttl * 100) if lw_ttl != 0 else 0
    ttl_tw_bdg_diff = ((tw_ttl - bdg_ttl) / bdg_ttl * 100) if bdg_ttl != 0 else 0
    
    rows.append((
        "TTL", 
        f"{tw_ttl:.2f}", 
        f"{lw_ttl:.2f}", 
        f"{ttl_tw_lw_diff:.2f}",
        f"{bdg_ttl:.2f}",
        f"{ttl_tw_bdg_diff:.2f}"
    ))
    
    # Food Cost percentage calculations
    tw_food_pct = tw_ttl / tw_net_sales * 100 if tw_net_sales != 0 else 0
    lw_food_pct = lw_ttl / lw_net_sales * 100 if lw_net_sales != 0 else 0
    bdg_food_pct = bdg_ttl / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
    food_tw_lw_diff = tw_food_pct - lw_food_pct
    food_tw_bdg_diff = tw_food_pct - bdg_food_pct
    
    rows.append((
        "Food Cost %", 
        f"{tw_food_pct:.2f}", 
        f"{lw_food_pct:.2f}", 
        f"{food_tw_lw_diff:.2f}",
        f"{bdg_food_pct:.2f}",
        f"{food_tw_bdg_diff:.2f}"
    ))
    
    # Prime Cost $ calculations
    tw_prime = tw_lbr_pay + tw_ttl
    lw_prime = lw_lbr_pay + lw_ttl
    bdg_prime = bdg_lbr_pay + bdg_ttl
    
    prime_tw_lw_diff = ((tw_prime - lw_prime) / lw_prime * 100) if lw_prime != 0 else 0
    prime_tw_bdg_diff = ((tw_prime - bdg_prime) / bdg_prime * 100) if bdg_prime != 0 else 0
    
    rows.append((
        "Prime Cost $", 
        f"{tw_prime:.2f}", 
        f"{lw_prime:.2f}", 
        f"{prime_tw_lw_diff:.2f}",
        f"{bdg_prime:.2f}",
        f"{prime_tw_bdg_diff:.2f}"
    ))
    
    # Prime Cost % calculations
    tw_prime_pct = tw_prime / tw_net_sales * 100 if tw_net_sales != 0 else 0
    lw_prime_pct = lw_prime / lw_net_sales * 100 if lw_net_sales != 0 else 0
    bdg_prime_pct = bdg_prime / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
    prime_pct_tw_lw_diff = tw_prime_pct - lw_prime_pct
    prime_pct_tw_bdg_diff = tw_prime_pct - bdg_prime_pct
    
    rows.append((
        "Prime Cost %", 
        f"{tw_prime_pct:.2f}", 
        f"{lw_prime_pct:.2f}", 
        f"{prime_pct_tw_lw_diff:.2f}",
        f"{bdg_prime_pct:.2f}",
        f"{prime_pct_tw_bdg_diff:.2f}"
    ))
    
    # Calculate Avg Ticket values
    tw_orders = filtered_df['Tw_Orders'].sum() if 'Tw_Orders' in filtered_df.columns else 0
    lw_orders = filtered_df['Lw_Orders'].sum() if 'Lw_Orders' in filtered_df.columns else 0

    tw_avg_ticket = tw_net_sales / tw_orders if tw_orders != 0 else 0
    lw_avg_ticket = lw_net_sales / lw_orders if lw_orders != 0 else 0
    bdg_avg_ticket = bdg_net_sales / budget_values['Orders'] if budget_values['Orders'] != 0 else 0
    
    avg_ticket_tw_lw_diff = ((tw_avg_ticket - lw_avg_ticket) / lw_avg_ticket * 100) if lw_avg_ticket != 0 else 0
    avg_ticket_tw_bdg_diff = ((tw_avg_ticket - bdg_avg_ticket) / bdg_avg_ticket * 100) if bdg_avg_ticket != 0 else 0
    
    # Insert the Avg Ticket row after Orders (at index 2)
    rows.insert(2, (
        "Avg Ticket", 
        f"{tw_avg_ticket:.2f}", 
        f"{lw_avg_ticket:.2f}", 
        f"{avg_ticket_tw_lw_diff:.2f}",
        f"{bdg_avg_ticket:.2f}",
        f"{avg_ticket_tw_bdg_diff:.2f}"
    ))
    
    # Final DataFrame
    result = pd.DataFrame(
        rows, 
        columns=["Metric", "This Week", "Last Week", "Tw/Lw (+/-)", "Budget", "Tw/Bdg (+/-)"]
    )
    
    result['Metric'] = result['Metric'].str.replace('_', ' ')

    # print(" i am here in the financials_utils.py file checking the result", result)
    return result

