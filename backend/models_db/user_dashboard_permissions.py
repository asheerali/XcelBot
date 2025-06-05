from sqlalchemy import Column, Integer, ForeignKey, Boolean
from database import Base

class UserDashboardPermission(Base):
    __tablename__ = "user_dashboard_permissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"))
    can_view = Column(Boolean, default=False)
