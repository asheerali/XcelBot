from typing import Annotated
from fastapi import Depends, FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime, timedelta

from requests import Session
from models import locations
from routers import locations
from database import engine, SessionLocal
from routers import excel_upload, sales_split_filter, health, companywide_filter, pmix_filter, financials_filter, master_upload, masterfile
# Import from local modules
from models import (users,user_company_companylocation ,
                    locations,company_locations, 
                    permissions, user_company, payments, 
                    subscriptions, dashboards, user_dashboard_permissions, 
                    uploaded_files, file_permissions, companies, master_file, 
                    logs, storeorders, mails
                    )
from database import get_db
from tasks.email_scheduler import start_scheduler

# Initialize FastAPI app
app = FastAPI()

@app.on_event("startup")
def start_email_scheduler():
    start_scheduler()

users.Base.metadata.create_all(bind=engine)
user_company_companylocation.Base.metadata.create_all(bind=engine)
user_dashboard_permissions.Base.metadata.create_all(bind=engine)
uploaded_files.Base.metadata.create_all(bind=engine)
subscriptions.Base.metadata.create_all(bind=engine)
locations.Base.metadata.create_all(bind=engine)
payments.Base.metadata.create_all(bind=engine)
file_permissions.Base.metadata.create_all(bind=engine)
companies.Base.metadata.create_all(bind=engine)
user_company.Base.metadata.create_all(bind=engine)
permissions.Base.metadata.create_all(bind=engine)
company_locations.Base.metadata.create_all(bind=engine)
master_file.Base.metadata.create_all(bind=engine)
logs.Base.metadata.create_all(bind=engine)
storeorders.Base.metadata.create_all(bind=engine)
mails.Base.metadata.create_all(bind=engine)

        
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
    return {"message": "Welcome to the Excel Processing API! with cidc"}
    
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
app.include_router(master_upload.router)
app.include_router(masterfile.router)


# for the databases
from routers import (users, company_locations, companies,
                     locations, payments, subscriptions, 
                     dashboards, user_dashboard_permissions,
                     uploaded_files, permissions, user_company,   
                     file_permissions, company_overview, logs, 
                     storeorders, mails, sales_pmix
                     )

app.include_router(users.router)
app.include_router(companies.router)
app.include_router(payments.router)
app.include_router(locations.router)
app.include_router(subscriptions.router)
app.include_router(locations.router)
app.include_router(dashboards.router)
app.include_router(user_dashboard_permissions.router)
app.include_router(uploaded_files.router)
app.include_router(file_permissions.router)
app.include_router(user_company.router)
app.include_router(permissions.router)
app.include_router(company_locations.router)
app.include_router(company_overview.router)
app.include_router(logs.router)
app.include_router(storeorders.router)
app.include_router(mails.router)
app.include_router(sales_pmix.router)



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
    