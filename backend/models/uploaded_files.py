from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    dashboard_name = Column(String(100), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    uploader = relationship("User", back_populates="uploaded_files")
    permissions = relationship("FilePermission", back_populates="uploaded_file", cascade="all, delete-orphan")
