# Add this code BEFORE the database insertion in your excel_upload.py

def analyze_duplicate_patterns(df, company_id):
    """
    Provide detailed analysis of duplicate patterns in the data
    """
    print("\n" + "="*50)
    print("DUPLICATE ANALYSIS REPORT")
    print("="*50)
    
    df_temp = df.copy()
    df_temp['company_id'] = company_id
    
    # 1. Database constraint duplicates (ACTUAL constraint that will cause errors)
    db_columns = ['company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date']
    db_dups = df_temp[df_temp.duplicated(subset=db_columns, keep=False)]
    
    print(f"📊 Total records: {len(df)}")
    print(f"🚫 Database constraint violations: {len(db_dups)} records")
    print(f"🎯 Database constraint: (company_id, Order_Id, Item_Selection_Id, Sent_Date)")
    
    if not db_dups.empty:
        print("\n⚠️  CRITICAL: Database constraint violations found!")
        print("These records have the same Order_Id + Item_Selection_Id + Sent_Date:")
        
        violation_analysis = db_dups.groupby(db_columns).agg({
            'Menu_Item': ['unique', 'count'],
            'Net_Price': ['unique', 'min', 'max'],
            'Qty': 'sum'
        }).reset_index()
        
        # Flatten column names
        violation_analysis.columns = [
            'company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date',
            'Unique_Items', 'Item_Count', 'Unique_Prices', 'Min_Price', 'Max_Price', 'Total_Qty'
        ]
        
        critical_violations = violation_analysis[violation_analysis['Item_Count'] > 1]
        if not critical_violations.empty:
            print("Detailed violation breakdown:")
            for _, row in critical_violations.iterrows():
                print(f"  Order_Id: {row['Order_Id']}")
                print(f"  Item_Selection_Id: {row['Item_Selection_Id']} ({'SAME AS ORDER_ID' if row['Item_Selection_Id'] == row['Order_Id'] else 'DIFFERENT'})")
                print(f"  Items: {row['Unique_Items']}")
                print(f"  Prices: ${row['Min_Price']:.2f} - ${row['Max_Price']:.2f}")
                print(f"  Count: {row['Item_Count']} records")
                print("  ---")
    
    # 2. Business logic duplicates (including Net_Price)
    business_columns = ['company_id', 'Order_Id', 'Item_Selection_Id', 'Sent_Date', 'Net_Price']
    business_dups = df_temp[df_temp.duplicated(subset=business_columns, keep=False)]
    
    print(f"\n💼 Business logic duplicates (exact matches): {len(business_dups)} records")
    
    if not business_dups.empty:
        print("Exact duplicate combinations (these are safe to remove):")
        exact_dups = business_dups.groupby(business_columns).size().reset_index(name='count')
        print(exact_dups[exact_dups['count'] > 1].head().to_string(index=False))
    
    # 3. Data quality insights
    print(f"\n🔍 DATA QUALITY INSIGHTS:")
    same_order_item_ids = (df['Order_Id'] == df['Item_Selection_Id']).sum()
    print(f"Records where Order_Id = Item_Selection_Id: {same_order_item_ids}/{len(df)} ({same_order_item_ids/len(df)*100:.1f}%)")
    
    if same_order_item_ids > len(df) * 0.5:
        print("⚠️  WARNING: Most Item_Selection_Id values are identical to Order_Id")
        print("   This suggests a data structure issue that may cause constraint violations")
    
    print("="*50 + "\n")

def remove_database_constraint_duplicates(df, db_constraint_columns=['Order_Id', 'Item_Selection_Id', 'Sent_Date']):
    """
    Remove duplicates that would violate the actual database constraint
    This is more aggressive - keeps only the first occurrence when database constraint fields match
    """
    print(f"\nChecking database constraint violations...")
    print(f"Database constraint: {db_constraint_columns}")
    
    # Check for duplicates based on database constraint only
    db_duplicate_mask = df.duplicated(subset=db_constraint_columns, keep='first')
    db_duplicate_count = db_duplicate_mask.sum()
    
    if db_duplicate_count > 0:
        print(f"Found {db_duplicate_count} records that violate database constraint")
        
        # Show detailed analysis of what's being removed
        duplicates = df[db_duplicate_mask]
        if not duplicates.empty:
            print("Records being removed due to database constraint:")
            constraint_analysis = df[df.duplicated(subset=db_constraint_columns, keep=False)].groupby(db_constraint_columns).agg({
                'Menu_Item': 'unique',
                'Net_Price': 'unique', 
                'Menu_Item': 'count'
            }).reset_index()
            constraint_analysis.columns = db_constraint_columns + ['Unique_Items', 'Unique_Prices', 'Total_Records']
            print(constraint_analysis[constraint_analysis['Total_Records'] > 1].to_string(index=False))
        
        # Remove duplicates, keeping the first occurrence
        df_clean = df[~db_duplicate_mask].copy()
        print(f"After removing database constraint violations: {len(df_clean)} records")
        
        return df_clean, db_duplicate_count
    else:
        print("No database constraint violations found")
        return df, 0

def remove_internal_duplicates(df, unique_columns=['Order_Id', 'Item_Selection_Id', 'Sent_Date', 'Net_Price']):
    """
    Remove internal duplicates from DataFrame based on business logic (including Net_Price)
    """
    print(f"Checking business logic duplicates...")
    print(f"Business constraint: {unique_columns}")
    print(f"Dataset size: {len(df)} records")
    
    # Check for internal duplicates
    duplicate_mask = df.duplicated(subset=unique_columns, keep='first')
    duplicate_count = duplicate_mask.sum()
    
    if duplicate_count > 0:
        print(f"Found {duplicate_count} exact duplicate records")
        
        # Show sample duplicates for debugging
        duplicates = df[duplicate_mask]
        if not duplicates.empty:
            print("Sample duplicate records:")
            print(duplicates[unique_columns + ['Menu_Item']].head())
        
        # Remove duplicates, keeping the first occurrence
        df_clean = df[~duplicate_mask].copy()
        print(f"After removing exact duplicates: {len(df_clean)} records")
        
        return df_clean, duplicate_count
    else:
        print("No exact duplicates found")
        return df, 0

def validate_unique_constraints(df, company_id, unique_columns=['Order_Id', 'Item_Selection_Id', 'Sent_Date']):
    """
    Validate that the DataFrame doesn't contain combinations that would violate the actual database constraint
    """
    # Add company_id to the check (it's always the same for a single upload)
    df_with_company = df.copy()
    df_with_company['company_id'] = company_id
    
    constraint_columns = ['company_id'] + unique_columns
    
    # Check for duplicates in the constraint columns
    duplicates = df_with_company[df_with_company.duplicated(subset=constraint_columns, keep=False)]
    
    if not duplicates.empty:
        print(f"❌ FINAL VALIDATION FAILED: Found {len(duplicates)} rows that would still violate database constraint!")
        print("These records WILL cause insertion errors:")
        
        problem_combinations = duplicates.groupby(constraint_columns).agg({
            'Menu_Item': ['unique', 'count'],
            'Net_Price': 'unique'
        }).reset_index()
        problem_combinations.columns = constraint_columns + ['Unique_Items', 'Record_Count', 'Unique_Prices']
        print(problem_combinations[problem_combinations['Record_Count'] > 1].to_string(index=False))
        
        return False, duplicates
    else:
        print("✅ Final database constraint validation passed!")
        return True, None

# REPLACE the database insertion section in your code with this enhanced version:
        