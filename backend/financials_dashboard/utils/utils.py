import pandas as pd
import numpy as np


def financials_filters(df):
    # finding the unique values in the 'Helper 4' column
    unique_weeks = df['Helper 4'].unique()
    # Remove empty strings from unique_weeks
    unique_weeks = [week for week in unique_weeks if str(week).strip() != '']

    unique_years = df['Year'].unique()
    # Remove empty strings and convert to int
    unique_years = [int(year) for year in unique_years if str(year).strip() != '']

    unique_stores = df['Store'].unique()
    unique_stores = [store for store in unique_stores if str(store).strip() != '']
    unique_stores = [store.split(':', 1)[1].strip() for store in unique_stores if ':' in store]
    
    return unique_weeks, unique_years, unique_stores


def day_of_the_week_tables(df):


    # sales_table
    # Clean column names
    df.columns = df.columns.str.strip()

    # Define columns to clean
    sales_cols = ['Tw Sales', 'Lw Sales', 'Ly Sales']
    df[sales_cols] = df[sales_cols].fillna(0)

    # Remove $ and , and convert to float
    for col in sales_cols:
        df[col] = df[col].astype(str).str.replace(r'[\$,]', '', regex=True)
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # Group by Helper 1
    grouped = df.groupby('Helper 1')[sales_cols].sum().reset_index()

    # Calculate percentage differences and round to 2 decimal places
    grouped['Tw/Lw (+/-)'] = (((grouped['Tw Sales'] - grouped['Lw Sales']) / grouped['Lw Sales'].replace(0, pd.NA)) * 100).round(2)
    grouped['Tw/Ly (+/-)'] = (((grouped['Tw Sales'] - grouped['Ly Sales']) / grouped['Ly Sales'].replace(0, pd.NA)) * 100).round(2)

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

    # Calculate percentage differences
    grouped_orders['Tw/Lw (+/-)'] = (((grouped_orders['Tw Orders'] - grouped_orders['Lw Orders']) / grouped_orders['Lw Orders'].replace(0, pd.NA)) * 100).round(2)
    grouped_orders['Tw/Ly (+/-)'] = (((grouped_orders['Tw Orders'] - grouped_orders['Ly Orders']) / grouped_orders['Ly Orders'].replace(0, pd.NA)) * 100).round(2)

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

    # Calculate % differences
    grouped_tckt['Tw/Lw (+/-)'] = (((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Lw Avg Tckt']) / grouped_tckt['Lw Avg Tckt'].replace(0, pd.NA)) * 100).round(2)
    grouped_tckt['Tw/Ly (+/-)'] = (((grouped_tckt['Tw Avg Tckt'] - grouped_tckt['Ly Avg Tckt']) / grouped_tckt['Ly Avg Tckt'].replace(0, pd.NA)) * 100).round(2)

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


# def calculate_tw_lw_bdg_comparison(df, store, year, week_range):
def calculate_tw_lw_bdg_comparison(df, store="0001: Midtown East", year=2025, week_range="1 | 12/30/2024 - 01/05/2025"):
    df.columns = df.columns.str.strip()
    
    # Filter data
    mask = (
        (df['Store'].str.strip() == store) &
        (df['Year'] == year) &
        (df['Helper 4'].str.strip() == week_range)
    )
    filtered_df = df[mask].copy()
    
    # Clean function
    def clean_currency(df, col):
        return pd.to_numeric(
            df[col].astype(str).str.replace(r'[\$,]', '', regex=True),
            errors='coerce'
        ).fillna(0)
    
    # Define matching columns
    metrics = {
        'Net Sales': ('Tw Sales', 'Lw Sales', 'Budget Sales'),
        'Orders': ('Tw Orders', 'Lw Orders', 'Budget Orders'),
        'Lbr hrs': ('Tw Labor Hrs', 'Lw Labor Hrs', 'Budget Labor Hrs'),
        'Lbr Pay': ('Tw Reg Pay', 'Lw Reg Pay', 'Budget Labor Pay'),
        'SPMH': ('Tw SPMH', 'Lw SPMH', 'Budget SPMH'),
        'LPMH': ('Tw LPMH', 'Lw LPMH', 'Budget LPMH'),
        'Tw Johns': ('TW', 'LW', 'Budget Johns'),
        'Terra': ('TW .1', 'LW .1', 'Budget Terra'),
        'Metro': ('TW .2', 'LW .2', 'Budget Metro'),
        'Victory': ('TW .3', 'LW .3', 'Budget Victory'),
        'Central Kitchen': ('TW .4', 'LW .4', 'Budget CK'),
        'Other': ('TW .5', 'LW .5', 'Budget Other'),
    }
    
    # Process actual data columns
    for tw_col, lw_col, _ in metrics.values():
        filtered_df[tw_col] = clean_currency(filtered_df, tw_col)
        filtered_df[lw_col] = clean_currency(filtered_df, lw_col)
    
    # Process budget data columns
    budget_values = {}
    for metric, (_, _, bdg_col) in metrics.items():
        if filtered_df.empty:
            budget_values[metric] = 0
        else:
            budget_values[metric] = clean_currency(filtered_df, bdg_col).sum() if bdg_col in filtered_df.columns else 0
    
    # Calculate values
    rows = []
    for label, (tw_col, lw_col, _) in metrics.items():
        tw = filtered_df[tw_col].sum()
        lw = filtered_df[lw_col].sum()
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
    
    # Additional Calculations
    tw_lbr_pay = filtered_df['Tw Reg Pay'].sum()
    tw_net_sales = filtered_df['Tw Sales'].sum()
    lw_lbr_pay = filtered_df['Lw Reg Pay'].sum()
    lw_net_sales = filtered_df['Lw Sales'].sum()
    bdg_lbr_pay = budget_values['Lbr Pay']
    bdg_net_sales = budget_values['Net Sales']
    
    # Labor percentage calculations
    tw_lbr_pct = tw_lbr_pay / tw_net_sales * 100 if tw_net_sales != 0 else 0
    lw_lbr_pct = lw_lbr_pay / lw_net_sales * 100 if lw_net_sales != 0 else 0
    bdg_lbr_pct = bdg_lbr_pay / bdg_net_sales * 100 if bdg_net_sales != 0 else 0
    
    lbr_tw_lw_diff = tw_lbr_pct - lw_lbr_pct
    lbr_tw_bdg_diff = tw_lbr_pct - bdg_lbr_pct
    
    rows.insert(4, (
        "Lbr %", 
        f"{tw_lbr_pct:.2f}", 
        f"{lw_lbr_pct:.2f}", 
        f"{lbr_tw_lw_diff:.2f}",
        f"{bdg_lbr_pct:.2f}",
        f"{lbr_tw_bdg_diff:.2f}"
    ))
    
    # TTL calculations
    tw_ttl = sum(filtered_df[col].sum() for col in ['TW', 'TW .1', 'TW .2', 'TW .3', 'TW .4', 'TW .5'])
    lw_ttl = sum(filtered_df[col].sum() for col in ['LW', 'LW .1', 'LW .2', 'LW .3', 'LW .4', 'LW .5'])
    bdg_ttl = sum(budget_values[m] for m in ['Tw Johns', 'Terra', 'Metro', 'Victory', 'Central Kitchen', 'Other'])
    
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
    tw_avg_ticket = tw_net_sales / filtered_df['Tw Orders'].sum() if filtered_df['Tw Orders'].sum() != 0 else 0
    lw_avg_ticket = lw_net_sales / filtered_df['Lw Orders'].sum() if filtered_df['Lw Orders'].sum() != 0 else 0
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
    return result