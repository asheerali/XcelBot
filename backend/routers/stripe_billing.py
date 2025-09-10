# import datetime
# import stripe
# from fastapi import APIRouter, HTTPException, Request, Depends
# from fastapi.responses import JSONResponse
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.orm import Session
# from models import users, payments, subscriptions  # Use plural 'payments' and 'subscriptions'
# from database import get_db
# import os  # To access environment variables
# import json

# # Initialize Stripe API key from environment variables
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")  # Fetch the Stripe secret key from the environment variable
# WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")  # Fetch the webhook secret from the environment variable

# router = APIRouter(prefix="/billing/webhook", tags=["billing"])

# # Webhook endpoint to listen to Stripe events
# @router.post("/")
# async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
#     payload = await request.body()
#     sig_header = request.headers.get("stripe-signature")
    
#     # Verify the Stripe signature to ensure the request is legitimate
#     try:
#         event = stripe.Webhook.construct_event(
#             payload=payload,
#             sig_header=sig_header,
#             secret=WEBHOOK_SECRET
#         )
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
#     except stripe.error.SignatureVerificationError as e:
#         raise HTTPException(status_code=400, detail=f"Signature verification failed: {str(e)}")

#     # Handle the event
#     event_type = event["type"]
#     try:
#         if event_type == "invoice.payment_succeeded":
#             await handle_payment_success(event, db)
#         elif event_type == "customer.subscription.created":
#             await handle_subscription_created(event, db)
#         elif event_type == "customer.subscription.updated":
#             await handle_subscription_updated(event, db)
#         elif event_type == "customer.subscription.deleted":
#             await handle_subscription_deleted(event, db)
#         else:
#             return JSONResponse({"message": f"Event {event_type} not handled"}, status_code=200)
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Error handling {event_type}: {str(e)}")

#     return JSONResponse({"received": True}, status_code=200)

# async def handle_payment_success(event, db: AsyncSession):
#     # Payment intent succeeded, create a payment record
#     payment_intent = event["data"]["object"]
#     user_id = payment_intent["metadata"].get("user_id")
    
#     # Look up the user in your database
#     user = await db.execute(select(users).where(users.id == user_id))
#     user = user.scalar_one_or_none()
#     if user:
#         payment = payments(  # Use plural 'payments'
#             user_id=user.id,
#             stripe_payment_intent_id=payment_intent["id"],
#             amount=payment_intent["amount_received"],
#             currency=payment_intent["currency"],
#             status="succeeded",
#         )
#         db.add(payment)
#         await db.commit()

# async def handle_subscription_created(event, db: AsyncSession):
#     # Subscription created, link to user and store in database
#     subscription = event["data"]["object"]
#     customer_id = subscription["customer"]
#     user = await db.execute(select(users).where(users.stripe_customer_id == customer_id))
#     user = user.scalar_one_or_none()
    
#     if user:
#         user.subscription_status = subscription["status"]
#         user.plan_price_id = subscription["items"]["data"][0]["price"]["id"]
#         user.current_period_end = datetime.utcfromtimestamp(subscription["current_period_end"])
#         db.add(user)
#         await db.commit()

# async def handle_subscription_updated(event, db: AsyncSession):
#     # Subscription updated, update user subscription details
#     subscription = event["data"]["object"]
#     customer_id = subscription["customer"]
#     user = await db.execute(select(users).where(users.stripe_customer_id == customer_id))
#     user = user.scalar_one_or_none()

#     if user:
#         user.subscription_status = subscription["status"]
#         user.plan_price_id = subscription["items"]["data"][0]["price"]["id"]
#         user.current_period_end = datetime.utcfromtimestamp(subscription["current_period_end"])
#         db.add(user)
#         await db.commit()

# async def handle_subscription_deleted(event, db: AsyncSession):
#     # Subscription deleted, update user status
#     subscription = event["data"]["object"]
#     customer_id = subscription["customer"]
#     user = await db.execute(select(users).where(users.stripe_customer_id == customer_id))
#     user = user.scalar_one_or_none()

#     if user:
#         user.subscription_status = "canceled"
#         user.current_period_end = None  # Or set a specific date for cancellation
#         db.add(user)
#         await db.commit()

import datetime
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
# Load environment variables from .env
load_dotenv()

# Initialize Stripe API key and Webhook secret from environment variables
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

router = APIRouter(prefix="/billing/webhook", tags=["billing"])

@router.post("/")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=WEBHOOK_SECRET  # Verifying using the webhook secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Signature verification failed: {str(e)}")

    event_type = event["type"]
    try:
        if event_type == "invoice.payment_succeeded":
            await handle_payment_success(event, request)
        elif event_type == "customer.subscription.created":
            print("Handling subscription created event")
            await handle_subscription_created(event, request)
        elif event_type == "customer.subscription.updated":
            await handle_subscription_updated(event)
        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(event)
        else:
            return JSONResponse({"message": f"Event {event_type} not handled"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error handling {event_type}: {str(e)}")

    return JSONResponse({"received": True}, status_code=200)

async def handle_payment_success(event,request: Request):
    invoice = event["data"]["object"]
    user_data = request.state.user_data
    print(f"User Data from Request State: {user_data}")
    print("=== INVOICE PAYMENT SUCCESS ===")
    print("=== FULL EVENT STRUCTURE ===")
    print(json.dumps(event, indent=2, default=str))
    
    print("=== INVOICE METADATA ===")
    print(json.dumps(invoice.get('metadata', {}), indent=4))
    
    # Check subscription metadata if this is a subscription invoice
    if 'subscription' in invoice and invoice['subscription']:
        try:
            subscription = stripe.Subscription.retrieve(invoice['subscription'])
            print("=== SUBSCRIPTION METADATA (from invoice) ===")
            print(json.dumps(subscription.get('metadata', {}), indent=4))
        except Exception as e:
            print(f"Could not retrieve subscription: {e}")
    
    # Check customer metadata
    if 'customer' in invoice and invoice['customer']:
        try:
            customer = stripe.Customer.retrieve(invoice['customer'])
            print("=== CUSTOMER METADATA ===")
            print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            print(f"Could not retrieve customer: {e}")

async def handle_subscription_created(event, request: Request):
    subscription = event["data"]["object"]
    user_data = request.state.user_data
    print(f"User Data from Request State: {user_data}")
    print("=== SUBSCRIPTION CREATED ===")
    print("=== FULL EVENT STRUCTURE ===")
    print(json.dumps(event, indent=2, default=str))
    
    print("=== SUBSCRIPTION METADATA ===")
    print(json.dumps(subscription.get('metadata', {}), indent=4))
    
    # Check customer metadata
    if 'customer' in subscription and subscription['customer']:
        try:
            customer = stripe.Customer.retrieve(subscription['customer'])
            print("=== CUSTOMER METADATA ===")
            print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            print(f"Could not retrieve customer: {e}")

async def handle_subscription_updated(event):
    subscription = event["data"]["object"]
    
    print("=== SUBSCRIPTION UPDATED ===")
    print("=== FULL EVENT STRUCTURE ===")
    print(json.dumps(event, indent=2, default=str))
    
    print("=== UPDATED SUBSCRIPTION METADATA ===")
    print(json.dumps(subscription.get('metadata', {}), indent=4))
    
    # Check customer metadata
    if 'customer' in subscription and subscription['customer']:
        try:
            customer = stripe.Customer.retrieve(subscription['customer'])
            print("=== CUSTOMER METADATA ===")
            print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            print(f"Could not retrieve customer: {e}")

async def handle_subscription_deleted(event):
    subscription = event["data"]["object"]
    
    print("=== SUBSCRIPTION DELETED ===")
    print("=== FULL EVENT STRUCTURE ===")
    print(json.dumps(event, indent=2, default=str))
    
    print("=== DELETED SUBSCRIPTION METADATA ===")
    print(json.dumps(subscription.get('metadata', {}), indent=4))
    
    # Check customer metadata
    if 'customer' in subscription and subscription['customer']:
        try:
            customer = stripe.Customer.retrieve(subscription['customer'])
            print("=== CUSTOMER METADATA ===")
            print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            print(f"Could not retrieve customer: {e}")