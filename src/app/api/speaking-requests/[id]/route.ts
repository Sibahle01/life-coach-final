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

// PATCH - Create booking from speaking request (DISABLED FOR DEMO)
export async function PATCH(request: NextRequest, { params }: Params) {
  return NextResponse.json(
    { 
      success: false, 
      message: 'This feature is currently disabled for demo. Please use the admin panel to create bookings manually.' 
    },
    { status: 200 }
  )
}