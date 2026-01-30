// File: /src/app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// GET single event
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        tickets: true
      }
    })
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
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
    }
    
    return NextResponse.json(responseEvent)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT update event
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    const event = await prisma.event.update({
      where: { id: params.id },
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
        isVirtual: body.isVirtual,
        meetingLink: body.meetingLink,
        category: body.category,
        capacity: parseInt(body.capacity),
        ticketPrice: parseFloat(body.ticketPrice),
        posterImageUrl: body.posterImageUrl,
        galleryImages: body.galleryImages,
        status: body.status,
        isFeatured: body.isFeatured
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
      updatedAt: event.updatedAt.toISOString()
    }
    
    return NextResponse.json(responseEvent)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE event
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // First delete all tickets (due to foreign key constraint)
    await prisma.eventTicket.deleteMany({
      where: { eventId: params.id }
    })
    
    // Then delete the event
    await prisma.event.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}