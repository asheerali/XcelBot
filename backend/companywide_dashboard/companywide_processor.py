import pandas as pd
import io
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import numpy as np
from companywide_dashboard.companywide_utils import companywide_tables

def process_companywide_file(df1, store_filter='All', year_filter=None, quarter_filter='All', helper4_filter='All', start_date=None, end_date=None):
    """
    Process the uploaded Excel file and transform the data.
    Returns data tables for the frontend including the 1P column.
    
    Parameters:
    - file_data: Excel file as BytesIO object, bytes, DataFrame, or file path string
    - start_date: Optional start date for filtering (str format: 'YYYY-MM-DD')
    - end_date: Optional end date for filtering (str format: 'YYYY-MM-DD')
    - location: Optional location name for filtering
    """
        
    try:
            if isinstance(df1, pd.DataFrame):
                print("Received DataFrame directly.")
                df = df1

            if df.empty:
                raise ValueError("The sheet 'Database' is empty or missing.")
    except ValueError as e:
        raise ValueError("Sheet named 'Database' not found in the uploaded Excel file.")


 
    
    # # ===== ADD HELPER COLUMN CHECK HERE =====
    # # Check if Helper 1 and Helper 4 exist, create them if they don't
    # if 'Helper 1' not in df.columns:
    #     print("Helper 1 column not found. Creating Helper 1 column...")
    #     # Find the position after Year column or at the end
    #     if 'Year' in df.columns:
    #         year_idx = df.columns.get_loc('Year')
    #         df.insert(year_idx + 1, 'Helper 1', '')
    #     else:
    #         df['Helper 1'] = ''
    # else:
    #     print("Helper 1 column already exists.")
    
    # if 'Helper 4' not in df.columns:
    #     print("Helper 4 column not found. Creating Helper 4 column...")
    #     # Find the position after Helper columns
    #     helper_cols = [col for col in df.columns if col.startswith('Helper')]
    #     if helper_cols:
    #         # Insert after the last existing Helper column
    #         last_helper_col = max(helper_cols, key=lambda x: int(x.split()[-1]) if x.split()[-1].isdigit() else 0)
    #         last_helper_idx = df.columns.get_loc(last_helper_col)
    #         df.insert(last_helper_idx + 1, 'Helper 4', '')
    #     else:
    #         df['Helper 4'] = ''
    # else:
    #     print("Helper 4 column already exists.")
    # # ===== END HELPER COLUMN CHECK =====
    
    # print("i am here 2")

    # # Define columns to exclude from filling
    # exclude_cols = ['Store', 'Ly Date', 'Date', 'Day', 'Week', 'Month', 'Quarter', 'Year',
    #                 'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4']

    # # Get all columns that should be filled with 0
    # fill_cols = [col for col in df.columns if col not in exclude_cols]

    # # Replace NaN with 0 only in selected columns
    # df[fill_cols] = df[fill_cols].fillna(0)

    # # Fill excluded (metadata/helper) columns with empty string
    # df[exclude_cols] = df[exclude_cols].fillna('')
    # df["Store"] = df["Store"].str.replace(r'^\d{4}:\s*', '', regex=True)
    
    years = df["Year"].unique().tolist()  # Display unique values in the 'Year' column
    dates = df["Helper_4"].unique().tolist()  # Display unique values in the 'Helper 4' column
    stores = df["Store"].unique().tolist()  # Display unique values in the 'stores' column

 
    (sales_df, 
     order_df, 
     avg_ticket_df, 
     cogs_df, 
     reg_pay_df, 
     lb_hrs_df, 
     spmh_df) = companywide_tables(df, 
                                   store_filter=store_filter, 
                                   year_filter=year_filter, 
                                   quarter_filter=quarter_filter, 
                                   helper4_filter=helper4_filter, 
                                   start_date=start_date,
                                   end_date=end_date)
 

    return sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df, years, dates, stores

