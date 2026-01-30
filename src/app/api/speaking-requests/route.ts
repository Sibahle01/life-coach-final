// File: /src/app/api/speaking-requests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all speaking requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const eventType = searchParams.get('eventType')
    const responded = searchParams.get('responded')
    
    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (eventType && eventType !== 'all') {
      where.eventType = eventType
    }
    
    if (responded && responded !== 'all') {
      if (responded === 'yes') {
        where.respondedById = { not: null }
      } else {
        where.respondedById = null
      }
    }
    
    const speakingRequests = await prisma.speakingRequest.findMany({
      where,
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
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    
    // Convert for response
    const requestsWithFormattedData = speakingRequests.map(request => ({
      id: request.id,
      requestNumber: request.requestNumber,
      organization: request.organization,
      contactPerson: request.contactPerson,
      email: request.email,
      phone: request.phone,
      eventName: request.eventName,
      eventDate: request.eventDate?.toISOString(),
      eventType: request.eventType,
      audienceSize: request.audienceSize,
      duration: request.duration,
      budget: request.budget ? parseFloat(request.budget.toString()) : null,
      location: request.location,
      isVirtual: request.isVirtual,
      description: request.description,
      status: request.status,
      notes: request.notes,
      respondedById: request.respondedById,
      responseDate: request.responseDate?.toISOString(),
      responseNotes: request.responseNotes,
      bookingId: request.bookingId,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      respondedBy: request.respondedBy ? {
        id: request.respondedBy.id,
        name: request.respondedBy.name,
        email: request.respondedBy.email
      } : null,
      booking: request.booking ? {
        id: request.booking.id,
        bookingNumber: request.booking.bookingNumber,
        bookingDate: request.booking.bookingDate.toISOString(),
        status: request.booking.status,
        service: request.booking.service
      } : null
    }))
    
    return NextResponse.json(requestsWithFormattedData)
  } catch (error) {
    console.error('Error fetching speaking requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch speaking requests' },
      { status: 500 }
    )
  }
}

// POST new speaking request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const speakingRequest = await prisma.speakingRequest.create({
      data: {
        requestNumber: `SR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
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
        isVirtual: body.isVirtual || false,
        description: body.description,
        status: body.status || 'PENDING',
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
      respondedBy: speakingRequest.respondedBy
    }
    
    return NextResponse.json(responseRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating speaking request:', error)
    return NextResponse.json(
      { error: 'Failed to create speaking request' },
      { status: 500 }
    )
  }
}