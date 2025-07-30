# backend/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os
from dotenv import load_dotenv

# DATABASE_URL = "postgresql://postgres:admin@localhost:5432/testdb"

load_dotenv()  # Load from .env

# Ensure the data directory exists
os.makedirs("data", exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL")

# Extra connect args needed for SQLite (only for SQLite)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}


Base = declarative_base()
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        



# Base = declarative_base()
# Base.metadata.create_all(bind=engine)


# # ✅ Single function to provide DB session
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()



# def create_tables():
#     Base.metadata.create_all(bind=engine)