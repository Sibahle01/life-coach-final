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
        
        <!-- Header -->
        <div style="padding: 40px 0 30px 0; border-bottom: 1px solid #000000;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; color: #000000;">
            Life Coach Pro
          </h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 0;">
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #666666;">
            ${data.customerName},
          </p>
          
          <h2 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; line-height: 1.3; color: #000000;">
            Your eBook is Ready
          </h2>
          
          <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #333333;">
            Thank you for your purchase. <strong style="font-weight: 600;">${data.bookTitle}</strong> is now available for download.
          </p>
          
          <!-- Download Button -->
          <div style="margin: 40px 0; text-align: center;">
            <a href="${data.downloadUrl}" 
               style="display: inline-block; padding: 16px 48px; background: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; letter-spacing: 0.3px; border-radius: 4px;">
              Download eBook
            </a>
            <p style="margin: 16px 0 0 0; font-size: 13px; color: #999999;">
              Link expires in ${data.expiresInDays} days
            </p>
          </div>
          
          <!-- Divider -->
          <div style="margin: 48px 0; height: 1px; background: #E5E5E5;"></div>
          
          <!-- Reading Tips -->
          <div style="margin: 32px 0;">
            <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.5px;">
              Reading Tips
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5; vertical-align: top;">
                  <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #333333;">
                    Save a copy to your device for offline access
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5; vertical-align: top;">
                  <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #333333;">
                    Use Adobe Acrobat Reader for the best experience
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; vertical-align: top;">
                  <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #333333;">
                    Need help? Reply to this email anytime
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="padding: 32px 0 40px 0; border-top: 1px solid #E5E5E5;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
            Happy reading,
          </p>
          <p style="margin: 0; font-size: 14px; font-weight: 500; color: #000000;">
            Life Coach Pro
          </p>
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
        <p>Your ${data.serviceName} session has been scheduled.</p>
        
        <div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-radius: 10px;">
          <h3 style="margin-top: 0;">Session Details:</h3>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.time} (${data.duration} minutes)</p>
          <p><strong>Location:</strong> ${data.location}</p>
          ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 8px; border-left: 4px solid #2196F3;">
          <p><strong>Important:</strong></p>
          <ul>
            <li>Please arrive 5 minutes early</li>
            <li>Bring any materials you want to discuss</li>
            <li>Cancel or reschedule at least 24 hours in advance</li>
          </ul>
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
        <p>This is a friendly reminder about your ${data.serviceName} session tomorrow.</p>
        
        <div style="margin: 25px 0; padding: 20px; background: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
          <p><strong>⏰ ${data.date} at ${data.time}</strong></p>
          ${data.meetingLink ? `<p><strong>🔗 Meeting Link:</strong> <a href="${data.meetingLink}">Click to join</a></p>` : ''}
        </div>
        
        <p>Please let me know if you need to reschedule.</p>
        <p style="margin-top: 30px;">Best regards,<br/>Your Life Coach</p>
      </div>
    `
  }),

  // EVENTS
  eventRegistration: (data: {
    attendeeName: string
    eventTitle: string
    eventDate: string
    eventTime: string
    ticketType: string
    qrCodeUrl?: string
    eventLink?: string
  }) => ({
    subject: `Your Ticket: ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>You're Registered!</h2>
        <p>Dear ${data.attendeeName},</p>
        <p>Thank you for registering for <strong>${data.eventTitle}</strong>.</p>
        
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; border-radius: 12px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; color: white;">Digital Ticket</h3>
          <p style="margin: 5px 0;">${data.ticketType}</p>
          <p style="margin: 5px 0;">📅 ${data.eventDate} | ⏰ ${data.eventTime}</p>
          ${data.qrCodeUrl ? `<img src="${data.qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px; margin: 15px auto; display: block;" />` : ''}
        </div>
        
        ${data.eventLink ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${data.eventLink}" style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              🎟️ Access Event
            </a>
          </div>
        ` : ''}
        
        <p style="margin-top: 30px;">We look forward to seeing you there!<br/>Life Coach Pro Events Team</p>
      </div>
    `
  }),

  // SPEAKING REQUESTS (Admin)
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
          <p><strong>Contact:</strong> ${data.contactName} (${data.contactEmail})</p>
          <p><strong>Proposed Date:</strong> ${data.eventDate}</p>
          <p><strong>Topic:</strong> ${data.topic}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/speaking-requests" 
             style="display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            👀 View Request in Admin
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">This is an automated notification from your Life Coach Pro system.</p>
      </div>
    `
  })
}