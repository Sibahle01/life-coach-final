// File: /src/lib/email/templates.ts
export const emailTemplates = {
  // BOOK ORDERS
  bookOrderConfirmation: (data: {
    customerName: string
    orderNumber: string
    items: Array<{ title: string; format: string; quantity: number; price: number }>
    total: number
  }) => ({
    subject: `Order Confirmation #${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="padding: 32px 40px; background: #000000; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">
              ORDER CONFIRMATION
            </h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px;">
            
            <!-- Greeting -->
            <div style="margin-bottom: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">
                Dear ${data.customerName},
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                Thank you for your order. Your purchase has been confirmed and is being processed.
              </p>
            </div>
            
            <!-- Order Summary -->
            <div style="margin-bottom: 32px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #000000;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #000000;">
                  ORDER #${data.orderNumber}
                </h2>
                <span style="font-size: 13px; color: #6B7280;">${new Date().toLocaleDateString()}</span>
              </div>
              
              <!-- Order Items -->
              <div style="margin-bottom: 24px;">
                ${data.items.map(item => `
                <div style="margin-bottom: 16px; padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 15px; font-weight: 600; color: #111827;">${item.title}</span>
                    <span style="font-size: 15px; font-weight: 600; color: #000000;">R ${item.price.toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 13px; color: #6B7280;">Format: ${item.format}</span>
                    <span style="font-size: 13px; color: #6B7280;">Quantity: ${item.quantity}</span>
                  </div>
                </div>
                `).join('')}
              </div>
              
              <!-- Total -->
              <div style="padding: 16px; background: #F9FAFB; border-radius: 8px; text-align: right;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #6B7280;">Subtotal</span>
                  <span style="font-size: 14px; color: #374151;">R ${data.total.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 14px; color: #6B7280;">Shipping</span>
                  <span style="font-size: 14px; color: #374151;">Calculated at checkout</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #E5E7EB;">
                  <span style="font-size: 16px; font-weight: 600; color: #000000;">Total</span>
                  <span style="font-size: 18px; font-weight: 700; color: #000000;">R ${data.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <!-- Delivery Information -->
            <div style="margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #000000;">
                DELIVERY INFORMATION
              </h3>
              <div style="padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px;">
                <div style="margin-bottom: 12px;">
                  <span style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">eBook Delivery</span>
                  <span style="font-size: 13px; color: #6B7280;">Will be delivered via email within 24 hours</span>
                </div>
                <div>
                  <span style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Physical Books</span>
                  <span style="font-size: 13px; color: #6B7280;">Ship within 2-3 business days with tracking information</span>
                </div>
              </div>
            </div>
            
            <!-- Support -->
            <div style="padding: 20px; background: #F9FAFB; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">
                NEED ASSISTANCE?
              </p>
              <p style="margin: 0; font-size: 13px; color: #6B7280;">
                Contact support at support@sifisonkabinde.com
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="padding: 32px 40px; background: #000000;">
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">
                Sifiso Nkabinde Ministries
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.7);">
                © ${new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `
  }),

  ebookDelivery: (data: {
    customerName: string
    bookTitle: string
    downloadUrl: string
    expiresInDays: number
  }) => ({
    subject: `Your eBook: ${data.bookTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your eBook is Ready</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #111827;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="padding: 32px 40px; background: #000000; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">
              EBOOK DELIVERY
            </h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px;">
            
            <!-- Greeting -->
            <div style="margin-bottom: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">
                ${data.customerName},
              </p>
              <h2 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3; color: #000000;">
                Your eBook is Ready
              </h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Thank you for your purchase. <strong style="font-weight: 600;">${data.bookTitle}</strong> is now available for download.
              </p>
            </div>
            
            <!-- Download Section -->
            <div style="margin: 40px 0; text-align: center;">
              <a href="${data.downloadUrl}" style="display: inline-block; padding: 16px 48px; background: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; letter-spacing: 0.3px; border-radius: 4px; transition: background-color 0.2s;">
                DOWNLOAD EBOOK
              </a>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #6B7280;">
                Download link expires in ${data.expiresInDays} days
              </p>
            </div>
            
            <!-- Important Notes -->
            <div style="margin-bottom: 32px; padding: 20px; background: #F9FAFB; border-radius: 8px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #000000;">
                IMPORTANT INFORMATION
              </h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151; line-height: 1.6;">
                <li>This is a digital product. No physical item will be shipped.</li>
                <li>The download link is valid for ${data.expiresInDays} days from the date of purchase.</li>
                <li>For best reading experience, use a PDF reader application.</li>
              </ul>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="padding: 32px 40px; background: #000000;">
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">
                Happy reading,
              </p>
              <p style="margin: 0; font-size: 15px; font-weight: 500; color: #ffffff;">
                Sifiso Nkabinde
              </p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `
  }),

  // SESSION BOOKINGS
  bookingConfirmation: (data: {
    clientName: string
    serviceName: string
    date: string
    time: string
    duration: number
    location: string
    meetingLink?: string
  }) => ({
    subject: `Booking Confirmed: ${data.serviceName} on ${data.date}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="padding: 32px 40px; background: #000000; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">
              SESSION CONFIRMED
            </h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px;">
            
            <!-- Greeting -->
            <div style="margin-bottom: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">
                Dear ${data.clientName},
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                Your coaching session has been confirmed. Below are the details of your booking.
              </p>
            </div>
            
            <!-- Session Details -->
            <div style="margin-bottom: 32px;">
              <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 12px;">
                SESSION DETAILS
              </h2>
              
              <div style="margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #6B7280;">Service</span>
                  <span style="font-size: 14px; font-weight: 600; color: #000000;">${data.serviceName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #6B7280;">Date</span>
                  <span style="font-size: 14px; font-weight: 600; color: #000000;">${data.date}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #6B7280;">Time</span>
                  <span style="font-size: 14px; font-weight: 600; color: #000000;">${data.time}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: #6B7280;">Duration</span>
                  <span style="font-size: 14px; font-weight: 600; color: #000000;">${data.duration} minutes</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 14px; color: #6B7280;">Location</span>
                  <span style="font-size: 14px; font-weight: 600; color: #000000; text-align: right;">${data.location}</span>
                </div>
              </div>
              
              ${data.meetingLink ? `
              <div style="margin-top: 24px; padding: 20px; background: #F3F4F6; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #000000;">
                  VIRTUAL SESSION ACCESS
                </p>
                <a href="${data.meetingLink}" style="display: inline-block; padding: 12px 32px; background: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                  JOIN SESSION
                </a>
              </div>
              ` : ''}
            </div>
            
            <!-- Preparation Notes -->
            <div style="margin-bottom: 32px; padding: 20px; background: #F9FAFB; border-radius: 8px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #000000;">
                PREPARATION NOTES
              </h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151; line-height: 1.6;">
                <li>Please arrive 5 minutes before your scheduled time</li>
                <li>Have your questions and goals prepared for our session</li>
                <li>Ensure a quiet environment for focused discussion</li>
                ${data.meetingLink ? '<li>Test your audio and video connection before the session</li>' : ''}
              </ul>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="padding: 32px 40px; background: #000000;">
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">
                Looking forward to our session
              </p>
              <p style="margin: 0; font-size: 15px; font-weight: 500; color: #ffffff;">
                Sifiso Nkabinde
              </p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `
  }),

  bookingReminder: (data: {
    clientName: string
    serviceName: string
    date: string
    time: string
    meetingLink?: string
  }) => ({
    subject: `Reminder: ${data.serviceName} Session Tomorrow`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Session Reminder</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="padding: 32px 40px; background: #000000; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">
              SESSION REMINDER
            </h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px;">
            
            <!-- Greeting -->
            <div style="margin-bottom: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">
                Dear ${data.clientName},
              </p>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #374151;">
                This is a reminder for your upcoming coaching session tomorrow.
              </p>
            </div>
            
            <!-- Session Details -->
            <div style="margin-bottom: 32px; padding: 24px; background: #FEF3C7; border-radius: 8px; border-left: 4px solid #D97706;">
              <div style="margin-bottom: 16px;">
                <h2 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #92400E;">
                  UPCOMING SESSION
                </h2>
                <p style="margin: 0; font-size: 14px; color: #92400E;">
                  ${data.serviceName}
                </p>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                <div>
                  <span style="display: block; font-size: 13px; color: #B45309; margin-bottom: 4px;">Date</span>
                  <span style="font-size: 14px; font-weight: 600; color: #92400E;">${data.date}</span>
                </div>
                <div>
                  <span style="display: block; font-size: 13px; color: #B45309; margin-bottom: 4px;">Time</span>
                  <span style="font-size: 14px; font-weight: 600; color: #92400E;">${data.time}</span>
                </div>
              </div>
              
              ${data.meetingLink ? `
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(212, 166, 91, 0.3);">
                <a href="${data.meetingLink}" style="display: inline-block; padding: 10px 24px; background: #92400E; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                  ACCESS SESSION LINK
                </a>
              </div>
              ` : ''}
            </div>
            
            <!-- Preparation Checklist -->
            <div style="margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #000000;">
                PREPARATION CHECKLIST
              </h3>
              <div style="padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <div style="width: 20px; height: 20px; border: 2px solid #D1D5DB; border-radius: 4px; margin-right: 12px; flex-shrink: 0;"></div>
                  <span style="font-size: 14px; color: #374151;">Review your goals and questions</span>
                </div>
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <div style="width: 20px; height: 20px; border: 2px solid #D1D5DB; border-radius: 4px; margin-right: 12px; flex-shrink: 0;"></div>
                  <span style="font-size: 14px; color: #374151;">Ensure a quiet, distraction-free environment</span>
                </div>
                ${data.meetingLink ? `
                <div style="display: flex; align-items: flex-start;">
                  <div style="width: 20px; height: 20px; border: 2px solid #D1D5DB; border-radius: 4px; margin-right: 12px; flex-shrink: 0;"></div>
                  <span style="font-size: 14px; color: #374151;">Test your internet connection and equipment</span>
                </div>
                ` : `
                <div style="display: flex; align-items: flex-start;">
                  <div style="width: 20px; height: 20px; border: 2px solid #D1D5DB; border-radius: 4px; margin-right: 12px; flex-shrink: 0;"></div>
                  <span style="font-size: 14px; color: #374151;">Plan your travel time to arrive 5 minutes early</span>
                </div>
                `}
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="padding: 32px 40px; background: #000000;">
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">
                See you tomorrow
              </p>
              <p style="margin: 0; font-size: 15px; font-weight: 500; color: #ffffff;">
                Sifiso Nkabinde
              </p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `
  }),

  // EVENTS
  eventTicket: (data: {
    attendeeName: string
    eventTitle: string
    eventDate: string
    eventTime: string
    location: string
    venue: string
    ticketNumber: string
    qrCodeUrl: string
    quantity: number
    totalAmount: number
    isVirtual: boolean
    meetingLink?: string
  }) => ({
    subject: `Your Ticket: ${data.eventTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Ticket</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="padding: 32px 40px; background: #000000; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">
              EVENT TICKET
            </h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px;">
            
            <!-- Greeting -->
            <div style="margin-bottom: 32px;">
              <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">
                ${data.attendeeName},
              </p>
              <h2 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; color: #000000;">
                You're All Set
              </h2>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Your ${data.quantity} ticket${data.quantity > 1 ? 's' : ''} for <strong>${data.eventTitle}</strong> ${data.quantity > 1 ? 'are' : 'is'} confirmed.
              </p>
            </div>
            
            <!-- Ticket Card -->
            <div style="margin: 32px 0; padding: 32px; background: #000000; border-radius: 16px; text-align: center; position: relative; overflow: hidden;">
              
              <!-- Ticket Pattern -->
              <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%); border-radius: 0 0 0 100px;"></div>
              
              <!-- Event Title -->
              <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
                ${data.eventTitle}
              </h3>
              
              <!-- Event Details -->
              <div style="margin: 0 0 24px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: rgba(255,255,255,0.8);">Date</span>
                  <span style="font-size: 14px; font-weight: 600; color: #ffffff;">${data.eventDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="font-size: 14px; color: rgba(255,255,255,0.8);">Time</span>
                  <span style="font-size: 14px; font-weight: 600; color: #ffffff;">${data.eventTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 14px; color: rgba(255,255,255,0.8);">${data.isVirtual ? 'Platform' : 'Venue'}</span>
                  <span style="font-size: 14px; font-weight: 600; color: #ffffff; text-align: right;">${data.venue || data.location}</span>
                </div>
              </div>
              
              <!-- QR Code -->
              <div style="margin: 24px auto; padding: 16px; background: #ffffff; border-radius: 12px; display: inline-block;">
                <img src="${data.qrCodeUrl}" alt="Ticket QR Code" style="width: 180px; height: 180px; display: block;" />
              </div>
              
              <!-- Ticket Number -->
              <div style="margin: 20px 0 0 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.7);">
                  TICKET NUMBER
                </p>
                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff; letter-spacing: 2px;">
                  ${data.ticketNumber}
                </p>
              </div>
              
              <div style="margin-top: 16px;">
                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">
                  ${data.quantity} Ticket${data.quantity > 1 ? 's' : ''} • R ${data.totalAmount.toFixed(2)}
                </p>
              </div>
              
            </div>
            
            ${data.isVirtual && data.meetingLink ? `
            <!-- Virtual Event Access -->
            <div style="margin: 32px 0; padding: 24px; background: #EFF6FF; border-radius: 12px; text-align: center;">
              <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1E40AF;">
                VIRTUAL EVENT ACCESS
              </h4>
              <a href="${data.meetingLink}" style="display: inline-block; padding: 14px 32px; background: #1E40AF; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background-color 0.2s;">
                JOIN VIRTUAL EVENT
              </a>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #4B5563;">
                Save this link - you'll need it to join on event day
              </p>
            </div>
            ` : ''}
            
            <!-- Event Information -->
            <div style="margin: 32px 0;">
              <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #000000;">
                EVENT INFORMATION
              </h4>
              <div style="padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
                <div style="margin-bottom: 12px;">
                  <span style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Arrival Time</span>
                  <span style="font-size: 13px; color: #6B7280;">${data.isVirtual ? 'Join 5 minutes before start time' : 'Arrive 15 minutes early for check-in'}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Check-in Process</span>
                  <span style="font-size: 13px; color: #6B7280;">${data.isVirtual ? 'Use the meeting link above to access the event' : 'Present QR code at entrance for verification'}</span>
                </div>
                <div>
                  <span style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Additional Information</span>
                  <span style="font-size: 13px; color: #6B7280;">${data.isVirtual ? 'Ensure stable internet connection and required equipment' : 'Bring valid ID for verification purposes'}</span>
                </div>
              </div>
            </div>
            
            <!-- Support -->
            <div style="margin: 32px 0; padding: 20px; background: #F9FAFB; border-radius: 12px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">
                NEED ASSISTANCE?
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6B7280;">
                Contact support at support@sifisonkabinde.com or reply to this email.
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="padding: 32px 40px; background: #000000;">
            <div style="text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">
                Looking forward to seeing you at the event
              </p>
              <p style="margin: 0; font-size: 15px; font-weight: 500; color: #ffffff;">
                Sifiso Nkabinde Events
              </p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `
  }),

  // ADMIN NOTIFICATIONS
  newSpeakingRequest: (data: {
    organization: string
    contactName: string
    contactEmail: string
    eventDate: string
    topic: string
  }) => ({
    subject: `New Speaking Request: ${data.organization}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Speaking Request</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="padding: 32px 40px; background: #000000; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: 1px;">
              NEW SPEAKING REQUEST
            </h1>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px;">
            
            <!-- Request Details -->
            <div style="margin-bottom: 32px;">
              <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 12px;">
                REQUEST DETAILS
              </h2>
              
              <div style="margin-bottom: 24px; padding: 20px; background: #F0F9FF; border-radius: 8px;">
                <div style="margin-bottom: 12px;">
                  <span style="display: block; font-size: 14px; color: #0369A1; margin-bottom: 4px;">Organization</span>
                  <span style="font-size: 15px; font-weight: 600; color: #000000;">${data.organization}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="display: block; font-size: 14px; color: #0369A1; margin-bottom: 4px;">Contact Person</span>
                  <span style="font-size: 15px; font-weight: 600; color: #000000;">${data.contactName}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="display: block; font-size: 14px; color: #0369A1; margin-bottom: 4px;">Contact Email</span>
                  <span style="font-size: 15px; font-weight: 600; color: #000000;">${data.contactEmail}</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="display: block; font-size: 14px; color: #0369A1; margin-bottom: 4px;">Event Date</span>
                  <span style="font-size: 15px; font-weight: 600; color: #000000;">${data.eventDate}</span>
                </div>
                <div>
                  <span style="display: block; font-size: 14px; color: #0369A1; margin-bottom: 4px;">Requested Topic</span>
                  <span style="font-size: 15px; font-weight: 600; color: #000000;">${data.topic}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.sifisonkabinde.com'}/admin/speaking-requests" style="display: inline-block; padding: 14px 32px; background: #000000; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 500; transition: background-color 0.2s;">
                VIEW IN ADMIN PANEL
              </a>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #6B7280;">
                This request requires your review and response
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="padding: 32px 40px; background: #000000;">
            <div style="text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #ffffff;">
                Admin Notification • Sifiso Nkabinde Ministries
              </p>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `
  })
}