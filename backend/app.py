from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback

from routers import excel_upload, sales_split_filter, health, companywide_filter, pmix_filter, financials_filter
# Import from local modules
from models import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file



# Initialize FastAPI app
app = FastAPI()

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    