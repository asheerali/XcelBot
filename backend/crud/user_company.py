from sqlalchemy.orm import Session
from models.user_company import UserCompany
from schemas.user_company import UserCompanyCreate

def create_user_company(db: Session, data: UserCompanyCreate):
    entry = UserCompany(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_user_company(db: Session, record_id: int):
    return db.query(UserCompany).filter(UserCompany.id == record_id).first()

def get_all_user_companies(db: Session):
    return db.query(UserCompany).all()

def delete_user_company(db: Session, record_id: int):
    entry = get_user_company(db, record_id)
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True

def delete_user_company_mapping(db: Session, user_id: int):
    db.query(UserCompany).filter(
        UserCompany.user_id == user_id
    ).delete()
    db.commit()
