from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import base64
import io
import os
from datetime import datetime
from typing import Dict, List, Any

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save uploaded files
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic models
class ExcelUploadRequest(BaseModel):
    fileName: str
    fileContent: str  # base64 encoded file content


class ExcelUploadResponse(BaseModel):
    table1: List[Dict[str, Any]]
    table2: List[Dict[str, Any]]
    table3: List[Dict[str, Any]]
    table4: List[Dict[str, Any]]
    table5: List[Dict[str, Any]]


@app.post("/api/excel/upload", response_model=ExcelUploadResponse)
async def upload_excel(request: ExcelUploadRequest = Body(...)):
    """
    Endpoint to upload and process an Excel file.
    """
    try:
        # Decode base64 file content
        file_content = base64.b64decode(request.fileContent)
        
        # Create BytesIO object for pandas
        excel_data = io.BytesIO(file_content)
        
        # Save file to disk with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{request.fileName}")
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        print('inside upload_excel')
        # Process Excel file
        return process_excel_file(excel_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
def process_excel_file(file_data: io.BytesIO) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process the uploaded Excel file and transform the data.
    Returns dictionary with tables to be used in the frontend.
    """
    # Read the Excel file
    df = pd.read_excel(file_data)
    
    # Reset the file pointer for further operations
    file_data.seek(0)
    
    # Data cleaning and preparation
    # Convert date columns to proper datetime format
    df['Sent Date'] = pd.to_datetime(df['Sent Date'])
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Extract day of week, week number, month, quarter and year
    df['Day'] = df['Sent Date'].dt.strftime('%a')  # Mon, Tue, etc.
    df['Week'] = df['Sent Date'].dt.isocalendar().week
    df['Month'] = df['Sent Date'].dt.strftime('%b')  # Dec, Jan, etc.
    df['Quarter'] = df['Sent Date'].dt.quarter
    df['Year'] = df['Sent Date'].dt.year
    
    # Create helper columns as shown in the image
    df['Helper 1'] = df['Day'].apply(lambda x: f"1 - {x}day")
    
    # Create date range format for Helper 2 and Helper 4
    # Format appears to be "12/30/2024 - 01/05/2025"
    start_date = df['Date'].min().strftime('%m/%d/%Y')
    end_date = (df['Date'].min() + pd.Timedelta(days=6)).strftime('%m/%d/%Y')
    date_range = f"{start_date} - {end_date}"
    
    df['Helper 2'] = date_range
    
    # Update Helper 3 column to include the pipe separator: "2024|1"
    df['Helper 3'] = df['Year'].astype(str) + " | " + df['Quarter'].astype(str)
    
    # Helper 4 with the week number and date range
    df['Helper 4'] = df['Week'].astype(str) + " | " + date_range
    
    # Create Category column based on Dining Option
    df['Category'] = df['Dining Option'].apply(
        lambda x: 'Catering' if 'Cater' in x else 'In-House'
    )
    
    # Print the total number of rows in the DataFrame
    print(f"\nTotal number of rows: {len(df)}")
    
    # Print the first 20 rows of the processed DataFrame to terminal
    print("\nFirst 20 rows of processed DataFrame:")
    pd.set_option('display.max_columns', None)  # Show all columns
    pd.set_option('display.width', 1000)  # Set width to avoid wrapping
    print(df[['Day', 'Week', 'Month', 'Quarter', 'Year', 'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4', 'Category']].head(20))
    
    # Save the processed DataFrame to a new Excel file
    output_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(UPLOAD_DIR, f"processed_{output_timestamp}.xlsx")
    df.to_excel(output_path, index=False)
    print(f"\nProcessed file saved to: {output_path}")
    
    # Create the expected output format
    # Limit to returning only the first 20 rows for table1 to avoid performance issues
    result = {
        "table1": df.head(20).to_dict(orient='records'),
        "table2": [],  # Empty tables as per instructions
        "table3": [],
        "table4": [],
        "table5": []
    }
    
    return result
    """
    Process the uploaded Excel file and transform the data.
    Returns dictionary with tables to be used in the frontend.
    """
    # Read the Excel file
    df = pd.read_excel(file_data)
    
    # Reset the file pointer for further operations
    file_data.seek(0)
    
    # Data cleaning and preparation
    # Convert date columns to proper datetime format
    df['Sent Date'] = pd.to_datetime(df['Sent Date'])
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Extract day of week, week number, month, quarter and year
    df['Day'] = df['Sent Date'].dt.strftime('%a')  # Mon, Tue, etc.
    df['Week'] = df['Sent Date'].dt.isocalendar().week
    df['Month'] = df['Sent Date'].dt.strftime('%b')  # Dec, Jan, etc.
    df['Quarter'] = df['Sent Date'].dt.quarter
    df['Year'] = df['Sent Date'].dt.year
    
    # Create helper columns as shown in the image
    df['Helper 1'] = df['Day'].apply(lambda x: f"1 - {x}day")
    
    # Create date range format for Helper 2 and Helper 4
    # Format appears to be "12/30/2024 - 01/05/2025"
    start_date = df['Date'].min().strftime('%m/%d/%Y')
    end_date = (df['Date'].min() + pd.Timedelta(days=6)).strftime('%m/%d/%Y')
    date_range = f"{start_date} - {end_date}"
    
    df['Helper 2'] = date_range
    
    # Update Helper 3 column to include the pipe separator: "2024|1"
    df['Helper 3'] = df['Year'].astype(str) + " | " + df['Quarter'].astype(str)
    
    # Helper 4 with the week number and date range
    df['Helper 4'] = df['Week'].astype(str) + " | " + date_range
    
    # Create Category column based on Dining Option
    df['Category'] = df['Dining Option'].apply(
        lambda x: 'Catering' if 'Cater' in x else 'In-House'
    )
    
    # Print the total number of rows in the DataFrame
    print(f"\nTotal number of rows: {len(df)}")
    
    # Print the first 20 rows of the processed DataFrame to terminal
    print("\nFirst 20 rows of processed DataFrame:")
    pd.set_option('display.max_columns', None)  # Show all columns
    pd.set_option('display.width', 1000)  # Set width to avoid wrapping
    print(df[['Day', 'Week', 'Month', 'Quarter', 'Year', 'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4', 'Category']].head(20))
    
    # Save the processed DataFrame to a new Excel file
    output_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(UPLOAD_DIR, f"processed_{output_timestamp}.xlsx")
    df.to_excel(output_path, index=False)
    print(f"\nProcessed file saved to: {output_path}")
    
    # Create the expected output format
    # Limit to returning only the first 20 rows for table1 to avoid performance issues
    result = {
        "table1": df.head(20).to_dict(orient='records'),
        "table2": [],  # Empty tables as per instructions
        "table3": [],
        "table4": [],
        "table5": []
    }
    
    return result# def process_excel_file(file_data: io.BytesIO) -> Dict[str, List[Dict[str, Any]]]:
#     """
#     Process the uploaded Excel file and transform the data.
#     Returns dictionary with tables to be used in the frontend.
#     """
#     # Read the Excel file
#     df = pd.read_excel(file_data)
    
#     # Reset the file pointer for further operations
#     file_data.seek(0)
    
#     # Data cleaning and preparation
#     # Convert date columns to proper datetime format
#     df['Sent Date'] = pd.to_datetime(df['Sent Date'])
#     df['Date'] = pd.to_datetime(df['Date'])
    
#     # Extract day of week, week number, month, quarter and year
#     df['Day'] = df['Sent Date'].dt.strftime('%a')  # Mon, Tue, etc.
#     df['Week'] = df['Sent Date'].dt.isocalendar().week
#     df['Month'] = df['Sent Date'].dt.strftime('%b')  # Dec, Jan, etc.
#     df['Quarter'] = df['Sent Date'].dt.quarter
#     df['Year'] = df['Sent Date'].dt.year
    
#     # Create helper columns as shown in the image
#     df['Helper 1'] = df['Day'].apply(lambda x: f"1 - {x}day")
    
#     # Create date range format for Helper 2 and Helper 4
#     # Format appears to be "12/30/2024 - 01/05/2025"
#     start_date = df['Date'].min().strftime('%m/%d/%Y')
#     end_date = (df['Date'].min() + pd.Timedelta(days=6)).strftime('%m/%d/%Y')
#     date_range = f"{start_date} - {end_date}"
    
#     df['Helper 2'] = date_range
#     df['Helper 3'] = df['Year'].astype(str) + df['Quarter'].astype(str)
#     df['Helper 4'] = df['Week'].astype(str) + " | " + date_range
    
#     # Create Category column based on Dining Option
#     df['Category'] = df['Dining Option'].apply(
#         lambda x: 'Catering' if 'Cater' in x else 'In-House'
#     )
    
#     # Print the processed DataFrame to terminal
#     print("\nProcessed DataFrame:")
#     print(df[['Day', 'Week', 'Month', 'Quarter', 'Year', 'Helper 1', 'Helper 2', 'Helper 3', 'Helper 4', 'Category']].head())
    
#     # Save the processed DataFrame to a new Excel file
#     output_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     output_path = os.path.join(UPLOAD_DIR, f"processed_{output_timestamp}.xlsx")
#     df.to_excel(output_path, index=False)
#     print(f"\nProcessed file saved to: {output_path}")
    
#     # Create the expected output format
#     result = {
#         "table1": df.to_dict(orient='records'),
#         "table2": [],  # Empty tables as per instructions
#         "table3": [],
#         "table4": [],
#         "table5": []
#     }
    
#     return result
# # Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)