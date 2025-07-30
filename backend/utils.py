import os

def find_file_in_directory(directory, partial_filename, location_pattern=None):
    """
    Find a file in a directory that contains the partial filename and optional location pattern.
    
    Args:
        directory (str): The directory to search in
        partial_filename (str): Partial name of the file to find
        location_pattern (str, optional): Pattern for location to include in the search
    
    Returns:
        str or None: Full path to the file if found, None otherwise
    """
    if not os.path.exists(directory):
        return None
    
    for filename in os.listdir(directory):
        # Check for the partial filename match
        if partial_filename in filename:
            # If location pattern is provided, check for that too
            if location_pattern is None or location_pattern in filename:
                file_path = os.path.join(directory, filename)
                print(f"Found matching file: {filename}")
                return file_path
    
    # If location pattern was provided but no match found, log it
    if location_pattern:
        print(f"No files found with pattern: {location_pattern} and filename: {partial_filename}")
    else:
        print(f"No files found with filename: {partial_filename}")
        
    return None


def analyze_duplicate_patterns(df, company_id):
    """
    Provide detailed analysis of duplicate patterns in the data
    """
    print("\n" + "="*50)
    print("DUPLICATE ANALYSIS REPORT")
    print("="*50)
    
    df_temp = df.copy()
    df_temp['company_id'] = company_id
    
    # 1. Database constraint duplicates (will cause insertion errors)
    db_columns = ['company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date']
    db_dups = df_temp[df_temp.duplicated(subset=db_columns, keep=False)]
    
    print(f"📊 Total records: {len(df)}")
    print(f"🚫 Database constraint violations: {len(db_dups)} records")
    
    if not db_dups.empty:
        print("\nDatabase constraint violations by price variance:")
        price_analysis = db_dups.groupby(db_columns).agg({
            'Net_Price': ['count', 'nunique', 'min', 'max'],
            'Menu_Item': 'first'
        }).reset_index()
        price_analysis.columns = ['company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date', 
                                'Record_Count', 'Unique_Prices', 'Min_Price', 'Max_Price', 'Menu_Item']
        print(price_analysis[price_analysis['Record_Count'] > 1].to_string(index=False))
    
    # 2. Business logic duplicates (including Net_Price)
    business_columns = ['company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date', 'Net_Price']
    business_dups = df_temp[df_temp.duplicated(subset=business_columns, keep=False)]
    
    print(f"\n💼 Business logic duplicates (including price): {len(business_dups)} records")
    
    if not business_dups.empty:
        print("Exact duplicate combinations:")
        exact_dups = business_dups.groupby(business_columns).size().reset_index(name='count')
        print(exact_dups[exact_dups['count'] > 1].to_string(index=False))
    
    print("="*50 + "\n")

def remove_internal_duplicates(df, unique_columns=['Order_Id', 'Item_Selection_Id', 'Sent_Date', 'Net_Price']):
    """
    Remove internal duplicates from DataFrame based on unique constraint columns + Net_Price
    """
    print(f"Original dataset size: {len(df)} records")
    
    # Check for internal duplicates
    duplicate_mask = df.duplicated(subset=unique_columns, keep='first')
    duplicate_count = duplicate_mask.sum()
    
    if duplicate_count > 0:
        print(f"Found {duplicate_count} internal duplicate records")
        
        # Show sample duplicates for debugging
        duplicates = df[duplicate_mask]
        if not duplicates.empty:
            print("Sample duplicate records:")
            print(duplicates[unique_columns + ['Menu_Item']].head())
            
            # Show detailed duplicate analysis
            print("\nDuplicate analysis:")
            duplicate_groups = df[df.duplicated(subset=unique_columns, keep=False)].groupby(unique_columns).size().reset_index(name='count')
            print(duplicate_groups[duplicate_groups['count'] > 1].head())
        
        # Remove duplicates, keeping the first occurrence
        df_clean = df[~duplicate_mask].copy()
        print(f"After removing duplicates: {len(df_clean)} records")
        
        return df_clean, duplicate_count
    else:
        print("No internal duplicates found")
        return df, 0

def validate_unique_constraints(df, company_id, unique_columns=['Order_Id', 'Item_Selection_Id', 'Sent_Date', 'Net_Price']):
    """
    Validate that the DataFrame doesn't contain combinations that would violate unique constraints
    Including Net_Price for more granular duplicate detection
    """
    # Add company_id to the check (it's always the same for a single upload)
    df_with_company = df.copy()
    df_with_company['company_id'] = company_id
    
    constraint_columns = ['company_id'] + unique_columns
    
    # Check for duplicates in the constraint columns
    duplicates = df_with_company[df_with_company.duplicated(subset=constraint_columns, keep=False)]
    
    if not duplicates.empty:
        print(f"ERROR: Found {len(duplicates)} rows that would violate unique constraint!")
        print("Problematic combinations:")
        problem_combinations = duplicates.groupby(constraint_columns).size().reset_index(name='count')
        print(problem_combinations[problem_combinations['count'] > 1])
        
        # Additional analysis: separate database constraint vs business logic duplicates
        db_constraint_columns = ['company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date']  # Actual DB constraint
        db_duplicates = df_with_company[df_with_company.duplicated(subset=db_constraint_columns, keep=False)]
        
        if not db_duplicates.empty:
            print(f"\nDatabase constraint violations (excluding Net_Price): {len(db_duplicates)} rows")
            print("These will definitely cause insertion errors:")
            db_problem_combinations = db_duplicates.groupby(db_constraint_columns).size().reset_index(name='count')
            print(db_problem_combinations[db_problem_combinations['count'] > 1].head())
        
        return False, duplicates
    
    return True, None

# REPLACE the database insertion section in your code with this enhanced version:



