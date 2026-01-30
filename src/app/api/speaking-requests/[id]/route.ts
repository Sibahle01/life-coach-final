// File: /src/app/api/speaking-requests/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// GET single speaking request
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const speakingRequest = await prisma.speakingRequest.findUnique({
      where: { id: params.id },
      include: {
        respondedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        booking: {
          include: {
            service: {
              select: {
                name: true,
                category: true,
                price: true
              }
            }
          }
        }
      }
    })
    
    if (!speakingRequest) {
      return NextResponse.json(
        { error: 'Speaking request not found' },
        { status: 404 }
      )
    }
    
    // Convert for response
    const responseRequest = {
      id: speakingRequest.id,
      requestNumber: speakingRequest.requestNumber,
      organization: speakingRequest.organization,
      contactPerson: speakingRequest.contactPerson,
      email: speakingRequest.email,
      phone: speakingRequest.phone,
      eventName: speakingRequest.eventName,
      eventDate: speakingRequest.eventDate?.toISOString(),
      eventType: speakingRequest.eventType,
      audienceSize: speakingRequest.audienceSize,
      duration: speakingRequest.duration,
      budget: speakingRequest.budget ? parseFloat(speakingRequest.budget.toString()) : null,
      location: speakingRequest.location,
      isVirtual: speakingRequest.isVirtual,
      description: speakingRequest.description,
      status: speakingRequest.status,
      notes: speakingRequest.notes,
      respondedById: speakingRequest.respondedById,
      responseDate: speakingRequest.responseDate?.toISOString(),
      responseNotes: speakingRequest.responseNotes,
      bookingId: speakingRequest.bookingId,
      createdAt: speakingRequest.createdAt.toISOString(),
      updatedAt: speakingRequest.updatedAt.toISOString(),
      respondedBy: speakingRequest.respondedBy,
      booking: speakingRequest.booking ? {
        id: speakingRequest.booking.id,
        bookingNumber: speakingRequest.booking.bookingNumber,
        bookingDate: speakingRequest.booking.bookingDate.toISOString(),
        status: speakingRequest.booking.status,
        service: speakingRequest.booking.service ? {
          ...speakingRequest.booking.service,
          price: parseFloat(speakingRequest.booking.service.price.toString())
        } : null
      } : null
    }
    
    return NextResponse.json(responseRequest)
  } catch (error) {
    console.error('Error fetching speaking request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch speaking request' },
      { status: 500 }
    )
  }
}

// PUT update speaking request
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    const speakingRequest = await prisma.speakingRequest.update({
      where: { id: params.id },
      data: {
        organization: body.organization,
        contactPerson: body.contactPerson,
        email: body.email,
        phone: body.phone,
        eventName: body.eventName,
        eventDate: body.eventDate ? new Date(body.eventDate) : null,
        eventType: body.eventType,
        audienceSize: body.audienceSize ? parseInt(body.audienceSize) : null,
        duration: body.duration ? parseInt(body.duration) : null,
        budget: body.budget ? parseFloat(body.budget) : null,
        location: body.location,
        isVirtual: body.isVirtual,
        description: body.description,
        status: body.status,
        notes: body.notes,
        respondedById: body.respondedById || null,
        responseDate: body.responseDate ? new Date(body.responseDate) : null,
        responseNotes: body.responseNotes
      },
      include: {
        respondedBy: {
          select: {
            name: true,
            email: true
          }
        },
        booking: {
          include: {
            service: true
          }
        }
      }
    })
    
    // Convert for response
    const responseRequest = {
      id: speakingRequest.id,
      requestNumber: speakingRequest.requestNumber,
      organization: speakingRequest.organization,
      contactPerson: speakingRequest.contactPerson,
      email: speakingRequest.email,
      phone: speakingRequest.phone,
      eventName: speakingRequest.eventName,
      eventDate: speakingRequest.eventDate?.toISOString(),
      eventType: speakingRequest.eventType,
      audienceSize: speakingRequest.audienceSize,
      duration: speakingRequest.duration,
      budget: speakingRequest.budget ? parseFloat(speakingRequest.budget.toString()) : null,
      location: speakingRequest.location,
      isVirtual: speakingRequest.isVirtual,
      description: speakingRequest.description,
      status: speakingRequest.status,
      notes: speakingRequest.notes,
      respondedById: speakingRequest.respondedById,
      responseDate: speakingRequest.responseDate?.toISOString(),
      responseNotes: speakingRequest.responseNotes,
      bookingId: speakingRequest.bookingId,
      createdAt: speakingRequest.createdAt.toISOString(),
      updatedAt: speakingRequest.updatedAt.toISOString(),
      respondedBy: speakingRequest.respondedBy,
      booking: speakingRequest.booking ? {
        id: speakingRequest.booking.id,
        bookingNumber: speakingRequest.booking.bookingNumber,
        bookingDate: speakingRequest.booking.bookingDate.toISOString(),
        status: speakingRequest.booking.status,
        service: speakingRequest.booking.service ? {
          ...speakingRequest.booking.service,
          price: parseFloat(speakingRequest.booking.service.price.toString())
        } : null
      } : null
    }
    
    return NextResponse.json(responseRequest)
  } catch (error) {
    console.error('Error updating speaking request:', error)
    return NextResponse.json(
      { error: 'Failed to update speaking request' },
      { status: 500 }
    )
  }
}

// DELETE speaking request
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await prisma.speakingRequest.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting speaking request:', error)
    return NextResponse.json(
      { error: 'Failed to delete speaking request' },
      { status: 500 }
    )
  }
}

// PATCH - Create booking from speaking request
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    // First get the speaking request
    const speakingRequest = await prisma.speakingRequest.findUnique({
      where: { id: params.id },
      include: {
        respondedBy: true
      }
    })
    
    if (!speakingRequest) {
      return NextResponse.json(
        { error: 'Speaking request not found' },
        { status: 404 }
      )
    }
    
    // Find the "Invite to Speak" service
    const speakService = await prisma.service.findFirst({
      where: {
        name: { contains: 'Invite to Speak', mode: 'insensitive' }
      }
    })
    
    if (!speakService) {
      return NextResponse.json(
        { error: 'Invite to Speak service not found. Please create it first.' },
        { status: 404 }
      )
    }
    
    // Generate booking number
    const bookingNumber = `BK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Create the booking
    const booking = await prisma.sessionBooking.create({
      data: {
        bookingNumber,
        serviceId: speakService.id,
        clientName: speakingRequest.contactPerson,
        clientEmail: speakingRequest.email,
        clientPhone: speakingRequest.phone || '',
        companyName: speakingRequest.organization,
        eventDetails: speakingRequest.description,
        attendees: speakingRequest.audienceSize || 1,
        bookingDate: speakingRequest.eventDate || new Date(),
        bookingTime: '10:00', // Default time
        duration: speakingRequest.duration || 60,
        format: speakingRequest.isVirtual ? 'virtual' : 'in-person',
        paymentStatus: 'PENDING',
        amountPaid: speakingRequest.budget || 0,
        status: 'PENDING',
        location: speakingRequest.location,
        notes: `Converted from speaking request #${speakingRequest.requestNumber}`
      }
    })
    
    // Update the speaking request with booking reference
    const updatedRequest = await prisma.speakingRequest.update({
      where: { id: params.id },
      data: {
        bookingId: booking.id,
        status: 'ACCEPTED',
        respondedById: body.respondedById || speakingRequest.respondedById,
        responseDate: new Date(),
        responseNotes: body.responseNotes || 'Converted to booking'
      },
      include: {
        respondedBy: {
          select: {
            name: true,
            email: true
          }
        },
        booking: {
          include: {
            service: true
          }
        }
      }
    })
    
    // Convert for response
    const responseRequest = {
      id: updatedRequest.id,
      requestNumber: updatedRequest.requestNumber,
      organization: updatedRequest.organization,
      contactPerson: updatedRequest.contactPerson,
      email: updatedRequest.email,
      phone: updatedRequest.phone,
      eventName: updatedRequest.eventName,
      eventDate: updatedRequest.eventDate?.toISOString(),
      eventType: updatedRequest.eventType,
      audienceSize: updatedRequest.audienceSize,
      duration: updatedRequest.duration,
      budget: updatedRequest.budget ? parseFloat(updatedRequest.budget.toString()) : null,
      location: updatedRequest.location,
      isVirtual: updatedRequest.isVirtual,
      description: updatedRequest.description,
      status: updatedRequest.status,
      notes: updatedRequest.notes,
      respondedById: updatedRequest.respondedById,
      responseDate: updatedRequest.responseDate?.toISOString(),
      responseNotes: updatedRequest.responseNotes,
      bookingId: updatedRequest.bookingId,
      createdAt: updatedRequest.createdAt.toISOString(),
      updatedAt: updatedRequest.updatedAt.toISOString(),
      respondedBy: updatedRequest.respondedBy,
      booking: updatedRequest.booking ? {
        id: updatedRequest.booking.id,
        bookingNumber: updatedRequest.booking.bookingNumber,
        bookingDate: updatedRequest.booking.bookingDate.toISOString(),
        status: updatedRequest.booking.status,
        service: updatedRequest.booking.service ? {
          ...updatedRequest.booking.service,
          price: parseFloat(updatedRequest.booking.service.price.toString())
        } : null
      } : null
    }
    
    return NextResponse.json(responseRequest)
  } catch (error) {
    console.error('Error converting speaking request to booking:', error)
    return NextResponse.json(
      { error: 'Failed to convert speaking request to booking' },
      { status: 500 }
    )
  }
}