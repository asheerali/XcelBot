# crud/financials_company_wide.py

from sqlalchemy.orm import Session
from models.financials_company_wide import FinancialsCompanyWide
from schemas.financials_company_wide import FinancialsCompanyWideCreate
import pandas as pd

def create_financials_company_wide(db: Session, obj_in: FinancialsCompanyWideCreate):
    db_obj = FinancialsCompanyWide(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def insert_financials_company_wide_df(db: Session, df: pd.DataFrame, company_id: int):
    # Create column mapping from DataFrame to database model
    column_mapping = {
        'Store': 'Store',
        'Ly Date': 'Ly_Date',
        'Date': 'Date',
        'Day': 'Day',
        'Week': 'Week',
        'Month': 'Month',
        'Quarter': 'Quarter',
        'Year': 'Year',
        'Helper 1': 'Helper_1',
        'Helper 2': 'Helper_2',
        'Helper 3': 'Helper_3',
        'Helper 4': 'Helper_4',
        'Tw Sales': 'Tw_Sales',
        'Lw Sales': 'Lw_Sales',
        'Ly Sales': 'Ly_Sales',
        'Tw Orders': 'Tw_Orders',
        'Lw Orders': 'Lw_Orders',
        'Ly Orders': 'Ly_Orders',
        'Tw Avg Tckt': 'Tw_Avg_Tckt',
        'Lw Avg Tckt': 'Lw_Avg_Tckt',
        'Ly Avg Tckt': 'Ly_Avg_Tckt',
        'Tw Labor Hrs': 'Tw_Labor_Hrs',
        'Lw Labor Hrs': 'Lw_Labor_Hrs',
        'Tw Reg Pay': 'Tw_Reg_Pay',
        'Lw Reg Pay': 'Lw_Reg_Pay',
        'Tw SPMH': 'Tw_SPMH',
        'Lw SPMH': 'Lw_SPMH',
        'Tw LPMH': 'Tw_LPMH',
        'Lw LPMH': 'Lw_LPMH',
        'Tw COGS': 'Tw_COGS',
        'TW Johns': 'TW_Johns',
        'TW Terra': 'TW_Terra',
        'TW Metro': 'TW_Metro',
        'TW Victory': 'TW_Victory',
        'TW Central Kitchen': 'TW_Central_Kitchen',
        'TW Other': 'TW_Other',
        'Unnamed: 36': 'Unnamed_36',
        'Unnamed: 37': 'Unnamed_37',
        'Unnamed: 38': 'Unnamed_38',
        'Unnamed: 39': 'Unnamed_39',
        'Lw COGS': 'Lw_COGS',
        'LW Johns': 'LW_Johns',
        'LW Terra': 'LW_Terra',
        'LW Metro': 'LW_Metro',
        'LW Victory': 'LW_Victory',
        'LW Central Kitchen': 'LW_Central_Kitchen',
        'LW Other': 'LW_Other'
    }
    
    # Rename columns to match database model
    df_renamed = df.rename(columns=column_mapping)
    
    for _, row in df_renamed.iterrows():
        data = row.to_dict()
        data["company_id"] = company_id
        
        # Handle NaN values
        for key, value in data.items():
            if pd.isna(value):
                data[key] = None
        
        db_obj = FinancialsCompanyWide(**data)
        db.add(db_obj)
    db.commit()