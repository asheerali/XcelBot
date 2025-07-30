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
<<<<<<< HEAD
    # allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_origins=["*"],  # Allow all origins
=======
    allow_origins=["*"],  # Allow all origins for development; restrict in production
>>>>>>> integrations_v41
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
    
<<<<<<< HEAD
    
# Add this test endpoint to verify FastAPI routing
@app.get("/api/test")
async def test_endpoint():
    return {"status": "ok", "message": "Test endpoint is working"}

# Upload endpoint
# Update to app.py to handle Sales Wide dashboard

# Inside the upload_excel endpoint, add support for the Sales Wide dashboard type
@app.post("/api/excel/upload", response_model=ExcelUploadResponse)
async def upload_excel(request: ExcelUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
    try:
        print(f"Received file upload: {request.fileName}")
        # Decode base64 file content
        # print("Type of file_content:", type(file_content))
        file_content = base64.b64decode(request.fileContent)
        print("Type of file_content:", type(file_content))
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp and location
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        location_slug = ""
        
        # If location is provided, include it in the filename
        if request.location:
            location_slug = f"{request.location.replace(' ', '_').lower()}_"
            
        file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{location_slug}{request.fileName}")
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        if request.location:
            print('Location:', request.location)
            
        if request.dashboard == "Financials":
            print("Dashboard type: Financials")
            # print("i am here 4")
            excel_data_copy = io.BytesIO(file_content)

            financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table = process_financials_file(
                excel_data_copy, 
                location=request.location
            )
            print("financials_weeks type:", type(financials_weeks))
            # print("financials_weeks:", financials_weeks)
            
# Ensure all returned values are properly converted to JSON-serializable formats
            # return {"hello": "world"}
            result = {
            "table1": [],
            "table2": [],
            "table3": [],
            "table4": [],
            "table5": [],
            "locations": [request.location],
            "dateRanges": [],
            "fileLocation":[request.location],
            "data":  "Financial Dashboard is not yet implemented."
        }
            print("result", result )
            
            return result
            # return {"message": "Financial Dashboard is not yet implemented."}
        
        elif request.dashboard == "Sales Split":
            print("Dashboard type: Sales Split Dashboard")

            # Process Excel file with optional filters
            result = process_excel_file(
                excel_data, 
                start_date=request.startDate,
                end_date=request.endDate,
                location=request.location
            )
            
            # Ensure each table exists in the result, even if empty
            for table in ['table1', 'table2', 'table3', 'table4', 'table5']:
                if table not in result:
                    result[table] = []
            
            # If location is provided, make sure it's in the locations list
            if 'locations' not in result:
                result['locations'] = []
                
            if request.location and request.location not in result['locations']:
                result['locations'].append(request.location)
                
            if 'dateRanges' not in result:
                result['dateRanges'] = []
                
            # Add fileLocation field to the response
            result['fileLocation'] = request.location
            
            # Add dashboardName to indicate this is Sales Split data
            result['dashboardName'] = "Sales Split"

            print("Sales Split Dashboard this is here ", result)
            
            # Return the properly structured response
            return ExcelUploadResponse(**result)
        
       # Update the backend to include all seven tables for Sales Wide dashboard

# In app.py, update the Sales Wide dashboard data generation:

# Inside the `upload_excel` function, modify the "Sales Wide" section:
       # Updated backend (app.py) to generate all 7 tables for Sales Wide dashboard

# Inside the upload_excel endpoint, modify the Sales Wide dashboard handler:
        elif request.dashboard == "Sales Wide":
            print("Dashboard type: Sales Wide Dashboard")
            
            # Mock data for Sales Wide Dashboard (matching the structure in SalesDashboard.tsx)
            # Create a more complete set of financial tables (7 tables)
            financial_tables = [
                {
                    "title": "Sales",
                    "columns": ["Store", "Tw Sales", "Lw Sales", "Ly Sales", "Tw vs. Lw", "Tw vs. Ly"],
                    "data": [
                        { "store": f"{request.location}", "value1": "$684,828.09", "value2": "$682,457.38", "value3": "$1,732,837.11", "change1": "0.35%", "change2": "-60.48%" },
                        { "store": "Lenox Hill", "value1": "$783,896.10", "value2": "$783,896.10", "value3": "$2,235,045.87", "change1": "0.00%", "change2": "-64.93%" },
                        { "store": "Hell's Kitchen", "value1": "$894,800.88", "value2": "$891,400.08", "value3": "$2,402,680.02", "change1": "0.38%", "change2": "-62.76%" },
                        { "store": "Union Square", "value1": "$230,012.76", "value2": "$229,111.90", "value3": "$535,126.89", "change1": "0.39%", "change2": "-57.02%" },
                        { "store": "Flatiron", "value1": "$773,556.81", "value2": "$771,903.19", "value3": "$1,831,389.44", "change1": "0.21%", "change2": "-57.76%" },
                        { "store": "Williamsburg", "value1": "$129,696.74", "value2": "$129,696.74", "value3": "$454,048.17", "change1": "0.00%", "change2": "-71.44%" },
                        { "store": "Grand Total", "value1": "$3,496,791.38", "value2": "$3,488,465.39", "value3": "$9,191,127.50", "change1": "0.24%", "change2": "-61.95%", "isGrandTotal": True },
                    ]
                },
                {
                    "title": "Orders",
                    "columns": ["Store", "Tw Orders", "Lw Orders", "Ly Orders", "Tw vs. Lw", "Tw vs. Ly"],
                    "data": [
                        { "store": f"{request.location}", "value1": "25,157", "value2": "25,157", "value3": "71,201", "change1": "0.00%", "change2": "-64.67%" },
                        { "store": "Lenox Hill", "value1": "38,239", "value2": "38,239", "value3": "104,549", "change1": "0.00%", "change2": "-63.42%" },
                        { "store": "Hell's Kitchen", "value1": "41,880", "value2": "41,880", "value3": "111,192", "change1": "0.00%", "change2": "-62.34%" },
                        { "store": "Union Square", "value1": "10,509", "value2": "10,509", "value3": "25,316", "change1": "0.00%", "change2": "-58.49%" },
                        { "store": "Flatiron", "value1": "35,434", "value2": "35,434", "value3": "88,407", "change1": "0.00%", "change2": "-59.92%" },
                        { "store": "Williamsburg", "value1": "1,283", "value2": "1,283", "value3": "749", "change1": "0.00%", "change2": "71.30%" },
                        { "store": "Grand Total", "value1": "152,502", "value2": "152,502", "value3": "401,414", "change1": "0.00%", "change2": "-62.01%", "isGrandTotal": True },
                    ]
                },
                {
                    "title": "Average Ticket",
                    "columns": ["Store", "Tw Avg Ticket", "Lw Avg Ticket", "Ly Avg Ticket", "Tw vs. Lw", "Tw vs. Ly"],
                    "data": [
                        { "store": f"{request.location}", "value1": "$27.22", "value2": "$27.13", "value3": "$24.34", "change1": "0.35%", "change2": "11.85%" },
                        { "store": "Lenox Hill", "value1": "$20.50", "value2": "$20.50", "value3": "$21.38", "change1": "0.00%", "change2": "-4.11%" },
                        { "store": "Hell's Kitchen", "value1": "$21.37", "value2": "$21.28", "value3": "$21.61", "change1": "0.38%", "change2": "-1.12%" },
                        { "store": "Union Square", "value1": "$21.89", "value2": "$21.80", "value3": "$21.14", "change1": "0.39%", "change2": "3.54%" },
                        { "store": "Flatiron", "value1": "$21.83", "value2": "$21.78", "value3": "$20.72", "change1": "0.21%", "change2": "5.38%" },
                        { "store": "Williamsburg", "value1": "$101.09", "value2": "$101.09", "value3": "$606.21", "change1": "0.00%", "change2": "-83.32%" },
                        { "store": "Grand Total", "value1": "$22.93", "value2": "$22.87", "value3": "$22.90", "change1": "0.24%", "change2": "0.14%", "isGrandTotal": True },
                    ]
                },
                {
                    "title": "COGS",
                    "columns": ["Store", "Tw COGS", "Lw COGS", "Tw vs. Lw", "Tw Fc %", "Lw Fc %"],
                    "data": [
                        { "store": f"{request.location}", "value1": "$209,202.98", "value2": "$208,770.59", "value3": "0.21%", "change1": "30.55%", "change2": "30.59%" },
                        { "store": "Lenox Hill", "value1": "$263,932.59", "value2": "$263,932.59", "value3": "0.00%", "change1": "33.67%", "change2": "33.67%" },
                        { "store": "Hell's Kitchen", "value1": "$286,700.07", "value2": "$286,259.49", "value3": "0.15%", "change1": "32.04%", "change2": "32.11%" },
                        { "store": "Union Square", "value1": "$67,410.90", "value2": "$66,989.23", "value3": "0.63%", "change1": "29.31%", "change2": "29.24%" },
                        { "store": "Flatiron", "value1": "$242,340.09", "value2": "$241,910.65", "value3": "0.18%", "change1": "31.33%", "change2": "31.34%" },
                        { "store": "Williamsburg", "value1": "$72,649.35", "value2": "$72,162.13", "value3": "0.68%", "change1": "2.08%", "change2": "2.07%" },
                        { "store": "Grand Total", "value1": "$1,142,235.99", "value2": "$1,140,024.68", "value3": "0.19%", "change1": "32.67%", "change2": "32.68%", "isGrandTotal": True },
                    ]
                },
                {
                    "title": "Regular Pay",
                    "columns": ["Store", "Tw Reg Pay", "Lw Reg Pay", "Tw vs. Lw", "Tw Lc %", "Lw Lc %"],
                    "data": [
                        { "store": f"{request.location}", "value1": "$120,317.61", "value2": "$120,317.61", "value3": "0.00%", "change1": "17.57%", "change2": "17.63%" },
                        { "store": "Lenox Hill", "value1": "$187,929.88", "value2": "$186,309.88", "value3": "0.87%", "change1": "23.97%", "change2": "23.77%" },
                        { "store": "Hell's Kitchen", "value1": "$200,590.94", "value2": "$199,078.22", "value3": "0.76%", "change1": "22.42%", "change2": "22.33%" },
                        { "store": "Union Square", "value1": "$56,704.25", "value2": "$56,704.25", "value3": "0.00%", "change1": "24.65%", "change2": "24.75%" },
                        { "store": "Flatiron", "value1": "$174,991.94", "value2": "$173,694.02", "value3": "0.75%", "change1": "22.62%", "change2": "22.50%" },
                        { "store": "Williamsburg", "value1": "$290,133.01", "value2": "$290,929.09", "value3": "-0.27%", "change1": "8.30%", "change2": "8.34%" },
                        { "store": "Grand Total", "value1": "$1,030,667.64", "value2": "$1,027,033.08", "value3": "0.35%", "change1": "29.47%", "change2": "29.44%", "isGrandTotal": True },
                    ]
                },
                {
                    "title": "Labor Hours",
                    "columns": ["Store", "Tw Lb Hrs", "Lw Lb Hrs", "Tw vs. Lw"],
                    "data": [
                        { "store": f"{request.location}", "value1": "5,737.37", "value2": "5,737.37", "value3": "0.00%", "change1": "", "change2": "" },
                        { "store": "Lenox Hill", "value1": "9,291.48", "value2": "9,291.48", "value3": "0.00%", "change1": "", "change2": "" },
                        { "store": "Hell's Kitchen", "value1": "9,436.65", "value2": "9,436.65", "value3": "0.00%", "change1": "", "change2": "" },
                        { "store": "Union Square", "value1": "2,830.92", "value2": "2,830.92", "value3": "0.00%", "change1": "", "change2": "" },
                        { "store": "Flatiron", "value1": "8,598.96", "value2": "8,598.96", "value3": "0.00%", "change1": "", "change2": "" },
                        { "store": "Williamsburg", "value1": "12,297.80", "value2": "12,297.80", "value3": "0.00%", "change1": "", "change2": "" },
                        { "store": "Grand Total", "value1": "48,193.18", "value2": "48,193.18", "value3": "0.00%", "change1": "", "change2": "", "isGrandTotal": True },
                    ]
                },
                {
                    "title": "SPMH",
                    "columns": ["Store", "Tw SPMH", "Lw SPMH", "Tw vs. Lw"],
                    "data": [
                        { "store": f"{request.location}", "value1": "117.44", "value2": "389.74", "value3": "-69.87%", "change1": "", "change2": "" },
                        { "store": "Lenox Hill", "value1": "84.34", "value2": "84.34", "value3": "0.00%", "change1": "", "change2": "" },
                        { "store": "Hell's Kitchen", "value1": "105.41", "value2": "345.76", "value3": "-69.51%", "change1": "", "change2": "" },
                        { "store": "Union Square", "value1": "71.39", "value2": "198.36", "value3": "-64.01%", "change1": "", "change2": "" },
                        { "store": "Flatiron", "value1": "99.08", "value2": "305.27", "value3": "-67.54%", "change1": "", "change2": "" },
                        { "store": "Williamsburg", "value1": "10.12", "value2": "668.70", "value3": "-98.49%", "change1": "", "change2": "" },
                        { "store": "Grand Total", "value1": "83.65", "value2": "325.89", "value3": "-74.33%", "change1": "", "change2": "", "isGrandTotal": True },
                    ]
                }
            ]
            
            # Now generate the chart data from the financial tables
            # This ensures the charts and tables use the same data
            
            # 1. Sales data (from "Sales" table, using Tw vs. Lw and Tw vs. Ly columns)
            sales_data = []
            for row in financial_tables[0]["data"]:
                if row.get("isGrandTotal"):
                    continue  # Skip the grand total row
                
                # Convert percentage strings to floats
                tw_vs_lw = float(row["change1"].replace("%", "")) if isinstance(row["change1"], str) else row["change1"]
                tw_vs_ly = float(row["change2"].replace("%", "")) if isinstance(row["change2"], str) else row["change2"]
                
                sales_data.append({
                    "store": row["store"],
                    "Tw vs. Lw": tw_vs_lw,
                    "Tw vs. Ly": tw_vs_ly
                })
            
            # 2. Orders data (from "Orders" table)
            orders_data = []
            for row in financial_tables[1]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                tw_vs_lw = float(row["change1"].replace("%", "")) if isinstance(row["change1"], str) else row["change1"]
                tw_vs_ly = float(row["change2"].replace("%", "")) if isinstance(row["change2"], str) else row["change2"]
                
                orders_data.append({
                    "store": row["store"],
                    "Tw vs. Lw": tw_vs_lw,
                    "Tw vs. Ly": tw_vs_ly
                })
            
            # 3. Average Ticket data (from "Average Ticket" table)
            avg_ticket_data = []
            for row in financial_tables[2]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                tw_vs_lw = float(row["change1"].replace("%", "")) if isinstance(row["change1"], str) else row["change1"]
                tw_vs_ly = float(row["change2"].replace("%", "")) if isinstance(row["change2"], str) else row["change2"]
                
                avg_ticket_data.append({
                    "store": row["store"],
                    "Tw vs. Lw": tw_vs_lw,
                    "Tw vs. Ly": tw_vs_ly
                })
            
            # 4. Labor Hours data (from "Labor Hours" table)
            labor_hrs_data = []
            for row in financial_tables[5]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                # Convert string values with commas to floats
                tw_lb_hrs = float(row["value1"].replace(",", "")) if isinstance(row["value1"], str) else row["value1"]
                lw_lb_hrs = float(row["value2"].replace(",", "")) if isinstance(row["value2"], str) else row["value2"]
                
                labor_hrs_data.append({
                    "store": row["store"],
                    "Tw Lb Hrs": tw_lb_hrs,
                    "Lw Lb Hrs": lw_lb_hrs
                })
            
            # 5. SPMH data (from "SPMH" table)
            spmh_data = []
            for row in financial_tables[6]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                tw_spmh = float(row["value1"]) if isinstance(row["value1"], str) else row["value1"]
                lw_spmh = float(row["value2"]) if isinstance(row["value2"], str) else row["value2"]
                
                spmh_data.append({
                    "store": row["store"],
                    "Tw SPMH": tw_spmh,
                    "Lw SPMH": lw_spmh
                })
            
            # 6. Labor Cost data (from "Regular Pay" table)
            labor_cost_data = []
            for row in financial_tables[4]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                # Convert currency strings to floats
                tw_reg_pay = float(row["value1"].replace("$", "").replace(",", "")) if isinstance(row["value1"], str) else row["value1"]
                lw_reg_pay = float(row["value2"].replace("$", "").replace(",", "")) if isinstance(row["value2"], str) else row["value2"]
                
                labor_cost_data.append({
                    "store": row["store"],
                    "Tw Reg Pay": tw_reg_pay,
                    "Lw Reg Pay": lw_reg_pay
                })
            
            # 7. Labor Percentage data (from "Regular Pay" table)
            labor_percentage_data = []
            for row in financial_tables[4]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                tw_lc = float(row["change1"].replace("%", "")) if isinstance(row["change1"], str) else row["change1"]
                lw_lc = float(row["change2"].replace("%", "")) if isinstance(row["change2"], str) else row["change2"]
                
                labor_percentage_data.append({
                    "store": row["store"],
                    "Tw Lc %": tw_lc,
                    "Lw Lc %": lw_lc
                })
            
            # 8. COGS data (from "COGS" table)
            cogs_data = []
            for row in financial_tables[3]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                # Convert currency strings to floats
                tw_cogs = float(row["value1"].replace("$", "").replace(",", "")) if isinstance(row["value1"], str) else row["value1"]
                lw_cogs = float(row["value2"].replace("$", "").replace(",", "")) if isinstance(row["value2"], str) else row["value2"]
                
                cogs_data.append({
                    "store": row["store"],
                    "Tw COGS": tw_cogs,
                    "Lw COGS": lw_cogs
                })
            
            # 9. COGS Percentage data (from "COGS" table)
            cogs_percentage_data = []
            for row in financial_tables[3]["data"]:
                if row.get("isGrandTotal"):
                    continue
                
                tw_fc = float(row["change1"].replace("%", "")) if isinstance(row["change1"], str) else row["change1"]
                lw_fc = float(row["change2"].replace("%", "")) if isinstance(row["change2"], str) else row["change2"]
                
                cogs_percentage_data.append({
                    "store": row["store"],
                    "Tw Fc %": tw_fc,
                    "Lw Fc %": lw_fc
                })
            
            result = {
                # Chart data derived from the tables
                "salesData": sales_data,
                "ordersData": orders_data,
                "avgTicketData": avg_ticket_data,
                "laborHrsData": labor_hrs_data,
                "spmhData": spmh_data,
                "laborCostData": labor_cost_data,
                "laborPercentageData": labor_percentage_data,
                "cogsData": cogs_data,
                "cogsPercentageData": cogs_percentage_data,
                
                # Tables data
                "financialTables": financial_tables,
                
                # Common fields required for all dashboards
                "locations": [request.location] if request.location else ["Default Store"],
                "helpers": ["Helper 1", "Helper 2", "Helper 3", "Helper 4"],
                "years": ["2023", "2024", "2025", "2026"],
                "equators": ["Equator A", "Equator B", "Equator C", "Equator D"],
                "dateRanges": ["Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Last 3 Months"],
                "fileLocation": request.location,
                "dashboardName": "Sales Wide",
                "data": "Sales Wide Dashboard data."
            }
            
            print("Result structure created for Sales Wide Dashboard")
            print("Result:", result)
            return ExcelUploadResponse(**result)
                    
        else:
            # Handle other dashboard types
            print(f"Dashboard type: {request.dashboard}")
            
            # For now, return empty data for unsupported dashboards
            result = {
                "table1": [],
                "table2": [],
                "table3": [],
                "table4": [],
                "table5": [],
                "locations": [request.location] if request.location else [],
                "dateRanges": [],
                "fileLocation": request.location,
                "dashboardName": request.dashboard,
                "data": f"{request.dashboard} Dashboard is not yet implemented."
            }
            
            return ExcelUploadResponse(**result)
    except Exception as e:
        # Log the full exception for debugging
        error_message = str(e)
        print(f"Error processing file: {error_message}")
        print(traceback.format_exc())
        
            # Check for specific known error patterns
        if "Net Price" in error_message:
            raise HTTPException(
                status_code=400,
                detail=f"You uploaded the file in the wrong dashboard i.e. ({request.dashboard}) or the file is not properly structured. Please check the help center for more details."
            )
        
        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error processing file: {error_message}")

        
=======
>>>>>>> integrations_v41
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
    