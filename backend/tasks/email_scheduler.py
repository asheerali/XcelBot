from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
from crud.mails import get_mails_by_time
from utils.email import send_actual_email  # This should contain real sending logic

def check_and_send_scheduled_emails():
    db: Session = SessionLocal()
    try:
        now = datetime.now().time().replace(second=0, microsecond=0)
        scheduled_mails = get_mails_by_time(db, receiving_time=now)
        
        for mail in scheduled_mails:
            send_actual_email(
                to=mail.receiver_email,
                name=mail.receiver_name
            )
            print(f"Sent scheduled email to {mail.receiver_email} at {now}")

    except Exception as e:
        print("Error in scheduled email sender:", e)
    finally:
        db.close()


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_send_scheduled_emails, 'cron', minute='*')  # runs every minute
    scheduler.start()
