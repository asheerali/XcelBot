from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime
import atexit
import logging
from database import SessionLocal
from crud.mails import get_mails_by_time
from utils.email import send_actual_email

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None

def check_and_send_scheduled_emails():
    """Check for scheduled emails and send them"""
    db: Session = SessionLocal()
    try:
        now = datetime.now().time().replace(second=0, microsecond=0)
        logger.info(f"Checking for scheduled emails at {now}")
        
        scheduled_mails = get_mails_by_time(db, receiving_time=now)
        
        if not scheduled_mails:
            logger.info(f"No scheduled emails found for {now}")
            return
            
        logger.info(f"Found {len(scheduled_mails)} scheduled emails")
        
        for mail in scheduled_mails:
            try:
                send_actual_email(
                    to=mail.receiver_email,
                    name=mail.receiver_name
                )
                logger.info(f"Successfully sent scheduled email to {mail.receiver_email} at {now}")
                
                # Optional: Mark email as sent in database
                # mail.status = "sent"
                # mail.sent_at = datetime.now()
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
    """Start the email scheduler"""
    global scheduler
    
    if scheduler is not None:
        logger.warning("Scheduler already exists. Shutting down existing scheduler.")
        scheduler.shutdown()
    
    try:
        scheduler = BackgroundScheduler()
        
        # Add job to run every minute
        scheduler.add_job(
            check_and_send_scheduled_emails, 
            'cron', 
            minute='*',
            id='email_scheduler_job',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("Email scheduler started successfully")
        
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
    """Get current scheduler status"""
    global scheduler
    if scheduler is None:
        return {"status": "not_started", "running": False}
    
    return {
        "status": "running" if scheduler.running else "stopped",
        "running": scheduler.running,
        "jobs": len(scheduler.get_jobs())
    }