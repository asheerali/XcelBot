
# 3. FIXED CRUD (crud/companies.py)
from sqlalchemy.orm import Session
from models.companies import Company
from schemas.companies import CompanyCreate

def create_company(db: Session, company: CompanyCreate) -> Company:
    try:
        print("Creating company with data:", company.model_dump())
        
        # Create company instance
        db_company = Company(**company.model_dump())
        
        db.add(db_company)
        db.commit()
        db.refresh(db_company)
        
        print("Company created successfully:", db_company.id)
        return db_company
        
    except Exception as e:
        print("Error creating company:", str(e))
        db.rollback()
        raise e

def get_companies(db: Session):
    return db.query(Company).all()

def get_company(db: Session, company_id: int):
    return db.query(Company).filter(Company.id == company_id).first()

def update_company(db: Session, company_id: int, company_data: CompanyCreate):
    try:
        db_company = get_company(db, company_id)
        if not db_company:
            return None
        
        # Update fields
        for key, value in company_data.model_dump().items():
            setattr(db_company, key, value)
        
        db.commit()
        db.refresh(db_company)
        return db_company
        
    except Exception as e:
        print("Error updating company:", str(e))
        db.rollback()
        raise e

def delete_company(db: Session, company_id: int):
    try:
        db_company = get_company(db, company_id)
        if not db_company:
            return False
        
        db.delete(db_company)
        db.commit()
        return True
        
    except Exception as e:
        print("Error deleting company:", str(e))
        db.rollback()
        raise e

