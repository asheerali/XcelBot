from typing import Annotated
from fastapi import Depends, FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime, timedelta
import logging
import atexit

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
from tasks.email_scheduler import start_scheduler, stop_scheduler, get_scheduler_status

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()

# Create all tables
logger.info("Creating database tables...")
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

# Add scheduler status endpoint for debugging
@app.get("/scheduler/status")
async def scheduler_status():
    return get_scheduler_status()

@app.post("/scheduler/restart")
async def restart_scheduler():
    """Restart the email scheduler"""
    try:
        stop_scheduler()
        start_scheduler()
        return {"message": "Scheduler restarted successfully"}
    except Exception as e:
        logger.error(f"Failed to restart scheduler: {e}")
        return {"error": str(e)}

# Include routers
app.include_router(excel_upload.router)
app.include_router(sales_split_filter.router)
app.include_router(pmix_filter.router)
app.include_router(financials_filter.router)
app.include_router(companywide_filter.router)
app.include_router(health.router)
app.include_router(master_upload.router)
app.include_router(masterfile.router)

# Database routers
from routers import (users, company_locations, companies,
                     locations, payments, subscriptions, 
                     dashboards, user_dashboard_permissions,
                     uploaded_files, permissions, user_company,   
                     file_permissions, company_overview, logs, 
                     storeorders, mails, sales_pmix,
                     budget, financials_company_wide
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
app.include_router(financials_company_wide.router)
app.include_router(budget.router)

from dependencies.init_superuser import create_default_superusers
from routers import auth
app.include_router(auth.router)

@app.on_event("startup")
async def startup_event():
    """Handle startup events"""
    logger.info("Starting up application...")
    
    # Initialize database with superusers
    db = SessionLocal()
    try:
        create_default_superusers(db)
        logger.info("Default superusers created")
    except Exception as e:
        logger.error(f"Error creating superusers: {e}")
    finally:
        db.close()
    
    # Start email scheduler
    try:
        start_scheduler()
        logger.info("Email scheduler started")
    except Exception as e:
        logger.error(f"Failed to start email scheduler: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Handle shutdown events"""
    logger.info("Shutting down application...")
    try:
        stop_scheduler()
        logger.info("Email scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")

# Register shutdown handler for graceful termination
atexit.register(stop_scheduler)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)