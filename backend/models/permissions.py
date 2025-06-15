from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    upload_excel = Column(Boolean, default=False)
    d1 = Column(Boolean, default=False)
    d2 = Column(Boolean, default=False)
    d3 = Column(Boolean, default=False)
    d4 = Column(Boolean, default=False)
    d5 = Column(Boolean, default=False)
    d6 = Column(Boolean, default=False)
    d7 = Column(Boolean, default=False)
