from sqlalchemy import Column, Integer, ForeignKey
from database import Base
from sqlalchemy.dialects.postgresql import UUID

class UserCompany(Base):
    __tablename__ = "user_company"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.location_id", ondelete="CASCADE"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
