import datetime
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
import os
import json
from dotenv import load_dotenv
current_user_data_billing  = None  # Use the same name as in auth.py

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
            await handle_payment_success(event)
        elif event_type == "customer.subscription.created":
            await handle_subscription_created(event)
        elif event_type == "customer.subscription.updated":
            await handle_subscription_updated(event)
        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(event)
        # Add this to your main webhook function
        elif event_type == "checkout.session.completed":
            # print("===  Starting the checkout.session.completed handler ===")
            await handle_checkout_completed(event)

        else:
            return JSONResponse({"message": f"Event {event_type} not handled"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error handling {event_type}: {str(e)}")

    return JSONResponse({"received": True}, status_code=200)

# Add this new handler
async def handle_checkout_completed(event):
    
    session = event["data"]["object"]
    
    user_id = session.get('client_reference_id')        # This should be "11"
    customer_email = session.get('customer_email')      # This should be "user@email.com"
    subscription_id = session.get('subscription')
    
    # print(f"🔔 CHECKOUT COMPLETED:")
    # print(f"   User ID: {user_id}")
    # print(f"   Email: {customer_email}")
    # print(f"   Subscription: {subscription_id}")
    
    # Store this info for later use in subscription events
    if subscription_id and user_id:
        stripe.Subscription.modify(
            subscription_id,
            metadata={
                'user_id': user_id,
                'user_email': customer_email
            }
        )

async def handle_payment_success(event):
    invoice = event["data"]["object"]
        

    # print("=== INVOICE PAYMENT SUCCESS ===")
    # print("=== FULL EVENT STRUCTURE ===")
    # print(json.dumps(event, indent=2, default=str))
    
    # print("=== INVOICE METADATA ===")
    # print(json.dumps(invoice.get('metadata', {}), indent=4))
    
    # Check subscription metadata if this is a subscription invoice
    if 'subscription' in invoice and invoice['subscription']:
        try:
            subscription = stripe.Subscription.retrieve(invoice['subscription'])
            # print("=== SUBSCRIPTION METADATA (from invoice) ===")
            # print(json.dumps(subscription.get('metadata', {}), indent=4))
        except Exception as e:
            # print(f"Could not retrieve subscription: {e}")
            pass
    
    # Check customer metadata
    if 'customer' in invoice and invoice['customer']:
        try:
            customer = stripe.Customer.retrieve(invoice['customer'])
            # print("=== CUSTOMER METADATA ===")
            # print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            # print(f"Could not retrieve customer: {e}")
            pass

async def handle_subscription_created(event):
    subscription = event["data"]["object"]

    try:
        # Get customer email
        customer_id = subscription.get('customer')
        customer = stripe.Customer.retrieve(customer_id)
        customer_email = customer.get('email', 'No email found')
        
        # Get user ID from client_reference_id (might be in different places)
        user_id = subscription.get('metadata', {}).get('client_reference_id') or \
                  customer.get('metadata', {}).get('client_reference_id') or \
                  'No user ID found'
        
        # print(f"🔔 SUBSCRIPTION CREATED FOR:")
        # print(f"   User ID: {user_id}")
        # print(f"   Email: {customer_email}")
        # print("=" * 50)
    except Exception as e:
        # print(f"Could not extract user info: {e}")
        pass
    


    try:
        # Get the latest invoice from subscription
        latest_invoice_id = subscription.get('latest_invoice')
        if latest_invoice_id:
            # Retrieve the invoice
            invoice = stripe.Invoice.retrieve(latest_invoice_id)
            
            # Get payment intent from invoice
            payment_intent_id = invoice.payment_intent
            if payment_intent_id:
                # Find checkout sessions for this payment intent
                sessions = stripe.checkout.Session.list(
                    payment_intent=payment_intent_id,
                    limit=1
                )
                
                if sessions.data:
                    session = sessions.data[0]
                    user_id = session.get('client_reference_id')
                    customer_email = session.get('customer_email')
                    
                    # print(f"🔔 SUBSCRIPTION CREATED FOR:")
                    # print(f"   User ID: {user_id}")
                    # print(f"   Email: {customer_email}")
                    # print("=" * 50)
                else:
                    # print("No checkout session found")
                    pass
            else:
                # print("No payment intent in invoice")
                pass
        else:
            # print("No latest_invoice in subscription")
            pass
            
    except Exception as e:
        # print(f"Could not extract user info: {e}")
        pass
    



    # print("=== SUBSCRIPTION CREATED ===")
    # print("=== FULL EVENT STRUCTURE ===")
    # print(json.dumps(event, indent=2, default=str))
    
    # print("=== SUBSCRIPTION METADATA ===")
    # print(json.dumps(subscription.get('metadata', {}), indent=4))
    
    # Check customer metadata
    if 'customer' in subscription and subscription['customer']:
        try:
            customer = stripe.Customer.retrieve(subscription['customer'])
            # print("=== CUSTOMER METADATA ===")
            # print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            # print(f"Could not retrieve customer: {e}")
            pass

async def handle_subscription_updated(event):
    subscription = event["data"]["object"]
    
    # print("=== SUBSCRIPTION UPDATED ===")
    # print("=== FULL EVENT STRUCTURE ===")
    # print(json.dumps(event, indent=2, default=str))
    
    # print("=== UPDATED SUBSCRIPTION METADATA ===")
    # print(json.dumps(subscription.get('metadata', {}), indent=4))
    
    # Check customer metadata
    if 'customer' in subscription and subscription['customer']:
        try:
            customer = stripe.Customer.retrieve(subscription['customer'])
            # print("=== CUSTOMER METADATA ===")
            # print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            # print(f"Could not retrieve customer: {e}")
            pass

async def handle_subscription_deleted(event, webhook_data):
    subscription = event["data"]["object"]
    
    # Extract subscription data
    webhook_data['stripe_subscription_id'] = subscription.get('id')
    webhook_data['stripe_customer_id'] = subscription.get('customer')
    webhook_data['status'] = subscription.get('status')
    webhook_data['start_date'] = subscription.get('start_date')
    webhook_data['cancel_at_period_end'] = subscription.get('cancel_at_period_end')
    webhook_data['user_id'] = subscription.get('metadata', {}).get('user_id')
    
    # Get plan info from subscription items
    items = subscription.get('items', {}).get('data', [])
    if items:
        item = items[0]
        webhook_data['plan_id'] = item.get('price', {}).get('id') or item.get('plan', {}).get('id')
        webhook_data['quantity'] = item.get('quantity')
        webhook_data['current_period_end'] = item.get('current_period_end')
    
    # print("=== SUBSCRIPTION DELETED ===")
    # print("=== FULL EVENT STRUCTURE ===")
    # print(json.dumps(event, indent=2, default=str))
    
    # print("=== DELETED SUBSCRIPTION METADATA ===")
    # print(json.dumps(subscription.get('metadata', {}), indent=4))
    
    # Check customer metadata
    if 'customer' in subscription and subscription['customer']:
        try:
            customer = stripe.Customer.retrieve(subscription['customer'])
            # print("=== CUSTOMER METADATA ===")
            # print(json.dumps(customer.get('metadata', {}), indent=4))
        except Exception as e:
            # print(f"Could not retrieve customer: {e}")
            pass