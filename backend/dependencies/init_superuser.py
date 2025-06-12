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
            "phone_number": "+491742555647"
        },
        {
            "email": "musawar.soomro25@gmail.com",
            "password": "admin",
            "first_name": "musawar",
            "last_name": "soomro"
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
                role=RoleEnum.superuser,
            )
            db.add(user)
            print(f"✅ Superuser {user_data['email']} created.")
        else:
            print(f"ℹ️ Superuser {user_data['email']} already exists.")

    db.commit()
