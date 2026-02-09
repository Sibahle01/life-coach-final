// File: /src/app/api/emails/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    
    let template: any
    
    switch (type) {
      case 'ebook-delivery':
        template = emailTemplates.ebookDelivery(data)
        break
        
      case 'book-order-confirmation':
        template = emailTemplates.bookOrderConfirmation(data)
        break

      case 'event-ticket':
        template = emailTemplates.eventTicket(data)
        break

      case 'booking-confirmation':
        template = emailTemplates.bookingConfirmation(data)
        break

      case 'booking-reminder':
        template = emailTemplates.bookingReminder(data)
        break

      case 'speaking-request':
        template = emailTemplates.newSpeakingRequest(data)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }
    
    // Attempt to find a recipient email in common data fields
    const recipientEmail = data.attendeeEmail || data.customerEmail || data.clientEmail || data.contactEmail || data.to

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email address is missing' },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html
    })
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully'
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
    
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}