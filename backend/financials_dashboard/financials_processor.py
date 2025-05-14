import pandas as pd
import io
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from financials_dashboard.financials_utils import financials_filters, day_of_the_week_tables, calculate_tw_lw_bdg_comparison



def process_financials_file(file_data: io.BytesIO, start_date=None, end_date=None, location=None):
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
    file_data.seek(0)
    print("Type of file_data:", type(file_data))

    try:
        # print("i am here 1")
        df = pd.read_excel(file_data, sheet_name="Database")
    except ValueError as e:
        raise ValueError("Sheet named 'Database' not found in the uploaded Excel file.")

    
    # Reset the file pointer for further operations
    file_data.seek(0)

    # Strip whitespace from column names
    df.columns = df.columns.str.strip()
    # print("i am here 2")

    # Define columns to exclude from filling
    exclude_cols = ['Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
                    'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4']

    # Get all columns that should be filled with 0
    fill_cols = [col for col in df.columns if col not in exclude_cols]

    # Replace NaN with 0 only in selected columns
    df[fill_cols] = df[fill_cols].fillna(0)

    # Fill excluded (metadata/helper) columns with empty string
    df[exclude_cols] = df[exclude_cols].fillna('')

    financials_weeks, financials_years, financials_stores = financials_filters(df)
    
    financials_sales_table, financials_orders_table, financials_avg_ticket_table = day_of_the_week_tables(df)
    
    if location == "0001: Midtown East":
        financials_tw_lw_bdg_table =  calculate_tw_lw_bdg_comparison(df, store="0001: Midtown East", year=2025, week_range="1 | 12/30/2024 - 01/05/2025")
    else:
        financials_tw_lw_bdg_table =  calculate_tw_lw_bdg_comparison(df, store="0001: Midtown East", year=2025, week_range="1 | 12/30/2024 - 01/05/2025")
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

    return financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table
    # return {
    #     table1: financials_weeks,
    #     table2: financials_years,
    #     table3: financials_sales_table,
    #     table4: financials_orders_table,
    #     table5: financials_avg_ticket_table,
    #     table6: financials_tw_lw_bdg_table,

    # }
    # except Exception as e:
    #     # Log the error
    #     print(f"Error processing Excel file: {str(e)}")
    #     import traceback
    #     print(traceback.format_exc())
    #     # Re-raise to be caught by the endpoint handler
    #     raise
    



