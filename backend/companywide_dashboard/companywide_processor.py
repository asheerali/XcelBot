import pandas as pd
import io
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import numpy as np
from companywide_dashboard.companywide_processor import companywide_tables



def process_companywide_file(file_data: Union[io.BytesIO, str], store_filter='All', year_filter=None, quarter_filter='All', helper4_filter='All'):
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
    
    print("Type of file_data:", type(file_data))

    try:
            if isinstance(file_data, io.BytesIO):
                file_data.seek(0)
                print("Reading Excel from BytesIO object.")
                df = pd.read_excel(file_data, sheet_name="Actuals")
            elif isinstance(file_data, str):
                print("Reading Excel from file path.")
                df = pd.read_excel(file_data, sheet_name="Actuals")
          
            if df.empty:
                raise ValueError("The sheet 'Database' is empty or missing.")
    except ValueError as e:
        raise ValueError("Sheet named 'Database' not found in the uploaded Excel file.")

    
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
 
    sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df = companywide_tables(df, store_filter=store_filter, year_filter=year_filter, quarter_filter=quarter_filter, helper4_filter=helper4_filter)
 
    return sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df
