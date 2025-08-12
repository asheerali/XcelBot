# # backend/database.py

# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from sqlalchemy import text


# import os
# from dotenv import load_dotenv

# # DATABASE_URL = "postgresql://postgres:admin@localhost:5432/testdb"

# load_dotenv()  # Load from .env

# # Ensure the data directory exists
# os.makedirs("data", exist_ok=True)

# DATABASE_URL = os.getenv("DATABASE_URL")

# # Extra connect args needed for SQLite (only for SQLite)
# connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}


# Base = declarative_base()
# engine = create_engine(DATABASE_URL, echo=False)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)



# # def get_db():
# #     db = SessionLocal()
# #     try:
# #         yield db
# #     finally:
# #         db.close()
        
# def get_db():
#     db = SessionLocal()
#     try:
#         if DATABASE_URL.startswith("sqlite"):
#             db.execute(text("PRAGMA foreign_keys = ON"))  # Enable foreign key support for SQLite using text()
#         yield db
#     finally:
#         db.close()


# # Base = declarative_base()
# # Base.metadata.create_all(bind=engine)


# # # ✅ Single function to provide DB session
# # def get_db():
# #     db = SessionLocal()
# #     try:
# #         yield db
# #     finally:
# #         db.close()



# # def create_tables():
# #     Base.metadata.create_all(bind=engine)


# backend/database.py


# backend/database.py

from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlalchemy.engine import Engine
import sqlite3

import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env

# Ensure the data directory exists
os.makedirs("data", exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL")

# Extra connect args needed for SQLite (only for SQLite)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

Base = declarative_base()

# Create engine with foreign key support
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, 
        echo=False, 
        connect_args=connect_args,
        # Add this to ensure foreign keys are enabled at the engine level
        pool_pre_ping=True,
        pool_recycle=300
    )
    
    # Enable foreign keys for all SQLite connections
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        if isinstance(dbapi_connection, sqlite3.Connection):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
else:
    engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        # Double-check that foreign keys are enabled for this session
        if DATABASE_URL.startswith("sqlite"):
            db.execute(text("PRAGMA foreign_keys = ON"))
            db.commit()
        yield db
    finally:
        db.close()