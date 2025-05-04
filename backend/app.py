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
        
        # Process Excel file
        return process_excel_file(excel_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


def process_excel_file(file_data: io.BytesIO) -> Dict[str, List[Dict[str, Any]]]:
    """
    Process the Excel file and extract data for tables.
    """
    try:
        # Read Excel file
        df = pd.read_excel(file_data)
        df = df.fillna('')
        
        # Initialize result structure
        result = {
            "table1": [],  # Raw data (first 100 rows)
            "table2": [],  # Summary statistics 
            "table3": [],  # Column info
            "table4": [],  # Transposed preview
            "table5": [],  # Value counts
        }
        
        # Table 1: First 100 rows of data
        result["table1"] = df.head(100).to_dict('records')
        
        # Table 2: Summary statistics for numeric columns
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            stats_df = df[numeric_cols].describe().reset_index()
            stats_df = stats_df.rename(columns={'index': 'Statistic'})
            result["table2"] = stats_df.to_dict('records')
        
        # Table 3: Column information
        info_df = pd.DataFrame({
            'Column': df.columns,
            'Data Type': df.dtypes.astype(str),
            'Non-Null Count': df.count().values,
            'Non-Null Percentage': (df.count() / len(df) * 100).round(2).values,
        })
        result["table3"] = info_df.to_dict('records')
        
        # Table 4: Transposed first 5 rows (data preview)
        if len(df) >= 5:
            transposed_df = df.head(5).T.reset_index()
            transposed_df.columns = ['Column'] + [f'Row {i+1}' for i in range(5)]
            result["table4"] = transposed_df.to_dict('records')
        
        # Table 5: Value counts for categorical columns
        categorical_cols = df.select_dtypes(include=['object']).columns
        unique_values = []
        
        for col in categorical_cols[:5]:  # First 5 categorical columns
            value_counts = df[col].value_counts().head(10)  # Top 10 values
            for val, count in value_counts.items():
                unique_values.append({
                    'Column': col,
                    'Value': str(val)[:50],
                    'Count': int(count),
                    'Percentage': round(count / len(df) * 100, 2),
                })
        
        result["table5"] = unique_values
        
        return result
        
    except Exception as e:
        print(f"Error processing Excel file: {str(e)}")
        return {
            "table1": [],
            "table2": [],
            "table3": [],
            "table4": [],
            "table5": [],
        }


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)