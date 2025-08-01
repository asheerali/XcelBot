# router/excel_upload.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback
from datetime import date
from dateutil.relativedelta import relativedelta
from fastapi import Request
from sqlalchemy.orm import Session

# Import from local modules
from models_pydantic import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse, DualDashboardResponse, DashboardResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file
from companywide_dashboard.companywide_processor import process_companywide_file
from pmix_dashboard.pmix_processor import process_pmix_file
from sales_split_dashboard.sales_split_prcoessor import process_sales_split_file
from constants import *


from crud.uploaded_files import upload_file_record
from schemas.uploaded_files import UploadedFileCreate
from dependencies.auth import get_current_active_user
from models.users import User
from fastapi import Depends
from database import get_db

router = APIRouter(
    prefix="/api",
    tags=["excel_upload"],
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/excel/upload", response_model=DualDashboardResponse)
# @router.post("/excel/upload")
# async def upload_excel(request: ExcelUploadRequest = Body(...)):
async def upload_excel(
    request: ExcelUploadRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
# async def upload_excel(request: Request):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
        
    # request = await request.json()

    # print("i am here in excel upload printhign the request", request)	
    try:
        print(f"Received file upload: {request.fileName}")
        # Decode base64 file content
        # print("Type of file_content:", type(file_content))
        file_content = base64.b64decode(request.fileContent)
        print("Type of file_content:", type(file_content))
        
        # print("i am here printing the request in the excel upload", request)
        # print("response", request)
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp and location
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        location_slug = ""
        
        # # If location is provided, include it in the filename
        # if request.location:
        #     location_slug = f"{request.location.replace(' ', '_').lower()}_"
            
        file_name =  f"{timestamp}_{request.fileName}"
        file_path = os.path.join(UPLOAD_DIR,file_name)

        # Add this after file is saved to disk
        file_record = UploadedFileCreate(
            file_name=file_name,
            dashboard_name=request.dashboard,
            uploader_id=current_user.id  # Make sure current_user is injected via Depends
        )

        upload_file_record(db, file_record)
        
        print("i am here in excel upload printing the file path and file name",file_name, file_path)
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        print('Processing uploaded file:', request.fileName)
        if request.location:
            print('Location:', request.location)
            print("dashboard: ", request.dashboard) 
            
        # if request.dashboard == "Sales Split" or request.dashboard == "Product Mix":
        #     print("Dashboard type: Sales Split Dashboard")
        #     # Process the sales split file
        #     result = process_sales_split_file(excel_data, request.location, request.startDate, request.endDate)
        #     return ExcelUploadResponse(success=True, message="File processed successfully", data=result)

        # if request.dashboard in ["Financials", "Companywide", "Sales Wide"]:

        if request.dashboard == "Financials and Sales Wide" or request.dashboard == "Financials" or request.dashboard == "Sales Wide" or request.dashboard == "Companywide":

            print("Dashboard type: ", request.dashboard)
            # print("i am here 4")
            excel_data_copy = io.BytesIO(file_content)

            financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table, years, dates, stores  = process_financials_file(
                excel_data_copy,  
                year="All", 
                week_range="All", 
                location="All" 
                )
            
            # financials_result = {
            # "table1": [{"financials_weeks": [], "financials_years": [], "financials_stores": []}],
            # "table2": financials_sales_table.to_dict(orient='records'),
            # "table3": financials_orders_table.to_dict(orient='records'),
            # "table4": financials_avg_ticket_table.to_dict(orient='records'),
            # "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
            # "fileName": file_name, #the full names of the file saved in the uploads folder
            # "locations": stores,
            # "years": years,
            # "dates": dates,
            # "dashboardName": "Financials",
            # "data": "Financial Dashboard is not yet implemented."
            # }
            
            financials_result = {
            "table1": [{"financials_sales": 45000, 
                        "financials_labor_cost": 33.00 , 
                        "financials_avg_ticket": 13.41,
                        "financials_prime_cost": 12.40,
                        "financials_food_cost": 11.40,
                        "financials_spmh": 10.14,
                        "financials_lmph": 9.14,
                        }],
            "table2": financials_sales_table.to_dict(orient='records'),
            "table3": financials_orders_table.to_dict(orient='records'),
            "table4": financials_avg_ticket_table.to_dict(orient='records'),
            "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
            "table6": financials_sales_df.to_dict(orient='records'),  
            "table7": financials_labor_df.to_dict(orient='records'),
            "table8": financials_avg_ticker_df.to_dict(orient='records'),
            "table9": financials_prime_cost_df.to_dict(orient='records'),
            "table10": financials_food_cost_df.to_dict(orient='records'),
            "table11": financials_spmh_df.to_dict(orient='records'),
            "table12": financials_lpmh_df.to_dict(orient='records'),
            "table13": financials_weekly_sales_df.to_dict(orient='records'),
            "table14": financials_orders_by_day_df.to_dict(orient='records'),
            "table15": financials_average_ticket_df.to_dict(orient='records'),
            "table16": financials_kpi_vs_budget_df.to_dict(orient='records'),
            "fileName": file_name, #the full names of the file saved in the uploads folder
            "locations": stores,
            "years": years,
            "dates": dates,
            "dashboardName": "Financials",
            "data":  "Financial Dashboard is not yet implemented."
            }
        
            # ,
            # {
            #     "table1":sales_df.to_dict(orient='records'),
            #     "table2":order_df.to_dict(orient='records'),
            #     "table3":avg_ticket_df.to_dict(orient='records'),
            #     "table4":cogs_df.to_dict(orient='records'),
            #     "table5":reg_pay_df.to_dict(orient='records'),
            #     "table6":lb_hrs_df.to_dict(orient='records'),
            #     "table7":spmh_df.to_dict(orient='records'),
            #     "locations": ["test"],
            #     "dateRanges": ["test"],
            #     "fileLocation":["test"],
            #     "dashboardName": "Companywide",
            #     "fileName": "123", #the full names of the file saved in the uploads folder
            #     "data":  "Companywide Dashboard is not yet implemented."
            # }
            
            sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df, years, dates, stores = process_companywide_file(
                excel_data_copy, 
                store_filter='All', 
                year_filter=None, 
                quarter_filter='All', 
                helper4_filter='All'
            )
            
            
            sales_wide_result ={
                "table1":sales_df.to_dict(orient='records'),
                "table2":order_df.to_dict(orient='records'),
                "table3":avg_ticket_df.to_dict(orient='records'),
                "table4":cogs_df.to_dict(orient='records'),
                "table5":reg_pay_df.to_dict(orient='records'),
                "table6":lb_hrs_df.to_dict(orient='records'),
                "table7":spmh_df.to_dict(orient='records'),
                "locations": stores,
                "years": years,
                "dates": dates,
                # "fileLocation":["test"],
                "dashboardName": "Sales Wide",
                "fileName": file_name, #the full names of the file saved in the uploads folder
                "data": "Sales Wide Dashboard data."
            }
            
            print("result for the sales wide", financials_result) 
            
            if request.dashboard == "Financials and Sales Wide":
                return [financials_result, sales_wide_result]
            
            if request.dashboard == "Financials":
                # print("i am here in financials result", financials_result)
                return [financials_result]
            
            if request.dashboard == "Sales Wide" or request.dashboard == "Companywide":
                # print("i am here in sales wide result", sales_wide_result)
                return [sales_wide_result]
            
            
            # return {"message": "Financial Dashboard is not yet implemented."}
                # return {
            #     "table1": [],
            #     "table2": [],
            #     "table3": [],
            #     "table4": [],
            #     "table5": [],
            #     "table6": [],
            #     "table7": [],
            #     "table8": [],
            #     "table9": [],
            #     "locations": ["test"],
            #     "dateRanges": ["test"],
            #     "fileLocation":["test"],
            #     "dashboardName": request.dashboard,
            #     "fileName": request.fileName,
            #     "data":  f"{request.dashboard} Dashboard is not yet implemented."
            # }
        
        if request.dashboard == "Sales Split and Product Mix" or request.dashboard == "Sales Split" or request.dashboard == "Product Mix":
            print("Dashboard type: Sales Split / Product Mix Dashboard")
            
            excel_data_copy = io.BytesIO(file_content)
            if request.location == "Multiple Locations":
                location_filter = "All"
            else:
                location_filter = request.location if request.location else 'All'
                
            print("i am here in excel upload printing the location filter", location_filter)
            server_filter = request.server if request.server else 'All'
            # Set dynamic dates
            default_end_date1 = date.today()
            default_end_date = default_end_date1.strftime('%Y-%m-%d')
            default_start_date = (default_end_date1 - relativedelta(months=2)).strftime('%Y-%m-%d')                                                                                                                                                                                                                                                                                                            

            default_start_date = "2025-01-01"
            default_end_date = "2025-05-31" #2025-05-17

            start_date = request.startDate
            end_date = request.endDate
            
            end_date = request.endDate
            start_date = start_date if start_date else default_start_date
            end_date = end_date if end_date else default_end_date
            
            category_filter = request.category if request.category else 'All'
            
            (net_sales, 
             orders, 
             qty_sold, 
             sales_by_category_df, 
             sales_by_menu_group_df, 
             sales_by_server_df, 
             top_selling_items_df, 
             sales_by_location_df, 
             average_price_by_item_df, 
             average_order_value, 
             average_items_per_order, 
             price_changes_df, 
             top_items_df, 
             unique_orders, 
             total_quantity, 
             locations, 
             server, 
             category, 
             net_sales_change, 
             orders_change, 
             qty_sold_change, 
             average_order_value_change,
             average_items_per_order_change,
             unique_orders_change,
             total_quantity_change,
             sales_by_category_tables_df, 
             category_comparison_table_df, 
             sales_by_category_by_day_table_df,
             top_vs_bottom_comparison_df
   
             ) = process_pmix_file(excel_data_copy, 
            start_date=start_date, 
            end_date=end_date,
            category_filter=category_filter,
            location_filter=location_filter, 
            server_filter=server_filter)

            # print("i am here in excel upload printing before the result" )
            pmix_dashboard = {
            # "table1": [{"net_sales": [net_sales], "orders": [orders], 
            #             "qty_sold": [qty_sold],"average_order_value": [average_order_value], 
            #             "average_items_per_order": [average_items_per_order], "unique_orders": [unique_orders], 
            #             "total_quantity": [total_quantity]}],
                "table1": [{
                            "net_sales": [float(net_sales)],
                            "orders": [int(orders)],
                            "qty_sold": [int(qty_sold)],
                            "average_order_value": [float(average_order_value)],
                            "average_items_per_order": [float(average_items_per_order)],
                            "unique_orders": [int(unique_orders)],
                            "total_quantity": [int(total_quantity)],
                            
                            "net_sales_change": [float(net_sales_change)],
                            "orders_change": [int(orders_change)],
                            "qty_sold_change": [int(qty_sold_change)],
                            "average_order_value_change": [float(average_order_value_change)],
                            "average_items_per_order_change": [float(average_items_per_order_change)],
                            "unique_orders_change": [int(unique_orders_change)],
                            "total_quantity_change": [int(total_quantity_change)]
                        }],
            "table2": sales_by_category_df.to_dict(orient='records'),
            "table3": sales_by_menu_group_df.to_dict(orient='records'),
            "table4": sales_by_server_df.to_dict(orient='records'),
            "table5": top_selling_items_df.to_dict(orient='records'),
            "table6": sales_by_location_df.to_dict(orient='records'),
            "table7": average_price_by_item_df.to_dict(orient='records'),
            "table8": price_changes_df.to_dict(orient='records'),
            "table9": top_items_df.to_dict(orient='records'),
            "table10": sales_by_category_tables_df.to_dict(orient='records'),
            "table11": category_comparison_table_df.to_dict(orient='records'),
            "table12": top_vs_bottom_comparison_df.to_dict(orient='records'),
            "table13": sales_by_category_by_day_table_df.to_dict(orient='records'),
            "locations": locations,
            "servers": server,
            "categories": category,
            "dateRanges": [],
            "fileName": file_name,
            "dashboardName": "Product Mix ",
            "data":  "Dashboard is not yet implemented."
            }
 
            
            # return result
        

            # # print("i am here in excel upload printing start_date", start_date)

           
            # Process Excel file with optional filters
            (sales_by_day_table, 
             sales_by_category_table, 
             category_comparison_table, 
             thirteen_week_category_table, 
             pivot_table, 
             in_house_table,
             week_over_week_table, 
             category_summary_table, 
             salesByWeek, 
             salesByDayOfWeek, 
             salesByTimeOfDay, 
             categories, 
             locations) = process_sales_split_file(
                excel_data, 
                start_date=start_date,
                end_date=end_date,
                location=location_filter
            )
            
            
            # response accepted from the FE
               # For now, return empty data for unsupported dashboards
            # sales_split_dashboard = {
            #     "table1": pivot_table.to_dict(orient='records'),
            #     "table2": in_house_table.to_dict(orient='records'),
            #     "table3": week_over_week_table.to_dict(orient='records'),
            #     "table4": category_summary_table.to_dict(orient='records'),
            #     "table5": salesByWeek.to_dict(orient='records'),
            #     "table6": salesByDayOfWeek.to_dict(orient='records'),
            #     "table7": salesByTimeOfDay.to_dict(orient='records'),
            #     "locations": locations,
            #     "categories": categories,
            #     "dashboardName": "Sales Split",
            #     "fileName": file_name,
            #     "data": f"{request.dashboard} Dashboard is not yet implemented."
            # }
              # For now, return empty data for unsupported dashboards
            sales_split_dashboard = {
                "table1": pivot_table.to_dict(orient='records'),
                "table2": in_house_table.to_dict(orient='records'),
                "table3": week_over_week_table.to_dict(orient='records'),
                "table4": category_summary_table.to_dict(orient='records'),
                "table5": salesByWeek.to_dict(orient='records'),
                "table6": salesByDayOfWeek.to_dict(orient='records'),
                "table7": salesByTimeOfDay.to_dict(orient='records'),
                "table8": sales_by_day_table.to_dict(orient='records'),
                "table9": sales_by_category_table.to_dict(orient='records'),
                "table10": category_comparison_table.to_dict(orient='records'),
                "table11": thirteen_week_category_table.to_dict(orient='records'),
                "locations": locations,
                "categories": categories,
                "dashboardName": "Sales Split",
                "fileName": file_name,
                "data": f"{request.dashboard} Dashboard is not yet implemented."
            }
                       
            if request.dashboard == "Sales Split and Product Mix":
                print ("sales_split_dashboard, pmix_dashboard")
                return [sales_split_dashboard, pmix_dashboard]

            if request.dashboard == "Sales Split":
                print("i am here in sales split result", sales_split_dashboard)

                return [sales_split_dashboard]
                
            if request.dashboard == "Product Mix":
                print("i am here in product mix result", pmix_dashboard)
                return [pmix_dashboard]
            
            # return {
            #     "table1": [],
            #     "table2": [],
            #     "table3": [],
            #     "table4": [],
            #     "table5": [],
            #     "table6": [],
            #     "table7": [],
            #     "table8": [],
            #     "table9": [],
            #     "locations": ["test"],
            #     "dateRanges": ["test"],
            #     "fileLocation":["test"],
            #     "dashboardName": request.dashboard,
            #     "fileName": request.fileName,
            #     "data":  f"{request.dashboard} Dashboard is not yet implemented."
            # }
            
            # return result
    
    
    except Exception as e:
        # Log the full exception for debugging
        error_message = str(e)
        # print(f"Error processing file: {error_message}")
        print(traceback.format_exc())
        
            # Check for specific known error patterns
        if "Net Price" in error_message:
            raise HTTPException(
                status_code=400,
                detail=f"You uploaded the file in the wrong dashboard i.e. ({request.dashboard}) or the file is not properly structured. Please check the help center for more details."
            )

        # Raise HTTP exception
        raise HTTPException(status_code=500, detail=f"Error processing file: {error_message}")

