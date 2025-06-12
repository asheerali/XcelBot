from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user_dashboard_permissions import (
    UserDashboardPermission, UserDashboardPermissionCreate
)
from crud import user_dashboard_permissions as perm_crud
from app import get_db

router = APIRouter(
    prefix="/permissions/dashboards",
    tags=["Dashboard Permissions"]
)

@router.post("/", response_model=UserDashboardPermission)
def assign_dashboard_permission(
    perm: UserDashboardPermissionCreate,
    db: Session = Depends(get_db)
):
    return perm_crud.assign_dashboard_permission(db, perm)

@router.get("/user/{user_id}", response_model=list[UserDashboardPermission])
def get_user_dashboards(user_id: int, db: Session = Depends(get_db)):
    return perm_crud.get_user_dashboards(db, user_id)
