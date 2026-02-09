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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Thank you for your order!</h2>
        <p>Dear ${data.customerName},</p>
        <p>Your order <strong>#${data.orderNumber}</strong> has been received.</p>
        
        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          ${data.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.format}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">R ${item.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        
        <p><strong>Total: R ${data.total.toFixed(2)}</strong></p>
        
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>eBooks will be delivered via email within 24 hours</li>
            <li>Physical books ship within 2-3 business days</li>
            <li>You'll receive tracking information via email</li>
          </ul>
        </div>
        
        <p style="margin-top: 30px;">Best regards,<br/>Life Coach Pro Team</p>
      </div>
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 0;">
        <div style="padding: 40px 0 30px 0; border-bottom: 1px solid #000000;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; color: #000000;">
            Life & Relationship Coach
          </h1>
        </div>
        <div style="padding: 40px 0;">
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #666666;">${data.customerName},</p>
          <h2 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3; color: #000000;">Your eBook is Ready</h2>
          <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #333333;">
            Thank you for your purchase. <strong style="font-weight: 600;">${data.bookTitle}</strong> is now available for download.
          </p>
          <div style="margin: 40px 0; text-align: center;">
            <a href="${data.downloadUrl}" style="display: inline-block; padding: 16px 48px; background: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; letter-spacing: 0.3px; border-radius: 4px;">Download eBook</a>
            <p style="margin: 16px 0 0 0; font-size: 13px; color: #999999;">Link expires in ${data.expiresInDays} days</p>
          </div>
        </div>
        <div style="padding: 32px 0 40px 0; border-top: 1px solid #E5E5E5;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">Happy reading,</p>
          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #000000;">Sifiso Nkabinde</p>
        </div>
      </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Your Session is Confirmed!</h2>
        <p>Dear ${data.clientName},</p>
        <div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 10px;">
          <h3 style="margin-top: 0;">Session Details:</h3>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time} (${data.duration} minutes)</p>
          <p><strong>Location:</strong> ${data.location}</p>
          ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
        </div>
        <p style="margin-top: 30px;">Looking forward to our session!<br/>Your Life Coach</p>
      </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Session Reminder</h2>
        <p>Dear ${data.clientName},</p>
        <div style="margin: 25px 0; padding: 20px; background: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p><strong>⏰ ${data.date} at ${data.time}</strong></p>
          ${data.meetingLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${data.meetingLink}">Click to join</a></p>` : ''}
        </div>
        <p style="margin-top: 30px;">Best regards,<br/>Your Life Coach</p>
      </div>
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        
        <!-- Header -->
        <div style="padding: 32px 40px; background: #000000; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
            🎟️ Event Ticket
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px;">
          
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #666666;">
            ${data.attendeeName},
          </p>
          
          <h2 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; color: #000000;">
            You're all set!
          </h2>
          
          <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #333333;">
            Your ${data.quantity} ticket${data.quantity > 1 ? 's' : ''} for <strong>${data.eventTitle}</strong> ${data.quantity > 1 ? 'are' : 'is'} confirmed.
          </p>
          
          <!-- Ticket Card -->
          <div style="margin: 32px 0; padding: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
            
            <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #ffffff;">
              ${data.eventTitle}
            </h3>
            
            <div style="margin: 0 0 24px 0; padding: 20px; background: rgba(255,255,255,0.15); border-radius: 12px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #ffffff;">
                📅 ${data.eventDate}
              </p>
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #ffffff;">
                ⏰ ${data.eventTime}
              </p>
              <p style="margin: 0; font-size: 15px; color: #ffffff;">
                📍 ${data.location}
              </p>
            </div>
            
            <!-- QR Code -->
            <div style="margin: 24px auto; padding: 16px; background: #ffffff; border-radius: 12px; display: inline-block;">
              <img src="${data.qrCodeUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px; display: block;" />
            </div>
            
            <div style="margin: 20px 0 0 0; padding: 12px 20px; background: rgba(0,0,0,0.2); border-radius: 8px; display: inline-block;">
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 600; letter-spacing: 2px;">
                ${data.ticketNumber}
              </p>
            </div>
            
            <p style="margin: 16px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.9);">
              ${data.quantity} Ticket${data.quantity > 1 ? 's' : ''} • R ${data.totalAmount.toFixed(2)}
            </p>
          </div>
          
          ${data.isVirtual && data.meetingLink ? `
          <!-- Virtual Event Access -->
          <div style="margin: 32px 0; padding: 24px; background: #e3f2fd; border-radius: 12px; text-align: center;">
            <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1976d2;">
              Virtual Event Access
            </h4>
            <a href="${data.meetingLink}" style="display: inline-block; padding: 14px 32px; background: #1976d2; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Join Virtual Event
            </a>
            <p style="margin: 16px 0 0 0; font-size: 13px; color: #666666;">
              Save this link - you'll need it to join on event day
            </p>
          </div>
          ` : ''}
          
          <!-- Divider -->
          <div style="margin: 48px 0; height: 1px; background: #E5E5E5;"></div>
          
          <!-- Important Information -->
          <div style="margin: 32px 0;">
            <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #000000;">
              📋 Important Information
            </h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                    ${data.isVirtual 
                      ? 'Join the virtual event using the link above' 
                      : 'Arrive 15 minutes early for check-in'}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                    ${data.isVirtual 
                      ? 'Technical requirements: stable internet, webcam, microphone' 
                      : 'Show QR code at entrance for quick check-in'}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0;">
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                    Bring a valid ID for verification
                  </p>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Support -->
          <div style="margin: 32px 0; padding: 20px; background: #f8f9fa; border-radius: 12px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #000000;">
              Need Help?
            </p>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
              Contact us anytime at support@lifecoachpro.co.za or reply to this email.
            </p>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="padding: 32px 40px; background: #f8f9fa; border-top: 1px solid #E5E5E5; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
            See you at the event!
          </p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #000000;">
            Life Coach Pro Events Team
          </p>
        </div>
        
      </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>🎤 New Speaking Request</h2>
        <div style="margin: 25px 0; padding: 20px; background: #f0f7ff; border-radius: 8px;">
          <p><strong>Organization:</strong> ${data.organization}</p>
          <p><strong>Contact:</strong> ${data.contactName}</p>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Topic:</strong> ${data.topic}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/speaking-requests" style="display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View in Admin</a>
      </div>
    `
  })
}