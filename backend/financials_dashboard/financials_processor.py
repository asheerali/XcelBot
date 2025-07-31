import pandas as pd
import io
import os
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import numpy as np
from financials_dashboard.financials_utils import (financials_filters, 
                                                   day_of_the_week_tables, 
                                                   calculate_tw_lw_bdg_comparison,
                                                   weekly_sales_trend, avg_ticket_by_day,
                                                   kpi_vs_budget, financial_sales_df)


def process_financials_file(df1, df2, year="All", week_range="All", location="All", start_date=None, end_date=None):
    """
    Process the uploaded Excel file and transform the data.
    Returns data tables for the frontend including the 1P column.
    
    Parameters:
    - file_data: Excel file as BytesIO object, file path string, DataFrame, or bytes
    - start_date: Optional start date for filtering (str format: 'YYYY-MM-DD')
    - end_date: Optional end date for filtering (str format: 'YYYY-MM-DD')
    - location: Optional location name for filtering
    """
    
    try:
            if isinstance(df1, pd.DataFrame):
                print("Received DataFrame directly.")
                df = df1

            if df.empty:
                raise ValueError("The table is empty or missing in this date range.")
    except ValueError as e:
        raise ValueError("unable to read the table from the database.")

    try:
        if isinstance(df2, pd.DataFrame):
            # print("Received Budget DataFrame directly.")
            df_budget = df2

        if df_budget.empty:
            raise ValueError("The budget table is empty or missing.")
    except ValueError as e:
        raise ValueError("budget table is not found.")


    years = df["Year"].unique().tolist()  # Display unique values in the 'Year' column
    dates = df["Helper_4"].unique().tolist()  # Display unique values in the 'Helper 4' column
    stores = df["Store"].unique().tolist()  # Display unique values in the 'stores' column

    financials_weeks, financials_years, financials_stores = financials_filters(df)
    financials_sales_table, financials_orders_table, financials_avg_ticket_table = day_of_the_week_tables(df, store=location, start_date=start_date, end_date=end_date) 
    
    # print("i am here 2 in the financials_processor.py printing the financial_sales_table_ and printing the stores",stores, financials_sales_table)
    financials_tw_lw_bdg_table =  calculate_tw_lw_bdg_comparison(df,df_budget, store=location, year=year, week_range=week_range, start_date=start_date, end_date=end_date)
    

    # weekly_sales_trends = weekly_sales_trend(df, df_budget=df_budget, store=location, start_date=start_date, end_date=end_date)

    # print("i am here in the financials processot printing the weekly_sales_trends", weekly_sales_trends)
    
    # avg_ticket_by_day_df = avg_ticket_by_day(df,df_budget=df_budget,  store=location, start_date=start_date, end_date=end_date)
    
    # print("i am here in the financials processor printing the avg_ticket_by_day_df", avg_ticket_by_day_df)
    
    
    kpi_vs_budget_df = kpi_vs_budget(df, df_budget, store=location, start_date=start_date, end_date=end_date)
    
    
    financial_sales_table_df = financial_sales_df(df, df_budget, store=location, start_date=start_date, end_date=end_date)
    
    return (financials_weeks, financials_years, financials_stores, 
            financials_sales_table, financials_orders_table, 
            financials_avg_ticket_table, financials_tw_lw_bdg_table, 
            years, dates, stores, 
            # weekly_sales_trends, avg_ticket_by_day_df,
            kpi_vs_budget_df, financial_sales_table_df)





