# models/uploaded_file.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    dashboard_name = Column(String(100), nullable=False)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)
    # company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)  # Changed to Integer for consistency
    company_id = Column(Integer, ForeignKey("companies.id", ondelete='CASCADE'), nullable=True)  # Added CASCADE

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    uploader = relationship("User", back_populates="uploaded_files")
    permissions = relationship("FilePermission", back_populates="uploaded_file", cascade="all, delete-orphan")
    company = relationship("Company")
