import os

def get_file_type(file_name: str) -> str:
    """
    Determines the type of the uploaded file based on its extension.
    
    Args:
        file_name (str): Name of the file (with extension).
        
    Returns:
        str: "excel", "csv", or raises ValueError if unsupported.
    """
    _, file_extension = os.path.splitext(file_name.lower())
    excel_ext = [".xls", ".xlsx"]
    csv_ext = [".csv"]

    if file_extension in excel_ext:
        return "excel"
    elif file_extension in csv_ext:
        return "csv"
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")
