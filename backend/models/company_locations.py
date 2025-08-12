from sqlalchemy import Column, Integer, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class CompanyLocation(Base):
    __tablename__ = "company_locations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)

    # Add these relationships
    company = relationship("Company", back_populates="locations")
    location = relationship("Store", back_populates="company_locations")