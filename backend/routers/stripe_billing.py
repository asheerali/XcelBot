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

payment = {
    'user_id': None,  # Foreign Key: Links to the User table
    'company_id': None,  # Foreign Key: Links to the Company or CompanyLocation table
    'stripe_subscription_id': None,  # The ID from the Stripe subscription object
    'stripe_customer_id': None,  # The customer ID from Stripe
    'plan_id': None,  # The ID of the subscription plan
    'status': None,  # The current status of the subscription
    'start_date': None,  # The date the subscription started
    'current_period_end': None,  # The end date of the current billing cycle
    'quantity': None,  # The number of units for the subscription, if applicable
    'cancel_at_period_end': None  # Boolean flag indicating whether the subscription is set to be canceled at the end of the current billing cycle
}


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
            # await handle_payment_success(event)
            payment_details = await handle_payment_success(event)
            print("Payment Details:", payment_details)  # Here you can log or handle the payment details as needed
        elif event_type == "customer.subscription.created":
            await handle_subscription_created(event)
        elif event_type == "customer.subscription.updated":
            await handle_subscription_updated(event)
        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(event)
        # Add this to your main webhook function
        elif event_type == "checkout.session.completed":
            print("===  Starting the checkout.session.completed handler ===")
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
    
    print(f"🔔 CHECKOUT COMPLETED:")
    print(f"   User ID: {user_id}")
    print(f"   Email: {customer_email}")
    print(f"   Subscription: {subscription_id}")
    
    # Store this info for later use in subscription events
    if subscription_id and user_id:
        stripe.Subscription.modify(
            subscription_id,
            metadata={
                'user_id': user_id,
                'user_email': customer_email
            }
        )

# async def handle_payment_success(event):
#     invoice = event["data"]["object"]
        

#     print("=== INVOICE PAYMENT SUCCESS ===")
#     print("=== FULL EVENT STRUCTURE ===")
#     print(json.dumps(event, indent=2, default=str))
    
#     print("=== INVOICE METADATA ===")
#     print(json.dumps(invoice.get('metadata', {}), indent=4))
    
#     # Check subscription metadata if this is a subscription invoice
#     if 'subscription' in invoice and invoice['subscription']:
#         try:
#             subscription = stripe.Subscription.retrieve(invoice['subscription'])
#             print("=== SUBSCRIPTION METADATA (from invoice) ===")
#             print(json.dumps(subscription.get('metadata', {}), indent=4))
#         except Exception as e:
#             print(f"Could not retrieve subscription: {e}")
    
#     # Check customer metadata
#     if 'customer' in invoice and invoice['customer']:
#         try:
#             customer = stripe.Customer.retrieve(invoice['customer'])
#             print("=== CUSTOMER METADATA ===")
#             print(json.dumps(customer.get('metadata', {}), indent=4))
#         except Exception as e:
#             print(f"Could not retrieve customer: {e}")



import json
import stripe

async def handle_payment_success(event):
    invoice = event["data"]["object"]
    
    # Extract the required details
    payment_details = {
        'stripe_subscription_id': invoice.get('subscription', None),  # Subscription ID
        'stripe_customer_id': invoice.get('customer', None),  # Customer ID
        'plan_id': invoice.get('lines', {}).get('data', [{}])[0].get('pricing', {}).get('price', None),  # Plan ID (price ID)
        'status': invoice.get('status', None),  # Invoice status
        'start_date': invoice.get('created', None),  # Start date (timestamp)
        'current_period_end': invoice.get('period_end', None),  # Current period end date (timestamp)
        'quantity': invoice.get('lines', {}).get('data', [{}])[0].get('quantity', None),  # Quantity from the line item
        'cancel_at_period_end': None  # Assuming you will track this in subscription metadata or elsewhere
    }
    
    # Print the full event structure
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
            
            # If cancellation info exists in the subscription, set it here
            payment_details['cancel_at_period_end'] = subscription.get('cancel_at_period_end', None)
            
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
    
    # Return the extracted details
    return payment_details

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
        
        print(f"🔔 SUBSCRIPTION CREATED FOR:")
        print(f"   User ID: {user_id}")
        print(f"   Email: {customer_email}")
        print("=" * 50)
    except Exception as e:
        print(f"Could not extract user info: {e}")
    


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
                    
                    print(f"🔔 SUBSCRIPTION CREATED FOR:")
                    print(f"   User ID: {user_id}")
                    print(f"   Email: {customer_email}")
                    print("=" * 50)
                else:
                    print("No checkout session found")
            else:
                print("No payment intent in invoice")
        else:
            print("No latest_invoice in subscription")
            
    except Exception as e:
        print(f"Could not extract user info: {e}")
    



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