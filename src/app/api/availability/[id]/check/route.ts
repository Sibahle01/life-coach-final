// File: /src/app/api/availability/[id]/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slotId = params.id
    
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        service: true
      }
    })
    
    if (!slot) {
      return NextResponse.json({ available: false }, { status: 404 })
    }
    
    // Check if slot is booked
    const existingBooking = await prisma.sessionBooking.findFirst({
      where: {
        serviceId: slot.serviceId,
        bookingDate: slot.specificDate || new Date(), // Simplified for this example
        bookingTime: slot.startTime,
        status: { not: 'CANCELLED' }
      }
    })
    
    const isAvailable = !existingBooking && !slot.isBlockedByAdmin
    
    return NextResponse.json({
      available: isAvailable,
      slotId: slot.id,
      serviceId: slot.serviceId,
      time: slot.startTime
    })
    
  } catch (error) {
    console.error('Error checking slot:', error)
    return NextResponse.json(
      { error: 'Failed to check slot availability' },
      { status: 500 }
    )
  }
}