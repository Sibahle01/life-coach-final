import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const result = await sendEmail({
      to: body.to,
      subject: body.subject || 'Speaking Request Confirmation',
      html: body.html || '<p>Your speaking request has been received.</p>'
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )

  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}