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
    
    # logic only for the this week budget, net sales 
    if 'Net_Sales' in filtered_budget_df.columns:
        budget_values['Net_Sales'] = clean_currency(filtered_budget_df, 'Net_Sales').sum()
    else:
        budget_values['Net_Sales'] = 0
        
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


# def kpi_vs_budget(df, df_budget, store='All', start_date=None, end_date=None):
#     """
#     Generate a KPI vs Budget comparison table showing key metrics
#     comparing This Week, Budget, L4wt, and percentage changes
    
#     Parameters:
#     df: Main dataframe with sales data
#     df_budget: Budget dataframe
#     store: Store filter ('All' or specific store(s))
#     start_date: Start date filter
#     end_date: End date filter
    
#     Returns:
#     DataFrame with columns: Metric, This Week, Budget, L4wt, Bdg, Tw/Bdg (+/-), Percent Change
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
#         'TW_Johns': 'TW Johns',
#         'TW_Terra': 'TW Terra',
#         'TW_Metro': 'TW Metro',
#         'TW_Victory': 'TW Victory',
#         'TW_Central_Kitchen': 'TW Central Kitchen',
#         'TW_Other': 'TW Other',
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
    
#     # Clean main data columns
#     sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
#     order_cols = ['Tw Orders', 'Lw Orders', 'Ly Orders']
#     food_cost_cols = ['TW Johns', 'TW Terra', 'TW Metro', 'TW Victory', 'TW Central Kitchen', 'TW Other']
    
#     for col in sales_cols + order_cols + food_cost_cols:
#         if col in df_copy.columns:
#             df_copy[col] = clean_currency(df_copy[col])
    
#     # Clean budget columns
#     budget_sales_col = None
#     budget_orders_col = None
#     budget_food_cols = []
    
#     # Find budget sales column
#     for col in ['Net Sales', 'Sales', 'Net Sales ', 'Sales ', "Net_Sales", "net_sales"]:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_sales_col = col
#             break
    
#     # Find budget orders column
#     for col in ['Orders', 'Order', 'Orders ', 'Order ']:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_orders_col = col
#             break
    
#     # Find budget food cost columns
#     food_budget_mapping = {
#         'Johns': 'Johns',
#         'Terra': 'Terra', 
#         'Metro': 'Metro',
#         'Victory': 'Victory',
#         'Central Kitchen': 'Central Kitchen',
#         'Other': 'Other'
#     }
    
#     for budget_col, _ in food_budget_mapping.items():
#         if budget_col in budget_copy.columns:
#             budget_copy[budget_col] = clean_currency(budget_copy[budget_col])
#             budget_food_cols.append(budget_col)
    
#     # Calculate L4wt (Last 4 weeks trend) values
#     # Get the reference date for L4wt calculation
#     if end_date is not None:
#         l4wt_reference_date = end_date
#     else:
#         l4wt_reference_date = pd.Timestamp.now().normalize()
    
#     l4wt_four_weeks_ago = l4wt_reference_date - timedelta(weeks=4)
    
#     # For L4wt, use original (unfiltered by date) dataframe
#     df_l4wt = df.copy()
#     df_l4wt.columns = df_l4wt.columns.str.strip()
    
#     # Rename columns for L4wt dataframe
#     df_l4wt.rename(columns={
#         'Tw_Sales': 'Tw Sales',
#         'Tw_Orders': 'Tw Orders',
#         'TW_Johns': 'TW Johns',
#         'TW_Terra': 'TW Terra',
#         'TW_Metro': 'TW Metro',
#         'TW_Victory': 'TW Victory',
#         'TW_Central_Kitchen': 'TW Central Kitchen',
#         'TW_Other': 'TW Other'
#     }, inplace=True)
    
#     # Ensure Date column is datetime type for L4wt dataframe
#     if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
#         df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
#     # Apply only store filter to L4wt data
#     if store != 'All':
#         if isinstance(store, list):
#             df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
#         else:
#             df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
#     # Clean L4wt columns
#     for col in ['Tw Sales', 'Tw Orders'] + food_cost_cols:
#         if col in df_l4wt.columns:
#             df_l4wt[col] = clean_currency(df_l4wt[col])
    
#     # Filter L4wt data for the 4-week window
#     l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= l4wt_reference_date)]
    
#     # Calculate actual values
#     # This Week values
#     tw_net_sales = df_copy['Tw Sales'].sum()
#     tw_orders = df_copy['Tw Orders'].sum()
#     tw_avg_ticket = tw_net_sales / tw_orders if tw_orders > 0 else 0
#     tw_food_cost = sum(df_copy[col].sum() for col in food_cost_cols if col in df_copy.columns)
#     tw_food_cost_pct = (tw_food_cost / tw_net_sales * 100) if tw_net_sales > 0 else 0
    
#     # L4wt values
#     l4wt_net_sales = l4wt_filtered['Tw Sales'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0  # Average over 4 weeks
#     l4wt_orders = l4wt_filtered['Tw Orders'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0
#     l4wt_avg_ticket = l4wt_net_sales / l4wt_orders if l4wt_orders > 0 else 0
#     l4wt_food_cost = sum(l4wt_filtered[col].sum() for col in food_cost_cols if col in l4wt_filtered.columns) / 4 if not l4wt_filtered.empty else 0
#     l4wt_food_cost_pct = (l4wt_food_cost / l4wt_net_sales * 100) if l4wt_net_sales > 0 else 0
    
#     # Budget values
#     bdg_net_sales = budget_copy[budget_sales_col].sum() if budget_sales_col else 0
#     bdg_orders = budget_copy[budget_orders_col].sum() if budget_orders_col else 0
#     bdg_avg_ticket = bdg_net_sales / bdg_orders if bdg_orders > 0 else 0
#     bdg_food_cost = sum(budget_copy[col].sum() for col in budget_food_cols if col in budget_copy.columns)
#     bdg_food_cost_pct = (bdg_food_cost / bdg_net_sales * 100) if bdg_net_sales > 0 else 0
    
#     # Helper function to format numbers
#     def format_number(value, is_percentage=False):
#         if is_percentage:
#             return f"{value:.2f}%"
#         elif value >= 1000000:
#             return f"{value:,.0f}"
#         elif value >= 1000:
#             return f"{value:,.0f}"
#         else:
#             return f"{value:.2f}"
    
#     # Helper function to calculate percentage change with proper sign
#     def calc_percentage_change(actual, budget):
#         if budget == 0:
#             return "0.00%"
#         change = ((actual - budget) / budget) * 100
#         sign = "+" if change >= 0 else ""
#         return f"{sign}{change:.2f}%"
    
#     # # Helper function to calculate Tw/Bdg difference with proper sign
#     # def calc_tw_bdg_diff(actual, budget):
#     #     if budget == 0:
#     #         return "0.00"
#     #     diff = ((actual - budget) / budget) * 100
#     #     sign = "+" if diff >= 0 else ""
#     #     return f"{sign}{diff:.2f}"
    
    
#     def calc_tw_bdg_diff(actual, budget):
#         if budget == 0:
#             return "0.00"
        
#         diff = ((actual - budget) / budget) * 100
        
#         # If difference is above 100%, reverse the calculation
#         if abs(diff) > 100:
#             # Calculate how much budget exceeds actual (reverse perspective)
#             reverse_diff = ((budget - actual) / actual) * 100 if actual != 0 else 0
#             sign = "-" if diff > 0 else "+"  # Flip the sign
#             return f"{sign}{abs(reverse_diff):.2f}"
#         else:
#             sign = "+" if diff >= 0 else ""
#             return f"{sign}{diff:.2f}"
#     # Create result rows
#     result_rows = [
#         {
#             'Metric': 'Net Sales',
#             'This Week': format_number(tw_net_sales),
#             'Budget': format_number(bdg_net_sales),
#             'L4wt': format_number(l4wt_net_sales),
#             'Bdg': format_number(bdg_net_sales),  # Same as Budget column for consistency
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_net_sales, bdg_net_sales),
#             'Percent Change': calc_percentage_change(tw_net_sales, bdg_net_sales)
#         },
#         {
#             'Metric': 'Orders',
#             'This Week': format_number(tw_orders),
#             'Budget': format_number(bdg_orders),
#             'L4wt': format_number(l4wt_orders),
#             'Bdg': format_number(bdg_orders),
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_orders, bdg_orders),
#             'Percent Change': calc_percentage_change(tw_orders, bdg_orders)
#         },
#         {
#             'Metric': 'Avg Ticket',
#             'This Week': format_number(tw_avg_ticket),
#             'Budget': format_number(bdg_avg_ticket),
#             'L4wt': format_number(l4wt_avg_ticket),
#             'Bdg': format_number(bdg_avg_ticket),
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_avg_ticket, bdg_avg_ticket),
#             'Percent Change': calc_percentage_change(tw_avg_ticket, bdg_avg_ticket)
#         },
#         {
#             'Metric': 'Food Cost %',
#             'This Week': format_number(tw_food_cost_pct, is_percentage=True),
#             'Budget': format_number(bdg_food_cost_pct, is_percentage=True),
#             'L4wt': format_number(l4wt_food_cost_pct, is_percentage=True),
#             'Bdg': format_number(bdg_food_cost_pct, is_percentage=True),
#             'Tw/Bdg (+/-)': f"{calc_tw_bdg_diff(tw_food_cost_pct, bdg_food_cost_pct)}%",
#             'Percent Change': calc_percentage_change(tw_food_cost_pct, bdg_food_cost_pct)
#         }
#     ]
    
#     # Create DataFrame
#     result_df = pd.DataFrame(result_rows)
    
#     return result_df


# def kpi_vs_budget(df, df_budget, store='All', start_date=None, end_date=None):
#     """
#     Generate a KPI vs Budget comparison table showing key metrics
#     comparing This Week, Budget, L4wt, and percentage changes
    
#     Parameters:
#     df: Main dataframe with sales data
#     df_budget: Budget dataframe
#     store: Store filter ('All' or specific store(s))
#     start_date: Start date filter
#     end_date: End date filter
    
#     Returns:
#     DataFrame with columns: Metric, This Week, Budget, L4wt, Bdg, Tw/Bdg (+/-), Percent Change
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
#         'TW_Johns': 'TW Johns',
#         'TW_Terra': 'TW Terra',
#         'TW_Metro': 'TW Metro',
#         'TW_Victory': 'TW Victory',
#         'TW_Central_Kitchen': 'TW Central Kitchen',
#         'TW_Other': 'TW Other',
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
    
#     # Determine reference date for current week calculation
#     if end_date is not None:
#         reference_date = end_date
#     else:
#         reference_date = pd.Timestamp.now().normalize()
    
#     # Calculate current week start and end dates
#     # Assuming week starts on Monday (weekday 0)
#     current_week_start = reference_date - timedelta(days=reference_date.weekday())
#     current_week_end = current_week_start + timedelta(days=6)
    
#     # Apply date filters for main data
#     if start_date is not None:
#         df_copy = df_copy[df_copy['Date'] >= start_date]
    
#     if end_date is not None:
#         df_copy = df_copy[df_copy['Date'] <= end_date]
    
#     # Filter budget data for current week only
#     budget_copy = budget_copy[
#         (budget_copy['Date'] >= current_week_start) & 
#         (budget_copy['Date'] <= current_week_end)
#     ]
    
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
    
#     # Clean main data columns
#     sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
#     order_cols = ['Tw Orders', 'Lw Orders', 'Ly Orders']
#     food_cost_cols = ['TW Johns', 'TW Terra', 'TW Metro', 'TW Victory', 'TW Central Kitchen', 'TW Other']
    
#     for col in sales_cols + order_cols + food_cost_cols:
#         if col in df_copy.columns:
#             df_copy[col] = clean_currency(df_copy[col])
    
#     # Clean budget columns
#     budget_sales_col = None
#     budget_orders_col = None
#     budget_food_cols = []
    
#     # Find budget sales column
#     for col in ['Net Sales', 'Sales', 'Net Sales ', 'Sales ', "Net_Sales", "net_sales"]:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_sales_col = col
#             break
    
#     # Find budget orders column
#     for col in ['Orders', 'Order', 'Orders ', 'Order ']:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_orders_col = col
#             break
    
#     # Find budget food cost columns
#     food_budget_mapping = {
#         'Johns': 'Johns',
#         'Terra': 'Terra', 
#         'Metro': 'Metro',
#         'Victory': 'Victory',
#         'Central Kitchen': 'Central Kitchen',
#         'Other': 'Other'
#     }
    
#     for budget_col, _ in food_budget_mapping.items():
#         if budget_col in budget_copy.columns:
#             budget_copy[budget_col] = clean_currency(budget_copy[budget_col])
#             budget_food_cols.append(budget_col)
    
#     # Calculate L4wt (Last 4 weeks trend) values
#     l4wt_four_weeks_ago = reference_date - timedelta(weeks=4)
    
#     # For L4wt, use original (unfiltered by date) dataframe
#     df_l4wt = df.copy()
#     df_l4wt.columns = df_l4wt.columns.str.strip()
    
#     # Rename columns for L4wt dataframe
#     df_l4wt.rename(columns={
#         'Tw_Sales': 'Tw Sales',
#         'Tw_Orders': 'Tw Orders',
#         'TW_Johns': 'TW Johns',
#         'TW_Terra': 'TW Terra',
#         'TW_Metro': 'TW Metro',
#         'TW_Victory': 'TW Victory',
#         'TW_Central_Kitchen': 'TW Central Kitchen',
#         'TW_Other': 'TW Other'
#     }, inplace=True)
    
#     # Ensure Date column is datetime type for L4wt dataframe
#     if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
#         df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
#     # Apply only store filter to L4wt data
#     if store != 'All':
#         if isinstance(store, list):
#             df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
#         else:
#             df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
#     # Clean L4wt columns
#     for col in ['Tw Sales', 'Tw Orders'] + food_cost_cols:
#         if col in df_l4wt.columns:
#             df_l4wt[col] = clean_currency(df_l4wt[col])
    
#     # Filter L4wt data for the 4-week window
#     l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= reference_date)]
    
#     # Calculate actual values
#     # This Week values
#     tw_net_sales = df_copy['Tw Sales'].sum()
#     tw_orders = df_copy['Tw Orders'].sum()
#     tw_avg_ticket = tw_net_sales / tw_orders if tw_orders > 0 else 0
#     tw_food_cost = sum(df_copy[col].sum() for col in food_cost_cols if col in df_copy.columns)
#     tw_food_cost_pct = (tw_food_cost / tw_net_sales * 100) if tw_net_sales > 0 else 0
    
#     # L4wt values
#     l4wt_net_sales = l4wt_filtered['Tw Sales'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0  # Average over 4 weeks
#     l4wt_orders = l4wt_filtered['Tw Orders'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0
#     l4wt_avg_ticket = l4wt_net_sales / l4wt_orders if l4wt_orders > 0 else 0
#     l4wt_food_cost = sum(l4wt_filtered[col].sum() for col in food_cost_cols if col in l4wt_filtered.columns) / 4 if not l4wt_filtered.empty else 0
#     l4wt_food_cost_pct = (l4wt_food_cost / l4wt_net_sales * 100) if l4wt_net_sales > 0 else 0
    
#     # Budget values (now filtered to current week only)
#     bdg_net_sales = budget_copy[budget_sales_col].sum() if budget_sales_col else 0
#     bdg_orders = budget_copy[budget_orders_col].sum() if budget_orders_col else 0
#     bdg_avg_ticket = bdg_net_sales / bdg_orders if bdg_orders > 0 else 0
#     bdg_food_cost = sum(budget_copy[col].sum() for col in budget_food_cols if col in budget_copy.columns)
#     bdg_food_cost_pct = (bdg_food_cost / bdg_net_sales * 100) if bdg_net_sales > 0 else 0
    
#     # Helper function to format numbers
#     def format_number(value, is_percentage=False):
#         if is_percentage:
#             return f"{value:.2f}%"
#         elif value >= 1000000:
#             return f"{value:,.0f}"
#         elif value >= 1000:
#             return f"{value:,.0f}"
#         else:
#             return f"{value:.2f}"
    
#     # Helper function to calculate percentage change with proper formula
#     def calc_percentage_change(actual, budget):
#         if budget == 0:
#             return "0.00%"
#         change = (actual - budget) / budget  # Without * 100 as per your requirement
#         sign = "+" if change >= 0 else ""
#         return f"{sign}{change:.2f}%"
    
#     # Helper function to calculate Tw/Bdg difference
#     def calc_tw_bdg_diff(actual, budget):
#         if budget == 0:
#             return "0.00"
        
#         diff = (actual - budget) / budget  # Without * 100 as per your requirement
        
#         # If difference is above 1.0 (100%), reverse the calculation
#         if abs(diff) > 1.0:
#             # Calculate how much budget exceeds actual (reverse perspective)
#             reverse_diff = (budget - actual) / actual if actual != 0 else 0
#             sign = "-" if diff > 0 else "+"  # Flip the sign
#             return f"{sign}{abs(reverse_diff):.2f}"
#         else:
#             sign = "+" if diff >= 0 else ""
#             return f"{sign}{diff:.2f}"
    
#     # Create result rows
#     result_rows = [
#         {
#             'Metric': 'Net Sales',
#             'This Week': format_number(tw_net_sales),
#             'Budget': format_number(bdg_net_sales),
#             'L4wt': format_number(l4wt_net_sales),
#             'Bdg': format_number(bdg_net_sales),  # Same as Budget column for consistency
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_net_sales, bdg_net_sales),
#             'Percent Change': calc_percentage_change(tw_net_sales, bdg_net_sales)
#         },
#         {
#             'Metric': 'Orders',
#             'This Week': format_number(tw_orders),
#             'Budget': format_number(bdg_orders),
#             'L4wt': format_number(l4wt_orders),
#             'Bdg': format_number(bdg_orders),
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_orders, bdg_orders),
#             'Percent Change': calc_percentage_change(tw_orders, bdg_orders)
#         },
#         {
#             'Metric': 'Avg Ticket',
#             'This Week': format_number(tw_avg_ticket),
#             'Budget': format_number(bdg_avg_ticket),
#             'L4wt': format_number(l4wt_avg_ticket),
#             'Bdg': format_number(bdg_avg_ticket),
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_avg_ticket, bdg_avg_ticket),
#             'Percent Change': calc_percentage_change(tw_avg_ticket, bdg_avg_ticket)
#         },
#         {
#             'Metric': 'Food Cost %',
#             'This Week': format_number(tw_food_cost_pct, is_percentage=True),
#             'Budget': format_number(bdg_food_cost_pct, is_percentage=True),
#             'L4wt': format_number(l4wt_food_cost_pct, is_percentage=True),
#             'Bdg': format_number(bdg_food_cost_pct, is_percentage=True),
#             'Tw/Bdg (+/-)': f"{calc_tw_bdg_diff(tw_food_cost_pct, bdg_food_cost_pct)}%",
#             'Percent Change': calc_percentage_change(tw_food_cost_pct, bdg_food_cost_pct)
#         }
#     ]
    
#     # Create DataFrame
#     result_df = pd.DataFrame(result_rows)
    
#     return result_df


# def kpi_vs_budget(df, df_budget, store='All', start_date=None, end_date=None):
#     """
#     Generate a KPI vs Budget comparison table showing key metrics
#     comparing This Week, Budget, L4wt, and percentage changes
    
#     Parameters:
#     df: Main dataframe with sales data
#     df_budget: Budget dataframe
#     store: Store filter ('All' or specific store(s))
#     start_date: Start date filter
#     end_date: End date filter
    
#     Returns:
#     DataFrame with columns: Metric, This Week, Budget, L4wt, Bdg, Tw/Bdg (+/-), Percent Change
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
#         'Tw_Reg_Pay': 'Tw Reg Pay',
#         'TW_Johns': 'TW Johns',
#         'TW_Terra': 'TW Terra',
#         'TW_Metro': 'TW Metro',
#         'TW_Victory': 'TW Victory',
#         'TW_Central_Kitchen': 'TW Central Kitchen',
#         'TW_Other': 'TW Other',
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
    
#     # Determine reference date for current week calculation
#     if end_date is not None:
#         reference_date = end_date
#     else:
#         reference_date = pd.Timestamp.now().normalize()
    
#     # Calculate current week start and end dates
#     # Assuming week starts on Monday (weekday 0)
#     current_week_start = reference_date - timedelta(days=reference_date.weekday())
#     current_week_end = current_week_start + timedelta(days=6)
    
#     # Apply date filters for main data
#     if start_date is not None:
#         df_copy = df_copy[df_copy['Date'] >= start_date]
    
#     if end_date is not None:
#         df_copy = df_copy[df_copy['Date'] <= end_date]
    
#     # Filter budget data for current week only
#     budget_copy = budget_copy[
#         (budget_copy['Date'] >= current_week_start) & 
#         (budget_copy['Date'] <= current_week_end)
#     ]
    
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
    
#     # Clean main data columns
#     sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
#     order_cols = ['Tw Orders', 'Lw Orders', 'Ly Orders']
#     avg_ticket_cols = ['Tw Avg Tckt']
#     food_cost_cols = ['Tw Reg Pay']  # Food Cost % comes from Tw_Reg_Pay
    
#     for col in sales_cols + order_cols + avg_ticket_cols + food_cost_cols:
#         if col in df_copy.columns:
#             df_copy[col] = clean_currency(df_copy[col])
    
#     # Clean budget columns
#     budget_sales_col = None
#     budget_orders_col = None
#     budget_food_cols = []
    
#     # Find budget sales column
#     for col in ['Net Sales', 'Sales', 'Net Sales ', 'Sales ', "Net_Sales", "net_sales"]:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_sales_col = col
#             break
    
#     # Find budget orders column
#     for col in ['Orders', 'Order', 'Orders ', 'Order ']:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_orders_col = col
#             break
    
#     # Find budget food cost column
#     budget_food_cost_col = None
#     for col in ['Food_Cost', 'Food Cost', 'food_cost', 'FOOD_COST']:
#         if col in budget_copy.columns:
#             budget_copy[col] = clean_currency(budget_copy[col])
#             budget_food_cost_col = col
#             break
    
#     # Calculate L4wt (Last 4 weeks trend) values
#     l4wt_four_weeks_ago = reference_date - timedelta(weeks=4)
    
#     # For L4wt, use original (unfiltered by date) dataframe
#     df_l4wt = df.copy()
#     df_l4wt.columns = df_l4wt.columns.str.strip()
    
#     # Rename columns for L4wt dataframe
#     df_l4wt.rename(columns={
#         'Tw_Sales': 'Tw Sales',
#         'Tw_Orders': 'Tw Orders',
#         'Tw_Avg_Tckt': 'Tw Avg Tckt',
#         'Tw_Reg_Pay': 'Tw Reg Pay'
#     }, inplace=True)
    
#     # Ensure Date column is datetime type for L4wt dataframe
#     if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
#         df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
#     # Apply only store filter to L4wt data
#     if store != 'All':
#         if isinstance(store, list):
#             df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
#         else:
#             df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
#     # Clean L4wt columns
#     for col in ['Tw Sales', 'Tw Orders', 'Tw Avg Tckt', 'Tw Reg Pay']:
#         if col in df_l4wt.columns:
#             df_l4wt[col] = clean_currency(df_l4wt[col])
    
#     # Filter L4wt data for the 4-week window
#     l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= reference_date)]
    
#     # Calculate actual values
#     # This Week values
#     tw_net_sales = df_copy['Tw Sales'].sum()
#     tw_orders = df_copy['Tw Orders'].sum()
#     tw_avg_ticket = df_copy['Tw Avg Tckt'].sum() if 'Tw Avg Tckt' in df_copy.columns else (tw_net_sales / tw_orders if tw_orders > 0 else 0)
#     tw_food_cost = df_copy['Tw Reg Pay'].sum() if 'Tw Reg Pay' in df_copy.columns else 0  # Food Cost from Tw_Reg_Pay (not as percentage)
    
#     # L4wt values
#     l4wt_net_sales = l4wt_filtered['Tw Sales'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0  # Average over 4 weeks
#     l4wt_orders = l4wt_filtered['Tw Orders'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0
#     l4wt_avg_ticket = l4wt_filtered['Tw Avg Tckt'].sum() / 4 if not l4wt_filtered.empty and 'Tw Avg Tckt' in l4wt_filtered.columns else (l4wt_net_sales / l4wt_orders if l4wt_orders > 0 else 0)
#     l4wt_food_cost = l4wt_filtered['Tw Reg Pay'].sum() / 4 if not l4wt_filtered.empty and 'Tw Reg Pay' in l4wt_filtered.columns else 0
    
#     # Budget values (now filtered to current week only)
#     bdg_net_sales = budget_copy[budget_sales_col].sum() if budget_sales_col else 0
#     bdg_orders = budget_copy[budget_orders_col].sum() if budget_orders_col else 0
#     bdg_avg_ticket = bdg_net_sales / bdg_orders if bdg_orders > 0 else 0
#     bdg_food_cost = budget_copy[budget_food_cost_col].sum() if budget_food_cost_col else 0  # Food Cost from Food_Cost column
    
#     # Helper function to format numbers
#     def format_number(value, is_currency=False):
#         if is_currency:
#             return f"${value:,.2f}"
#         elif value >= 1000000:
#             return f"{value:,.0f}"
#         elif value >= 1000:
#             return f"{value:,.0f}"
#         else:
#             return f"{value:.2f}"
    
#     # Helper function to calculate percentage change with proper formula
#     def calc_percentage_change(actual, budget):
#         if budget == 0:
#             return "0.00%"
#         change = (actual - budget) / budget  # Without * 100 as per your requirement
#         sign = "+" if change >= 0 else ""
#         return f"{sign}{change:.2f}%"
    
#     # Helper function to calculate Tw/Bdg difference
#     def calc_tw_bdg_diff(actual, budget):
#         if budget == 0:
#             return "0.00"
        
#         diff = (actual - budget) / budget  # Without * 100 as per your requirement
        
#         # If difference is above 1.0 (100%), reverse the calculation
#         if abs(diff) > 1.0:
#             # Calculate how much budget exceeds actual (reverse perspective)
#             reverse_diff = (budget - actual) / actual if actual != 0 else 0
#             sign = "-" if diff > 0 else "+"  # Flip the sign
#             return f"{sign}{abs(reverse_diff):.2f}"
#         else:
#             sign = "+" if diff >= 0 else ""
#             return f"{sign}{diff:.2f}"
    
#     # Create result rows
#     result_rows = [
#         {
#             'Metric': 'Net Sales',
#             'This Week': format_number(tw_net_sales),
#             'Budget': format_number(bdg_net_sales),
#             'L4wt': format_number(l4wt_net_sales),
#             'Bdg': format_number(bdg_net_sales),  # Same as Budget column for consistency
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_net_sales, bdg_net_sales),
#             'Percent Change': calc_percentage_change(tw_net_sales, bdg_net_sales)
#         },
#         {
#             'Metric': 'Orders',
#             'This Week': format_number(tw_orders),
#             'Budget': format_number(bdg_orders),
#             'L4wt': format_number(l4wt_orders),
#             'Bdg': format_number(bdg_orders),
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_orders, bdg_orders),
#             'Percent Change': calc_percentage_change(tw_orders, bdg_orders)
#         },
#         {
#             'Metric': 'Avg Ticket',
#             'This Week': format_number(tw_avg_ticket),
#             'Budget': format_number(bdg_avg_ticket),
#             'L4wt': format_number(l4wt_avg_ticket),
#             'Bdg': format_number(bdg_avg_ticket),
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_avg_ticket, bdg_avg_ticket),
#             'Percent Change': calc_percentage_change(tw_avg_ticket, bdg_avg_ticket)
#         },
#         {
#             'Metric': 'Food Cost',
#             'This Week': format_number(tw_food_cost, is_currency=True),
#             'Budget': format_number(bdg_food_cost, is_currency=True),
#             'L4wt': format_number(l4wt_food_cost, is_currency=True),
#             'Bdg': format_number(bdg_food_cost, is_currency=True),
#             'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_food_cost, bdg_food_cost),
#             'Percent Change': calc_percentage_change(tw_food_cost, bdg_food_cost)
#         }
#     ]
    
#     # Create DataFrame
#     result_df = pd.DataFrame(result_rows)
    
#     return result_df

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
        'Tw_Avg_Tckt': 'Tw Avg Tckt',
        'Tw_Reg_Pay': 'Tw Reg Pay',
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
    
    # Determine reference date for current week calculation
    if end_date is not None:
        reference_date = end_date
    else:
        reference_date = pd.Timestamp.now().normalize()
    
    # Calculate current week start and end dates
    # Assuming week starts on Monday (weekday 0)
    current_week_start = reference_date - timedelta(days=reference_date.weekday())
    current_week_end = current_week_start + timedelta(days=6)
    
    # Apply date filters for main data
    if start_date is not None:
        df_copy = df_copy[df_copy['Date'] >= start_date]
    
    if end_date is not None:
        df_copy = df_copy[df_copy['Date'] <= end_date]
    
    # Filter budget data for current week only
    budget_copy = budget_copy[
        (budget_copy['Date'] >= current_week_start) & 
        (budget_copy['Date'] <= current_week_end)
    ]
    
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
    avg_ticket_cols = ['Tw Avg Tckt']
    food_cost_cols = ['Tw Reg Pay']  # Food Cost % comes from Tw_Reg_Pay
    
    for col in sales_cols + order_cols + avg_ticket_cols + food_cost_cols:
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
    
    # Find budget food cost column
    budget_food_cost_col = None
    for col in ['Food_Cost', 'Food Cost', 'food_cost', 'FOOD_COST']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            budget_food_cost_col = col
            break
    
    # Calculate L4wt (Last 4 weeks trend) values
    l4wt_four_weeks_ago = reference_date - timedelta(weeks=4)
    
    # For L4wt, use original (unfiltered by date) dataframe
    df_l4wt = df.copy()
    df_l4wt.columns = df_l4wt.columns.str.strip()
    
    # Rename columns for L4wt dataframe
    df_l4wt.rename(columns={
        'Tw_Sales': 'Tw Sales',
        'Tw_Orders': 'Tw Orders',
        'Tw_Avg_Tckt': 'Tw Avg Tckt',
        'Tw_Reg_Pay': 'Tw Reg Pay'
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
    for col in ['Tw Sales', 'Tw Orders', 'Tw Avg Tckt', 'Tw Reg Pay']:
        if col in df_l4wt.columns:
            df_l4wt[col] = clean_currency(df_l4wt[col])
    
    # Filter L4wt data for the 4-week window
    l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= reference_date)]
    
    # Calculate actual values
    # This Week values
    tw_net_sales = df_copy['Tw Sales'].sum()
    tw_orders = df_copy['Tw Orders'].sum()
    tw_avg_ticket = df_copy['Tw Avg Tckt'].sum() if 'Tw Avg Tckt' in df_copy.columns else (tw_net_sales / tw_orders if tw_orders > 0 else 0)
    tw_food_cost = df_copy['Tw Reg Pay'].sum() if 'Tw Reg Pay' in df_copy.columns else 0  # Food Cost from Tw_Reg_Pay (not as percentage)
    
    # L4wt values
    l4wt_net_sales = l4wt_filtered['Tw Sales'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0  # Average over 4 weeks
    l4wt_orders = l4wt_filtered['Tw Orders'].sum() / 4 if not l4wt_filtered.empty and len(l4wt_filtered) > 0 else 0
    l4wt_avg_ticket = l4wt_filtered['Tw Avg Tckt'].sum() / 4 if not l4wt_filtered.empty and 'Tw Avg Tckt' in l4wt_filtered.columns else (l4wt_net_sales / l4wt_orders if l4wt_orders > 0 else 0)
    l4wt_food_cost = l4wt_filtered['Tw Reg Pay'].sum() / 4 if not l4wt_filtered.empty and 'Tw Reg Pay' in l4wt_filtered.columns else 0
    
    # Budget values (now filtered to current week only)
    bdg_net_sales = budget_copy[budget_sales_col].sum() if budget_sales_col else 0
    bdg_orders = budget_copy[budget_orders_col].sum() if budget_orders_col else 0
    bdg_avg_ticket = bdg_net_sales / bdg_orders if bdg_orders > 0 else 0
    bdg_food_cost = budget_copy[budget_food_cost_col].sum() if budget_food_cost_col else 0  # Food Cost from Food_Cost column
    
    # Helper function to format numbers
    def format_number(value, is_currency=False):
        if is_currency:
            return f"${value:,.2f}"  # Always show 2 decimal places for currency
        elif value >= 1000000:
            return f"{value:,.0f}"
        elif value >= 1000:
            return f"{value:,.0f}"
        else:
            return f"{value:.2f}"
    
    # Helper function to calculate percentage change with proper formula
    def calc_percentage_change(actual, budget):
        if budget == 0:
            return "0.00%"
        change = (actual - budget) / budget  # Without * 100 as per your requirement
        sign = "+" if change >= 0 else ""
        return f"{sign}{change:.2f}%"
    
    # Helper function to calculate Tw/Bdg difference
    def calc_tw_bdg_diff(actual, budget):
        if budget == 0:
            return "0.00"
        
        diff = (actual - budget) / budget  # Without * 100 as per your requirement
        
        # If difference is above 1.0 (100%), reverse the calculation
        if abs(diff) > 1.0:
            # Calculate how much budget exceeds actual (reverse perspective)
            reverse_diff = (budget - actual) / actual if actual != 0 else 0
            sign = "-" if diff > 0 else "+"  # Flip the sign
            return f"{sign}{abs(reverse_diff):.2f}"
        else:
            sign = "+" if diff >= 0 else ""
            return f"{sign}{diff:.2f}"
    
    # Create result rows
    result_rows = [
        {
            'Metric': 'Net Sales',
            'This Week': format_number(tw_net_sales, is_currency=True),
            'Budget': format_number(bdg_net_sales, is_currency=True),
            'L4wt': format_number(l4wt_net_sales, is_currency=True),
            'Bdg': format_number(bdg_net_sales, is_currency=True),  # Same as Budget column for consistency
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
            'This Week': format_number(tw_avg_ticket, is_currency=True),
            'Budget': format_number(bdg_avg_ticket, is_currency=True),
            'L4wt': format_number(l4wt_avg_ticket, is_currency=True),
            'Bdg': format_number(bdg_avg_ticket, is_currency=True),
            'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_avg_ticket, bdg_avg_ticket),
            'Percent Change': calc_percentage_change(tw_avg_ticket, bdg_avg_ticket)
        },
        {
            'Metric': 'Food Cost',
            'This Week': format_number(tw_food_cost, is_currency=True),
            'Budget': format_number(bdg_food_cost, is_currency=True),
            'L4wt': format_number(l4wt_food_cost, is_currency=True),
            'Bdg': format_number(bdg_food_cost, is_currency=True),
            'Tw/Bdg (+/-)': calc_tw_bdg_diff(tw_food_cost, bdg_food_cost),
            'Percent Change': calc_percentage_change(tw_food_cost, bdg_food_cost)
        }
    ]
    
    # Create DataFrame
    result_df = pd.DataFrame(result_rows)
    
    return result_df

def financial_sales_df(df, df_budget, store='All', start_date=None, end_date=None):
    """
    Generate a financial sales analysis table showing sales by service type
    comparing This Week (Tw), Last Week (Lw), Last 4 weeks trend (L4wt), Last Year (Ly), and Budget (Bdg)
    
    Parameters:
    df: Main dataframe with sales data
    df_budget: Budget dataframe
    store: Store filter ('All' or specific store(s))
    start_date: Start date filter
    end_date: End date filter
    
    Returns:
    DataFrame with columns: Time Period, % Change, In-House, % (+/-)_In-House, 1p, % (+/-)_1p, 
                           3p, % (+/-)_3p, Catering, % (+/-)_Catering, TTL
    """
    
    # Make copies and clean column names
    df_copy = df.copy()
    budget_copy = df_budget.copy()
    
    df_copy.columns = df_copy.columns.str.strip()
    budget_copy.columns = budget_copy.columns.str.strip()
    
    # Rename columns for consistency - looking for service type columns
    service_type_mapping = {
        'Tw_In_House': 'Tw_In_House',
        'Lw_In_House': 'Lw_In_House', 
        'Ly_In_House': 'Ly_In_House',
        'Tw_1p': 'Tw_1p',
        'Lw_1p': 'Lw_1p',
        'Ly_1p': 'Ly_1p',
        'Tw_3p': 'Tw_3p',
        'Lw_3p': 'Lw_3p',
        'Ly_3p': 'Ly_3p',
        'Tw_Catering': 'Tw_Catering',
        'Lw_Catering': 'Lw_Catering',
        'Ly_Catering': 'Ly_Catering',
        'Tw_Sales': 'Tw_Sales',
        'Lw_Sales': 'Lw_Sales',
        'Ly_Sales': 'Ly_Sales'
    }
    
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
    
    # Service types to analyze
    service_types = ['In_House', '1p', '3p', 'Catering']
    
    # Clean service type columns
    for service in service_types:
        for period in ['Tw', 'Lw', 'Ly']:
            col_name = f'{period}_{service}'
            if col_name in df_copy.columns:
                df_copy[col_name] = clean_currency(df_copy[col_name])
    
    # Clean total sales columns
    for col in ['Tw_Sales', 'Lw_Sales', 'Ly_Sales']:
        if col in df_copy.columns:
            df_copy[col] = clean_currency(df_copy[col])
    
    # Clean budget columns
    budget_service_mapping = {
        'In_House': ['In House', 'In_House', 'InHouse', 'In-House'],
        '1p': ['1p', '1P', 'First Party', 'FirstParty'],
        '3p': ['3p', '3P', 'Third Party', 'ThirdParty'],
        'Catering': ['Catering', 'catering']
    }
    
    budget_cols = {}
    for service, possible_names in budget_service_mapping.items():
        for name in possible_names:
            if name in budget_copy.columns:
                budget_copy[name] = clean_currency(budget_copy[name])
                budget_cols[service] = name
                break
    
    # Find budget total sales column
    budget_total_col = None
    for col in ['Net Sales', 'Sales', 'Net_Sales', 'Total_Sales']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            budget_total_col = col
            break
    
    # Calculate L4wt (Last 4 weeks trend)
    if end_date is not None:
        l4wt_reference_date = end_date
    else:
        l4wt_reference_date = pd.Timestamp.now().normalize()
    
    l4wt_four_weeks_ago = l4wt_reference_date - timedelta(weeks=4)
    
    # For L4wt, use original dataframe
    df_l4wt = df.copy()
    df_l4wt.columns = df_l4wt.columns.str.strip()
    
    if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
        df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
    # Apply store filter to L4wt data
    if store != 'All':
        if isinstance(store, list):
            df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
        else:
            df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
    # Clean L4wt columns
    for service in service_types:
        col_name = f'Tw_{service}'
        if col_name in df_l4wt.columns:
            df_l4wt[col_name] = clean_currency(df_l4wt[col_name])
    
    if 'Tw_Sales' in df_l4wt.columns:
        df_l4wt['Tw_Sales'] = clean_currency(df_l4wt['Tw_Sales'])
    
    # Filter L4wt data for the 4-week window
    l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= l4wt_reference_date)]
    
    # Calculate values for each time period and service type
    results = {}
    
    # This Week (Tw) values
    tw_total = df_copy['Tw_Sales'].sum() if 'Tw_Sales' in df_copy.columns else 0
    tw_services = {}
    for service in service_types:
        col_name = f'Tw_{service}'
        tw_services[service] = df_copy[col_name].sum() if col_name in df_copy.columns else 0
    
    # Last Week (Lw) values
    lw_total = df_copy['Lw_Sales'].sum() if 'Lw_Sales' in df_copy.columns else 0
    lw_services = {}
    for service in service_types:
        col_name = f'Lw_{service}'
        lw_services[service] = df_copy[col_name].sum() if col_name in df_copy.columns else 0
    
    # Last Year (Ly) values
    ly_total = df_copy['Ly_Sales'].sum() if 'Ly_Sales' in df_copy.columns else 0
    ly_services = {}
    for service in service_types:
        col_name = f'Ly_{service}'
        ly_services[service] = df_copy[col_name].sum() if col_name in df_copy.columns else 0
    
    # L4wt values (average over 4 weeks)
    l4wt_total = (l4wt_filtered['Tw_Sales'].sum() / 4) if not l4wt_filtered.empty and 'Tw_Sales' in l4wt_filtered.columns else 0
    l4wt_services = {}
    for service in service_types:
        col_name = f'Tw_{service}'
        l4wt_services[service] = (l4wt_filtered[col_name].sum() / 4) if not l4wt_filtered.empty and col_name in l4wt_filtered.columns else 0
    
    # Budget values
    bdg_total = budget_copy[budget_total_col].sum() if budget_total_col else 0
    bdg_services = {}
    for service in service_types:
        if service in budget_cols:
            bdg_services[service] = budget_copy[budget_cols[service]].sum()
        else:
            bdg_services[service] = 0
    
    # Helper function to calculate percentage change
    def calc_percentage_change(current, previous):
        if previous == 0:
            return "0.00%"
        change = ((current - previous) / previous) * 100
        sign = "+" if change >= 0 else ""
        return f"{sign}{change:.2f}%"
    
    # Helper function to format currency values (convert to thousands if needed)
    def format_currency(value):
        if abs(value) >= 1000:
            return f"{value/1000:.2f}k"
        else:
            return f"{value:.2f}"
    
    # Build the result rows
    result_rows = []
    
    # This Week row
    tw_row = {
        "Time Period": "Tw",
        "% Change": calc_percentage_change(tw_total, lw_total),
        "TTL": format_currency(tw_total)
    }
    
    for service in service_types:
        service_display = service.replace('_', '-')  # Convert In_House to In-House for display
        tw_row[service_display] = format_currency(tw_services[service])
        tw_row[f"% (+/-)_{service_display}"] = calc_percentage_change(tw_services[service], lw_services[service])
    
    result_rows.append(tw_row)
    
    # Last Week row
    lw_row = {
        "Time Period": "Lw", 
        "% Change": "0.00%",  # Base comparison
        "TTL": format_currency(lw_total)
    }
    
    for service in service_types:
        service_display = service.replace('_', '-')
        lw_row[service_display] = format_currency(lw_services[service])
        lw_row[f"% (+/-)_{service_display}"] = "0.00%"  # Base comparison
    
    result_rows.append(lw_row)
    
    # L4wt row
    l4wt_row = {
        "Time Period": "L4wt",
        "% Change": calc_percentage_change(l4wt_total, lw_total),
        "TTL": format_currency(l4wt_total)
    }
    
    for service in service_types:
        service_display = service.replace('_', '-')
        l4wt_row[service_display] = format_currency(l4wt_services[service])
        l4wt_row[f"% (+/-)_{service_display}"] = calc_percentage_change(l4wt_services[service], lw_services[service])
    
    result_rows.append(l4wt_row)
    
    # Last Year row
    ly_row = {
        "Time Period": "Ly",
        "% Change": calc_percentage_change(ly_total, lw_total),
        "TTL": format_currency(ly_total)
    }
    
    for service in service_types:
        service_display = service.replace('_', '-')
        ly_row[service_display] = format_currency(ly_services[service])
        ly_row[f"% (+/-)_{service_display}"] = calc_percentage_change(ly_services[service], lw_services[service])
    
    result_rows.append(ly_row)
    
    # Budget row
    bdg_row = {
        "Time Period": "Bdg",
        "% Change": calc_percentage_change(bdg_total, lw_total),
        "TTL": format_currency(bdg_total)
    }
    
    for service in service_types:
        service_display = service.replace('_', '-')
        bdg_row[service_display] = format_currency(bdg_services[service])
        bdg_row[f"% (+/-)_{service_display}"] = calc_percentage_change(bdg_services[service], lw_services[service])
    
    result_rows.append(bdg_row)
    
    # Create DataFrame with proper column order
    columns = ["Time Period", "% Change"]
    for service in service_types:
        service_display = service.replace('_', '-')
        columns.extend([service_display, f"% (+/-)_{service_display}"])
    columns.append("TTL")
    
    result_df = pd.DataFrame(result_rows, columns=columns)
    
    return result_df



def financial_sales_df_modified(df, df_budget, store='All', start_date=None, end_date=None):
    """
    Generate a financial sales analysis table showing sales by service type
    comparing This Week (Tw), Last Week (Lw), Last 4 weeks trend (L4wt), Last Year (Ly), and Budget (Bdg)
    
    Parameters:
    df: Main dataframe with sales data
    df_budget: Budget dataframe
    store: Store filter ('All' or specific store(s))
    start_date: Start date filter
    end_date: End date filter
    
    Returns:
    DataFrame with columns: Time Period, In-House, % (+/-), 1p, % (+/-), 3p, % (+/-), Catering, % (+/-), TTL
    """
    
    import pandas as pd
    import numpy as np
    from datetime import datetime, timedelta
    
    # Make copies and clean column names
    df_copy = df.copy()
    budget_copy = df_budget.copy()
    
    df_copy.columns = df_copy.columns.str.strip()
    budget_copy.columns = budget_copy.columns.str.strip()
    
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
    sales_cols = ['Tw_Sales', 'Lw_Sales', 'Ly_Sales']
    order_cols = ['Tw_Orders', 'Lw_Orders', 'Ly_Orders']
    avg_ticket_cols = ['Tw_Avg_Tckt', 'Lw_Avg_Tckt', 'Ly_Avg_Tckt']
    
    # Clean delivery service columns (3P components)
    delivery_cols_tw = ['TW_DD', 'TW_GH', 'TW_UB']  # This Week delivery services
    delivery_cols_lw = ['LW_DD', 'LW_GH', 'LW_UB']  # Last Week delivery services
    
    # Clean food cost columns (these might help determine service types)
    food_cols_tw = ['TW_Johns', 'TW_Terra', 'TW_Metro', 'TW_Victory', 'TW_Central_Kitchen', 'TW_Other']
    food_cols_lw = ['LW_Johns', 'LW_Terra', 'LW_Metro', 'LW_Victory', 'LW_Central_Kitchen', 'LW_Other']
    
    all_cols_to_clean = sales_cols + order_cols + avg_ticket_cols + delivery_cols_tw + delivery_cols_lw + food_cols_tw + food_cols_lw
    
    for col in all_cols_to_clean:
        if col in df_copy.columns:
            df_copy[col] = clean_currency(df_copy[col])
    
    # Calculate L4wt (Last 4 weeks trend)
    if end_date is not None:
        l4wt_reference_date = end_date
    else:
        l4wt_reference_date = pd.Timestamp.now().normalize()
    
    l4wt_four_weeks_ago = l4wt_reference_date - timedelta(weeks=4)
    
    # For L4wt, use original dataframe
    df_l4wt = df.copy()
    df_l4wt.columns = df_l4wt.columns.str.strip()
    
    if not pd.api.types.is_datetime64_any_dtype(df_l4wt['Date']):
        df_l4wt['Date'] = pd.to_datetime(df_l4wt['Date'])
    
    # Apply store filter to L4wt data
    if store != 'All':
        if isinstance(store, list):
            df_l4wt = df_l4wt[df_l4wt['Store'].isin(store)]
        else:
            df_l4wt = df_l4wt[df_l4wt['Store'] == store]
    
    # Clean L4wt columns
    for col in ['Tw_Sales', 'Tw_Orders', 'Tw_Avg_Tckt'] + delivery_cols_tw + food_cols_tw:
        if col in df_l4wt.columns:
            df_l4wt[col] = clean_currency(df_l4wt[col])
    
    # Filter L4wt data for the 4-week window
    l4wt_filtered = df_l4wt[(df_l4wt['Date'] >= l4wt_four_weeks_ago) & (df_l4wt['Date'] <= l4wt_reference_date)]
    
    # CALCULATE SERVICE TYPES USING BUSINESS LOGIC
    
    # This Week (Tw) calculations
    tw_total = df_copy['Tw_Sales'].sum() if 'Tw_Sales' in df_copy.columns else 0
    tw_orders = df_copy['Tw_Orders'].sum() if 'Tw_Orders' in df_copy.columns else 0
    
    # Calculate In-House using Tw_Orders - you can modify this logic as needed
    # Option 1: Use orders directly as a value (but this mixes units)
    # tw_in_house = tw_orders
    
    # Option 2: Calculate In-House sales from orders and average ticket
    tw_avg_ticket = df_copy['Tw_Avg_Tckt'].mean() if 'Tw_Avg_Tckt' in df_copy.columns and not df_copy['Tw_Avg_Tckt'].empty else 0
    if tw_avg_ticket == 0 and tw_orders > 0:
        tw_avg_ticket = tw_total / tw_orders  # Calculate average ticket if not available
    
    # Assuming all orders are In-House (you can modify this assumption)
    tw_in_house = tw_orders * tw_avg_ticket if tw_avg_ticket > 0 else tw_total * 0.40
    
    # 3P = Sum of delivery services (DD + GH + UB)
    tw_3p = sum(df_copy[col].sum() for col in delivery_cols_tw if col in df_copy.columns)
    
    # Catering = Assume 8% of total sales (typical for restaurants)
    tw_catering = tw_total * 0.08  # 8% assumption
    
    # 1P = First party delivery/pickup - assume this is the remaining delivery after 3P
    tw_1p = tw_total * 0.25  # 25% assumption
    
    # Adjust In-House if it exceeds total (ensure mathematical consistency)
    if tw_in_house > tw_total:
        tw_in_house = tw_total - (tw_3p + tw_1p + tw_catering)
        if tw_in_house < 0:
            tw_in_house = tw_total * 0.40  # Fallback to 40%
    
    # Last Week (Lw) calculations
    lw_total = df_copy['Lw_Sales'].sum() if 'Lw_Sales' in df_copy.columns else 0
    lw_orders = df_copy['Lw_Orders'].sum() if 'Lw_Orders' in df_copy.columns else 0
    
    # Calculate In-House using Lw_Orders
    lw_avg_ticket = df_copy['Lw_Avg_Tckt'].mean() if 'Lw_Avg_Tckt' in df_copy.columns and not df_copy['Lw_Avg_Tckt'].empty else 0
    if lw_avg_ticket == 0 and lw_orders > 0:
        lw_avg_ticket = lw_total / lw_orders
    
    lw_in_house = lw_orders * lw_avg_ticket if lw_avg_ticket > 0 else lw_total * 0.40
    
    # 3P = Sum of delivery services (DD + GH + UB)
    lw_3p = sum(df_copy[col].sum() for col in delivery_cols_lw if col in df_copy.columns)
    
    # Apply same business logic ratios as This Week
    lw_catering = lw_total * 0.08  # 8% assumption
    lw_1p = lw_total * 0.25        # 25% assumption
    
    # Adjust if needed
    if lw_in_house > lw_total:
        lw_in_house = lw_total - (lw_3p + lw_1p + lw_catering)
        if lw_in_house < 0:
            lw_in_house = lw_total * 0.40
    
    # Last Year (Ly) calculations
    ly_total = df_copy['Ly_Sales'].sum() if 'Ly_Sales' in df_copy.columns else 0
    ly_orders = df_copy['Ly_Orders'].sum() if 'Ly_Orders' in df_copy.columns else 0
    
    # Calculate In-House using Ly_Orders
    ly_avg_ticket = df_copy['Ly_Avg_Tckt'].mean() if 'Ly_Avg_Tckt' in df_copy.columns and not df_copy['Ly_Avg_Tckt'].empty else 0
    if ly_avg_ticket == 0 and ly_orders > 0:
        ly_avg_ticket = ly_total / ly_orders
    
    ly_in_house = ly_orders * ly_avg_ticket if ly_avg_ticket > 0 else ly_total * 0.50
    
    # For Last Year, assume historical ratios (pre-delivery boom)
    ly_3p = ly_total * 0.15        # 15% (delivery was smaller before)
    ly_catering = ly_total * 0.08  # 8% assumption
    ly_1p = ly_total * 0.20        # 20% assumption
    
    # Adjust if needed
    if ly_in_house > ly_total:
        ly_in_house = ly_total - (ly_3p + ly_1p + ly_catering)
        if ly_in_house < 0:
            ly_in_house = ly_total * 0.57
    
    # L4wt calculations (average over 4 weeks)
    l4wt_total = (l4wt_filtered['Tw_Sales'].sum() / 4) if not l4wt_filtered.empty and 'Tw_Sales' in l4wt_filtered.columns else 0
    l4wt_orders = (l4wt_filtered['Tw_Orders'].sum() / 4) if not l4wt_filtered.empty and 'Tw_Orders' in l4wt_filtered.columns else 0
    
    # Calculate In-House using L4wt orders
    l4wt_avg_ticket = (l4wt_filtered['Tw_Avg_Tckt'].mean()) if not l4wt_filtered.empty and 'Tw_Avg_Tckt' in l4wt_filtered.columns else 0
    if l4wt_avg_ticket == 0 and l4wt_orders > 0:
        l4wt_avg_ticket = l4wt_total / l4wt_orders
    
    l4wt_in_house = l4wt_orders * l4wt_avg_ticket if l4wt_avg_ticket > 0 else l4wt_total * 0.43
    
    # 3P = Average of delivery services over 4 weeks
    l4wt_3p = (sum(l4wt_filtered[col].sum() for col in delivery_cols_tw if col in l4wt_filtered.columns) / 4) if not l4wt_filtered.empty else 0
    
    # Apply same business logic
    l4wt_catering = l4wt_total * 0.09  # 9% assumption (slightly higher than current)
    l4wt_1p = l4wt_total * 0.23        # 23% assumption
    
    # Adjust if needed
    if l4wt_in_house > l4wt_total:
        l4wt_in_house = l4wt_total - (l4wt_3p + l4wt_1p + l4wt_catering)
        if l4wt_in_house < 0:
            l4wt_in_house = l4wt_total * 0.43
    
    # Budget calculations
    budget_total_col = None
    for col in ['Net_Sales', 'Sales', 'Net Sales', 'Sales ', 'Net_Sales']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            budget_total_col = col
            break
    
    bdg_total = budget_copy[budget_total_col].sum() if budget_total_col else 0
    
    # Budget service types - check if budget has service type breakdown
    budget_delivery_cols = ['DD', 'GH', 'UB', 'DoorDash', 'GrubHub', 'UberEats']
    bdg_3p = 0
    for col in budget_delivery_cols:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            bdg_3p += budget_copy[col].sum()
    
    # If no delivery data in budget, use percentage
    if bdg_3p == 0:
        bdg_3p = bdg_total * 0.17  # 17% assumption
    
    # Check for other service types in budget
    bdg_in_house = 0
    for col in ['In House', 'In_House', 'Dine In', 'Dine_In', 'Orders']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            bdg_in_house += budget_copy[col].sum()
    if bdg_in_house == 0:
        bdg_in_house = bdg_total * 0.50  # 50% assumption
    
    bdg_1p = 0
    for col in ['1P', '1st Party', 'First Party']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            bdg_1p += budget_copy[col].sum()
    if bdg_1p == 0:
        bdg_1p = bdg_total * 0.25  # 25% assumption
    
    bdg_catering = 0
    for col in ['Catering', 'catering']:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
            bdg_catering += budget_copy[col].sum()
    if bdg_catering == 0:
        bdg_catering = bdg_total * 0.08  # 8% assumption
    
    # Helper function to calculate percentage change vs Lw (Last Week baseline)
    def calc_percentage_vs_lw(current, lw_baseline):
        if lw_baseline == 0:
            return "--%"
        change = ((current - lw_baseline) / lw_baseline) * 100
        if change == 0:
            return "--%"
        sign = "+" if change > 0 else ""
        return f"{sign}{change:.2f}%"
    
    # Helper function to format percentage values
    def format_percentage(value, total):
        if total == 0:
            return "0.00%"
        percentage = (value / total) * 100
        return f"{percentage:.2f}%"
    
    # Build the result rows
    result_rows = []
    
    # This Week row
    tw_ttl = tw_in_house + tw_1p + tw_3p + tw_catering
    tw_row = {
        "Time Period": "Tw",
        "In-House": format_percentage(tw_in_house, tw_total),
        "% (+/-)": calc_percentage_vs_lw(tw_in_house, lw_in_house),
        "1p": format_percentage(tw_1p, tw_total),
        "% (+/-)_1p": calc_percentage_vs_lw(tw_1p, lw_1p),
        "3p": format_percentage(tw_3p, tw_total),
        "% (+/-)_3p": calc_percentage_vs_lw(tw_3p, lw_3p),
        "Catering": format_percentage(tw_catering, tw_total),
        "% (+/-)_Catering": calc_percentage_vs_lw(tw_catering, lw_catering),
        "TTL": format_percentage(tw_ttl, tw_total)
    }
    result_rows.append(tw_row)
    
    # Last Week row (baseline - calculate % vs some reference)
    lw_ttl = lw_in_house + lw_1p + lw_3p + lw_catering
    lw_row = {
        "Time Period": "Lw", 
        "In-House": format_percentage(lw_in_house, lw_total),
        "% (+/-)": "0.00%",  # Base comparison
        "1p": format_percentage(lw_1p, lw_total),
        "% (+/-)_1p": "0.00%",
        "3p": format_percentage(lw_3p, lw_total),
        "% (+/-)_3p": "0.00%",
        "Catering": format_percentage(lw_catering, lw_total),
        "% (+/-)_Catering": "0.00%",
        "TTL": format_percentage(lw_ttl, lw_total)
    }
    result_rows.append(lw_row)
    
    # L4wt row
    l4wt_ttl = l4wt_in_house + l4wt_1p + l4wt_3p + l4wt_catering
    l4wt_row = {
        "Time Period": "L4wt",
        "In-House": format_percentage(l4wt_in_house, l4wt_total),
        "% (+/-)": calc_percentage_vs_lw(l4wt_in_house, lw_in_house),
        "1p": format_percentage(l4wt_1p, l4wt_total),
        "% (+/-)_1p": calc_percentage_vs_lw(l4wt_1p, lw_1p),
        "3p": format_percentage(l4wt_3p, l4wt_total),
        "% (+/-)_3p": calc_percentage_vs_lw(l4wt_3p, lw_3p),
        "Catering": format_percentage(l4wt_catering, l4wt_total),
        "% (+/-)_Catering": calc_percentage_vs_lw(l4wt_catering, lw_catering),
        "TTL": format_percentage(l4wt_ttl, l4wt_total)
    }
    result_rows.append(l4wt_row)
    
    # Last Year row
    ly_ttl = ly_in_house + ly_1p + ly_3p + ly_catering
    ly_row = {
        "Time Period": "Ly",
        "In-House": format_percentage(ly_in_house, ly_total),
        "% (+/-)": calc_percentage_vs_lw(ly_in_house, lw_in_house),
        "1p": format_percentage(ly_1p, ly_total),
        "% (+/-)_1p": calc_percentage_vs_lw(ly_1p, lw_1p),
        "3p": format_percentage(ly_3p, ly_total),
        "% (+/-)_3p": calc_percentage_vs_lw(ly_3p, lw_3p),
        "Catering": format_percentage(ly_catering, ly_total),
        "% (+/-)_Catering": calc_percentage_vs_lw(ly_catering, lw_catering),
        "TTL": format_percentage(ly_ttl, ly_total)
    }
    result_rows.append(ly_row)
    
    # Budget row
    bdg_ttl = bdg_in_house + bdg_1p + bdg_3p + bdg_catering
    bdg_row = {
        "Time Period": "Bdg",
        "In-House": format_percentage(bdg_in_house, bdg_total),
        "% (+/-)": calc_percentage_vs_lw(bdg_in_house, lw_in_house),
        "1p": format_percentage(bdg_1p, bdg_total),
        "% (+/-)_1p": calc_percentage_vs_lw(bdg_1p, lw_1p),
        "3p": format_percentage(bdg_3p, bdg_total),
        "% (+/-)_3p": calc_percentage_vs_lw(bdg_3p, lw_3p),
        "Catering": format_percentage(bdg_catering, bdg_total),
        "% (+/-)_Catering": calc_percentage_vs_lw(bdg_catering, lw_catering),
        "TTL": format_percentage(bdg_ttl, bdg_total)
    }
    result_rows.append(bdg_row)
    
    # Create DataFrame with proper column order
    columns = [
        "Time Period", 
        "In-House", "% (+/-)", 
        "1p", "% (+/-)_1p", 
        "3p", "% (+/-)_3p",
        "Catering", "% (+/-)_Catering",
        "TTL"
    ]
    
    result_df = pd.DataFrame(result_rows, columns=columns)
    
    return result_df



# def financials_food_cost_modified(df, df_budget, store='All', start_date=None, end_date=None):
#     """
#     Generate a food cost analysis table showing food costs by supplier
#     comparing This Week (Tw), Last Week (Lw), Last 4 weeks trend (L4wt), Last Year (Ly), and Budget (Bdg)
    
#     Parameters:
#     df: Main dataframe with sales data
#     df_budget: Budget dataframe
#     store: Store filter ('All' or specific store(s))
#     start_date: Start date filter
#     end_date: End date filter
    
#     Returns:
#     DataFrame with columns: TIME PERIOD, JOHNS, % (+/-), TERRA, % (+/-), METRO, % (+/-), VICTORY, CK
#     """
    
#     import pandas as pd
#     import numpy as np
#     from datetime import datetime, timedelta
    
#     # Make copies and clean column names
#     df_copy = df.copy()
#     budget_copy = df_budget.copy()
    
#     df_copy.columns = df_copy.columns.str.strip()
#     budget_copy.columns = budget_copy.columns.str.strip()
    
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
    
#     # Define food cost columns for This Week and Last Week
#     food_suppliers = ['Johns', 'Terra', 'Metro', 'Victory', 'Central_Kitchen']
    
#     # Map column names (TW_Central_Kitchen -> Central_Kitchen for easier processing)
#     food_cols_tw = ['TW_Johns', 'TW_Terra', 'TW_Metro', 'TW_Victory', 'TW_Central_Kitchen']
#     food_cols_lw = ['LW_Johns', 'LW_Terra', 'LW_Metro', 'LW_Victory', 'LW_Central_Kitchen']
    
#     # Clean food cost columns
#     for col in food_cols_tw + food_cols_lw:
#         if col in df_copy.columns:
#             df_copy[col] = clean_currency(df_copy[col])
    
#     # Get total sales for percentage calculations
#     tw_total = df_copy['Tw_Sales'].sum() if 'Tw_Sales' in df_copy.columns else 0
#     lw_total = df_copy['Lw_Sales'].sum() if 'Lw_Sales' in df_copy.columns else 0
    
#     if 'Tw_Sales' in df_copy.columns:
#         df_copy['Tw_Sales'] = clean_currency(df_copy['Tw_Sales'])
#         tw_total = df_copy['Tw_Sales'].sum()
    
#     if 'Lw_Sales' in df_copy.columns:
#         df_copy['Lw_Sales'] = clean_currency(df_copy['Lw_Sales'])
#         lw_total = df_copy['Lw_Sales'].sum()
    
#     # Calculate food costs for each supplier
#     # This Week values
#     tw_johns = df_copy['TW_Johns'].sum() if 'TW_Johns' in df_copy.columns else 0
#     tw_terra = df_copy['TW_Terra'].sum() if 'TW_Terra' in df_copy.columns else 0
#     tw_metro = df_copy['TW_Metro'].sum() if 'TW_Metro' in df_copy.columns else 0
#     tw_victory = df_copy['TW_Victory'].sum() if 'TW_Victory' in df_copy.columns else 0
#     tw_ck = df_copy['TW_Central_Kitchen'].sum() if 'TW_Central_Kitchen' in df_copy.columns else 0
    
#     # Last Week values
#     lw_johns = df_copy['LW_Johns'].sum() if 'LW_Johns' in df_copy.columns else 0
#     lw_terra = df_copy['LW_Terra'].sum() if 'LW_Terra' in df_copy.columns else 0
#     lw_metro = df_copy['LW_Metro'].sum() if 'LW_Metro' in df_copy.columns else 0
#     lw_victory = df_copy['LW_Victory'].sum() if 'LW_Victory' in df_copy.columns else 0
#     lw_ck = df_copy['LW_Central_Kitchen'].sum() if 'LW_Central_Kitchen' in df_copy.columns else 0
    
#     # L4wt and Ly values (set to 0 as requested)
#     l4wt_johns = l4wt_terra = l4wt_metro = l4wt_victory = l4wt_ck = 0
#     ly_johns = ly_terra = ly_metro = ly_victory = ly_ck = 0
    
#     # Budget values - check if budget has food cost breakdown
#     budget_johns = 0
#     budget_terra = 0
#     budget_metro = 0
#     budget_victory = 0
#     budget_ck = 0
    
#     # Try to find budget columns (check various possible names)
#     budget_mapping = {
#         'Johns': ['Johns', 'johns', 'JOHNS'],
#         'Terra': ['Terra', 'terra', 'TERRA'],
#         'Metro': ['Metro', 'metro', 'METRO'],
#         'Victory': ['Victory', 'victory', 'VICTORY'],
#         'Central_Kitchen': ['Central Kitchen', 'Central_Kitchen', 'CK', 'ck']
#     }
    
#     for supplier, possible_names in budget_mapping.items():
#         for name in possible_names:
#             if name in budget_copy.columns:
#                 budget_copy[name] = clean_currency(budget_copy[name])
#                 if supplier == 'Johns':
#                     budget_johns = budget_copy[name].sum()
#                 elif supplier == 'Terra':
#                     budget_terra = budget_copy[name].sum()
#                 elif supplier == 'Metro':
#                     budget_metro = budget_copy[name].sum()
#                 elif supplier == 'Victory':
#                     budget_victory = budget_copy[name].sum()
#                 elif supplier == 'Central_Kitchen':
#                     budget_ck = budget_copy[name].sum()
#                 break
    
#     # Helper function to calculate percentage of sales
#     def calc_percentage_of_sales(cost, total_sales):
#         if total_sales == 0:
#             return "0.00%"
#         percentage = (cost / total_sales) * 100
#         return f"{percentage:.2f}%"
    
#     # Helper function to calculate delta between current and previous period
#     def calc_delta(current_pct_str, previous_pct_str):
#         # Extract numeric values from percentage strings
#         try:
#             current_val = float(current_pct_str.replace('%', ''))
#             previous_val = float(previous_pct_str.replace('%', ''))
#             delta = current_val - previous_val
#             sign = "+" if delta > 0 else ""
#             return f"{sign}{delta:.2f}%"
#         except:
#             return "0.00%"
    
#     # Build the result rows
#     result_rows = []
    
#     # This Week row
#     tw_johns_pct = calc_percentage_of_sales(tw_johns, tw_total)
#     tw_terra_pct = calc_percentage_of_sales(tw_terra, tw_total)
#     tw_metro_pct = calc_percentage_of_sales(tw_metro, tw_total)
#     tw_victory_pct = calc_percentage_of_sales(tw_victory, tw_total)
#     tw_ck_pct = calc_percentage_of_sales(tw_ck, tw_total)
    
#     # Last Week row
#     lw_johns_pct = calc_percentage_of_sales(lw_johns, lw_total)
#     lw_terra_pct = calc_percentage_of_sales(lw_terra, lw_total)
#     lw_metro_pct = calc_percentage_of_sales(lw_metro, lw_total)
#     lw_victory_pct = calc_percentage_of_sales(lw_victory, lw_total)
#     lw_ck_pct = calc_percentage_of_sales(lw_ck, lw_total)
    
#     # L4wt row (set to 0 as requested)
#     l4wt_johns_pct = l4wt_terra_pct = l4wt_metro_pct = l4wt_victory_pct = l4wt_ck_pct = "0.00%"
    
#     # Ly row (set to 0 as requested)
#     ly_johns_pct = ly_terra_pct = ly_metro_pct = ly_victory_pct = ly_ck_pct = "0.00%"
    
#     # Budget row
#     bdg_total = budget_copy['Net_Sales'].sum() if 'Net_Sales' in budget_copy.columns else (
#         budget_copy['Sales'].sum() if 'Sales' in budget_copy.columns else 1)  # Avoid division by zero
    
#     if bdg_total == 0:
#         bdg_total = 1  # Avoid division by zero
        
#     bdg_johns_pct = calc_percentage_of_sales(budget_johns, bdg_total)
#     bdg_terra_pct = calc_percentage_of_sales(budget_terra, bdg_total)
#     bdg_metro_pct = calc_percentage_of_sales(budget_metro, bdg_total)
#     bdg_victory_pct = calc_percentage_of_sales(budget_victory, bdg_total)
#     bdg_ck_pct = calc_percentage_of_sales(budget_ck, bdg_total)
    
#     # This Week row
#     tw_row = {
#         "TIME PERIOD": "Tw",
#         "JOHNS": tw_johns_pct,
#         "% (+/-)": calc_delta(tw_johns_pct, lw_johns_pct),
#         "TERRA": tw_terra_pct,
#         "% (+/-)_TERRA": calc_delta(tw_terra_pct, lw_terra_pct),
#         "METRO": tw_metro_pct,
#         "% (+/-)_METRO": calc_delta(tw_metro_pct, lw_metro_pct),
#         "VICTORY": tw_victory_pct,
#         "CK": tw_ck_pct
#     }
#     result_rows.append(tw_row)
    
#     # Last Week row (baseline - all deltas are 0)
#     lw_row = {
#         "TIME PERIOD": "Lw",
#         "JOHNS": lw_johns_pct,
#         "% (+/-)": "0.00%",  # Base comparison
#         "TERRA": lw_terra_pct,
#         "% (+/-)_TERRA": "0.00%",
#         "METRO": lw_metro_pct,
#         "% (+/-)_METRO": "0.00%",
#         "VICTORY": lw_victory_pct,
#         "CK": lw_ck_pct
#     }
#     result_rows.append(lw_row)
    
#     # L4wt row (set to 0 as requested)
#     l4wt_row = {
#         "TIME PERIOD": "L4wt",
#         "JOHNS": l4wt_johns_pct,
#         "% (+/-)": calc_delta(l4wt_johns_pct, lw_johns_pct),
#         "TERRA": l4wt_terra_pct,
#         "% (+/-)_TERRA": calc_delta(l4wt_terra_pct, lw_terra_pct),
#         "METRO": l4wt_metro_pct,
#         "% (+/-)_METRO": calc_delta(l4wt_metro_pct, lw_metro_pct),
#         "VICTORY": l4wt_victory_pct,
#         "CK": l4wt_ck_pct
#     }
#     result_rows.append(l4wt_row)
    
#     # Last Year row (set to 0 as requested)
#     ly_row = {
#         "TIME PERIOD": "Ly",
#         "JOHNS": ly_johns_pct,
#         "% (+/-)": calc_delta(ly_johns_pct, lw_johns_pct),
#         "TERRA": ly_terra_pct,
#         "% (+/-)_TERRA": calc_delta(ly_terra_pct, lw_terra_pct),
#         "METRO": ly_metro_pct,
#         "% (+/-)_METRO": calc_delta(ly_metro_pct, lw_metro_pct),
#         "VICTORY": ly_victory_pct,
#         "CK": ly_ck_pct
#     }
#     result_rows.append(ly_row)
    
#     # Budget row
#     bdg_row = {
#         "TIME PERIOD": "Bdg",
#         "JOHNS": bdg_johns_pct,
#         "% (+/-)": calc_delta(bdg_johns_pct, lw_johns_pct),
#         "TERRA": bdg_terra_pct,
#         "% (+/-)_TERRA": calc_delta(bdg_terra_pct, lw_terra_pct),
#         "METRO": bdg_metro_pct,
#         "% (+/-)_METRO": calc_delta(bdg_metro_pct, lw_metro_pct),
#         "VICTORY": bdg_victory_pct,
#         "CK": bdg_ck_pct
#     }
#     result_rows.append(bdg_row)
    
#     # Create DataFrame with proper column order
#     columns = [
#         "TIME PERIOD",
#         "JOHNS", "% (+/-)",
#         "TERRA", "% (+/-)_TERRA", 
#         "METRO", "% (+/-)_METRO",
#         "VICTORY",
#         "CK"
#     ]
    
#     result_df = pd.DataFrame(result_rows, columns=columns)
    
#     return result_df



def financials_food_cost_modified(df, df_budget, store='All', start_date=None, end_date=None):
    """
    Generate a food cost analysis table showing food costs by supplier
    comparing This Week (Tw), Last Week (Lw), Last 4 weeks trend (L4wt), Last Year (Ly), and Budget (Bdg)
    
    Parameters:
    df: Main dataframe with sales data
    df_budget: Budget dataframe
    store: Store filter ('All' or specific store(s))
    start_date: Start date filter
    end_date: End date filter
    
    Returns:
    DataFrame with columns: Time Period, % Change, Johns, % (+/-)_Johns, Terra, % (+/-)_Terra, Metro, % (+/-)_Metro, Victory, % (+/-)_Victory, Ck, % (+/-)_Ck
    """
    
    import pandas as pd
    import numpy as np
    from datetime import datetime, timedelta
    
    # Make copies and clean column names
    df_copy = df.copy()
    budget_copy = df_budget.copy()
    
    df_copy.columns = df_copy.columns.str.strip()
    budget_copy.columns = budget_copy.columns.str.strip()
    
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
    
    # print("------------------------------------------")
    # print("i am here in the financials utils printing df_copy ", df_copy, df_copy["TW_Johns"])
    # print("i am here in the financial utils ", df_copy.head(), df_copy.columns)
    # print("i am here in the financials utils printing Tw_Sales ", df_copy["Tw_Sales"])
    # print("------------------------------------------")
    

    # Define food cost columns for This Week and Last Week
    food_suppliers = ['Johns', 'Terra', 'Metro', 'Victory', 'Central_Kitchen']
    
    # Map column names (TW_Central_Kitchen -> Central_Kitchen for easier processing)
    food_cols_tw = ['TW_Johns', 'TW_Terra', 'TW_Metro', 'TW_Victory', 'TW_Central_Kitchen']
    food_cols_lw = ['LW_Johns', 'LW_Terra', 'LW_Metro', 'LW_Victory', 'LW_Central_Kitchen']
    
    # Clean food cost columns
    for col in food_cols_tw + food_cols_lw:
        if col in df_copy.columns:
            df_copy[col] = clean_currency(df_copy[col])
    
    # Get total sales for percentage calculations
    tw_total = df_copy['Tw_Sales'].sum() if 'Tw_Sales' in df_copy.columns else 0
    lw_total = df_copy['Lw_Sales'].sum() if 'Lw_Sales' in df_copy.columns else 0
    
    if 'Tw_Sales' in df_copy.columns:
        df_copy['Tw_Sales'] = clean_currency(df_copy['Tw_Sales'])
        tw_total = df_copy['Tw_Sales'].sum()
    
    if 'Lw_Sales' in df_copy.columns:
        df_copy['Lw_Sales'] = clean_currency(df_copy['Lw_Sales'])
        lw_total = df_copy['Lw_Sales'].sum()
    
    # Calculate food costs for each supplier    
    net_sales_sum = df_copy['Tw_Sales'].sum() if 'Tw_Sales' in df_copy.columns else 1  # Avoid division by zero
    
    # This Week values
    tw_johns = df_copy['TW_Johns'].sum() if 'TW_Johns' in df_copy.columns else 0
    #     # Calculate tw_johns as sum of TW_Johns divided by sum of net_sales
    # tw_johns_sum = df_copy['TW_Johns'].sum() if 'TW_Johns' in df_copy.columns else 0
    # tw_johns = tw_johns_sum / net_sales_sum if net_sales_sum != 0 else 0
    
    # print("net sales sum and john sum", net_sales_sum, tw_johns)
    
    tw_terra = df_copy['TW_Terra'].sum() if 'TW_Terra' in df_copy.columns else 0
    # tw_terra_sum = df_copy['TW_Terra'].sum() if 'TW_Terra' in df_copy.columns else 0
    # tw_terra = tw_terra_sum / net_sales_sum if net_sales_sum != 0 else 0
    
    tw_metro = df_copy['TW_Metro'].sum() if 'TW_Metro' in df_copy.columns else 0
    # tw_metro_sum = df_copy['TW_Metro'].sum() if 'TW_Metro' in df_copy.columns else 0
    # tw_metro = tw_metro_sum / net_sales_sum if net_sales_sum != 0 else 0

    tw_victory = df_copy['TW_Victory'].sum() if 'TW_Victory' in df_copy.columns else 0
    # tw_victory_sum = df_copy['TW_Victory'].sum() if 'TW_Victory' in df_copy.columns else 0
    # tw_victory = tw_victory_sum / net_sales_sum if net_sales_sum != 0 else 0

    tw_ck = df_copy['TW_Central_Kitchen'].sum() if 'TW_Central_Kitchen' in df_copy.columns else 0
    # tw_ck_sum = df_copy['TW_Central_Kitchen'].sum() if 'TW_Central_Kitchen' in df_copy.columns else 0
    # tw_ck = tw_ck_sum / net_sales_sum if net_sales_sum != 0 else 0
    
    
    # Last Week values
    lw_johns = df_copy['LW_Johns'].sum() if 'LW_Johns' in df_copy.columns else 0
    lw_terra = df_copy['LW_Terra'].sum() if 'LW_Terra' in df_copy.columns else 0
    lw_metro = df_copy['LW_Metro'].sum() if 'LW_Metro' in df_copy.columns else 0
    lw_victory = df_copy['LW_Victory'].sum() if 'LW_Victory' in df_copy.columns else 0
    lw_ck = df_copy['LW_Central_Kitchen'].sum() if 'LW_Central_Kitchen' in df_copy.columns else 0
    
    # L4wt (Last 4 weeks) - calculate from current data
    # If end_date is not provided, use the latest date in the data
    if end_date is None:
        end_date = df_copy['Date'].max()
    
    # Calculate start date for last 4 weeks (28 days)
    l4w_start_date = end_date - timedelta(days=28)
    
    # Filter data for last 4 weeks
    l4w_data = df_copy[(df_copy['Date'] >= l4w_start_date) & (df_copy['Date'] <= end_date)]
    
    # Calculate L4wt food costs using TW prefix columns
    l4wt_johns = l4w_data['TW_Johns'].sum() if 'TW_Johns' in l4w_data.columns else 0
    l4wt_terra = l4w_data['TW_Terra'].sum() if 'TW_Terra' in l4w_data.columns else 0
    l4wt_metro = l4w_data['TW_Metro'].sum() if 'TW_Metro' in l4w_data.columns else 0
    l4wt_victory = l4w_data['TW_Victory'].sum() if 'TW_Victory' in l4w_data.columns else 0
    l4wt_ck = l4w_data['TW_Central_Kitchen'].sum() if 'TW_Central_Kitchen' in l4w_data.columns else 0
    
    # Get L4wt total sales for percentage calculations
    l4wt_total = l4w_data['Tw_Sales'].sum() if 'Tw_Sales' in l4w_data.columns else 1
    if l4wt_total == 0:
        l4wt_total = 1  # Avoid division by zero
    
    # Ly values (set to 0 as requested)
    ly_johns = ly_terra = ly_metro = ly_victory = ly_ck = 0
    
    # Budget values - check if budget has food cost breakdown
    budget_johns = 0
    budget_terra = 0
    budget_metro = 0
    budget_victory = 0
    budget_ck = 0
    
    # Try to find budget columns (check various possible names)
    budget_mapping = {
        'Johns': ['Johns', 'johns', 'JOHNS'],
        'Terra': ['Terra', 'terra', 'TERRA'],
        'Metro': ['Metro', 'metro', 'METRO'],
        'Victory': ['Victory', 'victory', 'VICTORY'],
        'Central_Kitchen': ['Central Kitchen', 'Central_Kitchen', 'CK', 'ck']
    }
    
    for supplier, possible_names in budget_mapping.items():
        for name in possible_names:
            if name in budget_copy.columns:
                budget_copy[name] = clean_currency(budget_copy[name])
                if supplier == 'Johns':
                    budget_johns = budget_copy[name].sum()
                elif supplier == 'Terra':
                    budget_terra = budget_copy[name].sum()
                elif supplier == 'Metro':
                    budget_metro = budget_copy[name].sum()
                elif supplier == 'Victory':
                    budget_victory = budget_copy[name].sum()
                elif supplier == 'Central_Kitchen':
                    budget_ck = budget_copy[name].sum()
                break
    
    # Helper function to calculate percentage of sales
    def calc_percentage_of_sales(cost, total_sales):
        if total_sales == 0:
            return "0.00%"
        percentage = (cost / total_sales) * 100
        return f"{percentage:.2f}%"
    
    # Helper function to calculate delta between current and previous period
    def calc_delta(current_pct_str, lw_pct_str):
        # Extract numeric values from percentage strings
        # Formula: (current - lw_baseline) / lw_baseline (without * 100)
        try:
            current_val = float(current_pct_str.replace('%', ''))
            lw_val = float(lw_pct_str.replace('%', ''))
            if lw_val == 0:
                return "0.00%"
            delta = (current_val - lw_val) / lw_val
            sign = "+" if delta > 0 else ""
            return f"{sign}{delta:.2f}%"
        except:
            return "0.00%"
    
    # Build the result rows
    result_rows = []
    
    # This Week row
    tw_johns_pct = calc_percentage_of_sales(tw_johns, tw_total)
    tw_terra_pct = calc_percentage_of_sales(tw_terra, tw_total)
    tw_metro_pct = calc_percentage_of_sales(tw_metro, tw_total)
    tw_victory_pct = calc_percentage_of_sales(tw_victory, tw_total)
    tw_ck_pct = calc_percentage_of_sales(tw_ck, tw_total)
    
    # Last Week row
    lw_johns_pct = calc_percentage_of_sales(lw_johns, lw_total)
    lw_terra_pct = calc_percentage_of_sales(lw_terra, lw_total)
    lw_metro_pct = calc_percentage_of_sales(lw_metro, lw_total)
    lw_victory_pct = calc_percentage_of_sales(lw_victory, lw_total)
    lw_ck_pct = calc_percentage_of_sales(lw_ck, lw_total)
    
    # L4wt row (calculate from actual last 4 weeks data)
    l4wt_johns_pct = calc_percentage_of_sales(l4wt_johns, l4wt_total)
    l4wt_terra_pct = calc_percentage_of_sales(l4wt_terra, l4wt_total)
    l4wt_metro_pct = calc_percentage_of_sales(l4wt_metro, l4wt_total)
    l4wt_victory_pct = calc_percentage_of_sales(l4wt_victory, l4wt_total)
    l4wt_ck_pct = calc_percentage_of_sales(l4wt_ck, l4wt_total)
    
    # Ly row (set to 0 as requested)
    ly_johns_pct = ly_terra_pct = ly_metro_pct = ly_victory_pct = ly_ck_pct = "0.00%"
    
    # Budget row
    bdg_total = budget_copy['Net_Sales'].sum() if 'Net_Sales' in budget_copy.columns else (
        budget_copy['Sales'].sum() if 'Sales' in budget_copy.columns else 1)  # Avoid division by zero
    
    if bdg_total == 0:
        bdg_total = 1  # Avoid division by zero
        
    bdg_johns_pct = calc_percentage_of_sales(budget_johns, bdg_total)
    bdg_terra_pct = calc_percentage_of_sales(budget_terra, bdg_total)
    bdg_metro_pct = calc_percentage_of_sales(budget_metro, bdg_total)
    bdg_victory_pct = calc_percentage_of_sales(budget_victory, bdg_total)
    bdg_ck_pct = calc_percentage_of_sales(budget_ck, bdg_total)
    
    # This Week row
    tw_row = {
        "Time Period": "Tw",
        "% Change": "-",
        "Johns": tw_johns_pct,
        "% (+/-)_Johns": calc_delta(tw_johns_pct, lw_johns_pct),
        "Terra": tw_terra_pct,
        "% (+/-)_Terra": calc_delta(tw_terra_pct, lw_terra_pct),
        "Metro": tw_metro_pct,
        "% (+/-)_Metro": calc_delta(tw_metro_pct, lw_metro_pct),
        "Victory": tw_victory_pct,
        "% (+/-)_Victory": calc_delta(tw_victory_pct, lw_victory_pct),
        "Ck": tw_ck_pct,
        "% (+/-)_Ck": calc_delta(tw_ck_pct, lw_ck_pct)
    }
    result_rows.append(tw_row)
    
    # Last Week row (baseline - all deltas are 0)
    lw_row = {
        "Time Period": "Lw",
        "% Change": "0.00%",
        "Johns": lw_johns_pct,
        "% (+/-)_Johns": "0.00%",  # Base comparison
        "Terra": lw_terra_pct,
        "% (+/-)_Terra": "0.00%",
        "Metro": lw_metro_pct,
        "% (+/-)_Metro": "0.00%",
        "Victory": lw_victory_pct,
        "% (+/-)_Victory": "0.00%",
        "Ck": lw_ck_pct,
        "% (+/-)_Ck": "0.00%"
    }
    result_rows.append(lw_row)
    
    # L4wt row (set to 0 as requested)
    l4wt_row = {
        "Time Period": "L4wt",
        "% Change": calc_delta(l4wt_johns_pct, lw_johns_pct),
        "Johns": l4wt_johns_pct,
        "% (+/-)_Johns": calc_delta(l4wt_johns_pct, lw_johns_pct),
        "Terra": l4wt_terra_pct,
        "% (+/-)_Terra": calc_delta(l4wt_terra_pct, lw_terra_pct),
        "Metro": l4wt_metro_pct,
        "% (+/-)_Metro": calc_delta(l4wt_metro_pct, lw_metro_pct),
        "Victory": l4wt_victory_pct,
        "% (+/-)_Victory": calc_delta(l4wt_victory_pct, lw_victory_pct),
        "Ck": l4wt_ck_pct,
        "% (+/-)_Ck": calc_delta(l4wt_ck_pct, lw_ck_pct)
    }
    result_rows.append(l4wt_row)
    
    # Last Year row (set to 0 as requested)
    ly_row = {
        "Time Period": "Ly",
        "% Change": calc_delta(ly_johns_pct, lw_johns_pct),
        "Johns": ly_johns_pct,
        "% (+/-)_Johns": calc_delta(ly_johns_pct, lw_johns_pct),
        "Terra": ly_terra_pct,
        "% (+/-)_Terra": calc_delta(ly_terra_pct, lw_terra_pct),
        "Metro": ly_metro_pct,
        "% (+/-)_Metro": calc_delta(ly_metro_pct, lw_metro_pct),
        "Victory": ly_victory_pct,
        "% (+/-)_Victory": calc_delta(ly_victory_pct, lw_victory_pct),
        "Ck": ly_ck_pct,
        "% (+/-)_Ck": calc_delta(ly_ck_pct, lw_ck_pct)
    }
    result_rows.append(ly_row)
    
    # Budget row
    bdg_row = {
        "Time Period": "Bdg",
        "% Change": calc_delta(bdg_johns_pct, lw_johns_pct),
        "Johns": bdg_johns_pct,
        "% (+/-)_Johns": calc_delta(bdg_johns_pct, lw_johns_pct),
        "Terra": bdg_terra_pct,
        "% (+/-)_Terra": calc_delta(bdg_terra_pct, lw_terra_pct),
        "Metro": bdg_metro_pct,
        "% (+/-)_Metro": calc_delta(bdg_metro_pct, lw_metro_pct),
        "Victory": bdg_victory_pct,
        "% (+/-)_Victory": calc_delta(bdg_victory_pct, lw_victory_pct),
        "Ck": bdg_ck_pct,
        "% (+/-)_Ck": calc_delta(bdg_ck_pct, lw_ck_pct)
    }
    result_rows.append(bdg_row)
    
    # Create DataFrame with proper column order matching dummy data
    columns = [
        "Time Period",
        "% Change",
        "Johns", "% (+/-)_Johns",
        "Terra", "% (+/-)_Terra", 
        "Metro", "% (+/-)_Metro",
        "Victory", "% (+/-)_Victory",
        "Ck", "% (+/-)_Ck"
    ]
    
    result_df = pd.DataFrame(result_rows, columns=columns)
    
    return result_df




def financials_labour_cost_modified(df, df_budget, store='All', start_date=None, end_date=None):
    """
    Generate a labour cost analysis table showing labour metrics
    comparing This Week (Tw), Last Week (Lw), Last 4 weeks trend (L4wt), Last Year (Ly), and Budget (Bdg)
    
    Parameters:
    df: Main dataframe with sales data
    df_budget: Budget dataframe
    store: Store filter ('All' or specific store(s))
    start_date: Start date filter
    end_date: End date filter
    
    Returns:
    DataFrame with columns: Time Period, Hours, % (+/-), Payroll %, % (+/-), SPMH, % (+/-), LPMH, % (+/-)
    """
    
    import pandas as pd
    import numpy as np
    from datetime import datetime, timedelta
    
    # Make copies and clean column names
    df_copy = df.copy()
    budget_copy = df_budget.copy()
    
    df_copy.columns = df_copy.columns.str.strip()
    budget_copy.columns = budget_copy.columns.str.strip()
    
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
    
    # Clean labour-related columns
    labour_columns = ['Tw_Labor_Hrs', 'Lw_Labor_Hrs', 'Tw_Reg_Pay', 'Lw_Reg_Pay', 
                     'Tw_SPMH', 'Lw_SPMH', 'Tw_LPMH', 'Lw_LPMH', 'Tw_Sales', 'Lw_Sales']
    
    for col in labour_columns:
        if col in df_copy.columns:
            df_copy[col] = clean_currency(df_copy[col])
    
    budget_labour_columns = ['LB_Hours', 'Labor_Cost', 'SPMH', 'LPMH', 'Net_Sales']
    
    for col in budget_labour_columns:
        if col in budget_copy.columns:
            budget_copy[col] = clean_currency(budget_copy[col])
    
    # Calculate This Week values
    tw_hours = df_copy['Tw_Labor_Hrs'].sum() if 'Tw_Labor_Hrs' in df_copy.columns else 0
    tw_payroll = df_copy['Tw_Reg_Pay'].sum() if 'Tw_Reg_Pay' in df_copy.columns else 0
    tw_sales = df_copy['Tw_Sales'].sum() if 'Tw_Sales' in df_copy.columns else 1
    tw_spmh = df_copy['Tw_SPMH'].sum() if 'Tw_SPMH' in df_copy.columns else 0
    tw_lpmh = df_copy['Tw_LPMH'].sum() if 'Tw_LPMH' in df_copy.columns else 0
    
    # Calculate Last Week values
    lw_hours = df_copy['Lw_Labor_Hrs'].sum() if 'Lw_Labor_Hrs' in df_copy.columns else 0
    lw_payroll = df_copy['Lw_Reg_Pay'].sum() if 'Lw_Reg_Pay' in df_copy.columns else 0
    lw_sales = df_copy['Lw_Sales'].sum() if 'Lw_Sales' in df_copy.columns else 1
    lw_spmh = df_copy['Lw_SPMH'].sum() if 'Lw_SPMH' in df_copy.columns else 0
    lw_lpmh = df_copy['Lw_LPMH'].sum() if 'Lw_LPMH' in df_copy.columns else 0
    
    # L4wt (Last 4 weeks) - calculate from current data
    # If end_date is not provided, use the latest date in the data
    if end_date is None:
        end_date = df_copy['Date'].max()
    
    # Calculate start date for last 4 weeks (28 days)
    l4w_start_date = end_date - timedelta(days=28)
    
    # Filter data for last 4 weeks
    l4w_data = df_copy[(df_copy['Date'] >= l4w_start_date) & (df_copy['Date'] <= end_date)]
    
    # Calculate L4wt labour metrics using TW prefix columns
    l4wt_hours = l4w_data['Tw_Labor_Hrs'].sum() if 'Tw_Labor_Hrs' in l4w_data.columns else 0
    l4wt_payroll = l4w_data['Tw_Reg_Pay'].sum() if 'Tw_Reg_Pay' in l4w_data.columns else 0
    l4wt_sales = l4w_data['Tw_Sales'].sum() if 'Tw_Sales' in l4w_data.columns else 1
    l4wt_spmh = l4w_data['Tw_SPMH'].mean() if 'Tw_SPMH' in l4w_data.columns else 0
    l4wt_lpmh = l4w_data['Tw_LPMH'].mean() if 'Tw_LPMH' in l4w_data.columns else 0
    
    # Ly values (set to 0 as requested in previous function)
    ly_hours = ly_payroll = ly_sales = ly_spmh = ly_lpmh = 0
    
    # Budget values
    bdg_hours = budget_copy['LB_Hours'].sum() if 'LB_Hours' in budget_copy.columns else 0
    bdg_payroll = budget_copy['Labor_Cost'].sum() if 'Labor_Cost' in budget_copy.columns else 0
    bdg_sales = budget_copy['Net_Sales'].sum() if 'Net_Sales' in budget_copy.columns else 1
    bdg_spmh = budget_copy['SPMH'].sum() if 'SPMH' in budget_copy.columns else 0
    bdg_lpmh = budget_copy['LPMH'].sum() if 'LPMH' in budget_copy.columns else 0
    
    # Helper function to calculate percentage of sales
    def calc_percentage_of_sales(cost, total_sales):
        if total_sales == 0:
            return "0.00%"
        percentage = (cost / total_sales) * 100
        return f"{percentage:.2f}%"
    
    # Helper function to format values
    def format_value(value, format_type='number'):
        if format_type == 'currency':
            return f"${value:,.2f}"
        elif format_type == 'percentage':
            return f"{value:.2f}%"
        elif format_type == 'number':
            return f"{value:,.2f}"
        else:
            return f"{value:,.2f}"
    
    # Helper function to calculate delta between current and previous period
    # Formula: (current - lw_baseline) / lw_baseline (without * 100)
    def calc_delta_hours_percentage(current_val, lw_baseline):
        try:
            if lw_baseline == 0:
                return "0.00%"
            delta_percentage = (current_val - lw_baseline) / lw_baseline
            sign = "+" if delta_percentage > 0 else ""
            return f"{sign}{delta_percentage:.2f}%"
        except:
            return "0.00%"
    
    def calc_delta_percentage(current_pct_str, lw_pct_str):
        try:
            current_val = float(current_pct_str.replace('%', ''))
            lw_val = float(lw_pct_str.replace('%', ''))
            if lw_val == 0:
                return "0.00%"
            delta = (current_val - lw_val) / lw_val
            sign = "+" if delta > 0 else ""
            return f"{sign}{delta:.2f}%"
        except:
            return "0.00%"
    
    def calc_delta_currency_percentage(current_val, lw_baseline):
        try:
            if lw_baseline == 0:
                return "0.00%"
            delta_percentage = (current_val - lw_baseline) / lw_baseline
            sign = "+" if delta_percentage > 0 else ""
            return f"{sign}{delta_percentage:.2f}%"
        except:
            return "0.00%"
    
    # Calculate payroll percentages
    tw_payroll_pct = calc_percentage_of_sales(tw_payroll, tw_sales)
    
    print("i am here in the financials utils printing tw_payroll_pct_ ", tw_payroll_pct, "tw_sales", tw_sales, "tw_payroll", tw_payroll)
    
    lw_payroll_pct = calc_percentage_of_sales(lw_payroll, lw_sales)
    l4wt_payroll_pct = calc_percentage_of_sales(l4wt_payroll, l4wt_sales)
    ly_payroll_pct = calc_percentage_of_sales(ly_payroll, ly_sales if ly_sales > 0 else 1)
    bdg_payroll_pct = calc_percentage_of_sales(bdg_payroll, bdg_sales)
    
    # Build the result rows
    result_rows = []
    
    # This Week row
    tw_row = {
        "Time Period": "Tw",
        "Hours": format_value(tw_hours, 'number'),
        "% (+/-)_Hours": calc_delta_hours_percentage(tw_hours, lw_hours),
        "Payroll": tw_payroll_pct,
        "% (+/-)_Payroll": calc_delta_percentage(tw_payroll_pct, lw_payroll_pct),
        "SPMH": format_value(tw_spmh, 'currency'),
        "% (+/-)_SPMH": calc_delta_currency_percentage(tw_spmh, lw_spmh),
        "LPMH": format_value(tw_lpmh, 'currency'),
        "% (+/-)_LPMH": calc_delta_currency_percentage(tw_lpmh, lw_lpmh)
    }
    result_rows.append(tw_row)
    
    # Last Week row (baseline - all deltas are 0)
    lw_row = {
        "Time Period": "Lw",
        "Hours": format_value(lw_hours, 'number'),
        "% (+/-)_Hours": "0.00%",
        "Payroll": lw_payroll_pct,
        "% (+/-)_Payroll": "0.00%",
        "SPMH": format_value(lw_spmh, 'currency'),
        "% (+/-)_SPMH": "0.00%",
        "LPMH": format_value(lw_lpmh, 'currency'),
        "% (+/-)_LPMH": "0.00%"
    }
    result_rows.append(lw_row)
    
    # L4wt row
    l4wt_row = {
        "Time Period": "L4wt",
        "Hours": format_value(l4wt_hours, 'number'),
        "% (+/-)_Hours": calc_delta_hours_percentage(l4wt_hours, lw_hours),
        "Payroll": l4wt_payroll_pct,
        "% (+/-)_Payroll": calc_delta_percentage(l4wt_payroll_pct, lw_payroll_pct),
        "SPMH": format_value(l4wt_spmh, 'currency'),
        "% (+/-)_SPMH": calc_delta_currency_percentage(l4wt_spmh, lw_spmh),
        "LPMH": format_value(l4wt_lpmh, 'currency'),
        "% (+/-)_LPMH": calc_delta_currency_percentage(l4wt_lpmh, lw_lpmh)
    }
    result_rows.append(l4wt_row)
    
    # Last Year row (set to 0 as requested)
    ly_row = {
        "Time Period": "Ly",
        "Hours": format_value(ly_hours, 'number'),
        "% (+/-)_Hours": calc_delta_hours_percentage(ly_hours, lw_hours),
        "Payroll": ly_payroll_pct,
        "% (+/-)_Payroll": calc_delta_percentage(ly_payroll_pct, lw_payroll_pct),
        "SPMH": format_value(ly_spmh, 'currency'),
        "% (+/-)_SPMH": calc_delta_currency_percentage(ly_spmh, lw_spmh),
        "LPMH": format_value(ly_lpmh, 'currency'),
        "% (+/-)_LPMH": calc_delta_currency_percentage(ly_lpmh, lw_lpmh)
    }
    result_rows.append(ly_row)
    
    # Budget row
    bdg_row = {
        "Time Period": "Bdg",
        "Hours": format_value(bdg_hours, 'number'),
        "% (+/-)_Hours": calc_delta_hours_percentage(bdg_hours, lw_hours),
        "Payroll": bdg_payroll_pct,
        "% (+/-)_Payroll": calc_delta_percentage(bdg_payroll_pct, lw_payroll_pct),
        "SPMH": format_value(bdg_spmh, 'currency'),
        "% (+/-)_SPMH": calc_delta_currency_percentage(bdg_spmh, lw_spmh),
        "LPMH": format_value(bdg_lpmh, 'currency'),
        "% (+/-)_LPMH": calc_delta_currency_percentage(bdg_lpmh, lw_lpmh)
    }
    result_rows.append(bdg_row)
    
    # Create DataFrame with proper column order matching frontend expectations
    columns = [
        "Time Period",
        "Hours", "% (+/-)_Hours",
        "Payroll", "% (+/-)_Payroll",
        "SPMH", "% (+/-)_SPMH",
        "LPMH", "% (+/-)_LPMH"
    ]
    
    result_df = pd.DataFrame(result_rows, columns=columns)
    
    return result_df








