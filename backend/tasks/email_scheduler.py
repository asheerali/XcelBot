# from apscheduler.schedulers.background import BackgroundScheduler
# from sqlalchemy.orm import Session
# from datetime import datetime
# import atexit
# import logging
# from database import SessionLocal
# from crud.mails import get_mails_by_time
# from utils.email import send_actual_email

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Global scheduler instance
# scheduler = None

# def check_and_send_scheduled_emails():
#     """Check for scheduled emails and send them"""
#     db: Session = SessionLocal()
#     try:
#         now = datetime.now().time().replace(second=0, microsecond=0)
#         logger.info(f"Checking for scheduled emails at {now}")
        
#         scheduled_mails = get_mails_by_time(db, receiving_time=now)
        
#         if not scheduled_mails:
#             logger.info(f"No scheduled emails found for {now}")
#             return
            
#         logger.info(f"Found {len(scheduled_mails)} scheduled emails")
        
#         for mail in scheduled_mails:
#             try:
#                 send_actual_email(
#                     to=mail.receiver_email,
#                     name=mail.receiver_name
#                 )
#                 logger.info(f"Successfully sent scheduled email to {mail.receiver_email} at {now}")
                
#                 # Optional: Mark email as sent in database
#                 # mail.status = "sent"
#                 # mail.sent_at = datetime.now()
#                 # db.commit()
                
#             except Exception as email_error:
#                 logger.error(f"Failed to send email to {mail.receiver_email}: {email_error}")
#                 # Optional: Mark email as failed
#                 # mail.status = "failed"
#                 # db.commit()

#     except Exception as e:
#         logger.error(f"Error in scheduled email sender: {e}")
#         db.rollback()
#     finally:
#         db.close()


# def start_scheduler():
#     """Start the email scheduler"""
#     global scheduler
    
#     if scheduler is not None:
#         logger.warning("Scheduler already exists. Shutting down existing scheduler.")
#         scheduler.shutdown()
    
#     try:
#         scheduler = BackgroundScheduler()
        
#         # Add job to run every minute
#         scheduler.add_job(
#             check_and_send_scheduled_emails, 
#             'cron', 
#             minute='*',
#             id='email_scheduler_job',
#             replace_existing=True
#         )
        
#         scheduler.start()
#         logger.info("Email scheduler started successfully")
        
#         # Register shutdown handler
#         atexit.register(lambda: scheduler.shutdown())
        
#     except Exception as e:
#         logger.error(f"Failed to start scheduler: {e}")
#         raise


# def stop_scheduler():
#     """Stop the email scheduler"""
#     global scheduler
#     if scheduler is not None:
#         scheduler.shutdown()
#         scheduler = None
#         logger.info("Email scheduler stopped")


# def get_scheduler_status():
#     """Get current scheduler status"""
#     global scheduler
#     if scheduler is None:
#         return {"status": "not_started", "running": False}
    
#     return {
#         "status": "running" if scheduler.running else "stopped",
#         "running": scheduler.running,
#         "jobs": len(scheduler.get_jobs())
#     }


from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime, time
import atexit
import logging
import pytz
from database import SessionLocal
from crud.mails import get_mails_by_time
from utils.email import send_actual_email

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define your application timezone
APP_TIMEZONE = pytz.timezone('America/New_York')  # EST/EDT
# Alternative options:
# APP_TIMEZONE = pytz.timezone('US/Eastern')
# APP_TIMEZONE = pytz.timezone('America/Detroit')

# Global scheduler instance
scheduler = None

def check_and_send_scheduled_emails():
    """Check for scheduled emails and send them - in EST timezone"""
    db: Session = SessionLocal()
    try:
        # Get current time in EST timezone
        est_timezone = pytz.timezone('America/New_York')
        now_est = datetime.now(est_timezone)
        now_time = now_est.time().replace(second=0, microsecond=0)
        
        logger.info(f"Checking for scheduled emails at {now_time} EST")
        
        scheduled_mails = get_mails_by_time(db, receiving_time=now_time)
        
        if not scheduled_mails:
            logger.info(f"No scheduled emails found for {now_time} EST")
            return
            
        logger.info(f"Found {len(scheduled_mails)} scheduled emails for {now_time} EST")
        
        for mail in scheduled_mails:
            try:
                send_actual_email(
                    to=mail.receiver_email,
                    name=mail.receiver_name,
                    company_id=mail.company_id
                )
                logger.info(f"Successfully sent scheduled email to {mail.receiver_email} at {now_time} EST")
                
                # Optional: Mark email as sent in database
                # mail.status = "sent"
                # mail.sent_at = datetime.now(APP_TIMEZONE)
                # db.commit()
                
            except Exception as email_error:
                logger.error(f"Failed to send email to {mail.receiver_email}: {email_error}")
                # Optional: Mark email as failed
                # mail.status = "failed"
                # db.commit()

    except Exception as e:
        logger.error(f"Error in scheduled email sender: {e}")
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the email scheduler in EST timezone"""
    global scheduler
    
    if scheduler is not None:
        logger.warning("Scheduler already exists. Shutting down existing scheduler.")
        scheduler.shutdown()
    
    try:
        # Configure scheduler to run in EST timezone
        est_timezone = pytz.timezone('America/New_York')
        scheduler = BackgroundScheduler(timezone=est_timezone)
        
        # Add job to run every minute in EST timezone
        scheduler.add_job(
            check_and_send_scheduled_emails, 
            'cron', 
            minute='*',
            id='email_scheduler_job',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Email scheduler started successfully in EST timezone")
        
        # Log the next few scheduled runs for verification
        job = scheduler.get_job('email_scheduler_job')
        if job:
            next_run = job.next_run_time
            logger.info(f"Next run scheduled for: {next_run.strftime('%Y-%m-%d %H:%M:%S %Z')}")
        
        # Register shutdown handler
        atexit.register(lambda: scheduler.shutdown())
        
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
        raise


def stop_scheduler():
    """Stop the email scheduler"""
    global scheduler
    if scheduler is not None:
        scheduler.shutdown()
        scheduler = None
        logger.info("Email scheduler stopped")


def get_scheduler_status():
    """Get current scheduler status with timezone info"""
    global scheduler
    if scheduler is None:
        return {"status": "not_started", "running": False}
    
    status = {
        "status": "running" if scheduler.running else "stopped",
        "running": scheduler.running,
        "jobs": len(scheduler.get_jobs()),
        "timezone": str(APP_TIMEZONE),
        "current_time_utc": datetime.utcnow().isoformat(),
        "current_time_local": datetime.now(APP_TIMEZONE).isoformat()
    }
    
    # Add next run time if job exists
    job = scheduler.get_job('email_scheduler_job')
    if job and job.next_run_time:
        status["next_run"] = job.next_run_time.isoformat()
    
    return status


# Utility function to convert time strings to your timezone
def convert_time_to_app_timezone(time_str: str, from_timezone_str: str = 'UTC'):
    """
    Convert a time string from one timezone to your app timezone
    Useful for debugging timezone issues
    """
    from_tz = pytz.timezone(from_timezone_str)
    
    # Parse time assuming it's today
    today = datetime.now().date()
    dt = datetime.combine(today, datetime.strptime(time_str, '%H:%M:%S').time())
    
    # Localize to source timezone and convert to app timezone
    dt_localized = from_tz.localize(dt)
    dt_app_tz = dt_localized.astimezone(APP_TIMEZONE)
    
    return dt_app_tz.time()