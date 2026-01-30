// File: /src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const isFeatured = searchParams.get('featured')
    
    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (isFeatured && isFeatured !== 'all') {
      where.isFeatured = isFeatured === 'true'
    }
    
    const events = await prisma.event.findMany({
      where,
      include: {
        tickets: true
      },
      orderBy: { eventDate: 'asc' },
    })
    
    // Convert for response
    const eventsWithFormattedData = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate.toISOString(),
      eventTime: event.eventTime,
      endDate: event.endDate?.toISOString(),
      endTime: event.endTime,
      location: event.location,
      venue: event.venue,
      address: event.address,
      isVirtual: event.isVirtual,
      meetingLink: event.meetingLink,
      category: event.category,
      capacity: event.capacity,
      ticketsSold: event.ticketsSold,
      ticketPrice: parseFloat(event.ticketPrice.toString()),
      posterImageUrl: event.posterImageUrl,
      galleryImages: event.galleryImages,
      status: event.status,
      isFeatured: event.isFeatured,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      tickets: event.tickets.map(ticket => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        eventId: ticket.eventId,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        attendeePhone: ticket.attendeePhone,
        quantity: ticket.quantity,
        totalAmount: parseFloat(ticket.totalAmount.toString()),
        paymentStatus: ticket.paymentStatus,
        status: ticket.status,
        specialRequests: ticket.specialRequests,
        dietaryNeeds: ticket.dietaryNeeds,
        companyName: ticket.companyName,
        jobTitle: ticket.jobTitle,
        virtualAccessSent: ticket.virtualAccessSent,
        virtualLink: ticket.virtualLink,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString()
      }))
    }))
    
    return NextResponse.json(eventsWithFormattedData)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        eventDate: new Date(body.eventDate),
        eventTime: body.eventTime,
        endDate: body.endDate ? new Date(body.endDate) : null,
        endTime: body.endTime,
        location: body.location,
        venue: body.venue,
        address: body.address,
        isVirtual: body.isVirtual || false,
        meetingLink: body.meetingLink,
        category: body.category,
        capacity: parseInt(body.capacity),
        ticketPrice: parseFloat(body.ticketPrice),
        posterImageUrl: body.posterImageUrl,
        galleryImages: body.galleryImages || [],
        status: body.status || 'UPCOMING',
        isFeatured: body.isFeatured || false
      },
    })
    
    // Convert for response
    const responseEvent = {
      id: event.id,
      title: event.title,
      description: event.description,
      eventDate: event.eventDate.toISOString(),
      eventTime: event.eventTime,
      endDate: event.endDate?.toISOString(),
      endTime: event.endTime,
      location: event.location,
      venue: event.venue,
      address: event.address,
      isVirtual: event.isVirtual,
      meetingLink: event.meetingLink,
      category: event.category,
      capacity: event.capacity,
      ticketsSold: event.ticketsSold,
      ticketPrice: parseFloat(event.ticketPrice.toString()),
      posterImageUrl: event.posterImageUrl,
      galleryImages: event.galleryImages,
      status: event.status,
      isFeatured: event.isFeatured,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      tickets: []
    }
    
    return NextResponse.json(responseEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}