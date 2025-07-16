# # from sqlalchemy.orm import Session
# # from models.sales_pmix import SalesPMix
# # from schemas.sales_pmix import SalesPMixCreate
# # import pandas as pd

# # def create_sales_pmix(db: Session, obj_in: SalesPMixCreate):
# #     db_obj = SalesPMix(**obj_in.dict())
# #     db.add(db_obj)
# #     db.commit()
# #     db.refresh(db_obj)
# #     return db_obj

# # def insert_sales_pmix_df(db: Session, df: pd.DataFrame, company_id: int):
# #     for _, row in df.iterrows():
# #         data = row.to_dict()
# #         data["company_id"] = company_id
# #         db_obj = SalesPMix(**data)
# #         db.add(db_obj)
# #     db.commit()


# from sqlalchemy.orm import Session
# from models.sales_pmix import SalesPMix
# from schemas.sales_pmix import SalesPMixCreate
# import pandas as pd

# def create_sales_pmix(db: Session, obj_in: SalesPMixCreate):
#     db_obj = SalesPMix(**obj_in.dict())
#     db.add(db_obj)
#     db.commit()
#     db.refresh(db_obj)
#     return db_obj

# def insert_sales_pmix_df(db: Session, df: pd.DataFrame, company_id: int, file_name: str = None, dashboard: int = None):
#     """
#     Insert sales data from DataFrame into database.
    
#     Args:
#         db: Database session
#         df: DataFrame containing sales data
#         company_id: Company ID to associate with the data
#         file_name: Optional filename to store with each record
#         dashboard: Optional dashboard integer to store with each record
#     """
#     for _, row in df.iterrows():
#         data = row.to_dict()
#         data["company_id"] = company_id
        
#         # Add new fields if provided
#         if file_name:
#             data["file_name"] = file_name
#         if dashboard is not None:
#             data["dashboard"] = dashboard
            
#         db_obj = SalesPMix(**data)
#         db.add(db_obj)
#     db.commit()

# def insert_sales_pmix_df_with_metadata(db: Session, df: pd.DataFrame, company_id: int, metadata: dict):
#     """
#     Insert sales data from DataFrame with metadata applied to all records.
    
#     Args:
#         db: Database session
#         df: DataFrame containing sales data
#         company_id: Company ID to associate with the data
#         metadata: Dictionary containing metadata fields like file_name, dashboard, etc.
#     """
#     for _, row in df.iterrows():
#         data = row.to_dict()
#         data["company_id"] = company_id
        
#         # Apply metadata to each record
#         data.update(metadata)
            
#         db_obj = SalesPMix(**data)
#         db.add(db_obj)
#     db.commit()

from sqlalchemy.orm import Session
from models.sales_pmix import SalesPMix
from schemas.sales_pmix import SalesPMixCreate
import pandas as pd
from sqlalchemy import func, and_, or_
from typing import Optional, List, Dict, Any
# ============================================================================


def create_sales_pmix(db: Session, obj_in: SalesPMixCreate):
    db_obj = SalesPMix(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def insert_sales_pmix_df(db: Session, df: pd.DataFrame, company_id: int, file_name: str = None, dashboard: int = None):
    """
    Insert sales data from DataFrame into database.
    
    Args:
        db: Database session
        df: DataFrame containing sales data
        company_id: Company ID to associate with the data
        file_name: Optional filename to store with each record
        dashboard: Optional dashboard integer to store with each record
    """
    for _, row in df.iterrows():
        data = row.to_dict()
        data["company_id"] = company_id
        
        # Add new fields if provided
        if file_name:
            data["file_name"] = file_name
        if dashboard is not None:
            data["dashboard"] = dashboard
            
        db_obj = SalesPMix(**data)
        db.add(db_obj)
    db.commit()

def insert_sales_pmix_df_with_metadata(db: Session, df: pd.DataFrame, company_id: int, metadata: dict):
    """
    Insert sales data from DataFrame with metadata applied to all records.
    
    Args:
        db: Database session
        df: DataFrame containing sales data
        company_id: Company ID to associate with the data
        metadata: Dictionary containing metadata fields like file_name, dashboard, etc.
    """
    for _, row in df.iterrows():
        data = row.to_dict()
        data["company_id"] = company_id
        
        # Apply metadata to each record
        data.update(metadata)
            
        db_obj = SalesPMix(**data)
        db.add(db_obj)
    db.commit()
    
    


# ============================================================================
# BASIC CRUD OPERATIONS
# ============================================================================

def get_sales_pmix_record(db: Session, record_id: int):
    """Get a specific sales pmix record by ID"""
    return db.query(SalesPMix).filter(SalesPMix.id == record_id).first()

def get_sales_pmix_records(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    company_id: Optional[int] = None,
    location: Optional[str] = None,
    file_name: Optional[str] = None,
    dashboard: Optional[int] = None
):
    """Get sales pmix records with optional filtering"""
    query = db.query(SalesPMix)
    
    # Apply filters
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    if location:
        query = query.filter(SalesPMix.Location.ilike(f"%{location}%"))
    if file_name:
        query = query.filter(SalesPMix.file_name.ilike(f"%{file_name}%"))
    if dashboard is not None:
        query = query.filter(SalesPMix.dashboard == dashboard)
    
    return query.offset(skip).limit(limit).all()

def update_sales_pmix_record(db: Session, record_id: int, obj_in: SalesPMixCreate):
    """Update a specific sales pmix record"""
    db_obj = db.query(SalesPMix).filter(SalesPMix.id == record_id).first()
    if db_obj:
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
    return db_obj

def delete_sales_pmix_record(db: Session, record_id: int):
    """Delete a specific sales pmix record"""
    db_obj = db.query(SalesPMix).filter(SalesPMix.id == record_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
        return True
    return False

# ============================================================================
# BULK DELETION OPERATIONS
# ============================================================================

def delete_all_sales_pmix_records(db: Session, company_id: Optional[int] = None):
    """Delete all sales pmix records (optionally filtered by company)"""
    query = db.query(SalesPMix)
    
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

def delete_sales_pmix_by_dashboard(db: Session, dashboard: int, company_id: Optional[int] = None):
    """Delete all sales pmix records for a specific dashboard"""
    query = db.query(SalesPMix).filter(SalesPMix.dashboard == dashboard)
    
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

def delete_sales_pmix_by_filename(db: Session, file_name: str, company_id: Optional[int] = None):
    """Delete all sales pmix records for a specific file name"""
    query = db.query(SalesPMix).filter(SalesPMix.file_name == file_name)
    
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

def delete_sales_pmix_by_location(db: Session, location: str, company_id: Optional[int] = None):
    """Delete all sales pmix records for a specific location"""
    query = db.query(SalesPMix).filter(SalesPMix.Location == location)
    
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    
    deleted_count = query.count()
    query.delete(synchronize_session=False)
    db.commit()
    
    return deleted_count

# ============================================================================
# ANALYTICS AND SUMMARY OPERATIONS
# ============================================================================

def get_sales_pmix_summary(
    db: Session,
    company_id: Optional[int] = None,
    dashboard: Optional[int] = None,
    file_name: Optional[str] = None,
    location: Optional[str] = None
) -> Dict[str, Any]:
    """Get summary statistics for sales pmix records"""
    query = db.query(SalesPMix)
    
    # Apply filters
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    if dashboard is not None:
        query = query.filter(SalesPMix.dashboard == dashboard)
    if file_name:
        query = query.filter(SalesPMix.file_name == file_name)
    if location:
        query = query.filter(SalesPMix.Location == location)
    
    # Get basic counts
    total_records = query.count()
    
    # Get financial summaries
    financial_summary = query.with_entities(
        func.sum(SalesPMix.Net_Price).label('total_net_price'),
        func.sum(SalesPMix.Gross_Price).label('total_gross_price'),
        func.sum(SalesPMix.Tax).label('total_tax'),
        func.sum(SalesPMix.Qty).label('total_quantity'),
        func.avg(SalesPMix.Net_Price).label('avg_net_price'),
        func.avg(SalesPMix.Avg_Price).label('avg_price')
    ).first()
    
    return {
        "total_records": total_records,
        "total_net_price": float(financial_summary.total_net_price or 0),
        "total_gross_price": float(financial_summary.total_gross_price or 0),
        "total_tax": float(financial_summary.total_tax or 0),
        "total_quantity": int(financial_summary.total_quantity or 0),
        "average_net_price": float(financial_summary.avg_net_price or 0),
        "average_price": float(financial_summary.avg_price or 0),
        "filters_applied": {
            "company_id": company_id,
            "dashboard": dashboard,
            "file_name": file_name,
            "location": location
        }
    }

def get_uploaded_files_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all uploaded files with record counts"""
    query = db.query(
        SalesPMix.file_name,
        func.count(SalesPMix.id).label('record_count'),
        func.min(SalesPMix.Sent_Date).label('earliest_date'),
        func.max(SalesPMix.Sent_Date).label('latest_date'),
        func.sum(SalesPMix.Net_Price).label('total_sales')
    ).filter(SalesPMix.file_name.isnot(None))
    
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    
    query = query.group_by(SalesPMix.file_name).order_by(SalesPMix.file_name)
    
    results = []
    for row in query.all():
        results.append({
            "file_name": row.file_name,
            "record_count": row.record_count,
            "earliest_date": row.earliest_date.isoformat() if row.earliest_date else None,
            "latest_date": row.latest_date.isoformat() if row.latest_date else None,
            "total_sales": float(row.total_sales or 0)
        })
    
    return results

def get_locations_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all locations with record counts"""
    query = db.query(
        SalesPMix.Location,
        func.count(SalesPMix.id).label('record_count'),
        func.sum(SalesPMix.Net_Price).label('total_sales'),
        func.avg(SalesPMix.Net_Price).label('avg_sale_amount')
    ).filter(SalesPMix.Location.isnot(None))
    
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    
    query = query.group_by(SalesPMix.Location).order_by(SalesPMix.Location)
    
    results = []
    for row in query.all():
        results.append({
            "location": row.Location,
            "record_count": row.record_count,
            "total_sales": float(row.total_sales or 0),
            "average_sale_amount": float(row.avg_sale_amount or 0)
        })
    
    return results

def get_dashboards_list(db: Session, company_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get list of all dashboards with record counts"""
    query = db.query(
        SalesPMix.dashboard,
        func.count(SalesPMix.id).label('record_count'),
        func.sum(SalesPMix.Net_Price).label('total_sales')
    ).filter(SalesPMix.dashboard.isnot(None))
    
    if company_id:
        query = query.filter(SalesPMix.company_id == company_id)
    
    query = query.group_by(SalesPMix.dashboard).order_by(SalesPMix.dashboard)
    
    results = []
    for row in query.all():
        results.append({
            "dashboard": row.dashboard,
            "record_count": row.record_count,
            "total_sales": float(row.total_sales or 0)
        })
    
    return results
