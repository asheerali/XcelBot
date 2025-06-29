import pandas as pd
import numpy as np
import io
from datetime import datetime

def parse_date(date_str):
    for fmt in ('%Y-%m-%d', '%m/%d/%Y'):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    raise ValueError("Date must be in one of the following formats: 'YYYY-MM-DD' or 'MM/DD/YYYY'")


def companywide_tables(df, store_filter='All', year_filter=None, quarter_filter='All', helper4_filter='All', start_date=None, end_date=None):
    
    print("i am here printing the df attributes", "\n", store_filter, start_date, end_date, year_filter, quarter_filter, helper4_filter)
    
    

    
    
    #Make a copy of the dataframe
    filtered_df = df.copy()
    
    
    if not pd.api.types.is_datetime64_any_dtype(filtered_df['Date']):
        filtered_df['Date'] = pd.to_datetime(filtered_df['Date'])

    # if end_date is not None and isinstance(end_date, str):
    #     end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
    # elif end_date is None:
    #     end_date = filtered_df['Date'].max().date()
    
    # Apply filters
    if store_filter != 'All':
        if isinstance(store_filter, list):
            filtered_df = filtered_df[filtered_df['Store'].isin(store_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Store'] == store_filter]
    
    if year_filter is not None:
        if isinstance(year_filter, list):
            filtered_df = filtered_df[filtered_df['Year'].isin(year_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Year'] == year_filter]
        
    if quarter_filter != 'All':
        if isinstance(quarter_filter, list):
            filtered_df = filtered_df[filtered_df['Quarter'].isin(quarter_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Quarter'] == quarter_filter]
        
    if helper4_filter != 'All':
        if isinstance(helper4_filter, list):
            filtered_df = filtered_df[filtered_df['Helper 4'].isin(helper4_filter)]
        else:
            filtered_df = filtered_df[filtered_df['Helper 4'] == helper4_filter]
   
    # if start_date is not None:
    #     if isinstance(start_date, str):
    #         start_date = parse_date(start_date)
    #     filtered_df = filtered_df[filtered_df['Date'] >= start_date]
    #     filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] >= start_date]

    # if end_date is not None:
    #     if isinstance(end_date, str):
    #         end_date = parse_date(end_date)
    #     filtered_df = filtered_df[filtered_df['Date'] <= end_date]
    #     filtered_budget_df = filtered_budget_df[filtered_budget_df['Date'] <= end_date]

    if start_date is not None:
        if isinstance(start_date, str):
            start_date = parse_date(start_date)
        start_date = pd.to_datetime(start_date)
        filtered_df = filtered_df[filtered_df['Date'] >= start_date]

    if end_date is not None:
        if isinstance(end_date, str):
            end_date = parse_date(end_date)
        end_date = pd.to_datetime(end_date)
        filtered_df = filtered_df[filtered_df['Date'] <= end_date]

# -------------------------------------------------------
# sales table
# -------------------------------------------------------

    # Group by Store
    store_grouped_sales = filtered_df.groupby('Store').agg({
        'Tw Sales': 'sum',
        'Lw Sales': 'sum',
        'Ly Sales': 'sum'
    }).reset_index()
    
    # Calculate comparison columns and round to 2 decimal places
    store_grouped_sales['Tw vs. Lw'] = round((((store_grouped_sales['Tw Sales'] - store_grouped_sales['Lw Sales']) / 
                                 store_grouped_sales['Lw Sales']).fillna(0)) * 100, 2)
    
    store_grouped_sales['Tw vs. Ly'] = round((((store_grouped_sales['Tw Sales'] - store_grouped_sales['Ly Sales']) / 
                                 store_grouped_sales['Ly Sales']).fillna(0)) * 100, 2)
    
    # Round sales values to 2 decimal places
    store_grouped_sales['Tw Sales'] = round(store_grouped_sales['Tw Sales'], 2)
    store_grouped_sales['Lw Sales'] = round(store_grouped_sales['Lw Sales'], 2)
    store_grouped_sales['Ly Sales'] = round(store_grouped_sales['Ly Sales'], 2)
    
    # Calculate grand total
    # Make sure division by zero is handled
    lw_sales_sum = store_grouped_sales['Lw Sales'].sum()
    ly_sales_sum = store_grouped_sales['Ly Sales'].sum()
    tw_sales_sum = store_grouped_sales['Tw Sales'].sum()
    
    tw_vs_lw = round(((tw_sales_sum - lw_sales_sum) / lw_sales_sum) * 100, 2) if lw_sales_sum != 0 else 0
    tw_vs_ly = round(((tw_sales_sum - ly_sales_sum) / ly_sales_sum) * 100, 2) if ly_sales_sum != 0 else 0
    
    grand_total = pd.DataFrame({
        'Store': ['Grand Total'],
        'Tw Sales': [round(tw_sales_sum, 2)],
        'Lw Sales': [round(lw_sales_sum, 2)],
        'Ly Sales': [round(ly_sales_sum, 2)],
        'Tw vs. Lw': [tw_vs_lw],
        'Tw vs. Ly': [tw_vs_ly]
    })
    
    # Combine results
    sales_df = pd.concat([store_grouped_sales, grand_total], ignore_index=True)




# -------------------------------------------------------
# orders table
# -------------------------------------------------------

    # Group by Store
    store_grouped_orders = filtered_df.groupby('Store').agg({
        'Tw Orders': 'sum',
        'Lw Orders': 'sum',
        'Ly Orders': 'sum'
    }).reset_index()
    
    # Calculate comparison columns and round to 2 decimal places for percentages
    store_grouped_orders['Tw vs. Lw'] = round((((store_grouped_orders['Tw Orders'] - store_grouped_orders['Lw Orders']) / 
                                 store_grouped_orders['Lw Orders']).fillna(0)) * 100, 2)
    
    store_grouped_orders['Tw vs. Ly'] = round((((store_grouped_orders['Tw Orders'] - store_grouped_orders['Ly Orders']) / 
                                 store_grouped_orders['Ly Orders']).fillna(0)) * 100, 2)
    
    # Convert orders to integers (no decimal places)
    store_grouped_orders['Tw Orders'] = store_grouped_orders['Tw Orders'].round().astype(int)
    store_grouped_orders['Lw Orders'] = store_grouped_orders['Lw Orders'].round().astype(int)
    store_grouped_orders['Ly Orders'] = store_grouped_orders['Ly Orders'].round().astype(int)
    
    # Calculate grand total
    tw_orders_sum = store_grouped_orders['Tw Orders'].sum()
    lw_orders_sum = store_grouped_orders['Lw Orders'].sum()
    ly_orders_sum = store_grouped_orders['Ly Orders'].sum()
    
    # Handle division by zero in percentage calculations
    tw_vs_lw = round(((tw_orders_sum - lw_orders_sum) / lw_orders_sum) * 100, 2) if lw_orders_sum != 0 else 0
    tw_vs_ly = round(((tw_orders_sum - ly_orders_sum) / ly_orders_sum) * 100, 2) if ly_orders_sum != 0 else 0
    
    # Create grand total row
    grand_total = pd.DataFrame({
        'Store': ['Grand Total'],
        'Tw Orders': [int(tw_orders_sum)],
        'Lw Orders': [int(lw_orders_sum)],
        'Ly Orders': [int(ly_orders_sum)],
        'Tw vs. Lw': [tw_vs_lw],
        'Tw vs. Ly': [tw_vs_ly]
    })
    
    # Combine results
    order_df = pd.concat([store_grouped_orders, grand_total], ignore_index=True)
    





# -------------------------------------------------------
# avg ticket table
# -------------------------------------------------------

    # First, let's run the sales and orders aggregations
    # This is needed first because we need the totals to calculate average tickets
    sales_agg = filtered_df.groupby('Store').agg({
        'Tw Sales': 'sum',
        'Lw Sales': 'sum',
        'Ly Sales': 'sum'
    }).reset_index()
    
    orders_agg = filtered_df.groupby('Store').agg({
        'Tw Orders': 'sum',
        'Lw Orders': 'sum',
        'Ly Orders': 'sum'
    }).reset_index()
    
    # Create a dataframe with all the stores
    stores = pd.DataFrame({'Store': sales_agg['Store'].unique()})
    
    # Merge sales and orders data
    result_df = stores.merge(sales_agg, on='Store', how='left')
    result_df = result_df.merge(orders_agg, on='Store', how='left')
    
    # Calculate average ticket values using the formula: Avg Ticket = Sales / Orders
    # Using IFERROR logic to handle division by zero
    result_df['Tw Avg Ticket'] = result_df.apply(lambda row: row['Tw Sales'] / row['Tw Orders'] 
                                               if row['Tw Orders'] != 0 else 0, axis=1)
    result_df['Lw Avg Ticket'] = result_df.apply(lambda row: row['Lw Sales'] / row['Lw Orders'] 
                                               if row['Lw Orders'] != 0 else 0, axis=1)
    result_df['Ly Avg Ticket'] = result_df.apply(lambda row: row['Ly Sales'] / row['Ly Orders'] 
                                               if row['Ly Orders'] != 0 else 0, axis=1)
    
    # Round average ticket values to 2 decimal places
    result_df['Tw Avg Ticket'] = round(result_df['Tw Avg Ticket'], 2)
    result_df['Lw Avg Ticket'] = round(result_df['Lw Avg Ticket'], 2)
    result_df['Ly Avg Ticket'] = round(result_df['Ly Avg Ticket'], 2)
    
    # Calculate comparison columns using IFERROR logic
    result_df['Tw vs. Lw'] = result_df.apply(lambda row: 
                                          ((row['Tw Avg Ticket'] - row['Lw Avg Ticket']) / row['Lw Avg Ticket'] * 100) 
                                          if row['Lw Avg Ticket'] != 0 else 0, axis=1)
    result_df['Tw vs. Ly'] = result_df.apply(lambda row: 
                                          ((row['Tw Avg Ticket'] - row['Ly Avg Ticket']) / row['Ly Avg Ticket'] * 100) 
                                          if row['Ly Avg Ticket'] != 0 else 0, axis=1)
    
    # Round percentage values to 2 decimal places
    result_df['Tw vs. Lw'] = round(result_df['Tw vs. Lw'], 2)
    result_df['Tw vs. Ly'] = round(result_df['Tw vs. Ly'], 2)
    
    # Calculate grand total
    # For the grand total row, calculate each total and then the average
    total_tw_sales = result_df['Tw Sales'].sum()
    total_lw_sales = result_df['Lw Sales'].sum()
    total_ly_sales = result_df['Ly Sales'].sum()
    total_tw_orders = result_df['Tw Orders'].sum()
    total_lw_orders = result_df['Lw Orders'].sum()
    total_ly_orders = result_df['Ly Orders'].sum()
    
    # Calculate average tickets for the grand total using the same formulas
    total_tw_avg_ticket = round(total_tw_sales / total_tw_orders, 2) if total_tw_orders != 0 else 0
    total_lw_avg_ticket = round(total_lw_sales / total_lw_orders, 2) if total_lw_orders != 0 else 0
    total_ly_avg_ticket = round(total_ly_sales / total_ly_orders, 2) if total_ly_orders != 0 else 0
    
    # Calculate percentage changes for the grand total
    total_tw_vs_lw = round(((total_tw_avg_ticket - total_lw_avg_ticket) / total_lw_avg_ticket * 100), 2) if total_lw_avg_ticket != 0 else 0
    total_tw_vs_ly = round(((total_tw_avg_ticket - total_ly_avg_ticket) / total_ly_avg_ticket * 100), 2) if total_ly_avg_ticket != 0 else 0
    
    # Create grand total row
    grand_total = pd.DataFrame({
        'Store': ['Grand Total'],
        'Tw Sales': [total_tw_sales],
        'Lw Sales': [total_lw_sales],
        'Ly Sales': [total_ly_sales],
        'Tw Orders': [total_tw_orders],
        'Lw Orders': [total_lw_orders],
        'Ly Orders': [total_ly_orders],
        'Tw Avg Ticket': [total_tw_avg_ticket],
        'Lw Avg Ticket': [total_lw_avg_ticket],
        'Ly Avg Ticket': [total_ly_avg_ticket],
        'Tw vs. Lw': [total_tw_vs_lw],
        'Tw vs. Ly': [total_tw_vs_ly]
    })
    
    # Select only the store and avg ticket columns for the result
    result_cols = ['Store', 'Tw Avg Ticket', 'Lw Avg Ticket', 'Ly Avg Ticket', 'Tw vs. Lw', 'Tw vs. Ly']
    result_df = result_df[result_cols]
    grand_total = grand_total[result_cols]
    
    # Combine results with grand total
    avg_ticket_df= pd.concat([result_df, grand_total], ignore_index=True)
    


# -------------------------------------------------------
# cogs table
# -------------------------------------------------------

    # Group by Store
    store_grouped_cogs = filtered_df.groupby('Store').agg({
        'Tw COGS': 'sum',
        'Lw COGS': 'sum',
        'Tw Sales': 'sum',  # Need sales to calculate percentages
        'Lw Sales': 'sum'
    }).reset_index()
    
    # Calculate comparison columns
    store_grouped_cogs['Tw vs. Lw'] = round((((store_grouped_cogs['Tw COGS'] - store_grouped_cogs['Lw COGS']) / 
                                store_grouped_cogs['Lw COGS']).fillna(0)) * 100, 2)
    
    # Calculate Food Cost percentages (COGS / Sales) * 100
    store_grouped_cogs['Tw Fc %'] = round((store_grouped_cogs['Tw COGS'] / store_grouped_cogs['Tw Sales']) * 100, 2)
    store_grouped_cogs['Lw Fc %'] = round((store_grouped_cogs['Lw COGS'] / store_grouped_cogs['Lw Sales']) * 100, 2)
    
    # Round COGS values to 2 decimal places
    store_grouped_cogs['Tw COGS'] = round(store_grouped_cogs['Tw COGS'], 2)
    store_grouped_cogs['Lw COGS'] = round(store_grouped_cogs['Lw COGS'], 2)
    
    # Remove the Sales columns as they're no longer needed
    store_grouped_cogs.drop(['Tw Sales', 'Lw Sales'], axis=1, inplace=True)
    
    # Calculate grand total
    total_tw_cogs = store_grouped_cogs['Tw COGS'].sum()
    total_lw_cogs = store_grouped_cogs['Lw COGS'].sum()
    
    # Need to recalculate total sales for FC% calculation
    total_tw_sales = filtered_df['Tw Sales'].sum()
    total_lw_sales = filtered_df['Lw Sales'].sum()
    
    # Calculate percentage change for grand total
    tw_vs_lw_total = round(((total_tw_cogs - total_lw_cogs) / total_lw_cogs) * 100, 2) if total_lw_cogs > 0 else 0
    
    # Calculate food cost percentages for grand total
    total_tw_fc_percent = round((total_tw_cogs / total_tw_sales) * 100, 2) if total_tw_sales > 0 else 0
    total_lw_fc_percent = round((total_lw_cogs / total_lw_sales) * 100, 2) if total_lw_sales > 0 else 0
    
    # Create grand total row
    grand_total = pd.DataFrame({
        'Store': ['Grand Total'],
        'Tw COGS': [round(total_tw_cogs, 2)],
        'Lw COGS': [round(total_lw_cogs, 2)],
        'Tw vs. Lw': [tw_vs_lw_total],
        'Tw Fc %': [total_tw_fc_percent],
        'Lw Fc %': [total_lw_fc_percent]
    })
    
    # Combine results
    cogs_df = pd.concat([store_grouped_cogs, grand_total], ignore_index=True)
    
    



# -------------------------------------------------------
# reg pay table
# -------------------------------------------------------


    # Group by Store
    store_grouped_reg_pay = filtered_df.groupby('Store').agg({
        'Tw Reg Pay': 'sum',
        'Lw Reg Pay': 'sum',
        'Tw Sales': 'sum',  # Need sales to calculate labor cost percentages
        'Lw Sales': 'sum'
    }).reset_index()
    
    # Calculate comparison column
    store_grouped_reg_pay['Tw vs. Lw'] = round((((store_grouped_reg_pay['Tw Reg Pay'] - store_grouped_reg_pay['Lw Reg Pay']) / 
                                store_grouped_reg_pay['Lw Reg Pay']).fillna(0)) * 100, 2)
    
    # Calculate Labor Cost percentages (Reg Pay / Sales) * 100
    store_grouped_reg_pay['Tw Lc %'] = round((store_grouped_reg_pay['Tw Reg Pay'] / store_grouped_reg_pay['Tw Sales']) * 100, 2)
    store_grouped_reg_pay['Lw Lc %'] = round((store_grouped_reg_pay['Lw Reg Pay'] / store_grouped_reg_pay['Lw Sales']) * 100, 2)
    
    # Round Reg Pay values to 2 decimal places
    store_grouped_reg_pay['Tw Reg Pay'] = round(store_grouped_reg_pay['Tw Reg Pay'], 2)
    store_grouped_reg_pay['Lw Reg Pay'] = round(store_grouped_reg_pay['Lw Reg Pay'], 2)
    
    # Remove the Sales columns as they're no longer needed
    store_grouped_reg_pay.drop(['Tw Sales', 'Lw Sales'], axis=1, inplace=True)
    
    # Calculate grand total
    total_tw_reg_pay = store_grouped_reg_pay['Tw Reg Pay'].sum()
    total_lw_reg_pay = store_grouped_reg_pay['Lw Reg Pay'].sum()
    
    # Need to recalculate total sales for LC% calculation
    total_tw_sales = filtered_df['Tw Sales'].sum()
    total_lw_sales = filtered_df['Lw Sales'].sum()
    
    # Calculate percentage change for grand total
    tw_vs_lw_total = round(((total_tw_reg_pay - total_lw_reg_pay) / total_lw_reg_pay) * 100, 2) if total_lw_reg_pay > 0 else 0
    
    # Calculate labor cost percentages for grand total
    total_tw_lc_percent = round((total_tw_reg_pay / total_tw_sales) * 100, 2) if total_tw_sales > 0 else 0
    total_lw_lc_percent = round((total_lw_reg_pay / total_lw_sales) * 100, 2) if total_lw_sales > 0 else 0
    
    # Create grand total row
    grand_total = pd.DataFrame({
        'Store': ['Grand Total'],
        'Tw Reg Pay': [round(total_tw_reg_pay, 2)],
        'Lw Reg Pay': [round(total_lw_reg_pay, 2)],
        'Tw vs. Lw': [tw_vs_lw_total],
        'Tw Lc %': [total_tw_lc_percent],
        'Lw Lc %': [total_lw_lc_percent]
    })
    
    # Combine results
    reg_pay_df = pd.concat([store_grouped_reg_pay, grand_total], ignore_index=True)
  





# -------------------------------------------------------
# lb hrs table
# -------------------------------------------------------
    
    # Group by Store
    store_grouped_lb_hrs = filtered_df.groupby('Store').agg({
        'Tw Labor Hrs': 'sum',
        'Lw Labor Hrs': 'sum'
    }).reset_index()
    
    # Rename columns to match the desired output
    store_grouped_lb_hrs.rename(columns={
        'Tw Labor Hrs': 'Tw Lb Hrs',
        'Lw Labor Hrs': 'Lw Lb Hrs'
    }, inplace=True)
    
    # Calculate comparison column
    store_grouped_lb_hrs['Tw vs. Lw'] = round((((store_grouped_lb_hrs['Tw Lb Hrs'] - store_grouped_lb_hrs['Lw Lb Hrs']) / 
                                store_grouped_lb_hrs['Lw Lb Hrs']).fillna(0)) * 100, 2)
    
    # Round Labor Hours values to 2 decimal places
    store_grouped_lb_hrs['Tw Lb Hrs'] = round(store_grouped_lb_hrs['Tw Lb Hrs'], 2)
    store_grouped_lb_hrs['Lw Lb Hrs'] = round(store_grouped_lb_hrs['Lw Lb Hrs'], 2)
    
    # Calculate grand total
    total_tw_lb_hrs = store_grouped_lb_hrs['Tw Lb Hrs'].sum()
    total_lw_lb_hrs = store_grouped_lb_hrs['Lw Lb Hrs'].sum()
    
    # Calculate percentage change for grand total
    tw_vs_lw_total = round(((total_tw_lb_hrs - total_lw_lb_hrs) / total_lw_lb_hrs) * 100, 2) if total_lw_lb_hrs > 0 else 0
    
    # Create grand total row
    grand_total = pd.DataFrame({
        'Store': ['Grand Total'],
        'Tw Lb Hrs': [round(total_tw_lb_hrs, 2)],
        'Lw Lb Hrs': [round(total_lw_lb_hrs, 2)],
        'Tw vs. Lw': [tw_vs_lw_total]
    })
    
    # Combine results
    lb_hrs_df = pd.concat([store_grouped_lb_hrs, grand_total], ignore_index=True)
    




# -------------------------------------------------------
# spmh table
# -------------------------------------------------------

    # Option 1: If SPMH is already a column in your dataframe
    if 'Tw SPMH' in filtered_df.columns and 'Lw SPMH' in filtered_df.columns:
        # Group by Store
        store_grouped_spmh = filtered_df.groupby('Store').agg({
            'Tw SPMH': 'mean',  # Using mean since SPMH is a rate/ratio
            'Lw SPMH': 'mean'
        }).reset_index()
    
    # Option 2: If we need to calculate SPMH from Sales and Labor Hours
    else:
        # First, get the sum of sales and labor hours for each store
        agg_data = filtered_df.groupby('Store').agg({
            'Tw Sales': 'sum',
            'Lw Sales': 'sum',
            'Tw Labor Hrs': 'sum',
            'Lw Labor Hrs': 'sum'
        }).reset_index()
        
        # Calculate SPMH (Sales / Labor Hours)
        agg_data['Tw SPMH'] = agg_data['Tw Sales'] / agg_data['Tw Labor Hrs']
        agg_data['Lw SPMH'] = agg_data['Lw Sales'] / agg_data['Lw Labor Hrs']
        
        # Select only the columns we need
        store_grouped_spmh = agg_data[['Store', 'Tw SPMH', 'Lw SPMH']]
    
    # Calculate comparison column
    store_grouped_spmh['Tw vs. Lw'] = round((((store_grouped_spmh['Tw SPMH'] - store_grouped_spmh['Lw SPMH']) / 
                                store_grouped_spmh['Lw SPMH']).fillna(0)) * 100, 2)
    
    # Round SPMH values to 2 decimal places
    store_grouped_spmh['Tw SPMH'] = round(store_grouped_spmh['Tw SPMH'], 2)
    store_grouped_spmh['Lw SPMH'] = round(store_grouped_spmh['Lw SPMH'], 2)
    
    # Calculate grand total - for SPMH we need total sales / total hours
    # Get the total sales and total labor hours
    if 'Tw SPMH' in filtered_df.columns:
        # If we already have SPMH, need to get sales and hours from the original data
        total_tw_sales = filtered_df['Tw Sales'].sum()
        total_lw_sales = filtered_df['Lw Sales'].sum()
        total_tw_labor_hrs = filtered_df['Tw Labor Hrs'].sum()
        total_lw_labor_hrs = filtered_df['Lw Labor Hrs'].sum()
    else:
        # Use the aggregated data we calculated above
        total_tw_sales = agg_data['Tw Sales'].sum()
        total_lw_sales = agg_data['Lw Sales'].sum()
        total_tw_labor_hrs = agg_data['Tw Labor Hrs'].sum()
        total_lw_labor_hrs = agg_data['Lw Labor Hrs'].sum()
    
    # Calculate overall SPMH
    total_tw_spmh = round(total_tw_sales / total_tw_labor_hrs, 2) if total_tw_labor_hrs > 0 else 0
    total_lw_spmh = round(total_lw_sales / total_lw_labor_hrs, 2) if total_lw_labor_hrs > 0 else 0
    
    # Calculate percentage change for grand total
    tw_vs_lw_total = round(((total_tw_spmh - total_lw_spmh) / total_lw_spmh) * 100, 2) if total_lw_spmh > 0 else 0
    
    # Create grand total row
    grand_total = pd.DataFrame({
        'Store': ['Grand Total'],
        'Tw SPMH': [total_tw_spmh],
        'Lw SPMH': [total_lw_spmh],
        'Tw vs. Lw': [tw_vs_lw_total]
    })
    
    # Combine results
    spmh_df = pd.concat([store_grouped_spmh, grand_total], ignore_index=True)
    

    return sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df



# print(companywide_tables(df))