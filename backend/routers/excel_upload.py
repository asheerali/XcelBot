from fastapi import APIRouter, Depends, HTTPException
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import base64
import io
import os
from datetime import datetime, timedelta
import traceback


# Import from local modules
from models import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file
from companywide_dashboard.companywide_processor import process_companywide_file
from pmix_dashboard.pmix_processor import process_pmix_file


router = APIRouter(
    prefix="/api",
    tags=["excel_upload"],
)

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/excel/upload", response_model=ExcelUploadResponse)
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
            
        if request.dashboard in ["Financials", "Companywide"]:
            print("Dashboard type: ", request.dashboard)
            # print("i am here 4")
            excel_data_copy = io.BytesIO(file_content)

            financials_weeks, financials_years, financials_stores, financials_sales_table, financials_orders_table, financials_avg_ticket_table, financials_tw_lw_bdg_table = process_financials_file(
                excel_data_copy, 
                location=request.location
            )
            
            sales_df, order_df, avg_ticket_df, cogs_df, reg_pay_df, lb_hrs_df, spmh_df = process_companywide_file(
                excel_data_copy, 
                store_filter='All', 
                year_filter=None, 
                quarter_filter='All', 
                helper4_filter='All'
            )
            
            
            result = {
            "table1": [{"financials_weeks": [financials_weeks], "financials_years": [financials_years], "financials_stores": [financials_stores]}],
            "table2": financials_sales_table.to_dict(orient='records'),
            "table3": financials_orders_table.to_dict(orient='records'),
            "table4": financials_avg_ticket_table.to_dict(orient='records'),
            "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
            "table6": [],
            "table7": [],
            "locations": ["test"],
            "dateRanges": ["test"],
            "fileLocation":["test"],
            "fileName": "123", #the full names of the file saved in the uploads folder
            "dashboardName": "Financials",
            "data":  "Financial Dashboard is not yet implemented."
            },
            {
                "table1":sales_df.to_dict(orient='records'),
                "table2":order_df.to_dict(orient='records'),
                "table3":avg_ticket_df.to_dict(orient='records'),
                "table4":cogs_df.to_dict(orient='records'),
                "table5":reg_pay_df.to_dict(orient='records'),
                "table6":lb_hrs_df.to_dict(orient='records'),
                "table7":spmh_df.to_dict(orient='records'),
                "locations": ["test"],
                "dateRanges": ["test"],
                "fileLocation":["test"],
                "dashboardName": "Companywide",
                "fileName": "123", #the full names of the file saved in the uploads folder
                "data":  "Companywide Dashboard is not yet implemented."
            }
        #        result = {
        #     "table1": [{"financials_weeks": [financials_weeks], "financials_years": [financials_years], "financials_stores": [financials_stores]}],
        #     "table2": financials_sales_table.to_dict(orient='records'),
        #     "table3": financials_orders_table.to_dict(orient='records'),
        #     "table4": financials_avg_ticket_table.to_dict(orient='records'),
        #     "table5": financials_tw_lw_bdg_table.to_dict(orient='records'),
        #     "locations": [financials_stores],
        #     "default_location": "xyz",
        #     "locations_range": [financials_stores],
        #     "dateRanges": ["test"],
        #     "fileLocation":["test"],
        #     "fileName": request.fileName,
        #     "dashboardName": "Financials",
        #     "data":  "Financial Dashboard is not yet implemented."
            
        # }
            # print("result", result )
            
            return result
            # return {"message": "Financial Dashboard is not yet implemented."}
        
        if request.dashboard == ["Sales Split", "Product Mix"]:
            print("Dashboard type: Sales Split Dashboard")
            
            excel_data_copy = io.BytesIO(file_content)

            net_sales, orders, qty_sold, sales_by_category_df, sales_by_menu_group_df, sales_by_server_df, top_selling_items_df, sales_by_location_df, average_price_by_item_df, average_order_value, average_items_per_order, price_changes_df, top_items_df, unique_orders, total_quantity = process_pmix_file(excel_data_copy)


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
            
            # Return the properly structured response
            result_final = ExcelUploadResponse(**result)            # Return the properly structured response
      
            
               # # For now, return empty data for unsupported dashboards
            # result = {
            #     "table1": [sales_by_week_table],
            #     "table2": [sale_by_day_of_week_table],
            #     "table3": [sales_by_time_Of_day_table],
            #     "table4": [percentage_table],
            #     "table5": [Inhouse_table],
            #     "table6": [Week_over_Week_table],
            #     "table7": [category_summary_table],
            #     "table8": [1p_3p_table],
            #     "locations": [request.location] if request.location else [],
            #     "dateRanges": [],
            #     "fileLocation": request.location,
            #     "dashboardName": request.dashboard,
            #     "data": f"{request.dashboard} Dashboard is not yet implemented."
            # }      
            # result_final = ExcelUploadResponse(**result), {
            # "table1": [{"net_sales": [net_sales], "orders": [orders], 
            #             "qty_sold": [qty_sold],"average_order_value": [average_order_value], 
            #             "average_items_per_order": [average_items_per_order], "unique_orders": [unique_orders], 
            #             "total_quantity": [total_quantity]}],
            # "table2": sales_by_category_df.to_dict(orient='records'),
            # "table3": sales_by_menu_group_df.to_dict(orient='records'),
            # "table4": sales_by_server_df.to_dict(orient='records'),
            # "table5": top_selling_items_df.to_dict(orient='records'),
            # "table6": sales_by_location_df.to_dict(orient='records'),
            # "table7": average_price_by_item_df.to_dict(orient='records'),
            # "table8": price_changes_df.to_dict(orient='records'),
            # "table9": top_items_df.to_dict(orient='records'),
            # "locations": result['locations'],
            # "dateRanges": result['dateRanges'],
            # "fileLocation": result['fileLocation'],
            # "fileName": request.fileName,
            # "dashboardName": "Product Mix ",
            # "data":  "Dashboard is not yet implemented."
            # }
            
            
            print("result", result_final )
            return result_final
            
            
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

