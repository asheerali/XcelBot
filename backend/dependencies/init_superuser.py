from sqlalchemy.orm import Session
from models.users import User, RoleEnum
from passlib.hash import bcrypt


def create_default_superusers(db: Session):
    default_superusers = [
        {
            "email": "asheerali1997@gmail.com",
            "password": "admin",
            "first_name": "asheer",
            "last_name": "ali",
            "phone_number": "+491742555647",
            "role": RoleEnum.superuser
        },{
            "email":  "afshin@allfacetsconsulting.com", 
            "password": "admin",
            "first_name": "afshin",
            "last_name": "shirazi",
            "phone_number": "+17186449039",
            "role": RoleEnum.superuser
            },
        {
            "email": "musawar.soomro25@gmail.com",
            "password": "admin",
            "first_name": "musawar",
            "last_name": "soomro",
            "role": RoleEnum.manager
        }
    ]

    for user_data in default_superusers:
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing_user:
            user = User(
                email=user_data["email"],
                password_hash=bcrypt.hash(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                phone_number=user_data.get("phone_number"),
                role=user_data["role"],
            )
            db.add(user)
            print(f"✅ {user_data['role']} {user_data['email']} created.")
        else:
            print(f"ℹ️ User {user_data['email']} already exists.")

    db.commit()
