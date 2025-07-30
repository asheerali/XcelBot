import pandas as pd
import numpy as np
from datetime import datetime, timedelta

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


    df_copy = df.copy()

    df_copy.rename (columns={
            'Helper_1': 'Helper 1',
            'Tw_Sales':'Tw Sales',
            'Lw_Sales':'Lw Sales',
            'Ly_Sales':'Ly Sales',
            'Tw_Orders':'Tw Orders',
            'Lw_Orders':'Lw Orders',
            'Ly_Orders':'Ly Orders',
            'Tw_Avg_Tckt':'Tw Avg Tckt',
            'Lw_Avg_Tckt':'Lw Avg Tckt', 
            'Ly_Avg_Tckt':'Ly Avg Tckt'
            }, inplace = True )

    # sales_table
    # Clean column names
    df_copy.columns = df_copy.columns.str.strip()
    
        # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])

    # Convert date strings to pandas datetime objects (not .date() objects)
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)

    # print("i am here in the financial utils_ printing the start date and end date", start_date, end_date, "store", store, "df_copy", df_copy.columns    )

    df = df_copy.copy()
        
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
    sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
    df[sales_cols] = df[sales_cols].fillna(0)

    # Remove $ and , and convert to float
    for col in sales_cols:
        df[col] = df[col].astype(str).str.replace(r'[\$,]', '', regex=True)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Group by Helper 1
    grouped = df.groupby('Helper 1')[sales_cols].sum().reset_index()

    # # Calculate percentage differences and round to 2 decimal places
    # grouped['Tw/Lw (+/-)'] = (((grouped['Tw Sales'] - grouped['Lw Sales']) / grouped['Lw Sales'].replace(0, pd.NA)) * 100).round(2)
    # grouped['Tw/Ly (+/-)'] = (((grouped['Tw Sales'] - grouped['Ly Sales']) / grouped['Ly Sales'].replace(0, pd.NA)) * 100).round(2)

    grouped['Tw/Lw (+/-)'] = np.where(
        grouped['Lw Sales'] == 0,
        0.0,
        ((grouped['Tw Sales'] - grouped['Lw Sales']) / grouped['Lw Sales']) * 100
    ).round(2)

    grouped['Tw/Ly (+/-)'] = np.where(
        grouped['Ly Sales'] == 0,
        0.0,
        ((grouped['Tw Sales'] - grouped['Ly Sales']) / grouped['Ly Sales']) * 100
    ).round(2)

    # Grand total values
    total_tw = df['Tw Sales'].sum()
    total_lw = df['Lw Sales'].sum()
    total_ly = df['Ly Sales'].sum()
    tw_lw_diff = round((total_tw - total_lw) / total_lw * 100, 2) if total_lw != 0 else 0.00
    tw_ly_diff = round((total_tw - total_ly) / total_ly * 100, 2) if total_ly != 0 else 0.00

    # Grand total row (all floats)
    grand_total = pd.DataFrame([{
        'Helper 1': 'Grand Total',
        'Tw Sales': round(total_tw, 2),
        'Lw Sales': round(total_lw, 2),
        'Ly Sales': round(total_ly, 2),
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
    sales_table = sales_table[sales_table['Helper 1'].isin(expected_days)]
    sales_table['Helper 1'] = pd.Categorical(sales_table['Helper 1'], categories=expected_days, ordered=True)
    sales_table = sales_table.sort_values('Helper 1').reset_index(drop=True)

    # Rename column
    sales_table = sales_table.rename(columns={'Helper 1': 'Day of the Week'})
    # print("sales_table", sales_table)
    cols_to_round = ['Tw Sales', 'Lw Sales', 'Ly Sales', 'Tw/Lw (+/-)', 'Tw/Ly (+/-)']
    sales_table[cols_to_round] = sales_table[cols_to_round].astype(float).round(2)


    # orders_table
    # Define order-related columns
    order_cols = ['Tw Orders', 'Lw Orders', 'Ly Orders']
    df[order_cols] = df[order_cols].fillna(0)

    # Remove commas and convert to float
    for col in order_cols:
        df[col] = df[col].astype(str).str.replace(',', '', regex=False)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Group by 'Helper 1'
    grouped_orders = df.groupby('Helper 1')[order_cols].sum().reset_index()

    # # Calculate percentage differences
    # grouped_orders['Tw/Lw (+/-)'] = (((grouped_orders['Tw Orders'] - grouped_orders['Lw Orders']) / grouped_orders['Lw Orders'].replace(0, pd.NA)) * 100).round(2)
    # grouped_orders['Tw/Ly (+/-)'] = (((grouped_orders['Tw Orders'] - grouped_orders['Ly Orders']) / grouped_orders['Ly Orders'].replace(0, pd.NA)) * 100).round(2)


    grouped_orders['Tw/Lw (+/-)'] = np.where(
        grouped_orders['Lw Orders'] == 0,
        0.0,
        ((grouped_orders['Tw Orders'] - grouped_orders['Lw Orders']) / grouped_orders['Lw Orders']) * 100
    ).round(2)

    grouped_orders['Tw/Ly (+/-)'] = np.where(
        grouped_orders['Ly Orders'] == 0,
        0.0,
        ((grouped_orders['Tw Orders'] - grouped_orders['Ly Orders']) / grouped_orders['Ly Orders']) * 100
    ).round(2)

    # Grand total values
    total_tw_orders = df['Tw Orders'].sum()
    total_lw_orders = df['Lw Orders'].sum()
    total_ly_orders = df['Ly Orders'].sum()
    tw_lw_orders_diff = round((total_tw_orders - total_lw_orders) / total_lw_orders * 100, 2) if total_lw_orders != 0 else 0.00
    tw_ly_orders_diff = round((total_tw_orders - total_ly_orders) / total_ly_orders * 100, 2) if total_ly_orders != 0 else 0.00

    # Grand total row
    grand_total_orders = pd.DataFrame([{
        'Helper 1': 'Grand Total',
        'Tw Orders': round(total_tw_orders, 2),
        'Lw Orders': round(total_lw_orders, 2),
        'Ly Orders': round(total_ly_orders, 2),
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
    orders_table = orders_table[orders_table['Helper 1'].isin(expected_days)]
    orders_table['Helper 1'] = pd.Categorical(orders_table['Helper 1'], categories=expected_days, ordered=True)
    orders_table = orders_table.sort_values('Helper 1').reset_index(drop=True)

    # Rename column
    orders_table = orders_table.rename(columns={'Helper 1': 'Day of The Week'})
    cols_to_round = ['Tw Orders', 'Lw Orders', 'Ly Orders', 'Tw/Lw (+/-)', 'Tw/Ly (+/-)']
    orders_table[cols_to_round] = orders_table[cols_to_round].astype(float).round(2)

    
    
    
    # avg_ticket_table
    # Ticket columns (though named 'Avg', treat them as total amounts to be summed)
    ticket_cols = ['Tw Avg Tckt', 'Lw Avg Tckt', 'Ly Avg Tckt']
    df[ticket_cols] = df[ticket_cols].fillna(0)

    # Clean $, commas and convert to float
    for col in ticket_cols:
        df[col] = df[col].astype(str).str.replace(r'[\$,]', '', regex=True)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Group by 'Helper 1' and sum (not average)
    grouped_tckt = df.groupby('Helper 1')[ticket_cols].sum().reset_index()

    # # Calculate % differences
    # grouped_tckt['Tw/Lw (+/-)'] = (((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Lw Avg Tckt']) / grouped_tckt['Lw Avg Tckt'].replace(0, pd.NA)) * 100).round(2)
    # grouped_tckt['Tw/Ly (+/-)'] = (((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Ly Avg Tckt']) / grouped_tckt['Ly Avg Tckt'].replace(0, pd.NA)) * 100).round(2)


    grouped_tckt['Tw/Lw (+/-)'] = np.where(
        grouped_tckt['Lw Avg Tckt'] == 0,
        0.0,
        ((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Lw Avg Tckt']) / grouped_tckt['Lw Avg Tckt']) * 100
    ).round(2)

    grouped_tckt['Tw/Ly (+/-)'] = np.where(
        grouped_tckt['Ly Avg Tckt'] == 0,
        0.0,
        ((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Ly Avg Tckt']) / grouped_tckt['Ly Avg Tckt']) * 100
    ).round(2)

    # Grand total values (averaged)
    tw_avg = round(df['Tw Avg Tckt'].mean(), 2)
    lw_avg = round(df['Lw Avg Tckt'].mean(), 2)
    ly_avg = round(df['Ly Avg Tckt'].mean(), 2)

    tw_lw_diff = round((tw_avg - lw_avg) / lw_avg * 100, 2) if lw_avg != 0 else 0.00
    tw_ly_diff = round((tw_avg - ly_avg) / ly_avg * 100, 2) if ly_avg != 0 else 0.00

    # Grand total row
    grand_total = pd.DataFrame([{
        'Helper 1': 'Grand Total',
        'Tw Avg Tckt': tw_avg,
        'Lw Avg Tckt': lw_avg,
        'Ly Avg Tckt': ly_avg,
        'Tw/Lw (+/-)': tw_lw_diff,
        'Tw/Ly (+/-)': tw_ly_diff
    }])


    # Combine and finalize
    avg_ticket_table = pd.concat([grouped_tckt, grand_total], ignore_index=True)
    avg_ticket_table = avg_ticket_table[avg_ticket_table['Helper 1'].isin(expected_days)]
    avg_ticket_table['Helper 1'] = pd.Categorical(avg_ticket_table['Helper 1'], categories=expected_days, ordered=True)
    avg_ticket_table = avg_ticket_table.sort_values('Helper 1').reset_index(drop=True)
    avg_ticket_table = avg_ticket_table.rename(columns={'Helper 1': 'Day of The Week'})
    # Round all numeric columns to 2 decimal places
    cols_to_round = ['Tw Avg Tckt', 'Lw Avg Tckt', 'Ly Avg Tckt', 'Tw/Lw (+/-)', 'Tw/Ly (+/-)']
    # avg_ticket_table[cols_to_round] = avg_ticket_table[cols_to_round].round(2)
    avg_ticket_table[cols_to_round] = avg_ticket_table[cols_to_round].astype(float).round(2)
    
    

    tw_sales_grand_total =sales_table.loc[sales_table["Day of the Week"] == "Grand Total", "Tw Sales"].values[0]
    lw_sales_grand_total =sales_table.loc[sales_table["Day of the Week"] == "Grand Total", "Lw Sales"].values[0]
    ly_sales_grand_total =sales_table.loc[sales_table["Day of the Week"] == "Grand Total", "Ly Sales"].values[0]

    tw_orders_grand_total =orders_table.loc[orders_table["Day of The Week"] == "Grand Total", "Tw Orders"].values[0]
    lw_orders_grand_total =orders_table.loc[orders_table["Day of The Week"] == "Grand Total", "Lw Orders"].values[0]
    ly_orders_grand_total =orders_table.loc[orders_table["Day of The Week"] == "Grand Total", "Ly Orders"].values[0]

    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Tw Avg Tckt"] = tw_sales_grand_total / tw_orders_grand_total
    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Lw Avg Tckt"] = lw_sales_grand_total / lw_orders_grand_total
    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Ly Avg Tckt"] = ly_sales_grand_total / ly_orders_grand_total

    tw_avg_tckt_grand_total = avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total","Tw Avg Tckt"].values[0]
    lw_avg_tckt_grand_total = avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total","Lw Avg Tckt"].values[0]
    ly_avg_tckt_grand_total = avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total","Ly Avg Tckt"].values[0]

    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Tw/Lw (+/-)"] = ((tw_avg_tckt_grand_total - lw_avg_tckt_grand_total) / lw_avg_tckt_grand_total * 100).round(2)
    avg_ticket_table.loc[avg_ticket_table["Day of The Week"] == "Grand Total", "Tw/Ly (+/-)"] = ((tw_avg_tckt_grand_total - ly_avg_tckt_grand_total) / ly_avg_tckt_grand_total * 100).round(2)
        
    return sales_table, orders_table, avg_ticket_table



def calculate_tw_lw_bdg_comparison(df, df_budget, store='All', year='All', week_range='All', start_date=None, end_date=None):
    # Clean both dataframes columns
    

            
    df.columns = df.columns.str.strip()
    df_budget.columns = df_budget.columns.str.strip()
    
    # Make copies of the dataframes
    filtered_df = df.copy()
    filtered_budget_df = df_budget.copy()

    # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])

    # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(filtered_budget_df['Date']):
        filtered_budget_df['Date'] = pd.to_datetime(filtered_budget_df['Date'])

    # Convert date strings to pandas datetime objects (not .date() objects)
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
    
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
            
    # print("i am here in the financials_utils.py file checking the year", year, "and the store", store, filtered_df['Store'].unique(), filtered_df.head())
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


def weekly_sales_trend(df, df_budget, store='All', start_date=None, end_date=None):
    """
    Generate a weekly sales trend table showing sales by day of the week
    comparing This Week, Last Week, Last Year, L4wt (Last 4 weeks trend), and Budget
    
    Parameters:
    df: Main dataframe with sales data
    df_budget: Budget dataframe
    store: Store filter ('All' or specific store(s))
    start_date: Start date filter
    end_date: End date filter
    
    Returns:
    DataFrame with columns: Day, This Week, Last Week, Last Year, L4wt, Bdg
    """
    

    # Make copies and clean column names
    df_copy = df.copy()
    budget_copy = df_budget.copy()
    
    df_copy.columns = df_copy.columns.str.strip()
    budget_copy.columns = budget_copy.columns.str.strip()
    
    # Rename columns for consistency
    df_copy.rename(columns={
        'Helper_1': 'Helper 1',
        'Tw_Sales': 'Tw Sales',
        'Lw_Sales': 'Lw Sales',
        'Ly_Sales': 'Ly Sales',
        'Helper_4': 'Helper 4'
    }, inplace=True)
    
    # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])
    
    if not pd.api.types.is_datetime64_any_dtype(budget_copy['Date']):
        budget_copy['Date'] = pd.to_datetime(budget_copy['Date'])
    
    # Convert date filters to pandas datetime
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
    
    # Apply date filters
    if start_date is not None:
        df_copy = df_copy[df_copy['Date'] >= start_date]
        budget_copy = budget_copy[budget_copy['Date'] >= start_date]
    
    if end_date is not None:
        df_copy = df_copy[df_copy['Date'] <= end_date]
        budget_copy = budget_copy[budget_copy['Date'] <= end_date]
    
    # Apply store filter
    if store != 'All':
        if isinstance(store, list):
            df_copy = df_copy[df_copy['Store'].isin(store)]
            budget_copy = budget_copy[budget_copy['Store'].isin(store)]
        else:
            df_copy = df_copy[df_copy['Store'] == store]
            budget_copy = budget_copy[budget_copy['Store'] == store]
    
    # Helper function to clean currency values
    def clean_currency(series):
        return pd.to_numeric(
            series.astype(str).str.replace(r'[\$,]', '', regex=True),
            errors='coerce'
        ).fillna(0)
    
    # Clean sales columns
    sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
    for col in sales_cols:
        if col in df_copy.columns:
            df_copy[col] = clean_currency(df_copy[col])
    
    # Clean budget sales column
    if 'Net Sales' in budget_copy.columns:
        budget_copy['Net Sales'] = clean_currency(budget_copy['Net Sales'])
    elif 'Sales' in budget_copy.columns:
        budget_copy['Sales'] = clean_currency(budget_copy['Sales'])
    
    # Group by day of week for main data
    if 'Helper 1' in df_copy.columns:
        day_col = 'Helper 1'
    elif 'Day_' in df_copy.columns:
        day_col = 'Day_'
    else:
        # Create day of week from Date if Helper columns don't exist
        df_copy['Day_'] = df_copy['Date'].dt.day_name()
        day_mapping = {
            'Monday': '1 - Monday',
            'Tuesday': '2 - Tuesday', 
            'Wednesday': '3 - Wednesday',
            'Thursday': '4 - Thursday',
            'Friday': '5 - Friday',
            'Saturday': '6 - Saturday',
            'Sunday': '7 - Sunday'
        }
        df_copy['Day_'] = df_copy['Day_'].map(day_mapping)
        day_col = 'Day_'
    
    # Define expected days in order (moved up here so it's available for L4wt calculation)
    expected_days = [
        '1 - Monday',
        '2 - Tuesday',
        '3 - Wednesday',
        '4 - Thursday',
        '5 - Friday',
        '6 - Saturday',
        '7 - Sunday'
    ]
    
    # Group by day of week and sum sales
    grouped = df_copy.groupby(day_col)[sales_cols].sum().reset_index()
    
    # Calculate L4wt (Last 4 weeks trend) - average of last 4 weeks for each day
    # Get the reference date for L4wt calculation
    if end_date is not None:
        l4wt_reference_date = end_date
    else:
        # Use current date (today) if no end_date is provided
        l4wt_reference_date = pd.Timestamp.now().normalize()  # Current date at midnight
    
    l4wt_four_weeks_ago = l4wt_reference_date - timedelta(weeks=4)
    
    # For L4wt, we need to look at the original (unfiltered by date) dataframe
    # to get historical data beyond our current date range
    df_l4wt = df.copy()  # Use original df, not the date-filtered df_copy
    df_l4wt.columns = df_l4wt.columns.str.strip()
    
    # Rename columns for consistency in L4wt dataframe
    df_l4wt.rename(columns={
        'Helper_1': 'Helper 1',
        'Tw_Sales': 'Tw Sales',
        'Lw_Sales': 'Lw Sales',
        'Ly_Sales': 'Ly Sales',
        'Helper_4': 'Helper 4'
    }, inplace=True)
    
    # Ensure Date column is datetime type for L4wt dataframe
    if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
        df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
    # Apply only store filter to L4wt data (not date filters)
    if store != 'All':
        if isinstance(store, list):
            df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
        else:
            df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
    # Clean sales columns for L4wt
    if 'Tw Sales' in df_l4wt.columns:
        df_l4wt['Tw Sales'] = clean_currency(df_l4wt['Tw Sales'])
    
    # Filter L4wt data for the 4-week window
    l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= l4wt_reference_date)]
    
    # Get the day column for L4wt
    if 'Helper 1' in df_l4wt.columns:
        l4wt_day_col = 'Helper 1'
    elif 'Day_' in df_l4wt.columns:
        l4wt_day_col = 'Day_'
    else:
        # Create day of week from Date if Helper columns don't exist
        df_l4wt['Day_'] = df_l4wt['Date'].dt.day_name()
        day_mapping = {
            'Monday': '1 - Monday',
            'Tuesday': '2 - Tuesday', 
            'Wednesday': '3 - Wednesday',
            'Thursday': '4 - Thursday',
            'Friday': '5 - Friday',
            'Saturday': '6 - Saturday',
            'Sunday': '7 - Sunday'
        }
        df_l4wt['Day_'] = df_l4wt['Day_'].map(day_mapping)
        l4wt_filtered['Day_'] = l4wt_filtered['Date'].dt.day_name().map(day_mapping)
        l4wt_day_col = 'Day_'
    
    l4wt_data = []
    for day in expected_days:
        # Get last 4 weeks of data for this specific day of week
        if l4wt_day_col in l4wt_filtered.columns:
            day_data = l4wt_filtered[l4wt_filtered[l4wt_day_col] == day]
            if len(day_data) > 0 and 'Tw Sales' in day_data.columns:
                # Average the sales for this day over the last 4 weeks
                l4wt_avg = day_data['Tw Sales'].mean()
            else:
                l4wt_avg = 0
        else:
            l4wt_avg = 0
        l4wt_data.append(l4wt_avg)
    
    # Create a dictionary mapping day to L4wt values for easy lookup
    l4wt_dict = dict(zip(expected_days, l4wt_data))
    
    # Get budget data - properly calculate from weekly budget data
    budget_by_day = {}
    if not budget_copy.empty:
        # print("=== BUDGET DEBUG INFO ===")
        # print(f"Budget dataframe shape: {budget_copy.shape}")
        # print(f"Budget columns: {budget_copy.columns.tolist()}")
        # print(f"Budget data sample:\n{budget_copy.head()}")
        # print(f"Budget date range: {budget_copy['Date'].min()} to {budget_copy['Date'].max()}")
        
        # Check for different possible budget column names
        possible_budget_cols = ['Net Sales', 'Sales', 'Net Sales ', 'Sales ', 'NET SALES', 'SALES']
        budget_col = None
        
        for col in possible_budget_cols:
            if col in budget_copy.columns:
                budget_col = col
                print(f"Found budget column: '{budget_col}'")
                break
        
        if budget_col is None:
            # Look for columns containing 'sales' or 'net'
            for col in budget_copy.columns:
                if 'sales' in col.lower() or 'net' in col.lower():
                    budget_col = col
                    print(f"Found potential budget column: '{budget_col}'")
                    break
        
        if budget_col and budget_col in budget_copy.columns:
            # print(f"Using budget column: '{budget_col}'")
            # print(f"Budget column data type: {budget_copy[budget_col].dtype}")
            # print(f"Budget column sample values:\n{budget_copy[budget_col].head()}")
            
            # Clean the budget column
            budget_copy[budget_col] = clean_currency(budget_copy[budget_col])
            # print(f"Budget column after cleaning:\n{budget_copy[budget_col].head()}")
            
            # Sum all weekly budgets in the filtered period
            total_weekly_budget = budget_copy[budget_col].sum()
            # print(f"Total weekly budget (sum of all weeks): {total_weekly_budget}")
            
            # For weekly sales trend, we need to distribute the weekly budget across days
            num_weeks = len(budget_copy)
            # print(f"Number of weeks in budget data: {num_weeks}")
            
            if num_weeks > 0 and total_weekly_budget > 0:
                # Average weekly budget
                avg_weekly_budget = total_weekly_budget / num_weeks
                # print(f"Average weekly budget: {avg_weekly_budget}")
                
                # Distribute weekly budget across 7 days
                # You can adjust these percentages based on your business patterns
                daily_distribution = {
                    '1 - Monday': 0.15,    # 15% of weekly sales typically on Monday
                    '2 - Tuesday': 0.14,   # 14% on Tuesday
                    '3 - Wednesday': 0.14, # 14% on Wednesday  
                    '4 - Thursday': 0.15,  # 15% on Thursday
                    '5 - Friday': 0.16,    # 16% on Friday
                    '6 - Saturday': 0.14,  # 14% on Saturday
                    '7 - Sunday': 0.12     # 12% on Sunday
                }
                
                # Calculate budget for each day
                for day in expected_days:
                    daily_budget = avg_weekly_budget * daily_distribution.get(day, 1/7)
                    budget_by_day[day] = daily_budget
                    # print(f"Budget for {day}: {daily_budget}")
            else:
                print("No valid budget data found or total budget is zero")
        else:
            # print("No suitable budget column found!")
            # print("Available columns with sample data:")
            for col in budget_copy.columns:
                print(f"  '{col}': {budget_copy[col].iloc[0] if len(budget_copy) > 0 else 'No data'}")
        
        # print(f"Final budget_by_day: {budget_by_day}")
        # print("=== END BUDGET DEBUG ===")
    else:
        print("Budget dataframe is empty")
    
    # Create the final result table
    result_rows = []
    for day in expected_days:
        day_data = grouped[grouped[day_col] == day]
        
        if len(day_data) > 0:
            tw_sales = day_data['Tw Sales'].iloc[0]
            lw_sales = day_data['Lw Sales'].iloc[0]
            ly_sales = day_data['Ly Sales'].iloc[0]
        else:
            tw_sales = lw_sales = ly_sales = 0
        
        # Get L4wt value for this day from our calculated dictionary
        l4wt_sales = l4wt_dict.get(day, 0)
        
        # Get budget value for this day
        bdg_sales = budget_by_day.get(day, 0)
        
        # Convert to thousands (divide by 1000) and round to 1 decimal place
        # Based on your demo data showing values like 8.4, 8.7, etc.
        result_rows.append({
            'Day': day.split(' - ')[1][:3],  # Get first 3 letters (Mon, Tue, etc.)
            'This Week': round(tw_sales / 1000, 2),
            'Last Week': round(lw_sales / 1000, 2),
            'Last Year': round(ly_sales / 1000, 2),
            'L4wt': round(l4wt_sales / 1000, 2),
            # 'Bdg': round(bdg_sales / 1000, 1)
            'Bdg': round(bdg_sales*100 , 2)
        })
    
    # Create DataFrame
    result_df = pd.DataFrame(result_rows)

    
    return result_df


# def avg_ticket_by_day(df, df_budget, store='All', start_date=None, end_date=None):
#     """
#     Generate an average ticket by day table showing average ticket values by day of the week
#     comparing This Week, Last Week, Last Year, L4wt (Last 4 weeks trend), and Budget
    
#     Parameters:
#     df: Main dataframe with sales data
#     df_budget: Budget dataframe
#     store: Store filter ('All' or specific store(s))
#     start_date: Start date filter
#     end_date: End date filter
    
#     Returns:
#     DataFrame with columns: Day, This Week, Last Week, Last Year, L4wt, Bdg
#     """
    
#     import pandas as pd
#     import numpy as np
#     from datetime import datetime, timedelta
    
#     # Make copies and clean column names
#     df_copy = df.copy()
#     budget_copy = df_budget.copy()
    
#     df_copy.columns = df_copy.columns.str.strip()
#     budget_copy.columns = budget_copy.columns.str.strip()
    
#     # Rename columns for consistency
#     df_copy.rename(columns={
#         'Helper_1': 'Helper 1',
#         'Tw_Sales': 'Tw Sales',
#         'Lw_Sales': 'Lw Sales',
#         'Ly_Sales': 'Ly Sales',
#         'Tw_Orders': 'Tw Orders',
#         'Lw_Orders': 'Lw Orders',
#         'Ly_Orders': 'Ly Orders',
#         'Tw_Avg_Tckt': 'Tw Avg Tckt',
#         'Lw_Avg_Tckt': 'Lw Avg Tckt',
#         'Ly_Avg_Tckt': 'Ly Avg Tckt',
#         'Helper_4': 'Helper 4'
#     }, inplace=True)
    
#     # Ensure Date column is datetime type
#     if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
#         df_copy['Date'] = pd.to_datetime(df_copy['Date'])
    
#     if not pd.api.types.is_datetime64_any_dtype(budget_copy['Date']):
#         budget_copy['Date'] = pd.to_datetime(budget_copy['Date'])
    
#     # Convert date filters to pandas datetime
#     if start_date is not None:
#         if isinstance(start_date, str):
#             start_date = pd.to_datetime(start_date)
    
#     if end_date is not None:
#         if isinstance(end_date, str):
#             end_date = pd.to_datetime(end_date)
    
#     # Apply date filters
#     if start_date is not None:
#         df_copy = df_copy[df_copy['Date'] >= start_date]
#         budget_copy = budget_copy[budget_copy['Date'] >= start_date]
    
#     if end_date is not None:
#         df_copy = df_copy[df_copy['Date'] <= end_date]
#         budget_copy = budget_copy[budget_copy['Date'] <= end_date]
    
#     # Apply store filter
#     if store != 'All':
#         if isinstance(store, list):
#             df_copy = df_copy[df_copy['Store'].isin(store)]
#             budget_copy = budget_copy[budget_copy['Store'].isin(store)]
#         else:
#             df_copy = df_copy[df_copy['Store'] == store]
#             budget_copy = budget_copy[budget_copy['Store'] == store]
    
#     # Helper function to clean currency values
#     def clean_currency(series):
#         return pd.to_numeric(
#             series.astype(str).str.replace(r'[\$,]', '', regex=True),
#             errors='coerce'
#         ).fillna(0)
    
#     # Clean sales and order columns
#     sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
#     order_cols = ['Tw Orders', 'Lw Orders', 'Ly Orders']
#     avg_ticket_cols = ['Tw Avg Tckt', 'Lw Avg Tckt', 'Ly Avg Tckt']
    
#     for col in sales_cols + order_cols + avg_ticket_cols:
#         if col in df_copy.columns:
#             df_copy[col] = clean_currency(df_copy[col])
    
#     # Clean budget columns
#     budget_sales_col = None
#     budget_orders_col = None
    
#     for col in ['Net Sales', 'Sales', 'Net Sales ', 'Sales ']:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_sales_col = col
#             break
    
#     for col in ['Orders', 'Order', 'Orders ', 'Order ']:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_orders_col = col
#             break
    
#     # Group by day of week for main data
#     if 'Helper 1' in df_copy.columns:
#         day_col = 'Helper 1'
#     elif 'Day_' in df_copy.columns:
#         day_col = 'Day_'
#     else:
#         # Create day of week from Date if Helper columns don't exist
#         df_copy['Day_'] = df_copy['Date'].dt.day_name()
#         day_mapping = {
#             'Monday': '1 - Monday',
#             'Tuesday': '2 - Tuesday', 
#             'Wednesday': '3 - Wednesday',
#             'Thursday': '4 - Thursday',
#             'Friday': '5 - Friday',
#             'Saturday': '6 - Saturday',
#             'Sunday': '7 - Sunday'
#         }
#         df_copy['Day_'] = df_copy['Day_'].map(day_mapping)
#         day_col = 'Day_'
    
#     # Define expected days in order
#     expected_days = [
#         '1 - Monday',
#         '2 - Tuesday',
#         '3 - Wednesday',
#         '4 - Thursday',
#         '5 - Friday',
#         '6 - Saturday',
#         '7 - Sunday'
#     ]
    
#     # Group by day of week and sum sales/orders
#     grouped = df_copy.groupby(day_col)[sales_cols + order_cols].sum().reset_index()
    
#     # Calculate average tickets for each period (Sales / Orders)
#     for period in ['Tw', 'Lw', 'Ly']:
#         sales_col = f'{period} Sales'
#         orders_col = f'{period} Orders'
#         avg_col = f'{period} Avg Ticket'
        
#         # Calculate average ticket = sales / orders
#         grouped[avg_col] = np.where(
#             grouped[orders_col] > 0,
#             grouped[sales_col] / grouped[orders_col],
#             0
#         )
    
#     # Calculate L4wt (Last 4 weeks trend) for average ticket
#     # Get the reference date for L4wt calculation
#     if end_date is not None:
#         l4wt_reference_date = end_date
#     else:
#         # Use current date (today) if no end_date is provided
#         l4wt_reference_date = pd.Timestamp.now().normalize()
    
#     l4wt_four_weeks_ago = l4wt_reference_date - timedelta(weeks=4)
    
#     # For L4wt, use original (unfiltered by date) dataframe
#     df_l4wt = df.copy()
#     df_l4wt.columns = df_l4wt.columns.str.strip()
    
#     # Rename columns for consistency in L4wt dataframe
#     df_l4wt.rename(columns={
#         'Helper_1': 'Helper 1',
#         'Tw_Sales': 'Tw Sales',
#         'Lw_Sales': 'Lw Sales',
#         'Ly_Sales': 'Ly Sales',
#         'Tw_Orders': 'Tw Orders',
#         'Lw_Orders': 'Lw Orders',
#         'Ly_Orders': 'Ly Orders',
#         'Helper_4': 'Helper 4'
#     }, inplace=True)
    
#     # Ensure Date column is datetime type for L4wt dataframe
#     if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
#         df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
#     # Apply only store filter to L4wt data (not date filters)
#     if store != 'All':
#         if isinstance(store, list):
#             df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
#         else:
#             df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
#     # Clean sales and orders columns for L4wt
#     for col in ['Tw Sales', 'Tw Orders']:
#         if col in df_l4wt.columns:
#             df_l4wt[col] = clean_currency(df_l4wt[col])
    
#     # Filter L4wt data for the 4-week window
#     l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= l4wt_reference_date)]
    
#     # Get the day column for L4wt
#     if 'Helper 1' in df_l4wt.columns:
#         l4wt_day_col = 'Helper 1'
#     elif 'Day_' in df_l4wt.columns:
#         l4wt_day_col = 'Day_'
#     else:
#         # Create day of week from Date if Helper columns don't exist
#         df_l4wt['Day_'] = df_l4wt['Date'].dt.day_name()
#         day_mapping = {
#             'Monday': '1 - Monday',
#             'Tuesday': '2 - Tuesday', 
#             'Wednesday': '3 - Wednesday',
#             'Thursday': '4 - Thursday',
#             'Friday': '5 - Friday',
#             'Saturday': '6 - Saturday',
#             'Sunday': '7 - Sunday'
#         }
#         df_l4wt['Day_'] = df_l4wt['Day_'].map(day_mapping)
#         l4wt_filtered['Day_'] = l4wt_filtered['Date'].dt.day_name().map(day_mapping)
#         l4wt_day_col = 'Day_'
    
#     # Calculate L4wt average ticket for each day
#     l4wt_data = []
#     for day in expected_days:
#         if l4wt_day_col in l4wt_filtered.columns:
#             day_data = l4wt_filtered[l4wt_filtered[l4wt_day_col] == day]
#             if len(day_data) > 0 and 'Tw Sales' in day_data.columns and 'Tw Orders' in day_data.columns:
#                 # Calculate average ticket for this day over the last 4 weeks
#                 total_sales = day_data['Tw Sales'].sum()
#                 total_orders = day_data['Tw Orders'].sum()
#                 l4wt_avg_ticket = total_sales / total_orders if total_orders > 0 else 0
#             else:
#                 l4wt_avg_ticket = 0
#         else:
#             l4wt_avg_ticket = 0
#         l4wt_data.append(l4wt_avg_ticket)
    
#     # Create a dictionary mapping day to L4wt values for easy lookup
#     l4wt_dict = dict(zip(expected_days, l4wt_data))
    
#     # Calculate budget average ticket by day
#     budget_by_day = {}
#     if not budget_copy.empty and budget_sales_col and budget_orders_col:
#         # Sum all weekly budgets in the filtered period
#         total_weekly_sales_budget = budget_copy[budget_sales_col].sum()
#         total_weekly_orders_budget = budget_copy[budget_orders_col].sum()
        
#         # Calculate overall average ticket from budget
#         budget_avg_ticket = total_weekly_sales_budget / total_weekly_orders_budget if total_weekly_orders_budget > 0 else 0
        
#         # For simplicity, use the same average ticket for all days
#         # You can adjust this if you have day-specific patterns
#         for day in expected_days:
#             budget_by_day[day] = budget_avg_ticket
    
#     # Create the final result table
#     result_rows = []
#     for day in expected_days:
#         day_data = grouped[grouped[day_col] == day]
        
#         if len(day_data) > 0:
#             tw_avg_ticket = day_data['Tw Avg Ticket'].iloc[0]
#             lw_avg_ticket = day_data['Lw Avg Ticket'].iloc[0]
#             ly_avg_ticket = day_data['Ly Avg Ticket'].iloc[0]
#         else:
#             tw_avg_ticket = lw_avg_ticket = ly_avg_ticket = 0
        
#         # Get L4wt value for this day from our calculated dictionary
#         l4wt_avg_ticket = l4wt_dict.get(day, 0)
        
#         # Get budget value for this day
#         bdg_avg_ticket = budget_by_day.get(day, 0)
        
#         # Round to 1 decimal place to match your demo data (8.4, 8.7, etc.)
#         result_rows.append({
#             'Day': day.split(' - ')[1][:3],  # Get first 3 letters (Mon, Tue, etc.)
#             'This Week': round(tw_avg_ticket, 2),
#             'Last Week': round(lw_avg_ticket, 2),
#             'Last Year': round(ly_avg_ticket, 2),
#             'L4wt': round(l4wt_avg_ticket, 2),
#             'Bdg': round(bdg_avg_ticket*100, 2)
#         })
    
#     # Create DataFrame
#     result_df = pd.DataFrame(result_rows)
    
#     return result_df


def avg_ticket_by_day(df, df_budget, store='All', start_date=None, end_date=None):
    """
    Generate an average ticket by day table showing average ticket values by day of the week
    comparing This Week, Last Week, Last Year, L4wt (Last 4 weeks trend), and Budget
    
    Parameters:
    df: Main dataframe with sales data
    df_budget: Budget dataframe
    store: Store filter ('All' or specific store(s))
    start_date: Start date filter
    end_date: End date filter
    
    Returns:
    DataFrame with columns: Day, This Week, Last Week, Last Year, L4wt, Bdg
    """
    
    import pandas as pd
    import numpy as np
    from datetime import datetime, timedelta
    
    # Make copies and clean column names
    df_copy = df.copy()
    budget_copy = df_budget.copy()
    
    df_copy.columns = df_copy.columns.str.strip()
    budget_copy.columns = budget_copy.columns.str.strip()
    
    # Rename columns for consistency
    df_copy.rename(columns={
        'Helper_1': 'Helper 1',
        'Tw_Sales': 'Tw Sales',
        'Lw_Sales': 'Lw Sales',
        'Ly_Sales': 'Ly Sales',
        'Tw_Orders': 'Tw Orders',
        'Lw_Orders': 'Lw Orders',
        'Ly_Orders': 'Ly Orders',
        'Tw_Avg_Tckt': 'Tw Avg Tckt',
        'Lw_Avg_Tckt': 'Lw Avg Tckt',
        'Ly_Avg_Tckt': 'Ly Avg Tckt',
        'Helper_4': 'Helper 4'
    }, inplace=True)
    
    # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])
    
    if not pd.api.types.is_datetime64_any_dtype(budget_copy['Date']):
        budget_copy['Date'] = pd.to_datetime(budget_copy['Date'])
    
    # Convert date filters to pandas datetime
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
    
    # Apply date filters
    if start_date is not None:
        df_copy = df_copy[df_copy['Date'] >= start_date]
        budget_copy = budget_copy[budget_copy['Date'] >= start_date]
    
    if end_date is not None:
        df_copy = df_copy[df_copy['Date'] <= end_date]
        budget_copy = budget_copy[budget_copy['Date'] <= end_date]
    
    # Apply store filter
    if store != 'All':
        if isinstance(store, list):
            df_copy = df_copy[df_copy['Store'].isin(store)]
            budget_copy = budget_copy[budget_copy['Store'].isin(store)]
        else:
            df_copy = df_copy[df_copy['Store'] == store]
            budget_copy = budget_copy[budget_copy['Store'] == store]
    
    # Helper function to clean currency values
    def clean_currency(series):
        return pd.to_numeric(
            series.astype(str).str.replace(r'[\$,]', '', regex=True),
            errors='coerce'
        ).fillna(0)
    
    # Clean sales and order columns
    sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
    order_cols = ['Tw Orders', 'Lw Orders', 'Ly Orders']
    avg_ticket_cols = ['Tw Avg Tckt', 'Lw Avg Tckt', 'Ly Avg Tckt']
    
    for col in sales_cols + order_cols + avg_ticket_cols:
        if col in df_copy.columns:
            df_copy[col] = clean_currency(df_copy[col])
    
    # Clean budget columns
    budget_sales_col = None
    budget_orders_col = None
    
    for col in ['Net Sales', 'Sales', 'Net Sales ', 'Sales ']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            budget_sales_col = col
            break
    
    for col in ['Orders', 'Order', 'Orders ', 'Order ']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            budget_orders_col = col
            break
    
    # Group by day of week for main data
    if 'Helper 1' in df_copy.columns:
        day_col = 'Helper 1'
    elif 'Day_' in df_copy.columns:
        day_col = 'Day_'
    else:
        # Create day of week from Date if Helper columns don't exist
        df_copy['Day_'] = df_copy['Date'].dt.day_name()
        day_mapping = {
            'Monday': '1 - Monday',
            'Tuesday': '2 - Tuesday', 
            'Wednesday': '3 - Wednesday',
            'Thursday': '4 - Thursday',
            'Friday': '5 - Friday',
            'Saturday': '6 - Saturday',
            'Sunday': '7 - Sunday'
        }
        df_copy['Day_'] = df_copy['Day_'].map(day_mapping)
        day_col = 'Day_'
    
    # Define expected days in order
    expected_days = [
        '1 - Monday',
        '2 - Tuesday',
        '3 - Wednesday',
        '4 - Thursday',
        '5 - Friday',
        '6 - Saturday',
        '7 - Sunday'
    ]
    
    # Group by day of week and sum sales/orders
    grouped = df_copy.groupby(day_col)[sales_cols + order_cols].sum().reset_index()
    
    # Calculate average tickets for each period (Sales / Orders)
    for period in ['Tw', 'Lw', 'Ly']:
        sales_col = f'{period} Sales'
        orders_col = f'{period} Orders'
        avg_col = f'{period} Avg Ticket'
        
        # Calculate average ticket = sales / orders
        grouped[avg_col] = np.where(
            grouped[orders_col] > 0,
            grouped[sales_col] / grouped[orders_col],
            0
        )
    
    # Calculate L4wt (Last 4 weeks trend) for average ticket
    # Get the reference date for L4wt calculation
    if end_date is not None:
        l4wt_reference_date = end_date
    else:
        # Use current date (today) if no end_date is provided
        l4wt_reference_date = pd.Timestamp.now().normalize()
    
    l4wt_four_weeks_ago = l4wt_reference_date - timedelta(weeks=4)
    
    # For L4wt, use original (unfiltered by date) dataframe
    df_l4wt = df.copy()
    df_l4wt.columns = df_l4wt.columns.str.strip()
    
    # Rename columns for consistency in L4wt dataframe
    df_l4wt.rename(columns={
        'Helper_1': 'Helper 1',
        'Tw_Sales': 'Tw Sales',
        'Lw_Sales': 'Lw Sales',
        'Ly_Sales': 'Ly Sales',
        'Tw_Orders': 'Tw Orders',
        'Lw_Orders': 'Lw Orders',
        'Ly_Orders': 'Ly Orders',
        'Helper_4': 'Helper 4'
    }, inplace=True)
    
    # Ensure Date column is datetime type for L4wt dataframe
    if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
        df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
    # Apply only store filter to L4wt data (not date filters)
    if store != 'All':
        if isinstance(store, list):
            df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
        else:
            df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
    # Clean sales and orders columns for L4wt
    for col in ['Tw Sales', 'Tw Orders']:
        if col in df_l4wt.columns:
            df_l4wt[col] = clean_currency(df_l4wt[col])
    
    # Filter L4wt data for the 4-week window
    l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= l4wt_reference_date)]
    
    # Get the day column for L4wt
    if 'Helper 1' in df_l4wt.columns:
        l4wt_day_col = 'Helper 1'
    elif 'Day_' in df_l4wt.columns:
        l4wt_day_col = 'Day_'
    else:
        # Create day of week from Date if Helper columns don't exist
        df_l4wt['Day_'] = df_l4wt['Date'].dt.day_name()
        day_mapping = {
            'Monday': '1 - Monday',
            'Tuesday': '2 - Tuesday', 
            'Wednesday': '3 - Wednesday',
            'Thursday': '4 - Thursday',
            'Friday': '5 - Friday',
            'Saturday': '6 - Saturday',
            'Sunday': '7 - Sunday'
        }
        df_l4wt['Day_'] = df_l4wt['Day_'].map(day_mapping)
        l4wt_filtered['Day_'] = l4wt_filtered['Date'].dt.day_name().map(day_mapping)
        l4wt_day_col = 'Day_'
    
    # Calculate L4wt average ticket for each day
    l4wt_data = []
    for day in expected_days:
        if l4wt_day_col in l4wt_filtered.columns:
            day_data = l4wt_filtered[l4wt_filtered[l4wt_day_col] == day]
            if len(day_data) > 0 and 'Tw Sales' in day_data.columns and 'Tw Orders' in day_data.columns:
                # Calculate average ticket for this day over the last 4 weeks
                total_sales = day_data['Tw Sales'].sum()
                total_orders = day_data['Tw Orders'].sum()
                l4wt_avg_ticket = total_sales / total_orders if total_orders > 0 else 0
            else:
                l4wt_avg_ticket = 0
        else:
            l4wt_avg_ticket = 0
        l4wt_data.append(l4wt_avg_ticket)
    
    # Create a dictionary mapping day to L4wt values for easy lookup
    l4wt_dict = dict(zip(expected_days, l4wt_data))
    
    # Get budget data - calculate average ticket by day of week
    budget_by_day = {}
    if not budget_copy.empty:
        # Check for different possible budget column names (same as sales trend)
        possible_budget_sales_cols = ['Net Sales', 'Sales', 'Net Sales ', 'Sales ', 'NET SALES', 'SALES']
        possible_budget_orders_cols = ['Orders', 'Order', 'Orders ', 'Order ']
        
        budget_sales_col = None
        budget_orders_col = None
        
        # Find sales column (same logic as your sales trend function)
        for col in possible_budget_sales_cols:
            if col in budget_copy.columns:
                budget_sales_col = col
                break
        
        if budget_sales_col is None:
            # Look for columns containing 'sales' or 'net'
            for col in budget_copy.columns:
                if 'sales' in col.lower() or 'net' in col.lower():
                    budget_sales_col = col
                    break
        
        # Find orders column
        for col in possible_budget_orders_cols:
            if col in budget_copy.columns:
                budget_orders_col = col
                break
        
        if budget_sales_col and budget_orders_col and budget_sales_col in budget_copy.columns and budget_orders_col in budget_copy.columns:
            # Clean the budget columns
            budget_copy[budget_sales_col] = clean_currency(budget_copy[budget_sales_col])
            budget_copy[budget_orders_col] = clean_currency(budget_copy[budget_orders_col])
            
            # Sum all weekly budgets in the filtered period
            total_weekly_sales_budget = budget_copy[budget_sales_col].sum()
            total_weekly_orders_budget = budget_copy[budget_orders_col].sum()
            
            num_weeks = len(budget_copy)
            
            if num_weeks > 0 and total_weekly_sales_budget > 0 and total_weekly_orders_budget > 0:
                # Calculate average weekly sales and orders
                avg_weekly_sales_budget = total_weekly_sales_budget / num_weeks
                avg_weekly_orders_budget = total_weekly_orders_budget / num_weeks
                
                # Distribute weekly budget across 7 days using the same distribution as sales
                daily_distribution = {
                    '1 - Monday': 0.15,    # 15% of weekly sales typically on Monday
                    '2 - Tuesday': 0.14,   # 14% on Tuesday
                    '3 - Wednesday': 0.14, # 14% on Wednesday  
                    '4 - Thursday': 0.15,  # 15% on Thursday
                    '5 - Friday': 0.16,    # 16% on Friday
                    '6 - Saturday': 0.14,  # 14% on Saturday
                    '7 - Sunday': 0.12     # 12% on Sunday
                }
                
                # Calculate budget average ticket for each day
                for day in expected_days:
                    daily_sales_pct = daily_distribution.get(day, 1/7)
                    daily_orders_pct = daily_distribution.get(day, 1/7)  # Assume same distribution for orders
                    
                    daily_sales_budget = avg_weekly_sales_budget * daily_sales_pct
                    daily_orders_budget = avg_weekly_orders_budget * daily_orders_pct
                    
                    # Calculate average ticket for this specific day
                    daily_avg_ticket = daily_sales_budget / daily_orders_budget if daily_orders_budget > 0 else 0
                    budget_by_day[day] = daily_avg_ticket
            else:
                print("No valid budget data found or total budget is zero")
        else:
            print(f"Budget columns not found. Sales col: {budget_sales_col}, Orders col: {budget_orders_col}")
    else:
        print("Budget dataframe is empty")
    
    # Create the final result table
    result_rows = []
    for day in expected_days:
        day_data = grouped[grouped[day_col] == day]
        
        if len(day_data) > 0:
            tw_avg_ticket = day_data['Tw Avg Ticket'].iloc[0]
            lw_avg_ticket = day_data['Lw Avg Ticket'].iloc[0]
            ly_avg_ticket = day_data['Ly Avg Ticket'].iloc[0]
        else:
            tw_avg_ticket = lw_avg_ticket = ly_avg_ticket = 0
        
        # Get L4wt value for this day from our calculated dictionary
        l4wt_avg_ticket = l4wt_dict.get(day, 0)
        
        # Get budget value for this day
        bdg_avg_ticket = budget_by_day.get(day, 0)
        
        # Round to 2 decimal places to match your sales function precision
        # For average ticket, we likely don't need the *100 scaling since it's already in the right range
        result_rows.append({
            'Day': day.split(' - ')[1][:3],  # Get first 3 letters (Mon, Tue, etc.)
            'This Week': round(tw_avg_ticket, 2),
            'Last Week': round(lw_avg_ticket, 2),
            'Last Year': round(ly_avg_ticket, 2),
            'L4wt': round(l4wt_avg_ticket, 2),
            'Bdg': round(bdg_avg_ticket *100, 2)  # No scaling needed for average ticket
        })
    
    # Create DataFrame
    result_df = pd.DataFrame(result_rows)
    
    return result_df


def kpi_vs_budget(df, df_budget, store='All', start_date=None, end_date=None):
    """
    Generate a KPI vs Budget comparison table showing key metrics
    comparing This Week, Budget, L4wt, and percentage changes
    
    Parameters:
    df: Main dataframe with sales data
    df_budget: Budget dataframe
    store: Store filter ('All' or specific store(s))
    start_date: Start date filter
    end_date: End date filter
    
    Returns:
    DataFrame with columns: Metric, This Week, Budget, L4wt, Bdg, Tw/Bdg (+/-), Percent Change
    """
    
    import pandas as pd
    import numpy as np
    from datetime import datetime, timedelta
    
    # Make copies and clean column names
    df_copy = df.copy()
    budget_copy = df_budget.copy()
    
    df_copy.columns = df_copy.columns.str.strip()
    budget_copy.columns = budget_copy.columns.str.strip()
    
    # Rename columns for consistency
    df_copy.rename(columns={
        'Helper_1': 'Helper 1',
        'Tw_Sales': 'Tw Sales',
        'Lw_Sales': 'Lw Sales',
        'Ly_Sales': 'Ly Sales',
        'Tw_Orders': 'Tw Orders',
        'Lw_Orders': 'Lw Orders',
        'Ly_Orders': 'Ly Orders',
        'TW_Johns': 'TW Johns',
        'TW_Terra': 'TW Terra',
        'TW_Metro': 'TW Metro',
        'TW_Victory': 'TW Victory',
        'TW_Central_Kitchen': 'TW Central Kitchen',
        'TW_Other': 'TW Other',
        'Helper_4': 'Helper 4'
    }, inplace=True)
    
    # Ensure Date column is datetime type
    if not pd.api.types.is_datetime64_any_dtype(df_copy['Date']):
        df_copy['Date'] = pd.to_datetime(df_copy['Date'])
    
    if not pd.api.types.is_datetime64_any_dtype(budget_copy['Date']):
        budget_copy['Date'] = pd.to_datetime(budget_copy['Date'])
    
    # Convert date filters to pandas datetime
    if start_date is not None:
        if isinstance(start_date, str):
            start_date = pd.to_datetime(start_date)
    
    if end_date is not None:
        if isinstance(end_date, str):
            end_date = pd.to_datetime(end_date)
    
    # Apply date filters
    if start_date is not None:
        df_copy = df_copy[df_copy['Date'] >= start_date]
        budget_copy = budget_copy[budget_copy['Date'] >= start_date]
    
    if end_date is not None:
        df_copy = df_copy[df_copy['Date'] <= end_date]
        budget_copy = budget_copy[budget_copy['Date'] <= end_date]
    
    # Apply store filter
    if store != 'All':
        if isinstance(store, list):
            df_copy = df_copy[df_copy['Store'].isin(store)]
            budget_copy = budget_copy[budget_copy['Store'].isin(store)]
        else:
            df_copy = df_copy[df_copy['Store'] == store]
            budget_copy = budget_copy[budget_copy['Store'] == store]
    
    # Helper function to clean currency values
    def clean_currency(series):
        return pd.to_numeric(
            series.astype(str).str.replace(r'[\$,]', '', regex=True),
            errors='coerce'
        ).fillna(0)
    
    # Clean main data columns
    sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
    order_cols = ['Tw Orders', 'Lw Orders', 'Ly Orders']
    food_cost_cols = ['TW Johns', 'TW Terra', 'TW Metro', 'TW Victory', 'TW Central Kitchen', 'TW Other']
    
    for col in sales_cols + order_cols + food_cost_cols:
        if col in df_copy.columns:
            df_copy[col] = clean_currency(df_copy[col])
    
    # Clean budget columns
    budget_sales_col = None
    budget_orders_col = None
    budget_food_cols = []
    
    # Find budget sales column
    for col in ['Net Sales', 'Sales', 'Net Sales ', 'Sales ', "Net_Sales", "net_sales"]:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            budget_sales_col = col
            break
    
    # Find budget orders column
    for col in ['Orders', 'Order', 'Orders ', 'Order ']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            budget_orders_col = col
            break
    
    # Find budget food cost columns
    food_budget_mapping = {
        'Johns': 'Johns',
        'Terra': 'Terra', 
        'Metro': 'Metro',
        'Victory': 'Victory',
        'Central Kitchen': 'Central Kitchen',
        'Other': 'Other'
    }
    
    for budget_col, _ in food_budget_mapping.items():
        if budget_col in budget_copy.columns:
            budget_copy[budget_col] = clean_currency(budget_copy[budget_col])
            budget_food_cols.append(budget_col)
    
    # Calculate L4wt (Last 4 weeks trend) values
    # Get the reference date for L4wt calculation
    if end_date is not None:
        l4wt_reference_date = end_date
    else:
        l4wt_reference_date = pd.Timestamp.now().normalize()
    
    l4wt_four_weeks_ago = l4wt_reference_date - timedelta(weeks=4)
    
    # For L4wt, use original (unfiltered by date) dataframe
    df_l4wt = df.copy()
    df_l4wt.columns = df_l4wt.columns.str.strip()
    
    # Rename columns for L4wt dataframe
    df_l4wt.rename(columns={
        'Tw_Sales': 'Tw Sales',
        'Tw_Orders': 'Tw Orders',
        'TW_Johns': 'TW Johns',
        'TW_Terra': 'TW Terra',
        'TW_Metro': 'TW Metro',
        'TW_Victory': 'TW Victory',
        'TW_Central_Kitchen': 'TW Central Kitchen',
        'TW_Other': 'TW Other'
    }, inplace=True)
    
    # Ensure Date column is datetime type for L4wt dataframe
    if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
        df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
    # Apply only store filter to L4wt data
    if store != 'All':
        if isinstance(store, list):
            df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
        else:
            df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
    # Clean L4wt columns
    for col in ['Tw Sales', 'Tw Orders'] + food_cost_cols:
        if col in df_l4wt.columns:
            df_l4wt[col] = clean_currency(df_l4wt[col])
    
    # Filter L4wt data for the 4-week window
    l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= l4wt_reference_date)]
    
    # Calculate actual values
    # This Week values
    tw_net_sales = df_copy['Tw Sales'].sum()
    tw_orders = df_copy['Tw Orders'].sum()
    tw_avg_ticket = tw_net_sales / tw_orders if tw_orders > 0 else 0
    tw_food_cost = sum(df_copy[col].sum() for col in food_cost_cols if col in df_copy.columns)
    tw_food_cost_pct = (tw_food_cost / tw_net_sales * 100) if tw_net_sales > 0 else 0
    
    # L4wt values
    l4wt_net_sales = l4wt_filtered['Tw Sales'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0  # Average over 4 weeks
    l4wt_orders = l4wt_filtered['Tw Orders'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0
    l4wt_avg_ticket = l4wt_net_sales / l4wt_orders if l4wt_orders > 0 else 0
    l4wt_food_cost = sum(l4wt_filtered[col].sum() for col in food_cost_cols if col in l4wt_filtered.columns) / 4 if not l4wt_filtered.empty else 0
    l4wt_food_cost_pct = (l4wt_food_cost / l4wt_net_sales * 100) if l4wt_net_sales > 0 else 0
    
    # Budget values
    bdg_net_sales = budget_copy[budget_sales_col].sum() if budget_sales_col else 0
    bdg_orders = budget_copy[budget_orders_col].sum() if budget_orders_col else 0
    bdg_avg_ticket = bdg_net_sales / bdg_orders if bdg_orders > 0 else 0
    bdg_food_cost = sum(budget_copy[col].sum() for col in budget_food_cols if col in budget_copy.columns)
    bdg_food_cost_pct = (bdg_food_cost / bdg_net_sales * 100) if bdg_net_sales > 0 else 0
    
    # Helper function to format numbers
    def format_number(value, is_percentage=False):
        if is_percentage:
            return f"{value:.2f}%"
        elif value >= 1000000:
            return f"{value:,.0f}"
        elif value >= 1000:
            return f"{value:,.0f}"
        else:
            return f"{value:.2f}"
    
    # Helper function to calculate percentage change with proper sign
    def calc_percentage_change(actual, budget):
        if budget == 0:
            return "0.00%"
        change = ((actual - budget) / budget) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{change:.2f}%"
    
    # # Helper function to calculate Tw/Bdg difference with proper sign
    # def calc_tw_bdg_diff(actual, budget):
    #     if budget == 0:
    #         return "0.00"
    #     diff = ((actual - budget) / budget) * 100
    #     sign = "+" if diff >= 0 else ""
    #     return f"{sign}{diff:.2f}"
    
    
    def calc_tw_bdg_diff(actual, budget):
        if budget == 0:
            return "0.00"
        
        diff = ((actual - budget) / budget) * 100
        
        # If difference is above 100%, reverse the calculation
        if abs(diff) > 100:
            # Calculate how much budget exceeds actual (reverse perspective)
            reverse_diff = ((budget - actual) / actual) * 100 if actual != 0 else 0
            sign = "-" if diff > 0 else "+"  # Flip the sign
            return f"{sign}{abs(reverse_diff):.2f}"
        else:
            sign = "+" if diff >= 0 else ""
            return f"{sign}{diff:.2f}"
    # Create result rows
    result_rows = [
        {
            'Metric': 'Net Sales',
            'This Week': format_number(tw_net_sales),
            'Budget': format_number(bdg_net_sales),
            'L4wt': format_number(l4wt_net_sales),
            'Bdg': format_number(bdg_net_sales),  # Same as Budget column for consistency
            'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_net_sales, bdg_net_sales),
            'Percent Change': calc_percentage_change(tw_net_sales, bdg_net_sales)
        },
        {
            'Metric': 'Orders',
            'This Week': format_number(tw_orders),
            'Budget': format_number(bdg_orders),
            'L4wt': format_number(l4wt_orders),
            'Bdg': format_number(bdg_orders),
            'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_orders, bdg_orders),
            'Percent Change': calc_percentage_change(tw_orders, bdg_orders)
        },
        {
            'Metric': 'Avg Ticket',
            'This Week': format_number(tw_avg_ticket),
            'Budget': format_number(bdg_avg_ticket),
            'L4wt': format_number(l4wt_avg_ticket),
            'Bdg': format_number(bdg_avg_ticket),
            'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_avg_ticket, bdg_avg_ticket),
            'Percent Change': calc_percentage_change(tw_avg_ticket, bdg_avg_ticket)
        },
        {
            'Metric': 'Food Cost %',
            'This Week': format_number(tw_food_cost_pct, is_percentage=True),
            'Budget': format_number(bdg_food_cost_pct, is_percentage=True),
            'L4wt': format_number(l4wt_food_cost_pct, is_percentage=True),
            'Bdg': format_number(bdg_food_cost_pct, is_percentage=True),
            'Tw/Bdg (+/-)': f"{calc_tw_bdg_diff(tw_food_cost_pct, bdg_food_cost_pct)}%",
            'Percent Change': calc_percentage_change(tw_food_cost_pct, bdg_food_cost_pct)
        }
    ]
    
    # Create DataFrame
    result_df = pd.DataFrame(result_rows)
    
    return result_df



