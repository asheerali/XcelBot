from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from crud import financials_company_wide as financials_crud
from schemas import financials_company_wide as financials_schema
from database import get_db
# from dependencies.auth import get_current_active_user
# from models.users import User

router = APIRouter(
    prefix="/financialscompanywide",
    tags=["Financials Company Wide"],
)

# @router.post("/", response_model=financials_schema.FinancialsCompanyWide)
# def create_financials_record(
#     financials: financials_schema.FinancialsCompanyWideCreate, 
#     db: Session = Depends(get_db),
#     # current_user: User = Depends(get_current_active_user)
# ):
#     """Create a new financials record"""
#     return financials_crud.create_financials_record(db, financials)

@router.get("/", response_model=List[financials_schema.FinancialsCompanyWide])
def get_financials_records(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    store: Optional[str] = Query(None, description="Filter by store"),
    file_name: Optional[str] = Query(None, description="Filter by file name"),
    dashboard: Optional[int] = Query(None, description="Filter by dashboard"),
    year: Optional[int] = Query(None, description="Filter by year"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get financials records with optional filtering"""
    return financials_crud.get_financials_records(
        db=db, 
        skip=skip, 
        limit=limit, 
        company_id=company_id,
        store=store,
        file_name=file_name,
        dashboard=dashboard,
        year=year
    )

@router.get("/{record_id}", response_model=financials_schema.FinancialsCompanyWide)
def get_financials_record(
    record_id: int, 
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get a specific financials record by ID"""
    record = financials_crud.get_financials_record(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Financials record not found")
    return record

@router.put("/{record_id}", response_model=financials_schema.FinancialsCompanyWide)
def update_financials_record(
    record_id: int, 
    financials: financials_schema.FinancialsCompanyWideCreate, 
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Update a specific financials record"""
    updated = financials_crud.update_financials_record(db, record_id, financials)
    if not updated:
        raise HTTPException(status_code=404, detail="Financials record not found")
    return updated

@router.delete("/{record_id}")
def delete_financials_record(
    record_id: int, 
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete a specific financials record"""
    success = financials_crud.delete_financials_record(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Financials record not found")
    return {"detail": "Financials record deleted successfully"}

# ============================================================================
# BULK DELETION ENDPOINTS
# ============================================================================

@router.delete("/bulk/all")
def delete_all_financials_records(
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete ALL financials records (with optional company filter)"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete all records. This action cannot be undone."
        )
    
    deleted_count = financials_crud.delete_all_financials_records(db, company_id)
    
    if company_id:
        return {
            "detail": f"Successfully deleted {deleted_count} Financials records for company ID {company_id}",
            "deleted_count": deleted_count,
            "company_id": company_id
        }
    else:
        return {
            "detail": f"Successfully deleted ALL {deleted_count} Financials records from the database",
            "deleted_count": deleted_count
        }

@router.delete("/bulk/by-dashboard")
def delete_financials_by_dashboard(
    dashboard: int = Query(..., description="Dashboard ID to delete records for"),
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete all financials records for a specific dashboard"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete records. This action cannot be undone."
        )
    
    deleted_count = financials_crud.delete_financials_by_dashboard(db, dashboard, company_id)
    
    return {
        "detail": f"Successfully deleted {deleted_count} Financials records for dashboard {dashboard}" + 
                 (f" and company {company_id}" if company_id else ""),
        "deleted_count": deleted_count,
        "dashboard": dashboard,
        "company_id": company_id
    }

@router.delete("/bulk/by-filename")
def delete_financials_by_filename(
    file_name: str = Query(..., description="File name to delete records for"),
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete all financials records for a specific file name"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete records. This action cannot be undone."
        )
    
    deleted_count = financials_crud.delete_financials_by_filename(db, file_name, company_id)
    
    return {
        "detail": f"Successfully deleted {deleted_count} Financials records for file '{file_name}'" + 
                 (f" and company {company_id}" if company_id else ""),
        "deleted_count": deleted_count,
        "file_name": file_name,
        "company_id": company_id
    }

@router.delete("/bulk/by-store")
def delete_financials_by_store(
    store: str = Query(..., description="Store to delete records for"),
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete all financials records for a specific store"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete records. This action cannot be undone."
        )
    
    deleted_count = financials_crud.delete_financials_by_store(db, store, company_id)
    
    return {
        "detail": f"Successfully deleted {deleted_count} Financials records for store '{store}'" + 
                 (f" and company {company_id}" if company_id else ""),
        "deleted_count": deleted_count,
        "store": store,
        "company_id": company_id
    }

# ============================================================================
# ANALYTICS AND SUMMARY ENDPOINTS
# ============================================================================

@router.get("/analytics/summary")
def get_financials_summary(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    dashboard: Optional[int] = Query(None, description="Filter by dashboard"),
    file_name: Optional[str] = Query(None, description="Filter by file name"),
    store: Optional[str] = Query(None, description="Filter by store"),
    year: Optional[int] = Query(None, description="Filter by year"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get summary statistics for financials records"""
    summary = financials_crud.get_financials_summary(
        db=db,
        company_id=company_id,
        dashboard=dashboard,
        file_name=file_name,
        store=store,
        year=year
    )
    return summary

@router.get("/analytics/file-list")
def get_uploaded_files_list(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get list of all uploaded files with record counts"""
    files = financials_crud.get_financials_uploaded_files_list(db, company_id)
    return files

@router.get("/analytics/stores")
def get_stores_list(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get list of all stores with record counts"""
    stores = financials_crud.get_financials_stores_list(db, company_id)
    return stores

@router.get("/analytics/dashboards")
def get_dashboards_list(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get list of all dashboards with record counts"""
    dashboards = financials_crud.get_financials_dashboards_list(db, company_id)
    return dashboards