from sqlalchemy.orm import Session
from models.sales_pmix import SalesPMix
from schemas.sales_pmix import SalesPMixCreate
import pandas as pd

def create_sales_pmix(db: Session, obj_in: SalesPMixCreate):
    db_obj = SalesPMix(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def insert_sales_pmix_df(db: Session, df: pd.DataFrame, company_id: int):
    for _, row in df.iterrows():
        data = row.to_dict()
        data["company_id"] = company_id
        db_obj = SalesPMix(**data)
        db.add(db_obj)
    db.commit()
