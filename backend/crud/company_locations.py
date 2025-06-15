from sqlalchemy.orm import Session
from models.company_locations import CompanyLocation
from schemas.company_locations import CompanyLocationCreate

def create_company_location(db: Session, data: CompanyLocationCreate):
    entry = CompanyLocation(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_company_location(db: Session, record_id: int):
    return db.query(CompanyLocation).filter(CompanyLocation.id == record_id).first()

def get_company_locations(db: Session):
    return db.query(CompanyLocation).all()

def delete_company_location(db: Session, record_id: int):
    entry = get_company_location(db, record_id)
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True
