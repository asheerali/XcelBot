from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from crud import sales_pmix as sales_pmix_crud
from schemas import sales_pmix as sales_pmix_schema
from database import get_db
from dependencies.auth import get_current_active_user
from models.users import User

router = APIRouter(
    prefix="/salespmix",
    tags=["Sales PMix"],
)


# @router.post("/", response_model=sales_pmix_schema.SalesPMix)
# def create_sales_pmix(
#     sales_pmix: sales_pmix_schema.SalesPMixCreate, 
#     db: Session = Depends(get_db),
#     # current_user: User = Depends(get_current_active_user)
# ):
#     """Create a new sales pmix record"""
#     return sales_pmix_crud.create_sales_pmix(db, sales_pmix)

@router.get("/", response_model=List[sales_pmix_schema.SalesPMix])
def get_sales_pmix_records(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    location: Optional[str] = Query(None, description="Filter by location"),
    file_name: Optional[str] = Query(None, description="Filter by file name"),
    dashboard: Optional[int] = Query(None, description="Filter by dashboard"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get sales pmix records with optional filtering"""
    return sales_pmix_crud.get_sales_pmix_records(
        db=db, 
        skip=skip, 
        limit=limit, 
        company_id=company_id,
        location=location,
        file_name=file_name,
        dashboard=dashboard
    )

@router.get("/{record_id}", response_model=sales_pmix_schema.SalesPMix)
def get_sales_pmix_record(
    record_id: int, 
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get a specific sales pmix record by ID"""
    record = sales_pmix_crud.get_sales_pmix_record(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Sales PMix record not found")
    return record

@router.put("/{record_id}", response_model=sales_pmix_schema.SalesPMix)
def update_sales_pmix_record(
    record_id: int, 
    sales_pmix: sales_pmix_schema.SalesPMixCreate, 
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Update a specific sales pmix record"""
    updated = sales_pmix_crud.update_sales_pmix_record(db, record_id, sales_pmix)
    if not updated:
        raise HTTPException(status_code=404, detail="Sales PMix record not found")
    return updated

@router.delete("/{record_id}")
def delete_sales_pmix_record(
    record_id: int, 
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete a specific sales pmix record"""
    success = sales_pmix_crud.delete_sales_pmix_record(db, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Sales PMix record not found")
    return {"detail": "Sales PMix record deleted successfully"}

# ============================================================================
# BULK DELETION ENDPOINTS
# ============================================================================

@router.delete("/bulk/all")
def delete_all_sales_pmix_records(
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete ALL sales pmix records (with optional company filter)"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete all records. This action cannot be undone."
        )
    
    deleted_count = sales_pmix_crud.delete_all_sales_pmix_records(db, company_id)
    
    if company_id:
        return {
            "detail": f"Successfully deleted {deleted_count} Sales PMix records for company ID {company_id}",
            "deleted_count": deleted_count,
            "company_id": company_id
        }
    else:
        return {
            "detail": f"Successfully deleted ALL {deleted_count} Sales PMix records from the database",
            "deleted_count": deleted_count
        }

@router.delete("/bulk/by-dashboard")
def delete_sales_pmix_by_dashboard(
    dashboard: int = Query(..., description="Dashboard ID to delete records for"),
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete all sales pmix records for a specific dashboard"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete records. This action cannot be undone."
        )
    
    deleted_count = sales_pmix_crud.delete_sales_pmix_by_dashboard(db, dashboard, company_id)
    
    return {
        "detail": f"Successfully deleted {deleted_count} Sales PMix records for dashboard {dashboard}" + 
                 (f" and company {company_id}" if company_id else ""),
        "deleted_count": deleted_count,
        "dashboard": dashboard,
        "company_id": company_id
    }

@router.delete("/bulk/by-filename")
def delete_sales_pmix_by_filename(
    file_name: str = Query(..., description="File name to delete records for"),
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete all sales pmix records for a specific file name"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete records. This action cannot be undone."
        )
    
    deleted_count = sales_pmix_crud.delete_sales_pmix_by_filename(db, file_name, company_id)
    
    return {
        "detail": f"Successfully deleted {deleted_count} Sales PMix records for file '{file_name}'" + 
                 (f" and company {company_id}" if company_id else ""),
        "deleted_count": deleted_count,
        "file_name": file_name,
        "company_id": company_id
    }

@router.delete("/bulk/by-location")
def delete_sales_pmix_by_location(
    location: str = Query(..., description="Location to delete records for"),
    company_id: Optional[int] = Query(None, description="If provided, delete only records for this company"),
    confirm: bool = Query(False, description="Must be set to true to confirm deletion"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Delete all sales pmix records for a specific location"""
    if not confirm:
        raise HTTPException(
            status_code=400, 
            detail="You must set confirm=true to delete records. This action cannot be undone."
        )
    
    deleted_count = sales_pmix_crud.delete_sales_pmix_by_location(db, location, company_id)
    
    return {
        "detail": f"Successfully deleted {deleted_count} Sales PMix records for location '{location}'" + 
                 (f" and company {company_id}" if company_id else ""),
        "deleted_count": deleted_count,
        "location": location,
        "company_id": company_id
    }

# ============================================================================
# ANALYTICS AND SUMMARY ENDPOINTS
# ============================================================================

@router.get("/analytics/summary")
def get_sales_pmix_summary(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    dashboard: Optional[int] = Query(None, description="Filter by dashboard"),
    file_name: Optional[str] = Query(None, description="Filter by file name"),
    location: Optional[str] = Query(None, description="Filter by location"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get summary statistics for sales pmix records"""
    summary = sales_pmix_crud.get_sales_pmix_summary(
        db=db,
        company_id=company_id,
        dashboard=dashboard,
        file_name=file_name,
        location=location
    )
    return summary

@router.get("/analytics/file-list")
def get_uploaded_files_list(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get list of all uploaded files with record counts"""
    files = sales_pmix_crud.get_uploaded_files_list(db, company_id)
    return files

@router.get("/analytics/locations")
def get_locations_list(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get list of all locations with record counts"""
    locations = sales_pmix_crud.get_locations_list(db, company_id)
    return locations

@router.get("/analytics/dashboards")
def get_dashboards_list(
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_active_user)
):
    """Get list of all dashboards with record counts"""
    dashboards = sales_pmix_crud.get_dashboards_list(db, company_id)
    return dashboards