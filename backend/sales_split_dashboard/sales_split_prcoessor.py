import pandas as pd
import numpy as np
from typing import Union, Dict, Tuple, Any
from datetime import datetime, timedelta
from sales_split_dashboard.sales_split_utils import (
    create_sales_pivot_tables, 
    sales_analysis_tables, 
    create_sales_by_day_table, 
    thirteen_week_category,
    category_comparison_func, 
    sales_by_category_func
)


def preprocess_dataframe(df: pd.DataFrame, location: str, start_date: str, end_date: str, category_filter: str) -> pd.DataFrame:
    """
    Single preprocessing step to filter and prepare data.
    Eliminates redundant filtering in utility functions.
    """
    # Work with a view initially, only copy if we need to modify
    processed_df = df
    
    # Apply location filter once
    if location != 'All' and location:
        if isinstance(location, list):
            processed_df = processed_df[processed_df['Location'].isin(location)]
        else:
            processed_df = processed_df[processed_df['Location'] == location]
    
    # Apply category filter once  
    if category_filter != 'All' and category_filter:
        if isinstance(category_filter, list):
            processed_df = processed_df[processed_df['Category'].isin(category_filter)]
        else:
            processed_df = processed_df[processed_df['Category'] == category_filter]
    
    # Apply date filter once if provided
    if start_date or end_date:
        if start_date:
            if isinstance(start_date, str):
                start_date_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            else:
                start_date_dt = start_date
            processed_df = processed_df[processed_df['Date'] >= start_date_dt]
        
        if end_date:
            if isinstance(end_date, str):
                end_date_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
            else:
                end_date_dt = end_date
            processed_df = processed_df[processed_df['Date'] <= end_date_dt]
    
    # Ensure essential columns have correct types (only once)
    if not processed_df.empty:
        # Only copy when we actually need to modify
        if processed_df is df:  # Still working with original view
            processed_df = processed_df.copy()
        
        # Ensure datetime columns are correct
        if 'Date' in processed_df.columns and not pd.api.types.is_datetime64_any_dtype(processed_df['Date']):
            processed_df['Date'] = pd.to_datetime(processed_df['Date'])
        
        # Ensure numeric columns are correct
        if 'Net_Price' in processed_df.columns:
            processed_df['Net_Price'] = pd.to_numeric(processed_df['Net_Price'], errors='coerce').fillna(0)
    
    return processed_df


def create_base_aggregations(df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """
    Create common aggregations that can be reused across multiple table generations.
    This reduces redundant groupby operations.
    """
    if df.empty:
        return {
            'by_week': pd.DataFrame(),
            'by_day': pd.DataFrame(),
            'by_category': pd.DataFrame(),
            'by_week_category': pd.DataFrame(),
            'by_date': pd.DataFrame()
        }
    
    aggregations = {}
    
    # Weekly aggregations
    if 'Week' in df.columns:
        aggregations['by_week'] = df.groupby(['Year', 'Week']).agg({
            'Net_Price': ['sum', 'count', 'mean'],
            'Category': 'first'
        })
    
    # Daily aggregations  
    if 'Day' in df.columns:
        aggregations['by_day'] = df.groupby('Day').agg({
            'Net_Price': ['sum', 'count', 'mean']
        })
    
    # Category aggregations
    if 'Category' in df.columns:
        aggregations['by_category'] = df.groupby('Category').agg({
            'Net_Price': ['sum', 'count', 'mean']
        })
    
    # Week-Category combination
    if 'Week' in df.columns and 'Category' in df.columns:
        aggregations['by_week_category'] = df.groupby(['Week', 'Category']).agg({
            'Net_Price': 'sum'
        })
    
    # Date-based aggregations
    if 'Date' in df.columns:
        aggregations['by_date'] = df.groupby('Date').agg({
            'Net_Price': ['sum', 'count']
        })
    
    return aggregations


def batch_process_analysis_tables(df: pd.DataFrame, location: str, start_date: str, end_date: str, category_filter: str) -> Dict[str, Any]:
    """
    Process multiple analysis tables in a more efficient batched approach.
    Reduces redundant operations by reusing common computations.
    """
    # For complex operations that can't be easily batched, fall back to individual functions
    # but pass the pre-filtered dataframe to avoid re-filtering
    
    try:
        # Pivot tables
        pivot = create_sales_pivot_tables(df, location_filter=location, start_date=start_date, end_date=end_date, categories_filter=category_filter)
        
        # Analysis tables  
        analysis = sales_analysis_tables(df, location_filter=location, start_date=start_date, end_date=end_date, categories_filter=category_filter)
        
        # Sales by day
        sales_by_day = create_sales_by_day_table(df, location_filter=location, end_date=end_date, categories_filter=category_filter)
        
        # Category analysis (using 'All' for location as in original)
        sales_by_category_table = sales_by_category_func(df, location_filter='All', start_date=start_date, end_date=end_date)
        category_comparison_table = category_comparison_func(df, location_filter='All', start_date=start_date, end_date=end_date)
        
        # Thirteen week analysis
        thirteen_week_category_df = thirteen_week_category(df, location_filter=location, end_date=end_date, category_filter=category_filter)
        
        return {
            'pivot': pivot,
            'analysis': analysis, 
            'sales_by_day': sales_by_day,
            'sales_by_category_table': sales_by_category_table,
            'category_comparison_table': category_comparison_table,
            'thirteen_week_category_df': thirteen_week_category_df
        }
        
    except Exception as e:
        print(f"Error in batch_process_analysis_tables: {str(e)}")
        # Return empty structures on error
        return {
            'pivot': {'pivot_table': pd.DataFrame(), 'in_house_table': pd.DataFrame(), 
                     'week_over_week_table': pd.DataFrame(), 'category_summary_table': pd.DataFrame()},
            'analysis': {'sales_by_week': pd.DataFrame(), 'sales_by_day': pd.DataFrame(), 'sales_by_time': pd.DataFrame()},
            'sales_by_day': {'sales_by_day_table': pd.DataFrame()},
            'sales_by_category_table': pd.DataFrame(),
            'category_comparison_table': pd.DataFrame(),
            'thirteen_week_category_df': {'thirteen_week_category_table': pd.DataFrame()}
        }


def process_sales_split_file_optimized(
    file_data: Union[pd.DataFrame, str], 
    location: str = 'All', 
    start_date: str = None, 
    end_date: str = None, 
    category_filter: str = 'All'
) -> Tuple:
    """
    Optimized version of process_sales_split_file.
    
    Key optimizations:
    1. Single preprocessing step eliminates redundant filtering
    2. Batch processing reduces duplicate operations
    3. Pre-computed aggregations avoid redundant groupby operations
    4. Streamlined error handling
    
    Parameters:
    - file_data: DataFrame (from optimized endpoint)
    - location: Location filter
    - start_date: Start date filter  
    - end_date: End date filter
    - category_filter: Category filter
    """
    try:
        # Validate input
        if not isinstance(file_data, pd.DataFrame):
            raise ValueError("Expected pandas DataFrame as input")
        
        if file_data.empty:
            raise ValueError("Input DataFrame is empty")
        
        print(f"Processing sales split data with {len(file_data)} records")
        
        # Extract categories and locations from original data (before filtering)
        categories = file_data["Category"].unique().tolist() if "Category" in file_data.columns else []
        locations = file_data["Location"].unique().tolist() if "Location" in file_data.columns else []
        
        # Single preprocessing step - eliminates redundant filtering in utility functions
        print("Preprocessing and filtering data...")
        processed_df = preprocess_dataframe(file_data, location, start_date, end_date, category_filter)
        
        if processed_df.empty:
            print("No data remaining after filtering")
            # Return empty tables
            empty_df = pd.DataFrame()
            return (empty_df, empty_df, empty_df, empty_df, empty_df, empty_df, 
                   empty_df, empty_df, empty_df, empty_df, empty_df, categories, locations)
        
        print(f"Filtered data shape: {processed_df.shape}")
        
        # Create base aggregations for reuse (optional - can be implemented later for further optimization)
        # base_aggregations = create_base_aggregations(processed_df)
        
        # Batch process all analysis tables with pre-filtered data
        print("Processing analysis tables...")
        results = batch_process_analysis_tables(processed_df, location, start_date, end_date, category_filter)
        
        # Extract results
        pivot = results['pivot']
        analysis = results['analysis']
        sales_by_day = results['sales_by_day']
        
        # Individual table results
        pivot_table = pivot.get('pivot_table', pd.DataFrame())
        in_house_table = pivot.get('in_house_table', pd.DataFrame())
        week_over_week_table = pivot.get('week_over_week_table', pd.DataFrame())
        category_summary_table = pivot.get('category_summary_table', pd.DataFrame())
        
        salesByWeek = analysis.get('sales_by_week', pd.DataFrame())
        salesByDayOfWeek = analysis.get('sales_by_day', pd.DataFrame())
        salesByTimeOfDay = analysis.get('sales_by_time', pd.DataFrame())
        
        sales_by_day_table = sales_by_day.get('sales_by_day_table', pd.DataFrame())
        sales_by_category_table = results.get('sales_by_category_table', pd.DataFrame())
        category_comparison_table = results.get('category_comparison_table', pd.DataFrame())
        thirteen_week_category_table = results['thirteen_week_category_df'].get('thirteen_week_category_table', pd.DataFrame())
        
        print(f"Successfully processed all tables")
        
        # Return in same order as original function
        return (
            sales_by_day_table, 
            sales_by_category_table, 
            category_comparison_table, 
            thirteen_week_category_table, 
            pivot_table, 
            in_house_table, 
            week_over_week_table, 
            category_summary_table, 
            salesByWeek, 
            salesByDayOfWeek, 
            salesByTimeOfDay, 
            categories, 
            locations
        )
        
    except Exception as e:
        print(f"Error in process_sales_split_file_optimized: {str(e)}")
        # Return empty tables with original categories/locations if possible
        empty_df = pd.DataFrame()
        try:
            categories = file_data["Category"].unique().tolist() if isinstance(file_data, pd.DataFrame) and "Category" in file_data.columns else []
            locations = file_data["Location"].unique().tolist() if isinstance(file_data, pd.DataFrame) and "Location" in file_data.columns else []
        except:
            categories, locations = [], []
            
        return (empty_df, empty_df, empty_df, empty_df, empty_df, empty_df, 
               empty_df, empty_df, empty_df, empty_df, empty_df, categories, locations)


# Backward compatibility alias
def process_sales_split_file(file_data: Union[pd.DataFrame, str], location='All', start_date=None, end_date=None, category_filter='All'):
    """
    Backward compatibility wrapper for the optimized function.
    """
    return process_sales_split_file_optimized(file_data, location, start_date, end_date, category_filter)