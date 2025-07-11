from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum as SQLAEnum
from datetime import datetime
from database import Base
import enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship



class RoleEnum(str, enum.Enum):
    superuser = "superuser"
    admin = "admin"
    manager = "manager"
    trial = "trial"
    user = "user"
    # trial = "trial"  # optional, if trial is in your system
    
    

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)
    # theme = Column(Boolean, default=False)
    role = Column(SQLAEnum(RoleEnum), nullable=False)
    isActive = Column(Boolean, default=True, nullable=False)  # ✅ Added isActive column
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)  # Ensure this matches the type in Company model


    uploaded_files = relationship("UploadedFile", back_populates="uploader", cascade="all, delete-orphan")