from sqlalchemy.orm import Session
from models.users import User
from models.mails import Mail
from models.companies import Company
from schemas.companies import CompanyCreate
from models.locations import Store

def create_company(db: Session, company: CompanyCreate) -> Company:
    # print("Creating company:", company)
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def get_companies(db: Session):
    return db.query(Company).all()

def get_company(db: Session, company_id):
    return db.query(Company).filter(Company.id == company_id).first()

def update_company(db: Session, company_id, company_data: CompanyCreate):
    db_company = get_company(db, company_id)
    if not db_company:
        return None
    for key, value in company_data.model_dump().items():
        setattr(db_company, key, value)
    db.commit()
    db.refresh(db_company)
    return db_company

# def delete_company(db: Session, company_id):
#     db_company = get_company(db, company_id)
#     if not db_company:
#         return False
#     db.delete(db_company)
#     db.commit()
#     return True

def delete_company(db: Session, company_id):
    db_company = get_company(db, company_id)
    if not db_company:
        return False


    # Delete all mails associated with this company first
    db.query(Mail).filter(Mail.company_id == company_id).delete()

    db.query(Store).filter(Store.company_id == company_id).delete()
    
    # also delete the user
    db.query(User).filter(User.company_id == company_id).delete()

    db.delete(db_company)
    db.commit()
    return True
