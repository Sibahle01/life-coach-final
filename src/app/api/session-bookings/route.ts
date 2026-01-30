// File: /src/app/api/session-bookings/route.ts - FIXED WITH OPTIMISTIC LOCKING
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to get system config value
async function getConfigValue(key: string): Promise<number> {
  const config = await prisma.systemConfig.findUnique({
    where: { key }
  });
  return config ? parseFloat(config.value) : 0;
}

// GET all session bookings
export async function GET() {
  try {
    const bookings = await prisma.sessionBooking.findMany({
      orderBy: { bookingDate: 'desc' },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching session bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session bookings' },
      { status: 500 }
    )
  }
}

// POST new session booking - WITH PROPER OPTIMISTIC LOCKING
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📥 Booking request received:', {
      serviceId: body.serviceId,
      date: body.bookingDate,
      time: body.bookingTime,
      meetingType: body.meetingType
    })
    
    // Get service details for price calculation
    const service = await prisma.service.findUnique({
      where: { id: body.serviceId }
    })
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    // Get travel configuration
    const travelRatePerKm = await getConfigValue('travel_rate_per_km')
    
    // Validate meeting type and travel details
    const meetingType = body.meetingType || 'virtual'
    let travelDistanceKm = body.travelDistanceKm ? parseFloat(body.travelDistanceKm) : null
    let travelAmount = 0
    let sessionAmount = parseFloat(service.price.toString())
    let totalAmount = sessionAmount
    let location = body.location || null
    
    // Handle travel pricing
    if (meetingType === 'coach_travels') {
      // Client requirement: User provides address, admin calculates distance later
      // Validate address is provided
      if (!location || location.trim() === '') {
        return NextResponse.json(
          { error: 'Address is required when coach travels to you' },
          { status: 400 }
        )
      }
      
      // Set travelDistanceKm to null (admin will fill later)
      travelDistanceKm = null
      travelAmount = 0 // Set to 0 initially, admin will update
      totalAmount = sessionAmount // Only session fee for now
      
      console.log('🚗 Coach travel booking - Address provided:', location)
      console.log('💰 Travel fee to be calculated later by admin')
      
    } else if (meetingType === 'client_travels') {
      // Client travels to coach - no travel fee
      travelDistanceKm = null
      travelAmount = 0
      totalAmount = sessionAmount
      location = "Client will travel to coach's location"
    } else {
      // Virtual session - no travel
      travelDistanceKm = null
      travelAmount = 0
      totalAmount = sessionAmount
      location = "Virtual session"
    }
    
    // Generate booking number
    const bookingNumber = `BK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // 🔥 CRITICAL FIX: Use transaction with proper locking
    const booking = await prisma.$transaction(async (tx) => {
      // 1. First, check if slot is available (WITHIN TRANSACTION)
      const slotTaken = await tx.sessionBooking.findFirst({
        where: {
          serviceId: body.serviceId,
          bookingDate: new Date(body.bookingDate),
          bookingTime: body.bookingTime,
          status: { not: 'CANCELLED' }
        }
      })
      
      if (slotTaken) {
        console.log('❌ Slot already taken in transaction check:', {
          existingBooking: slotTaken.bookingNumber,
          status: slotTaken.status
        })
        throw new Error('SLOT_TAKEN')
      }
      
      // 2. Create the booking
      return await tx.sessionBooking.create({
        data: {
          bookingNumber,
          serviceId: body.serviceId,
          clientName: body.clientName,
          clientEmail: body.clientEmail,
          clientPhone: body.clientPhone || '',
          companyName: body.companyName || null,
          eventDetails: body.eventDetails || null,
          attendees: parseInt(body.attendees || '1'),
          bookingDate: new Date(body.bookingDate),
          bookingTime: body.bookingTime,
          duration: parseInt(body.duration),
          format: body.format,
          
          // New travel pricing fields
          meetingType: meetingType,
          travelDistanceKm: travelDistanceKm,
          travelAmount: travelAmount,
          sessionAmount: sessionAmount,
          location: location,
          
          // Existing required fields
          sessionType: body.sessionType || 'single',
          numberOfSessions: parseInt(body.numberOfSessions || '1'),
          totalAmount: totalAmount,
          goals: body.goals || null,
          termsAccepted: Boolean(body.termsAccepted),
          currency: body.currency || 'ZAR',
          
          // Payment and status fields
          paymentStatus: body.paymentStatus || 'PENDING',
          amountPaid: parseFloat(body.amountPaid || '0'),
          status: body.status || 'PENDING',
          
          // Optional fields
          meetingLink: body.meetingLink || null,
          notes: body.notes || null,
          specialRequests: body.specialRequests || null
        },
        include: {
          service: true
        }
      })
    }, {
      // Transaction configuration for better locking
      maxWait: 5000, // Max wait for lock: 5 seconds
      timeout: 10000 // Timeout: 10 seconds
    })
    
    console.log('✅ Booking created successfully:', {
      bookingNumber: booking.bookingNumber,
      meetingType: booking.meetingType,
      location: booking.location,
      sessionAmount: booking.sessionAmount,
      travelAmount: booking.travelAmount,
      totalAmount: booking.totalAmount
    })
    
    return NextResponse.json(booking, { status: 201 })
    
  } catch (error) {
    console.error('Error creating session booking:', error)
    
    // Handle specific error cases
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { 
          error: 'Sorry, this time slot was just booked by another client. Please go back and choose a different time.',
          code: 'SLOT_TAKEN'
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create session booking', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}