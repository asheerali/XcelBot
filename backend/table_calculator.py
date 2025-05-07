import pandas as pd
import numpy as np

def calculate_raw_data_table(df):
    """
    TABLE 1: Raw Data Table (Week, 1P, Catering, DD, GH, In-House, UB, Grand Total)
    This table shows the raw sales numbers for each category.
    """
    # Group by Week and Sales_Category, sum the Net Price
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data to create the weekly summary table
    pivot_table = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_table.columns:
            pivot_table[col] = 0
    
    # Calculate 1P column (First Party) - equivalent to In-House sales
    pivot_table['1P'] = pivot_table['In-House']
    
    # Calculate Grand Total
    pivot_table['Grand Total'] = pivot_table[
        ['Catering', 'DD', 'GH', 'In-House', 'UB']
    ].sum(axis=1)
    
    # Reorder columns to match expected format
    column_order = ['Week', '1P', 'Catering', 'DD', 'GH', 'In-House', 'UB', 'Grand Total']
    pivot_table = pivot_table[
        [col for col in column_order if col in pivot_table.columns]
    ]
    
    # Format the currency values
    for col in pivot_table.columns:
        if col != 'Week':
            pivot_table[col] = pivot_table[col].apply(lambda x: f"${x:,.2f}")
    
    # Convert to records format for JSON serialization
    return pivot_table.to_dict(orient='records')


def calculate_percentage_table(df):
    """
    TABLE 2: Percentage Table (Week, 1P, Catering, DD, GH, In-House, UB)
    This table shows week-over-week percentage changes for each category.
    """
    # First, get the raw data table (without formatting)
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data
    pivot_raw = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_raw.columns:
            pivot_raw[col] = 0
    
    # Add 1P column (equivalent to In-House)
    pivot_raw['1P'] = pivot_raw['In-House']
    
    # Sort by Week
    pivot_raw = pivot_raw.sort_values('Week')
    
    # Initialize the percentage change table
    pct_change_cols = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']
    pct_table = pd.DataFrame()
    pct_table['Week'] = pivot_raw['Week']
    
    # Calculate percentage changes for each column
    for col in pct_change_cols:
        if col in pivot_raw.columns:
            # Calculate percentage change with shift
            pct_table[col] = pivot_raw[col].pct_change() * 100
            
    # Format the percentage values
    for col in pct_table.columns:
        if col != 'Week':
            pct_table[col] = pct_table[col].apply(lambda x: f"{x:.2f}%" if not pd.isna(x) else "####")
    
    # Convert to records format for JSON serialization
    return pct_table.to_dict(orient='records')


def calculate_inhouse_percentages(df):
    """
    TABLE 3: In-House Table (Week, 1P, In-House, Catering, DD, GH, UB)
    This table shows each category as a percentage of In-House sales.
    """
    # First, get the raw data table (without formatting)
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data
    pivot_raw = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_raw.columns:
            pivot_raw[col] = 0
    
    # Add 1P column (equivalent to In-House)
    pivot_raw['1P'] = pivot_raw['In-House']
    
    # Initialize the percentage of In-House table
    pct_ih_table = pd.DataFrame()
    pct_ih_table['Week'] = pivot_raw['Week']
    
    # Calculate as a percentage of In-House sales
    pct_cols = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB']
    for col in pct_cols:
        if col in pivot_raw.columns:
            pct_ih_table[col] = (pivot_raw[col] / pivot_raw['In-House'] * 100)
    
    # Format the percentage values - using numpy.isinf instead of pd.isinf
    for col in pct_ih_table.columns:
        if col != 'Week':
            pct_ih_table[col] = pct_ih_table[col].apply(lambda x: f"{x:.2f}%" if not pd.isna(x) and not np.isinf(x) else "####")
    
    # Convert to records format for JSON serialization
    return pct_ih_table.to_dict(orient='records')


def calculate_wow_table(df):
    """
    TABLE 4: WOW Table (Week, 1P, In-House, Catering, DD, GH, UB, 3P, 1P/3P)
    Week-over-Week data with 3P (Third-Party) totals and 1P to 3P ratio.
    """
    # First, get the raw data table (without formatting)
    weekly_summary = df.groupby(['Week', 'Sales_Category'])['Net Price'].sum().reset_index()
    
    # Pivot the data
    pivot_raw = weekly_summary.pivot_table(
        index='Week', 
        columns='Sales_Category', 
        values='Net Price',
        aggfunc='sum',
        fill_value=0
    ).reset_index()
    
    # Make sure all required columns exist
    required_columns = ['Catering', 'DD', 'GH', 'In-House', 'UB']
    for col in required_columns:
        if col not in pivot_raw.columns:
            pivot_raw[col] = 0
    
    # Add 1P column (equivalent to In-House)
    pivot_raw['1P'] = pivot_raw['In-House']
    
    # Calculate 3P (Third Party) column - sum of DD, GH, UB
    pivot_raw['3P'] = pivot_raw['DD'] + pivot_raw['GH'] + pivot_raw['UB']
    
    # Calculate 1P/3P ratio
    pivot_raw['1P/3P'] = pivot_raw['1P'] / pivot_raw['3P'].replace(0, float('nan'))
    
    # Sort by Week
    pivot_raw = pivot_raw.sort_values('Week')
    
    # Create the WOW (Week over Week) table
    wow_table = pd.DataFrame()
    wow_table['Week'] = pivot_raw['Week']
    
    # Calculate week-over-week percentage changes
    wow_cols = ['1P', 'In-House', 'Catering', 'DD', 'GH', 'UB', '3P', '1P/3P']
    for col in wow_cols:
        if col in pivot_raw.columns:
            wow_table[col] = pivot_raw[col].pct_change() * 100
    
    # Format the percentage values
    for col in wow_table.columns:
        if col != 'Week':
            wow_table[col] = wow_table[col].apply(lambda x: f"{x:.2f}%" if not pd.isna(x) else "####")
    
    # Convert to records format for JSON serialization
    return wow_table.to_dict(orient='records')


def calculate_category_summary(df):
    """
    TABLE 5: Category summary table
    This table summarizes sales by category with totals and percentages.
    """
    # Calculate summary by category
    category_summary = df.groupby('Sales_Category').agg(
        Amount=('Net Price', 'sum'),
        Transactions=('Net Price', 'count')
    ).reset_index()
    
    # Calculate 1P category (equivalent to In-House)
    inhouse_data = category_summary[category_summary['Sales_Category'] == 'In-House'].copy()
    if not inhouse_data.empty:
        inhouse_data['Sales_Category'] = '1P'
        category_summary = pd.concat([category_summary, inhouse_data], ignore_index=True)
    
    # Calculate total sales
    total_sales = df['Net Price'].sum()
    category_summary['% of Total'] = ((category_summary['Amount'] / total_sales) * 100).round(1)
    category_summary['Avg Transaction'] = (category_summary['Amount'] / category_summary['Transactions']).round(2)
    
    # Format for display
    category_summary['Amount'] = category_summary['Amount'].apply(lambda x: f"${x:,.2f}")
    category_summary['% of Total'] = category_summary['% of Total'].astype(str) + '%'
    category_summary['Avg Transaction'] = category_summary['Avg Transaction'].apply(lambda x: f"${x:,.2f}")
    
    return category_summary.to_dict(orient='records')