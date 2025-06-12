from sqlalchemy import Column, Integer, ForeignKey, Boolean
from database import Base

class FilePermission(Base):
    __tablename__ = "file_permissions"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("uploaded_files.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    can_view = Column(Boolean, default=False)
