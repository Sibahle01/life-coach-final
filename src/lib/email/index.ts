// File: /src/lib/email/index.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const from = process.env.RESEND_FROM_EMAIL || 'Life Coach Pro <notifications@lifecoachpro.co.za>'
    
    const response = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo
    })

    console.log('📧 Email sent:', response.data?.id)
    return { success: true, id: response.data?.id }
    
  } catch (error) {
    console.error('📧 Email failed:', error)
    return { success: false, error }
  }
}