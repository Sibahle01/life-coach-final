import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// PATCH to block/unblock availability slot
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const slotId = params.id
    
    // Validate slot ID
    if (!slotId || typeof slotId !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid slot ID' 
        },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const { block, reason } = body
    
    // Validate required fields
    if (typeof block !== 'boolean') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Block field is required and must be boolean' 
        },
        { status: 400 }
      )
    }
    
    // For now, use first admin until auth is implemented
    // In production, you'd get admin from session/cookie
    const admin = await prisma.adminUser.findFirst({
      select: {
        id: true,
        name: true,
        email: true
      }
    })
    
    if (!admin) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin authentication required' 
        },
        { status: 401 }
      )
    }
    
    // Check if slot exists first
    const existingSlot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        service: {
          select: {
            name: true
          }
        }
      }
    })
    
    if (!existingSlot) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Time slot not found' 
        },
        { status: 404 }
      )
    }
    
    // Check if slot is already in the desired state
    if (existingSlot.isBlockedByAdmin === block) {
      return NextResponse.json({
        success: true,
        message: `Slot is already ${block ? 'blocked' : 'unblocked'}`,
        slot: existingSlot,
        action: 'no_change'
      })
    }
    
    // Check if slot has existing bookings
    if (block && existingSlot.bookingsMade > 0) {
      // Get active bookings for this slot
      const activeBookings = await prisma.sessionBooking.findMany({
        where: {
          serviceId: existingSlot.serviceId,
          bookingDate: existingSlot.specificDate || undefined,
          bookingTime: existingSlot.startTime,
          status: { not: 'CANCELLED' }
        }
      })
      
      if (activeBookings.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Cannot block slot with active bookings',
          bookings: activeBookings.map(b => ({
            id: b.id,
            bookingNumber: b.bookingNumber,
            clientName: b.clientName,
            status: b.status
          }))
        }, { status: 409 })
      }
    }
    
    // Update the slot
    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id: slotId },
      data: {
        isBlockedByAdmin: block,
        blockedReason: block ? (reason?.trim() || 'Blocked by admin') : null,
        blockedByAdminId: block ? admin.id : null,
        blockedAt: block ? new Date() : null,
        isActive: !block, // Also update isActive for consistency
        
        // If unblocking, also reset bookings counter if needed
        bookingsMade: block ? existingSlot.bookingsMade : existingSlot.bookingsMade
      },
      include: {
        service: {
          select: {
            id: true,
            name: true
          }
        },
        blockedByAdmin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    // Log the action for audit trail
    console.log(`📋 Slot ${block ? 'blocked' : 'unblocked'}:`, {
      slotId: updatedSlot.id,
      service: updatedSlot.service?.name,
      date: updatedSlot.specificDate || `Weekly (Day ${updatedSlot.dayOfWeek})`,
      time: updatedSlot.startTime,
      admin: admin.email,
      reason: reason || 'No reason provided'
    })
    
    return NextResponse.json({
      success: true,
      message: `Time slot successfully ${block ? 'blocked' : 'unblocked'}`,
      slot: {
        id: updatedSlot.id,
        serviceId: updatedSlot.serviceId,
        serviceName: updatedSlot.service?.name,
        startTime: updatedSlot.startTime,
        endTime: updatedSlot.endTime,
        isBlockedByAdmin: updatedSlot.isBlockedByAdmin,
        blockedReason: updatedSlot.blockedReason,
        blockedByAdmin: updatedSlot.blockedByAdmin?.name,
        blockedAt: updatedSlot.blockedAt,
        bookingsMade: updatedSlot.bookingsMade,
        maxBookings: updatedSlot.maxBookings,
        isActive: updatedSlot.isActive
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error blocking slot:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Slot not found in database' 
        },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database constraint violation' 
        },
        { status: 409 }
      )
    }
    
    // Database connection error
    if (error.code === 'P1001' || error.code === 'P1017') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed. Please try again.' 
        },
        { status: 503 }
      )
    }
    
    // Generic error
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update time slot',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// POST alternative (some clients may use POST instead of PATCH)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    // Forward to PATCH handler
    return PATCH(request, { params })
  } catch (error) {
    console.error('Error in POST handler:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request' 
      },
      { status: 500 }
    )
  }
}

// GET to check slot status
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const slotId = params.id
    
    // Validate slot ID
    if (!slotId || typeof slotId !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid slot ID' 
        },
        { status: 400 }
      )
    }
    
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      select: {
        id: true,
        serviceId: true,
        startTime: true,
        endTime: true,
        specificDate: true,
        dayOfWeek: true,
        isBlockedByAdmin: true,
        blockedReason: true,
        blockedByAdminId: true,
        blockedAt: true,
        bookingsMade: true,
        maxBookings: true,
        isActive: true,
        recurrence: true,
        service: {
          select: {
            name: true,
            duration: true,
            price: true
          }
        },
        blockedByAdmin: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!slot) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Time slot not found' 
        },
        { status: 404 }
      )
    }
    
    // Check if slot has bookings
    const activeBookings = await prisma.sessionBooking.count({
      where: {
        serviceId: slot.serviceId,
        bookingDate: slot.specificDate || undefined,
        bookingTime: slot.startTime,
        status: { not: 'CANCELLED' }
      }
    })
    
    // Calculate availability
    const isFullyBooked = slot.bookingsMade >= slot.maxBookings
    const isAvailable = !slot.isBlockedByAdmin && !isFullyBooked && slot.isActive
    
    return NextResponse.json({
      success: true,
      slot: {
        ...slot,
        hasActiveBookings: activeBookings > 0,
        activeBookingsCount: activeBookings,
        isFullyBooked,
        isAvailable,
        // Format date for display
        formattedDate: slot.specificDate 
          ? new Date(slot.specificDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : slot.dayOfWeek !== null
          ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek]
          : 'Custom date',
        // Format time for display
        formattedTime: formatTimeDisplay(slot.startTime, slot.endTime)
      }
    })
    
  } catch (error: any) {
    console.error('Error fetching slot:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch slot information' 
      },
      { status: 500 }
    )
  }
}

// Helper function to format time display
function formatTimeDisplay(startTime: string, endTime: string): string {
  try {
    const formatTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
    }
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  } catch {
    return `${startTime} - ${endTime}`
  }
}