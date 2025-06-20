from sqlalchemy.orm import Session
from models.users import User, RoleEnum
from models.companies import Company
from models.user_company import UserCompany
from models.locations import Store
from passlib.hash import bcrypt
from datetime import datetime

def create_default_superusers(db: Session):
    try:
        # Step 1: Ensure a default company exists
        default_company = db.query(Company).first()
        if not default_company:
            default_company = Company(
                name="Default Company",
                address="123 Default St",  # Add address here
                state="N/A",
                postcode="00000",
                phone="000-000-0000",
                email="default@company.com",
                website=None
            )

            db.add(default_company)
            db.commit()
            db.refresh(default_company)
            print(f"Default company '{default_company.name}' created.")

        # Step 1.1: Create another company if not exists
        second_company = db.query(Company).filter_by(name="Second Company").first()
        if not second_company:
            second_company = Company(
                name="Second Company",
                address="456 Main Ave",  # Add address here
                state="CA",
                postcode="90001",
                phone="123-456-7890",
                email="info@secondcompany.com",
                website="https://secondcompany.com"
            )
            db.add(second_company)
            db.commit()
            db.refresh(second_company)
            print(f"Second company '{second_company.name}' created.")

            # Add a location for the second company
            location = Store(
                name="Second Company Store",
                city="Los Angeles",
                state="CA",
                address="789 Sunset Blvd",  # Add address here
                postcode="90001",
                phone="323-1112222",
                email="store@secondcompany.com",
                company_id=second_company.id
            )
            db.add(location)
            db.commit()
            print("Location for second company added.")

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
                "phone_number": "+923002345678",
                "role": RoleEnum.manager,
                "company_id": default_company.id
            }
        ]

        # Step 3: Create users
        for user_data in default_superusers:
            existing_user = db.query(User).filter_by(email=user_data["email"]).first()
            if existing_user:
                print(f"User '{user_data['email']}' already exists.")

                # Ensure user_company mapping for non-superusers
                if existing_user.role != RoleEnum.superuser:
                    exists = db.query(UserCompany).filter_by(
                        user_id=existing_user.id,
                        company_id=existing_user.company_id
                    ).first()
                    if not exists:
                        db.add(UserCompany(user_id=existing_user.id, company_id=existing_user.company_id))
                        print(f"UserCompany mapping created for '{existing_user.email}'")
                continue

            # Create new user
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
            db.flush()

            # Step 4: Create user_company + dummy locations for non-superusers
            if user.role != RoleEnum.superuser:
                db.add(UserCompany(user_id=user.id, company_id=user.company_id))

                location1 = Store(
                    name="Default Store A",
                    city="Berlin",
                    state="BE",
                    postcode="10115",
                    address="123 Main St",  # Add address here
                    phone="030-123456",
                    email="store-a@default.com",
                    company_id=user.company_id
                )
                location2 = Store(
                    name="Default Store B",
                    city="Munich",
                    state="BY",
                    postcode="80331",
                    address="456 Elm St ",  # Add address here
                    phone="089-654321",
                    email="store-b@default.com",
                    company_id=user.company_id
                )
                db.add_all([location1, location2])
                print("Added dummy locations for manager.")

            print(f"User '{user.email}' with role '{user.role.name}' created.")

        db.commit()
        print("All default users processed.")

    except Exception as e:
        db.rollback()
        print(f"Error while creating default superusers: {e}")
