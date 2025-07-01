from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from database import Base

class MasterFile(Base):
    __tablename__ = "masterfile"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)  # NEW
    filename = Column(String(255), nullable=False, index=True)
    file_data = Column(JSON, nullable=False)