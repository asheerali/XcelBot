import pandas as pd
import io
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import numpy as np
from financials_dashboard.financials_utils import financials_filters, day_of_the_week_tables, calculate_tw_lw_bdg_comparison


# def process_financials_file(file_data: Union[io.BytesIO, str], year="All", week_range="All", location="All", start_date=None, end_date=None):
#     """
#     Process the uploaded Excel file and transform the data.
#     Returns data tables for the frontend including the 1P column.
    
#     Parameters:
#     - file_data: Excel file as BytesIO object
#     - start_date: Optional start date for filtering (str format: 'YYYY-MM-DD')
#     - end_date: Optional end date for filtering (str format: 'YYYY-MM-DD')
#     - location: Optional location name for filtering
#     """
#     # Read the Excel file
#     # df = pd.read_excel(file_data)
    
#     # print("Type of file_data:", type(file_data))

#     try:
#             if isinstance(file_data, io.BytesIO):
#                 file_data.seek(0)
#                 print("Reading Excel from BytesIO object.")
#                 # df = pd.read_excel(file_data, sheet_name="Database")
#                 df = pd.read_excel(file_data, sheet_name="Actuals")
#                 file_data.seek(0)
#                 # df_budget = pd.read_excel(file_data, sheet_name="Budget")
#                 df_budget = pd.read_excel(file_data, sheet_name="Budget", header=1)

#             elif isinstance(file_data, str):
#                 print("Reading Excel from file path.")
#                 # df = pd.read_excel(file_data, sheet_name="Database")
#                 df = pd.read_excel(file_data, sheet_name="Actuals")
#                 # df_budget = pd.read_excel(file_data, sheet_name="Budget")
#                 df_budget = pd.read_excel(file_data, sheet_name="Budget", header=1)

          
#             if df.empty:
#                 raise ValueError("The sheet 'Actuals' is empty or missing.")
#     except ValueError as e:
#         raise ValueError("Sheet named 'Actuals' not found in the uploaded Excel file.")

#     # df_budget = pd.read_excel(file_bytes, sheet_name="Budget", header=1)

#         # Strip whitespace from column names
#     df.columns = df.columns.str.strip()

#     # Define columns to exclude from filling
#     exclude_cols = ['Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
#                     'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4']

#     # Get all columns that should be filled with 0
#     fill_cols = [col for col in df.columns if col not in exclude_cols]

#     # Replace NaN with 0 only in selected columns
#     df[fill_cols] = df[fill_cols].fillna(0)

#     # Fill excluded (metadata/helper) columns with empty string
#     df[exclude_cols] = df[exclude_cols].fillna('')
#     df["Store"] = df["Store"].str.replace(r'^\d{4}:\s*', '', regex=True)


#     # Strip whitespace from column names
#     df_budget.columns = df_budget.columns.str.strip()

#     # Identify all column names
#     cols = list(df_budget.columns)

#     # Replace only the first occurrence of "Net Sales" with "Net Sales 1"
#     found = False
#     for i, col in enumerate(cols):
#         if col.strip() == "Net Sales" and not found:
#             cols[i] = "Net Sales 1"
#             found = True

#     # Assign the modified column names back
#     df_budget.columns = cols


#     # Define columns to exclude from numeric NaN filling
#     exclude_cols = [
#         'Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
#         'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4', 'Helper'  # Include any actual column names in your sheet
#     ]

#     # Ensure all exclude columns that are present in df_budget
#     exclude_cols = [col for col in exclude_cols if col in df_budget.columns]

#     # Get all columns that should be filled with 0
#     fill_cols = [col for col in df_budget.columns if col not in exclude_cols]

#     # Replace NaN with 0 only in selected columns
#     df_budget[fill_cols] = df_budget[fill_cols].fillna(0)

#     # Fill excluded (metadata/helper) columns with empty string
#     df_budget[exclude_cols] = df_budget[exclude_cols].fillna('')

#     df_budget["Store"] = df_budget["Store"].str.replace(r'^\d{4}:\s*', '', regex=True)
#     df_budget["Store"].unique()  # Display unique values in the 'stores' column

#     years = df["Year"].unique().tolist()  # Display unique values in the 'Year' column
#     dates = df["Helper 4"].unique().tolist()  # Display unique values in the 'Helper 4' column
#     stores = df["Store"].unique().tolist()  # Display unique values in the 'stores' column
#     df["Date"] = df["Date"].dt.date
#     df_budget["Date"] = df_budget["Date"].dt.date

#     financials_weeks, financials_years, financials_stores = financials_filters(df)
#     print("i am here checking the startdate and end date 3", start_date, end_date)
#     financials_sales_table, financials_orders_table, financials_avg_ticket_table = day_of_the_week_tables(df, store=location, start_date=start_date, end_date=end_date) 
    
#     financials_tw_lw_bdg_table =  calculate_tw_lw_bdg_comparison(df,df_budget, store=location, year=year, week_range=week_range, start_date=start_date, end_date=end_date)
    
#     # print("i am here 3")
#     # print(financials_tw_lw_bdg_table)
    
#     # result = {
#     #         "table1": [financials_weeks, financials_years, financials_stores],    # Raw data table
#     #         "table2": financials_years,    # Percentage table
#     #         "table3": financials_sales_table,    # In-House percentages
#     #         "table4": financials_orders_table,    # Week-over-Week table
#     #         "table5": financials_avg_ticket_table,    # Category summary
#     #         "locations": "locations",   # List of all locations (not just filtered ones)
#     #         "dateRanges": "" # List of available date ranges
#     #     }
#     # return result

#     return financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table, years, dates, stores
#     # return {
#     #     table1: financials_weeks,
#     #     table2: financials_years,
#     #     table3: financials_sales_table,
#     #     table4: financials_orders_table,
#     #     table5: financials_avg_ticket_table,
#     #     table6: financials_tw_lw_bdg_table,

#     # }
#     # except Exception as e:
#     #     # Log the error
#     #     print(f"Error processing Excel file: {str(e)}")
#     #     import traceback
#     #     print(traceback.format_exc())
#     #     # Re-raise to be caught by the endpoint handler
#     #     raise
    


def process_financials_file(file_data: Union[io.BytesIO, str], year="All", week_range="All", location="All", start_date=None, end_date=None):
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
    
    # print("Type of file_data:", type(file_data))

    try:
            if isinstance(file_data, io.BytesIO):
                file_data.seek(0)
                print("Reading Excel from BytesIO object.")
                # df = pd.read_excel(file_data, sheet_name="Database")
                df = pd.read_excel(file_data, sheet_name="Actuals")
                file_data.seek(0)
                # df_budget = pd.read_excel(file_data, sheet_name="Budget")
                df_budget = pd.read_excel(file_data, sheet_name="Budget", header=1)

            elif isinstance(file_data, str):
                print("Reading Excel from file path.")
                # df = pd.read_excel(file_data, sheet_name="Database")
                df = pd.read_excel(file_data, sheet_name="Actuals")
                # df_budget = pd.read_excel(file_data, sheet_name="Budget")
                df_budget = pd.read_excel(file_data, sheet_name="Budget", header=1)

          
            if df.empty:
                raise ValueError("The sheet 'Actuals' is empty or missing.")
    except ValueError as e:
        raise ValueError("Sheet named 'Actuals' not found in the uploaded Excel file.")

    # df_budget = pd.read_excel(file_bytes, sheet_name="Budget", header=1)

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    
    # ===== ADD HELPER COLUMN CHECK HERE =====
    # Check if Helper 1 and Helper 4 exist, create them if they don't
    if 'Helper 1' not in df.columns:
        print("Helper 1 column not found. Creating Helper 1 column...")
        # Find the position after Year column or at the end
        if 'Year' in df.columns:
            year_idx = df.columns.get_loc('Year')
            df.insert(year_idx + 1, 'Helper 1', '')
        else:
            df['Helper 1'] = ''
    else:
        print("Helper 1 column already exists.")
    
    if 'Helper 4' not in df.columns:
        print("Helper 4 column not found. Creating Helper 4 column...")
        # Find the position after Helper columns
        helper_cols = [col for col in df.columns if col.startswith('Helper')]
        if helper_cols:
            # Insert after the last existing Helper column
            last_helper_col = max(helper_cols, key=lambda x: int(x.split()[-1]) if x.split()[-1].isdigit() else 0)
            last_helper_idx = df.columns.get_loc(last_helper_col)
            df.insert(last_helper_idx + 1, 'Helper 4', '')
        else:
            df['Helper 4'] = ''
    else:
        print("Helper 4 column already exists.")
    # ===== END HELPER COLUMN CHECK =====

    # Define columns to exclude from filling
    exclude_cols = ['Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
                    'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4']

    # Get all columns that should be filled with 0
    fill_cols = [col for col in df.columns if col not in exclude_cols]

    # Replace NaN with 0 only in selected columns
    df[fill_cols] = df[fill_cols].fillna(0)

    # Fill excluded (metadata/helper) columns with empty string
    df[exclude_cols] = df[exclude_cols].fillna('')
    df["Store"] = df["Store"].str.replace(r'^\d{4}:\s*', '', regex=True)


    # Strip whitespace from column names for budget dataframe
    df_budget.columns = df_budget.columns.str.strip()
    
    # ===== ADD HELPER COLUMN CHECK FOR BUDGET DF TOO =====
    # Check if Helper 1 and Helper 4 exist in budget dataframe, create them if they don't
    if 'Helper 1' not in df_budget.columns:
        print("Helper 1 column not found in budget data. Creating Helper 1 column...")
        if 'Year' in df_budget.columns:
            year_idx = df_budget.columns.get_loc('Year')
            df_budget.insert(year_idx + 1, 'Helper 1', '')
        else:
            df_budget['Helper 1'] = ''
    
    if 'Helper 4' not in df_budget.columns:
        print("Helper 4 column not found in budget data. Creating Helper 4 column...")
        helper_cols = [col for col in df_budget.columns if col.startswith('Helper')]
        if helper_cols:
            last_helper_col = max(helper_cols, key=lambda x: int(x.split()[-1]) if x.split()[-1].isdigit() else 0)
            last_helper_idx = df_budget.columns.get_loc(last_helper_col)
            df_budget.insert(last_helper_idx + 1, 'Helper 4', '')
        else:
            df_budget['Helper 4'] = ''
    # ===== END HELPER COLUMN CHECK FOR BUDGET DF =====

    # Identify all column names
    cols = list(df_budget.columns)

    # Replace only the first occurrence of "Net Sales" with "Net Sales 1"
    found = False
    for i, col in enumerate(cols):
        if col.strip() == "Net Sales" and not found:
            cols[i] = "Net Sales 1"
            found = True

    # Assign the modified column names back
    df_budget.columns = cols

    
    # Define columns to exclude from numeric NaN filling
    exclude_cols = [
        'Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
        'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4', 'Helper'  # Include any actual column names in your sheet
    ]

    # Ensure all exclude columns that are present in df_budget
    exclude_cols = [col for col in exclude_cols if col in df_budget.columns]

    # Get all columns that should be filled with 0
    fill_cols = [col for col in df_budget.columns if col not in exclude_cols]

    # Replace NaN with 0 only in selected columns
    df_budget[fill_cols] = df_budget[fill_cols].fillna(0)

    # Fill excluded (metadata/helper) columns with empty string
    df_budget[exclude_cols] = df_budget[exclude_cols].fillna('')

    df_budget["Store"] = df_budget["Store"].str.replace(r'^\d{4}:\s*', '', regex=True)
    df_budget["Store"].unique()  # Display unique values in the 'stores' column

    years = df["Year"].unique().tolist()  # Display unique values in the 'Year' column
    dates = df["Helper 4"].unique().tolist()  # Display unique values in the 'Helper 4' column
    stores = df["Store"].unique().tolist()  # Display unique values in the 'stores' column
    df["Date"] = df["Date"].dt.date
    df_budget["Date"] = df_budget["Date"].dt.date

    financials_weeks, financials_years, financials_stores = financials_filters(df)
    print("i am here checking the startdate and end date 3", start_date, end_date)
    financials_sales_table, financials_orders_table, financials_avg_ticket_table = day_of_the_week_tables(df, store=location, start_date=start_date, end_date=end_date) 
    
    financials_tw_lw_bdg_table =  calculate_tw_lw_bdg_comparison(df,df_budget, store=location, year=year, week_range=week_range, start_date=start_date, end_date=end_date)
    
    # print("i am here 3")
    # print(financials_tw_lw_bdg_table)
    
    # result = {
    #         "table1": [financials_weeks, financials_years, financials_stores],    # Raw data table
    #         "table2": financials_years,    # Percentage table
    #         "table3": financials_sales_table,    # In-House percentages
    #         "table4": financials_orders_table,    # Week-over-Week table
    #         "table5": financials_avg_ticket_table,    # Category summary
    #         "locations": "locations",   # List of all locations (not just filtered ones)
    #         "dateRanges": "" # List of available date ranges
    #     }
    # return result

    return financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table, years, dates, stores
