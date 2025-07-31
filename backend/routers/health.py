from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback


# Import from local modules
from models_pydantic import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse
from excel_processor import process_excel_file
# from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file

router = APIRouter(
    prefix="/api",
    tags=["health"],
)

@router.get("/health")
async def health_check():
    return {"status": "ok for the docker container test 1"}
