from sqlalchemy.orm import Session
from models.user_dashboard_permissions import UserDashboardPermission
from schemas.user_dashboard_permissions import UserDashboardPermissionCreate

def assign_dashboard_permission(db: Session, perm: UserDashboardPermissionCreate):
    db_perm = UserDashboardPermission(**perm.dict())
    db.add(db_perm)
    db.commit()
    db.refresh(db_perm)
    return db_perm

def get_user_dashboards(db: Session, user_id: int):
    return db.query(UserDashboardPermission).filter(
        UserDashboardPermission.user_id == user_id,
        UserDashboardPermission.can_view == True
    ).all()
