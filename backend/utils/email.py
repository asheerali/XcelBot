from fastapi_mail import MessageSchema
from models.email_config import fm

async def send_account_email(email: str, username: str, password: str):
    subject = "Welcome to KPI360.ai - Your Account Credentials"
    
    # HTML email template with proper UI/UX
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to KPI360.ai</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f7fa;
                line-height: 1.6;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }}
            .logo {{
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .tagline {{
                font-size: 14px;
                opacity: 0.9;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .welcome-message {{
                font-size: 24px;
                color: #2d3748;
                margin-bottom: 20px;
                font-weight: 600;
            }}
            .message-text {{
                font-size: 16px;
                color: #4a5568;
                margin-bottom: 30px;
            }}
            .credentials-box {{
                background-color: #f7fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
            }}
            .credentials-title {{
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
            }}
            .credentials-title::before {{
                content: "🔐";
                margin-right: 8px;
            }}
            .credential-item {{
                margin: 12px 0;
                font-size: 14px;
            }}
            .credential-label {{
                font-weight: 600;
                color: #4a5568;
                display: inline-block;
                width: 80px;
            }}
            .credential-value {{
                background-color: #edf2f7;
                padding: 8px 12px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #2d3748;
                border: 1px solid #cbd5e0;
            }}
            .warning-box {{
                background-color: #fef5e7;
                border-left: 4px solid #f6ad55;
                padding: 15px;
                margin: 25px 0;
                border-radius: 4px;
            }}
            .warning-text {{
                color: #744210;
                font-size: 14px;
                margin: 0;
            }}
            .cta-button {{
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                transition: transform 0.2s ease;
            }}
            .cta-button:hover {{
                transform: translateY(-2px);
            }}
            .footer {{
                background-color: #f7fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }}
            .footer-text {{
                color: #718096;
                font-size: 14px;
                margin: 5px 0;
            }}
            .social-links {{
                margin-top: 20px;
            }}
            .social-links a {{
                color: #667eea;
                text-decoration: none;
                margin: 0 10px;
                font-size: 14px;
            }}
            @media only screen and (max-width: 600px) {{
                .email-container {{
                    width: 100% !important;
                }}
                .header, .content, .footer {{
                    padding: 20px !important;
                }}
                .welcome-message {{
                    font-size: 20px !important;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <div class="logo">KPI360.ai</div>
                <div class="tagline">Your Business Intelligence Platform</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="welcome-message">Welcome aboard, {username}! 🎉</div>
                
                <div class="message-text">
                    Your account has been successfully created for KPI360.ai. We're excited to have you join our platform for advanced business analytics and insights.
                </div>
                
                <!-- Credentials Box -->
                <div class="credentials-box">
                    <div class="credentials-title">Your Login Credentials</div>
                    <div class="credential-item">
                        <span class="credential-label">Email:</span>
                        <div class="credential-value">{email}</div>
                    </div>
                    <div class="credential-item">
                        <span class="credential-label">Password:</span>
                        <div class="credential-value">{password}</div>
                    </div>
                </div>
                
                <!-- Security Warning -->
                <div class="warning-box">
                    <p class="warning-text">
                        <strong>🔒 Important Security Notice:</strong> For your account security, please log in and change your password immediately after your first login.
                    </p>
                </div>
                
                <!-- Call to Action -->
                <div style="text-align: center;">
                    <a href="#" class="cta-button">Log In to Your Account</a>
                </div>
                
                <div class="message-text">
                    If you have any questions or need assistance, our support team is here to help. Simply reply to this email or contact us through our help center.
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-text"><strong>XcelBot Team</strong></div>
                <div class="footer-text">Making data-driven decisions simple and powerful</div>
               
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback for email clients that don't support HTML
    text_body = f"""
    Welcome to KPI360.ai, {username}!
    
    Your account has been successfully created.
    
    Login Credentials:
    Email: {email}
    Password: {password}
    
    IMPORTANT: Please log in and change your password as soon as possible for security.
    
    If you need help, contact our support team.
    
    Best regards,
    XcelBot Team
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=html_body,  # Set HTML as main body
        subtype="html"   # Ensure HTML subtype
    )
    
    await fm.send_message(message)
    
    
    
    
# async def send_order_confirmation_email(email: str, username: str, order_id: int, items_ordered: dict, order_date, is_update: bool = False):
#     subject = "Order Update - KPI360.ai" if is_update else "Order Confirmation - KPI360.ai"
    
#     print("Sending email with items:", items_ordered, "to", email, "for user", username, "with order ID", order_id)

#     # Format the order date
#     formatted_date = order_date.strftime("%B %d, %Y at %I:%M %p")
    
#     # Determine the date label and header content based on whether it's an update
#     date_label = "Updated At" if is_update else "Order Date"
#     header_title = "Order Update" if is_update else "Order Confirmation"
#     thank_you_message = f"Your order has been successfully updated, {username}! ✅" if is_update else f"Thank you for your order, {username}! ✅"
#     message_text = "Your order has been successfully updated. Here are the details:" if is_update else "Your order has been successfully placed. Here are the details:"
    
#     items_list = ""
#     for item in items_ordered.get("items", []):
#         unit_price = float(item.get('unit_price', 0))
#         quantity = int(item.get('quantity', 0))
#         total_price = float(item.get('total_price', unit_price * quantity))

#         items_list += f"""
#         <div style="padding: 10px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">
#             <strong>{item.get('name', 'Item')}</strong><br>
#             <span style="color: #718096; font-size: 14px;">
#                 Quantity: {quantity} | 
#                 Price: ${unit_price:.2f} | 
#                 Total: ${total_price:.2f}
#             </span>
#         </div>
#         """

#     total_amount = sum(float(item.get('total_price', float(item.get('unit_price', 0)) * int(item.get('quantity', 0)))) 
#                    for item in items_ordered.get("items", []))

#     # HTML email template
#     html_body = f"""
#     <!DOCTYPE html>
#     <html lang="en">
#     <head>
#         <meta charset="UTF-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1.0">
#         <title>{subject}</title>
#         <style>
#             body {{
#                 margin: 0;
#                 padding: 0;
#                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
#                 background-color: #f5f7fa;
#                 line-height: 1.6;
#             }}
#             .email-container {{
#                 max-width: 600px;
#                 margin: 0 auto;
#                 background-color: #ffffff;
#                 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
#             }}
#             .header {{
#                 background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
#                 padding: 40px 30px;
#                 text-align: center;
#                 color: white;
#             }}
#             .logo {{
#                 font-size: 28px;
#                 font-weight: bold;
#                 margin-bottom: 10px;
#             }}
#             .tagline {{
#                 font-size: 14px;
#                 opacity: 0.9;
#             }}
#             .content {{
#                 padding: 40px 30px;
#             }}
#             .order-title {{
#                 font-size: 24px;
#                 color: #2d3748;
#                 margin-bottom: 20px;
#                 font-weight: 600;
#             }}
#             .message-text {{
#                 font-size: 16px;
#                 color: #4a5568;
#                 margin-bottom: 30px;
#             }}
#             .order-details-box {{
#                 background-color: #f7fafc;
#                 border: 2px solid #e2e8f0;
#                 border-radius: 8px;
#                 padding: 25px;
#                 margin: 25px 0;
#             }}
#             .order-info {{
#                 display: flex;
#                 justify-content: space-between;
#                 margin-bottom: 20px;
#                 padding-bottom: 15px;
#                 border-bottom: 1px solid #e2e8f0;
#             }}
#             .order-info div {{
#                 font-size: 14px;
#             }}
#             .order-info .label {{
#                 color: #718096;
#                 font-weight: 500;
#             }}
#             .order-info .value {{
#                 color: #2d3748;
#                 font-weight: 600;
#             }}
#             .items-title {{
#                 font-size: 18px;
#                 font-weight: 600;
#                 color: #2d3748;
#                 margin-bottom: 15px;
#                 display: flex;
#                 align-items: center;
#             }}
#             .items-title::before {{
#                 content: "📦";
#                 margin-right: 8px;
#             }}
#             .total-box {{
#                 background-color: #48bb78;
#                 color: white;
#                 padding: 15px;
#                 border-radius: 6px;
#                 text-align: center;
#                 margin-top: 20px;
#             }}
#             .total-text {{
#                 font-size: 18px;
#                 font-weight: 600;
#             }}
#             .footer {{
#                 background-color: #f7fafc;
#                 padding: 30px;
#                 text-align: center;
#                 border-top: 1px solid #e2e8f0;
#             }}
#             .footer-text {{
#                 color: #718096;
#                 font-size: 14px;
#                 margin: 5px 0;
#             }}
#             @media only screen and (max-width: 600px) {{
#                 .email-container {{
#                     width: 100% !important;
#                 }}
#                 .header, .content, .footer {{
#                     padding: 20px !important;
#                 }}
#                 .order-title {{
#                     font-size: 20px !important;
#                 }}
#                 .order-info {{
#                     flex-direction: column;
#                     gap: 10px;
#                 }}
#             }}
#         </style>
#     </head>
#     <body>
#         <div class="email-container">
#             <!-- Header -->
#             <div class="header">
#                 <div class="logo">KPI360.ai</div>
#                 <div class="tagline">{header_title}</div>
#             </div>
            
#             <!-- Content -->
#             <div class="content">
#                 <div class="order-title">{thank_you_message}</div>
                
#                 <div class="message-text">
#                     {message_text}
#                 </div>
                
#                 <!-- Order Details Box -->
#                 <div class="order-details-box">
#                     <div class="order-info">
#                         <div>
#                             <div class="label">Order ID:</div>
#                             <div class="value">#{order_id}</div>
#                         </div>
#                         <div>
#                             <div class="label">{date_label}:</div>
#                             <div class="value">{formatted_date}</div>
#                         </div>
#                         <div>
#                             <div class="label">Total Items:</div>
#                             <div class="value">{items_ordered.get('total_items', 0)}</div>
#                         </div>
#                     </div>
                    
#                     <div class="items-title">Order Items</div>
#                     {items_list}
                    
#                     <div class="total-box">
#                         <div class="total-text">Total Amount: ${total_amount:.2f}</div>
#                     </div>
#                 </div>
                
#                 <div class="message-text">
#                     {"We'll send you another email with tracking information once your order ships." if not is_update else "Your order has been successfully updated with the new items."} 
#                     If you have any questions about your order, please don't hesitate to contact our support team.
#                 </div>
#             </div>
            
#             <!-- Footer -->
#             <div class="footer">
#                 <div class="footer-text"><strong>KPI360.ai Team</strong></div>
#                 <div class="footer-text">Thank you for your business!</div>
#             </div>
#         </div>
#     </body>
#     </html>
#     """
    
#     # Plain text fallback
#     text_body = f"""
#     {subject}
    
#     {thank_you_message.replace('✅', '')}
    
#     Order Details:
#     Order ID: # {order_id}
#     {date_label}: {formatted_date}
#     Total Items: {sum(int(item.get("quantity", 0)) for item in items_ordered.get("items", []))}

#     Items Ordered:
#     """
    
#     for item in items_ordered.get("items", []):
#         unit_price = float(item.get('unit_price', 0))
#         quantity = int(item.get('quantity', 0))
#         total_price = float(item.get('total_price', unit_price * quantity))
#         text_body += f"- {item.get('name', 'Item')}: {quantity} x ${unit_price:.2f} = ${total_price:.2f}\n"
    
#     text_body += f"""
    
#     Total Amount: ${total_amount:.2f}
    
#     {"We'll send you tracking information once your order ships." if not is_update else "Your order has been successfully updated with the new items."}
    
#     Thank you for your business!
#     KPI360.ai Team
#     """
    
#     message = MessageSchema(
#         subject=subject,
#         recipients=[email],
#         body=html_body,
#         subtype="html"
#     )
    
#     await fm.send_message(message)    
    
    
    
# async def send_order_confirmation_email(email: str, username: str, order_id: int, items_ordered: dict, order_date, is_update: bool = False):
#     subject = "Order Update - KPI360.ai" if is_update else "Order Confirmation - KPI360.ai"
    
#     print("Sending email with items:", items_ordered, "to", email, "for user", username, "with order ID", order_id)

#     # Format the order date
#     formatted_date = order_date.strftime("%B %d, %Y at %I:%M %p")
    
#     # Determine the date label and header content based on whether it's an update
#     date_label = "Updated At" if is_update else "Order Date"
#     header_title = "Order Update" if is_update else "Order Confirmation"
#     thank_you_message = f"Your order has been successfully updated, {username}! ✅" if is_update else f"Thank you for your order, {username}! ✅"
#     message_text = "Your order has been successfully updated. Here are the details:" if is_update else "Your order has been successfully placed. Here are the details:"
    
#     items_list = ""
#     for item in items_ordered.get("items", []):
#         unit_price = float(item.get('unit_price', 0))
#         quantity = int(item.get('quantity', 0))
#         total_price = float(item.get('total_price', unit_price * quantity))

#         items_list += f"""
#         <div style="padding: 10px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">
#             <strong>{item.get('name', 'Item')}</strong><br>
#             <span style="color: #718096; font-size: 14px;">
#                 Quantity: {quantity} | 
#                 Price: ${unit_price:.2f} | 
#                 Total: ${total_price:.2f}
#             </span>
#         </div>
#         """

#     total_amount = sum(float(item.get('total_price', float(item.get('unit_price', 0)) * int(item.get('quantity', 0)))) 
#                    for item in items_ordered.get("items", []))

#     # HTML email template
#     html_body = f"""
#     <!DOCTYPE html>
#     <html lang="en">
#     <head>
#         <meta charset="UTF-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1.0">
#         <title>{subject}</title>
#         <style>
#             body {{
#                 margin: 0;
#                 padding: 0;
#                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
#                 background-color: #f5f7fa;
#                 line-height: 1.6;
#             }}
#             .email-container {{
#                 max-width: 600px;
#                 margin: 0 auto;
#                 background-color: #ffffff;
#                 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
#             }}
#             .header {{
#                 background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
#                 padding: 40px 30px;
#                 text-align: center;
#                 color: white;
#             }}
#             .logo {{
#                 font-size: 28px;
#                 font-weight: bold;
#                 margin-bottom: 10px;
#             }}
#             .tagline {{
#                 font-size: 14px;
#                 opacity: 0.9;
#             }}
#             .content {{
#                 padding: 40px 30px;
#             }}
#             .order-title {{
#                 font-size: 24px;
#                 color: #2d3748;
#                 margin-bottom: 20px;
#                 font-weight: 600;
#             }}
#             .message-text {{
#                 font-size: 16px;
#                 color: #4a5568;
#                 margin-bottom: 30px;
#             }}
#             .order-details-box {{
#                 background-color: #f7fafc;
#                 border: 2px solid #e2e8f0;
#                 border-radius: 8px;
#                 padding: 25px;
#                 margin: 25px 0;
#             }}
#             .order-info {{
#                 display: grid;
#                 grid-template-columns: 1fr 1fr 1fr;
#                 gap: 20px;
#                 margin-bottom: 20px;
#                 padding-bottom: 15px;
#                 border-bottom: 1px solid #e2e8f0;
#             }}
#             .info-item {{
#                 text-align: center;
#             }}
#             .order-info .label {{
#                 color: #718096;
#                 font-weight: 500;
#                 font-size: 12px;
#                 text-transform: uppercase;
#                 letter-spacing: 0.5px;
#                 margin-bottom: 5px;
#             }}
#             .order-info .value {{
#                 color: #2d3748;
#                 font-weight: 600;
#                 font-size: 16px;
#             }}
#             .items-title {{
#                 font-size: 18px;
#                 font-weight: 600;
#                 color: #2d3748;
#                 margin-bottom: 15px;
#                 display: flex;
#                 align-items: center;
#             }}
#             .items-title::before {{
#                 content: "📦";
#                 margin-right: 8px;
#             }}
#             .total-box {{
#                 background-color: #48bb78;
#                 color: white;
#                 padding: 15px;
#                 border-radius: 6px;
#                 text-align: center;
#                 margin-top: 20px;
#             }}
#             .total-text {{
#                 font-size: 18px;
#                 font-weight: 600;
#             }}
#             .footer {{
#                 background-color: #f7fafc;
#                 padding: 30px;
#                 text-align: center;
#                 border-top: 1px solid #e2e8f0;
#             }}
#             .footer-text {{
#                 color: #718096;
#                 font-size: 14px;
#                 margin: 5px 0;
#             }}
#             @media only screen and (max-width: 600px) {{
#                 .email-container {{
#                     width: 100% !important;
#                 }}
#                 .header, .content, .footer {{
#                     padding: 20px !important;
#                 }}
#                 .order-title {{
#                     font-size: 20px !important;
#                 }}
#                 .order-info {{
#                     grid-template-columns: 1fr !important;
#                     gap: 15px !important;
#                 }}
#                 .info-item {{
#                     text-align: left !important;
#                     display: flex;
#                     justify-content: space-between;
#                     align-items: center;
#                     padding: 10px 0;
#                     border-bottom: 1px solid #e2e8f0;
#                 }}
#                 .info-item:last-child {{
#                     border-bottom: none;
#                 }}
#             }}
#         </style>
#     </head>
#     <body>
#         <div class="email-container">
#             <!-- Header -->
#             <div class="header">
#                 <div class="logo">KPI360.ai</div>
#                 <div class="tagline">{header_title}</div>
#             </div>
            
#             <!-- Content -->
#             <div class="content">
#                 <div class="order-title">{thank_you_message}</div>
                
#                 <div class="message-text">
#                     {message_text}
#                 </div>
                
#                 <!-- Order Details Box -->
#                 <div class="order-details-box">
#                     <div class="order-info">
#                         <div class="info-item">
#                             <div class="label">Order ID:</div>
#                             <div class="value">#{order_id}</div>
#                         </div>
#                         <div class="info-item">
#                             <div class="label">{date_label}:</div>
#                             <div class="value">{formatted_date}</div>
#                         </div>
#                         <div class="info-item">
#                             <div class="label">Total Items:</div>
#                             <div class="value">{sum(int(item.get("quantity", 0)) for item in items_ordered.get("items", []))}</div>
#                         </div>
#                     </div>
                    
#                     <div class="items-title">Order Items</div>
#                     {items_list}
                    
#                     <div class="total-box">
#                         <div class="total-text">Total Amount: ${total_amount:.2f}</div>
#                     </div>
#                 </div>
                
#                 <div class="message-text">
#                     {"We'll send you another email with tracking information once your order ships." if not is_update else "Your order has been successfully updated with the new items."} 
#                     If you have any questions about your order, please don't hesitate to contact our support team.
#                 </div>
#             </div>
            
#             <!-- Footer -->
#             <div class="footer">
#                 <div class="footer-text"><strong>KPI360.ai Team</strong></div>
#                 <div class="footer-text">Thank you for your business!</div>
#             </div>
#         </div>
#     </body>
#     </html>
#     """
    
#     # Plain text fallback
#     text_body = f"""
#     {subject}
    
#     {thank_you_message.replace('✅', '')}
    
#     Order Details:
#     Order ID: #{order_id}
#     {date_label}: {formatted_date}
#     Total Items: {items_ordered.get('total_items', 0)}
    
#     Items Ordered:
#     """
    
#     for item in items_ordered.get("items", []):
#         unit_price = float(item.get('unit_price', 0))
#         quantity = int(item.get('quantity', 0))
#         total_price = float(item.get('total_price', unit_price * quantity))
#         text_body += f"- {item.get('name', 'Item')}: {quantity} x ${unit_price:.2f} = ${total_price:.2f}\n"
    
#     text_body += f"""
    
#     Total Amount: ${total_amount:.2f}
    
#     {"We'll send you tracking information once your order ships." if not is_update else "Your order has been successfully updated with the new items."}
    
#     Thank you for your business!
#     KPI360.ai Team
#     """
    
#     message = MessageSchema(
#         subject=subject,
#         recipients=[email],
#         body=html_body,
#         subtype="html"
#     )
    
#     await fm.send_message(message)




async def send_order_confirmation_email(email: str, username: str, order_id: int, items_ordered: dict, order_date, is_update: bool = False):
    subject = "Order Update - KPI360.ai" if is_update else "Order Confirmation - KPI360.ai"
    
    print("Sending email with items:", items_ordered, "to", email, "for user", username, "with order ID", order_id)

    # Format the order date
    formatted_date = order_date.strftime("%B %d, %Y at %I:%M %p")
    
    # Determine the date label and header content based on whether it's an update
    date_label = "Updated At" if is_update else "Order Date"
    header_title = "Order Update" if is_update else "Order Confirmation"
    thank_you_message = f"Your order has been successfully updated, {username}! ✅" if is_update else f"Thank you for your order, {username}! ✅"
    message_text = "Your order has been successfully updated. Here are the details:" if is_update else "Your order has been successfully placed. Here are the details:"
    
    items_list = ""
    for item in items_ordered.get("items", []):
        unit_price = float(item.get('unit_price', 0))
        quantity = int(item.get('quantity', 0))
        total_price = float(item.get('total_price', unit_price * quantity))

        items_list += f"""
        <div style="padding: 10px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">
            <strong>{item.get('name', 'Item')}</strong><br>
            <span style="color: #718096; font-size: 14px;">
                Quantity: {quantity} | 
                Price: ${unit_price:.2f} | 
                Total: ${total_price:.2f}
            </span>
        </div>
        """

    total_amount = sum(float(item.get('total_price', float(item.get('unit_price', 0)) * int(item.get('quantity', 0)))) 
                   for item in items_ordered.get("items", []))

    # HTML email template
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f7fa;
                line-height: 1.6;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
                padding: 40px 30px;
                text-align: center;
                color: white;
            }}
            .logo {{
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .tagline {{
                font-size: 14px;
                opacity: 0.9;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .order-title {{
                font-size: 24px;
                color: #2d3748;
                margin-bottom: 20px;
                font-weight: 600;
            }}
            .message-text {{
                font-size: 16px;
                color: #4a5568;
                margin-bottom: 30px;
            }}
            .order-details-box {{
                background-color: #f7fafc;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
            }}
            .order-info {{
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
            }}
            .info-row {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #f1f5f9;
            }}
            .info-row:last-child {{
                border-bottom: none;
            }}
            .info-label {{
                color: #64748b;
                font-weight: 500;
                font-size: 14px;
            }}
            .info-value {{
                color: #1e293b;
                font-weight: 600;
                font-size: 14px;
            }}
            .items-title {{
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
            }}
            .items-title::before {{
                content: "📦";
                margin-right: 8px;
            }}
            .total-box {{
                background-color: #48bb78;
                color: white;
                padding: 15px;
                border-radius: 6px;
                text-align: center;
                margin-top: 20px;
            }}
            .total-text {{
                font-size: 18px;
                font-weight: 600;
            }}
            .footer {{
                background-color: #f7fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }}
            .footer-text {{
                color: #718096;
                font-size: 14px;
                margin: 5px 0;
            }}
            @media only screen and (max-width: 600px) {{
                .email-container {{
                    width: 100% !important;
                }}
                .header, .content, .footer {{
                    padding: 20px !important;
                }}
                .order-title {{
                    font-size: 20px !important;
                }}
                .info-row {{
                    padding: 10px 0 !important;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <div class="logo">KPI360.ai</div>
                <div class="tagline">{header_title}</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="order-title">{thank_you_message}</div>
                
                <div class="message-text">
                    {message_text}
                </div>
                
                <!-- Order Details Box -->
                <div class="order-details-box">
                    <div class="order-info">
                        <div class="info-row">
                            <span class="info-label">Order ID:</span>
                            <span class="info-value">#{order_id}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">{date_label}:</span>
                            <span class="info-value">{formatted_date}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Total Items:</span>
                            <span class="info-value">{sum(int(item.get("quantity", 0)) for item in items_ordered.get("items", []))}</span>
                        </div>
                    </div>
                    
                    <div class="items-title">Order Items</div>
                    {items_list}
                    
                    <div class="total-box">
                        <div class="total-text">Total Amount: ${total_amount:.2f}</div>
                    </div>
                </div>
                
                <div class="message-text">
                    {"We'll send you another email with tracking information once your order ships." if not is_update else "Your order has been successfully updated with the new items."} 
                    If you have any questions about your order, please don't hesitate to contact our support team.
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-text"><strong>KPI360.ai Team</strong></div>
                <div class="footer-text">Thank you for your business!</div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    text_body = f"""
    {subject}
    
    {thank_you_message.replace('✅', '')}
    
    Order Details:
    Order ID: #{order_id}
    {date_label}: {formatted_date}
    Total Items: {items_ordered.get('total_items', 0)}
    
    Items Ordered:
    """
    
    for item in items_ordered.get("items", []):
        unit_price = float(item.get('unit_price', 0))
        quantity = int(item.get('quantity', 0))
        total_price = float(item.get('total_price', unit_price * quantity))
        text_body += f"- {item.get('name', 'Item')}: {quantity} x ${unit_price:.2f} = ${total_price:.2f}\n"
    
    text_body += f"""
    
    Total Amount: ${total_amount:.2f}
    
    {"We'll send you tracking information once your order ships." if not is_update else "Your order has been successfully updated with the new items."}
    
    Thank you for your business!
    KPI360.ai Team
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=html_body,
        subtype="html"
    )
    
    await fm.send_message(message)

    