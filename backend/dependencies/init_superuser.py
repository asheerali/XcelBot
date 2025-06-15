from sqlalchemy.orm import Session
from models.users import User, RoleEnum
from models.companies import Company
from passlib.hash import bcrypt
import uuid

def create_default_superusers(db: Session):
    try:
        # Step 1: Ensure a default company exists
        default_company = db.query(Company).first()
        if not default_company:
            default_company = Company(
                name="Default Company",
                state="N/A",
                postcode="00000",
                phone_number="000-000-0000",
                email="default@company.com",
                website=None
            )
            db.add(default_company)
            db.commit()
            db.refresh(default_company)
            print(f"Default company '{default_company.name}' created.")

        # Step 2: Define default users
        default_superusers = [
            {
                "email": "asheerali1997@gmail.com",
                "password": "admin",
                "first_name": "Asheer",
                "last_name": "Ali",
                "phone_number": "+491742555647",
                "role": RoleEnum.superuser,
            },
            {
                "email": "afshin@allfacetsconsulting.com",
                "password": "admin",
                "first_name": "Afshin",
                "last_name": "Shirazi",
                "phone_number": "+17186449039",
                "role": RoleEnum.superuser,
            },
            {
                "email": "musawar.soomro25@gmail.com",
                "password": "admin",
                "first_name": "Musawar",
                "last_name": "Soomro",
                "role": RoleEnum.manager,
                "company_id": default_company.id
            }
        ]

        # Step 3: Create users if they don't exist
        for user_data in default_superusers:
            if db.query(User).filter_by(email=user_data["email"]).first():
                print(f"User '{user_data['email']}' already exists.")
                continue

            user = User(
                email=user_data["email"],
                password_hash=bcrypt.hash(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                phone_number=user_data.get("phone_number"),
                role=user_data["role"],
                company_id=user_data.get("company_id", default_company.id if user_data["role"] != RoleEnum.superuser else None)
            )
            db.add(user)
            print(f"User '{user.email}' with role '{user.role}' created.")

        db.commit()
        print("All default users processed.")

    except Exception as e:
        db.rollback()
        print(f"Error while creating default superusers: {e}")
