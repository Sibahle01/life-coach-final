// File: /src/app/api/events/purchase/route.ts
// COMPLETE VERSION - With Email & QR Code

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email/templates'

export async function POST(request: NextRequest) {
  console.log('🎟️ Purchase route HIT!')
  
  try {
    const body = await request.json()
    console.log('📝 Step 1: Received data:', body)
    
    const {
      eventId,
      quantity,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      specialRequests,
      dietaryNeeds,
      companyName,
      jobTitle
    } = body

    console.log('📝 Step 2: Validation...')
    if (!eventId || !quantity || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('📝 Step 3: Fetching event...')
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })
    console.log('📝 Event found:', event ? event.title : 'NULL')

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    console.log('📝 Step 4: Checking capacity...')
    const seatsAvailable = event.capacity - event.ticketsSold
    console.log(`   Capacity: ${event.capacity}, Sold: ${event.ticketsSold}, Available: ${seatsAvailable}`)
    
    if (quantity > seatsAvailable) {
      return NextResponse.json(
        { error: `Only ${seatsAvailable} seats available` },
        { status: 400 }
      )
    }

    console.log('📝 Step 5: Calculating total...')
    const ticketPrice = parseFloat(event.ticketPrice.toString())
    const totalAmount = ticketPrice * quantity
    console.log(`   Price: R${ticketPrice}, Quantity: ${quantity}, Total: R${totalAmount}`)

    console.log('📝 Step 6: Generating ticket number...')
    const timestamp = Date.now().toString().slice(-6)
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase()
    const ticketNumber = `TKT-${timestamp}-${randomStr}`
    console.log(`   Ticket Number: ${ticketNumber}`)

    console.log('📝 Step 7: Creating ticket in database...')
    const ticket = await prisma.eventTicket.create({
      data: {
        ticketNumber,
        eventId,
        attendeeName,
        attendeeEmail,
        attendeePhone: attendeePhone || null,
        quantity,
        totalAmount,
        paymentStatus: 'PENDING',
        status: 'ACTIVE',
        specialRequests: specialRequests || null,
        dietaryNeeds: dietaryNeeds || null,
        companyName: companyName || null,
        jobTitle: jobTitle || null,
        virtualAccessSent: false
      }
    })
    console.log('✅ Ticket created successfully!')
    console.log('   Ticket ID:', ticket.id)
    console.log('   Ticket Number:', ticket.ticketNumber)

    console.log('📝 Step 8: Updating event tickets sold...')
    await prisma.event.update({
      where: { id: eventId },
      data: {
        ticketsSold: event.ticketsSold + quantity
      }
    })
    console.log('✅ Event updated successfully!')

    // Generate QR code URL using external API
    console.log('📝 Step 9: Generating QR code...')
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketNumber)}`
    console.log('✅ QR Code URL:', qrCodeUrl)

    // Format date for email
    const formatDate = (dateString: Date) => {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Send ticket email
    console.log('📝 Step 10: Sending email...')
    try {
      const emailTemplate = emailTemplates.eventTicket({
        attendeeName,
        eventTitle: event.title,
        eventDate: formatDate(event.eventDate),
        eventTime: event.eventTime,
        location: event.isVirtual ? 'Virtual Event' : (event.venue || event.location),
        venue: event.venue || event.location,
        ticketNumber,
        qrCodeUrl: qrCodeUrl,
        quantity,
        totalAmount,
        isVirtual: event.isVirtual,
        meetingLink: event.meetingLink || undefined
      })

      console.log('📧 Email data prepared, sending to:', attendeeEmail)
      
      await sendEmail({
        to: attendeeEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      })

      console.log('✅ Email sent successfully!')
    } catch (emailError) {
      console.error('⚠️ Email failed (ticket still created):', emailError)
      // Don't throw - ticket was created, email failure shouldn't break the purchase
    }

    console.log('📝 Step 11: Preparing response...')
    const response = {
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        eventTitle: event.title,
        eventDate: event.eventDate.toISOString(),
        eventTime: event.eventTime,
        quantity: ticket.quantity,
        totalAmount: parseFloat(ticket.totalAmount.toString()),
        qrCode: qrCodeUrl
      }
    }
    console.log('✅ Response ready:', response)

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('❌ FATAL ERROR:', error)
    console.error('   Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('   Error message:', error instanceof Error ? error.message : 'Unknown')
    console.error('   Error stack:', error instanceof Error ? error.stack : 'Unknown')
    
    return NextResponse.json(
      { 
        error: 'Failed to process ticket purchase',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}