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

# ENHANCED CORS Configuration - Fixed to properly handle preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite development server
        "http://localhost:3000",  # Create React App development server
        "http://127.0.0.1:5173",  # Alternative localhost format
        "http://127.0.0.1:3000"   # Alternative localhost format
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language", 
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Origin",
        "Cache-Control",
        "Pragma"
    ],
    expose_headers=["*"],
    max_age=3600  # Cache preflight requests for 1 hour
)

# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to the Excel Processing API!"}

# Add a specific OPTIONS handler for troubleshooting
@app.options("/api/{path:path}")
async def options_handler(path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}

# Include routers
app.include_router(excel_upload.router)
app.include_router(sales_split_filter.router)
app.include_router(pmix_filter.router)
app.include_router(financials_filter.router)
app.include_router(companywide_filter.router)
app.include_router(health.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        # Add these for better CORS debugging
        log_level="debug"
    )