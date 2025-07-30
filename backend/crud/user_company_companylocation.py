from sqlalchemy.orm import Session
from models.user_company_companylocation import UserCompanyCompanyLocation
from schemas.user_company_companylocation import UserCompanyCompanyLocationCreate

def create_user_location_mapping(db: Session, data: UserCompanyCompanyLocationCreate):
    mapping = UserCompanyCompanyLocation(**data.model_dump())
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping

# def delete_user_location_mappings(db: Session, user_id: int):
#     db.query(UserCompanyCompanyLocation).filter_by(user_id=user_id).delete()
#     db.commit()

def delete_user_location_mappings(db: Session, user_id: int):
    db.query(UserCompanyCompanyLocation).filter(
        UserCompanyCompanyLocation.user_id == user_id
    ).delete()
    db.commit()
