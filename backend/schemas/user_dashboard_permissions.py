from pydantic import BaseModel

class UserDashboardPermissionBase(BaseModel):
    user_id: int
    dashboard_id: int
    can_view: bool = True

class UserDashboardPermissionCreate(UserDashboardPermissionBase):
    pass

class UserDashboardPermission(UserDashboardPermissionBase):
    id: int

    class Config:
        from_attributes = True
