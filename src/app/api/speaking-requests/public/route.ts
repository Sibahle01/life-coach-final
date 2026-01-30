// File: /src/app/api/speaking-requests/public/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Public form submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }
    
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    if (!body.eventName) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      )
    }
    
    if (!body.eventDate) {
      return NextResponse.json(
        { error: 'Event date is required' },
        { status: 400 }
      )
    }
    
    if (!body.location) {
      return NextResponse.json(
        { error: 'Event location is required' },
        { status: 400 }
      )
    }
    
    // Generate request number
    const requestNumber = `SR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Combine names
    const fullName = `${body.firstName} ${body.lastName}`.trim()
    
    // Build description with topic
    let description = body.description || ''
    if (body.preferredTopic) {
      description += `\n\nPreferred Speaking Topic: ${body.preferredTopic}`
    }
    
    // Build notes with additional info
    let notes = ''
    if (body.additionalNotes) {
      notes += body.additionalNotes
    }
    if (body.catering) {
      notes += notes ? `\n\nCatering: ${body.catering}` : `Catering: ${body.catering}`
    }
    
    // Create the speaking request
    const speakingRequest = await prisma.speakingRequest.create({
      data: {
        requestNumber,
        organization: body.organization || 'Individual',
        contactPerson: fullName,
        email: body.email,
        phone: body.phone || '',
        eventName: body.eventName,
        eventDate: new Date(body.eventDate),
        eventType: body.preferredTopic || 'general',
        audienceSize: body.attendees ? parseInt(body.attendees) : null,
        location: body.location,
        isVirtual: body.eventFormat === 'virtual',
        description: description.trim(),
        status: 'PENDING',
        notes: notes.trim() || null
      }
    })
    
    // TODO: Send confirmation email (implement later)
    // await sendConfirmationEmail(speakingRequest.email, speakingRequest.requestNumber)
    
    return NextResponse.json({
      success: true,
      requestNumber: speakingRequest.requestNumber,
      message: 'Thank you for your speaking invitation! We will review it and get back to you soon.'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error submitting speaking request:', error)
    return NextResponse.json(
      { error: 'Failed to submit speaking request. Please try again or contact us directly.' },
      { status: 500 }
    )
  }
}

// GET - Optional: For testing or preview (can be removed in production)
export async function GET() {
  return NextResponse.json(
    { message: 'Submit speaking requests via POST method' },
    { status: 200 }
  )
}