import os
import pandas as pd
from datetime import datetime, date
import calendar

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




def _to_date(d):
    if d is None:
        return None
    if isinstance(d, str):
        return datetime.strptime(d, "%Y-%m-%d").date()
    if isinstance(d, pd.Timestamp):
        return d.date()
    return d  # assume date or datetime.date

def days_between(start_date, end_date, inclusive=False):
    """Return the number of days between two dates.
    If inclusive is True, counts both endpoints."""
    sd = _to_date(start_date)
    ed = _to_date(end_date)
    if sd is None or ed is None:
        return None
    diff = (ed - sd).days
    return diff + 1 if inclusive else diff



def _whole_calendar_months(sd, ed):
    """
    Return the number of whole calendar months between sd and ed
    if the range covers full months, else 0.
    Requirement: sd is the first of a month and ed is the last day of the final month.
    """
    sd = _to_date(sd)
    ed = _to_date(ed)
    if sd is None or ed is None:
        return 0
    if sd.day != 1:
        return 0

    # Walk month by month from sd to ed
    count = 0
    cur = date(sd.year, sd.month, 1)
    while True:
        last_day = calendar.monthrange(cur.year, cur.month)[1]
        block_end = date(cur.year, cur.month, last_day)
        if ed < block_end:
            return 0
        count += 1
        if ed == block_end:
            return count
        # move to the first of next month
        if cur.month == 12:
            cur = date(cur.year + 1, 1, 1)
        else:
            cur = date(cur.year, cur.month + 1, 1)

def period_label_from_diff(diff_days, start_date=None, end_date=None):
    """
    diff_days is exclusive. The function adds 1 to get inclusive days.
    Detects year, whole calendar months (1, 2, 3, ...), weeks, 30 or 31 days, then falls back to N Day(s).
    """
    n_days = diff_days + 1
    sd = _to_date(start_date)
    ed = _to_date(end_date)

    # Year mapping first
    if n_days in (365, 366):
        return "1 Year(s) Sales"

    # Whole calendar months next
    m_count = _whole_calendar_months(sd, ed)
    if m_count >= 1:
        if m_count == 1:
            return "1 Month(s) Sales"
        return f"{m_count} Month(s) Sales"

    # Weeks mapping
    if n_days % 7 == 0:
        weeks = n_days // 7
        if weeks == 1:
            return "1 Week(s) Sales"
        if weeks == 13:
            return "13 Week(s) Sales"
        return f"{weeks} Week(s) Sales"

    # 30 or 31 day special cases
    if n_days in (30, 31):
        return f"{n_days} Day(s) Sales"

    # Default day-based labels
    if n_days == 1:
        return "1 Day(s) Sales"
    return f"{n_days} Day(s) Sales"


# Apply +/ and -/ formatting
def _format_percent_change(val):
    try:
        if val > 100:
            return "+/"
        if val < -100:
            return "-/"
    except TypeError:
        pass
    return val


