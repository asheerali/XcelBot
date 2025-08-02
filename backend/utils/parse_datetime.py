from typing import Optional
from datetime import datetime
import re

def parse_datetime_from_filename(filename: str) -> Optional[str]:
    """
    Extracts and formats datetime from the filename.
    Format: "MM-DD-YYYY - hh:mm AM/PM"
    """
    try:
        parts = filename.split("_")
        date_part = parts[0]  # e.g., 20250725
        time_part = parts[1]  # e.g., 013228
        dt = datetime.strptime(date_part + time_part, "%Y%m%d%H%M%S")
        return dt
        # return dt.strftime("%m-%d-%Y - %I:%M %p")
    except Exception:
        return None
    

def extract_clean_filename(full_filename: str) -> str:
    """Extract the meaningful filename part, removing timestamp prefix"""
    # Pattern to match timestamp prefix like "20250725_013228_"
    timestamp_pattern = r'^\d{8}_\d{6}_'
    
    # Remove timestamp prefix if it exists
    clean_name = re.sub(timestamp_pattern, '', full_filename)
    
    return clean_name




