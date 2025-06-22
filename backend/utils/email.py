from fastapi_mail import MessageSchema
from models.email_config import fm

async def send_account_email(email: str, username: str, password: str):
    subject = "Your Account Credentials"
    body = f"""
    Hello {username},

    Your account has been successfully created for KPI360.ai.

    Email: {email}
    Password: {password}

    Please log in and change your password as soon as possible.

    Regards,
    XcelBot Team
    """

    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=body,
        subtype="plain"
    )
    await fm.send_message(message)
