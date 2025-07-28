from typing import Optional
from datetime import datetime


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
        return dt.strftime("%m-%d-%Y - %I:%M %p")
    except Exception:
        return None
    
