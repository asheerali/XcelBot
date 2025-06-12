from typing import Annotated
from fastapi import Depends, FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime, timedelta

from requests import Session
from database import engine, SessionLocal
from routers import excel_upload, sales_split_filter, health, companywide_filter, pmix_filter, financials_filter
# Import from local modules
from models import users, payments, subscriptions, stores, dashboards, user_dashboard_permissions, uploaded_files, file_permissions
# Initialize FastAPI app
app = FastAPI()
users.Base.metadata.create_all(bind=engine)
user_dashboard_permissions.Base.metadata.create_all(bind=engine)
uploaded_files.Base.metadata.create_all(bind=engine)
subscriptions.Base.metadata.create_all(bind=engine)
stores.Base.metadata.create_all(bind=engine)
payments.Base.metadata.create_all(bind=engine)
file_permissions.Base.metadata.create_all(bind=engine)



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
db_dependency = Annotated[Session, Depends(get_db)]

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to the Excel Processing API!"}
    
# Filter endpoint
# NEW ENDPOINT: Analytics endpoint
# Health check endpoint

app.include_router(excel_upload.router)
app.include_router(sales_split_filter.router)
# app.include_router(excel_analytics.router)
app.include_router(pmix_filter.router)
app.include_router(financials_filter.router)
app.include_router(companywide_filter.router)
app.include_router(health.router)

# for the databases
from routers import (users, 
                     payments, 
                     subscriptions, 
                     stores,
                     dashboards, 
                     user_dashboard_permissions,
                     uploaded_files,    
                     file_permissions)

app.include_router(users.router)
app.include_router(payments.router)
app.include_router(subscriptions.router)
app.include_router(stores.router)
app.include_router(dashboards.router)
app.include_router(user_dashboard_permissions.router)
app.include_router(uploaded_files.router)
app.include_router(file_permissions.router)

from dependencies.init_superuser import create_default_superusers

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        create_default_superusers(db)
    finally:
        db.close()


from routers import auth
app.include_router(auth.router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    