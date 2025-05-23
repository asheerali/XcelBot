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

# Import from local modules
from models import ExcelUploadRequest, ExcelFilterRequest, ExcelUploadResponse, SalesAnalyticsResponse
from excel_processor import process_excel_file
from utils import find_file_in_directory
from sales_analytics import generate_sales_analytics
from financials_dashboard.financials_processor import process_financials_file
from companywide_dashboard.companywide_processor import process_companywide_file
from pmix_dashboard.pmix_processor import process_pmix_file
from sales_split_dashboard.sales_split_prcoessor import process_sales_split_file


router = APIRouter(
    prefix="/api",
    tags=["excel_upload"],
)

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Upload endpoint
@router.post("/excel/upload", response_model=ExcelUploadResponse)
# @router.post("/excel/upload")
async def upload_excel(request: ExcelUploadRequest = Body(...)):
# async def upload_excel(request: Request):
    """
    Endpoint to upload and process an Excel file.
    Supports optional date range and location filtering.
    """
        
    # request = await request.json()

    print("i am here in excel upload printhign the request", request)	
    try:
        print(f"Received file upload: {request.fileName}")
        # Decode base64 file content
        # print("Type of file_content:", type(file_content))
        file_content = base64.b64decode(request.fileContent)
        print("Type of file_content:", type(file_content))
        # print("response", request)
        
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
            print("dashboard: ", request.dashboard) 
            
        # if request.dashboard == "Sales Split" or request.dashboard == "Product Mix":
        #     print("Dashboard type: Sales Split Dashboard")
        #     # Process the sales split file
        #     result = process_sales_split_file(excel_data, request.location, request.startDate, request.endDate)
        #     return ExcelUploadResponse(success=True, message="File processed successfully", data=result)

        # if request.dashboard in ["Financials", "Companywide", "Sales Wide"]:
        if request.dashboard == "Financials" or request.dashboard == "Sales Wide" or request.dashboard == "Companywide":

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
        
        if request.dashboard == "Sales Split" or request.dashboard == "Product Mix":
            print("Dashboard type: Sales Split / Product Mix Dashboard")
            
            excel_data_copy = io.BytesIO(file_content)

            location_filter = request.location if request.location else 'All'
            server_filter = request.server if request.server else 'All'
            # Set dynamic dates
            default_end_date1 = date.today()
            default_end_date = default_end_date1.strftime('%Y-%m-%d')
            default_start_date = (default_end_date1 - relativedelta(months=2)).strftime('%Y-%m-%d')                                                                                                                                                                                                                                                                                                            

            default_start_date = "2025-01-01"
            default_end_date = "2025-05-31"

            start_date = request.startDate
            end_date = request.endDate
            start_date = start_date if start_date else default_start_date
            end_date = end_date if end_date else default_end_date
            
            net_sales, orders, qty_sold, sales_by_category_df, sales_by_menu_group_df, sales_by_server_df, top_selling_items_df, sales_by_location_df, average_price_by_item_df, average_order_value, average_items_per_order, price_changes_df, top_items_df, unique_orders, total_quantity, locations, server, category = process_pmix_file(excel_data_copy, 
                                                                                                                                                                                                                                                                                                                start_date=None, 
                                                                                                                                                                                                                                                                                                                end_date=None,
                                                                                                                                                                                                                                                                                                                category_filter='All',
                                                                                                                                                                                                                                                                                                                location_filter=location_filter, 
                                                                                                                                                                                                                                                                                                                server_filter=server_filter)

            print("i am here in excel upload printing before the result" )
            result = {
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
                            "total_quantity": [int(total_quantity)]
                        }],
            "table2": sales_by_category_df.to_dict(orient='records'),
            "table3": sales_by_menu_group_df.to_dict(orient='records'),
            "table4": sales_by_server_df.to_dict(orient='records'),
            "table5": top_selling_items_df.to_dict(orient='records'),
            "table6": sales_by_location_df.to_dict(orient='records'),
            "table7": average_price_by_item_df.to_dict(orient='records'),
            "table8": price_changes_df.to_dict(orient='records'),
            "table9": top_items_df.to_dict(orient='records'),
            "locations": [],
            "servers": [],
            "categories": [],
            "dateRanges": [],
            "fileLocation": ['fileLocation', 'fileLocationa'],
            "fileName": request.fileName,
            "dashboardName": "Product Mix ",
            "data":  "Dashboard is not yet implemented."
            }
            print("i am here in excel upload printing  the result", result)
            
            
            return result
        

            # # print("i am here in excel upload printing start_date", start_date)

            # # Process Excel file with optional filters
            # pivot_table, in_house_table, week_over_week_table, category_summary_table, salesByWeek, salesByDayOfWeek, salesByTimeOfDay = process_sales_split_file(
            #     excel_data, 
            #     start_date=start_date,
            #     end_date=end_date,
            #     location="All"
            # )
            
            
            # # response accepted from the FE
            #    # For now, return empty data for unsupported dashboards
            # result = {
            #     "table1": pivot_table.to_dict(orient='records'),
            #     "table2": in_house_table.to_dict(orient='records'),
            #     "table3": week_over_week_table.to_dict(orient='records'),
            #     "table4": category_summary_table.to_dict(orient='records'),
            #     "table5": salesByWeek.to_dict(orient='records'),
            #     "table6": salesByDayOfWeek.to_dict(orient='records'),
            #     "table7": salesByTimeOfDay.to_dict(orient='records'),
            #     "table8": [],
            #     "table9": [],
            #     "locations": [request.location] if request.location else [],
            #     "dateRanges": [],
            #     "fileLocation": [request.location] if request.location else [],
            #     "dashboardName": request.dashboard,
            #     "fileName": request.fileName,
            #     "data": f"{request.dashboard} Dashboard is not yet implemented."
            # }    
            # # print("result (i am here1)", result )
            # # result_final = ExcelUploadResponse(**result)
            # result_final = result
            # print("result (i am here2)", result_final )
            # return result_final
        
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
            
            # print("result", result_final )
            # return result_final
            
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

