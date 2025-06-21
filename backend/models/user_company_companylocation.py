from sqlalchemy import Column, Integer, ForeignKey
from database import Base

class UserCompanyCompanyLocation(Base):
    __tablename__ = "user_company_companylocation"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_location_id = Column(Integer, ForeignKey("company_locations.id", ondelete="CASCADE"), nullable=False)
