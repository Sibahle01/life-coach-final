// File: /src/app/api/availability/[id]/check/route.ts
// FIXED VERSION - WITH DATE PARAMETER SUPPORT

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const slotId = params.id
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date') // Get date from frontend
    
    console.log('=== CHECK API CALLED ===')
    console.log('Slot ID:', slotId)
    console.log('Date param:', dateParam)
    
    // Fetch slot
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId }
    })
    
    if (!slot) {
      return NextResponse.json({ 
        success: false,
        available: false,
        reason: 'Time slot not found',
        code: 'SLOT_NOT_FOUND'
      })
    }
    
    console.log('Slot found:', {
      id: slot.id,
      specificDate: slot.specificDate,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isActive: slot.isActive,
      isBlocked: slot.isBlocked,
      isBlockedByAdmin: slot.isBlockedByAdmin
    })
    
    // Check if slot is blocked (check both fields)
    const isBlocked = slot.isBlocked || slot.isBlockedByAdmin
    
    if (isBlocked) {
      console.log('❌ Slot is blocked')
      return NextResponse.json({
        success: true,
        available: false,
        reason: slot.isBlockedByAdmin 
          ? (slot.blockedReason || 'Slot blocked by admin')
          : 'Slot is unavailable',
        code: slot.isBlockedByAdmin ? 'ADMIN_BLOCKED' : 'SLOT_BLOCKED',
        blockReason: slot.blockedReason,
        isBlockedByAdmin: slot.isBlockedByAdmin,
        isBlocked: slot.isBlocked,
        slotId: slot.id
      })
    }
    
    // Check if slot is active
    if (!slot.isActive) {
      console.log('❌ Slot is not active')
      return NextResponse.json({
        success: true,
        available: false,
        reason: 'Time slot is not active',
        code: 'SLOT_INACTIVE',
        slotId: slot.id
      })
    }
    
    // Check if fully booked
    if (slot.bookingsMade >= slot.maxBookings) {
      console.log('❌ Slot is fully booked:', {
        bookingsMade: slot.bookingsMade,
        maxBookings: slot.maxBookings
      })
      return NextResponse.json({
        success: true,
        available: false,
        reason: 'This time slot is fully booked',
        code: 'FULLY_BOOKED',
        bookingsMade: slot.bookingsMade,
        maxBookings: slot.maxBookings,
        slotId: slot.id,
        time: slot.startTime
      })
    }
    
    // 🔥 CRITICAL FIX: Determine the actual date with UTC handling
    let actualDate: Date | null = null
    
    if (dateParam) {
      // Use date from frontend query parameter (this is the correct approach!)
      // The frontend knows which specific date occurrence it's trying to book
      actualDate = new Date(dateParam + 'T12:00:00Z') // Use noon UTC to avoid timezone issues
      console.log('✅ Using date from frontend param:', actualDate.toISOString())
    } else if (slot.specificDate) {
      // Specific date slot
      actualDate = new Date(slot.specificDate)
      console.log('✅ Using specificDate from slot:', actualDate.toISOString())
    } else if (slot.dayOfWeek !== null) {
      // ⚠️ WARNING: This fallback logic is problematic for recurring slots
      // The frontend should always pass the date parameter for recurring slots
      console.log('⚠️ WARNING: No date param provided for recurring slot')
      
      const today = new Date()
      const todayUTC = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        12, 0, 0
      ))
      
      const targetDay = slot.dayOfWeek // Database: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
      
      // Find next occurrence (including today if it matches)
      actualDate = new Date(todayUTC)
      let daysToAdd = 0
      
      while (actualDate.getUTCDay() !== targetDay) {
        daysToAdd++
        actualDate = new Date(todayUTC)
        actualDate.setUTCDate(todayUTC.getUTCDate() + daysToAdd)
        
        // Safety check: don't loop forever
        if (daysToAdd > 365) {
          console.error('❌ Infinite loop detected finding day of week')
          break
        }
      }
      
      console.log('⚠️ Calculated fallback date:', actualDate.toISOString())
    }
    
    if (!actualDate) {
      console.log('❌ Cannot determine date for slot')
      return NextResponse.json({
        success: true,
        available: false,
        reason: 'Cannot determine date for this slot',
        code: 'DATE_UNDEFINED',
        slotId: slot.id
      })
    }
    
    // 🔥 CRITICAL: Use UTC date string for database queries
    const slotDateStr = actualDate.toISOString().split('T')[0]
    const slotTimeStr = slot.startTime
    
    console.log('🔍 Checking bookings for:', {
      date: slotDateStr,
      time: slotTimeStr,
      slotDateISO: actualDate.toISOString()
    })
    
    // Look for ANY booking at this exact date/time (shared slots - serviceId can be null)
    const existingBookings = await prisma.sessionBooking.findMany({
      where: {
        bookingDate: {
          gte: new Date(slotDateStr + 'T00:00:00Z'), // Use UTC start of day
          lte: new Date(slotDateStr + 'T23:59:59.999Z') // Use UTC end of day
        },
        bookingTime: slotTimeStr,
        status: { not: 'CANCELLED' }
      },
      select: {
        id: true,
        bookingNumber: true,
        clientName: true,
        status: true,
        bookingDate: true,
        bookingTime: true,
        serviceId: true
      }
    })
    
    console.log('📊 Found existing bookings:', existingBookings.length)
    if (existingBookings.length > 0) {
      console.log('Existing bookings details:', existingBookings.map(b => ({
        bookingNumber: b.bookingNumber,
        date: b.bookingDate.toISOString(),
        time: b.bookingTime
      })))
    }
    
    const hasExistingBookings = existingBookings.length > 0
    
    if (hasExistingBookings) {
      console.log('❌ Slot has existing bookings')
      return NextResponse.json({
        success: true,
        available: false,
        reason: 'This time slot is already booked',
        code: 'SLOT_BOOKED',
        existingBookings: existingBookings,
        bookingsCount: existingBookings.length,
        slotId: slot.id,
        time: slot.startTime,
        date: actualDate,
        details: `Found ${existingBookings.length} booking(s) for this time slot`
      })
    }
    
    // Check recurrence end date (if it's a recurring slot)
    if (slot.endDate && actualDate > new Date(slot.endDate)) {
      console.log('❌ Recurring slot has ended:', {
        slotDate: actualDate.toISOString(),
        endDate: slot.endDate.toISOString()
      })
      return NextResponse.json({
        success: true,
        available: false,
        reason: 'Recurring slot has ended',
        code: 'RECURRENCE_ENDED',
        slotId: slot.id,
        endDate: slot.endDate,
        requestedDate: actualDate
      })
    }
    
    // All checks passed - slot is available!
    console.log('✅ Slot is available!')
    return NextResponse.json({
      success: true,
      available: true,
      slot: {
        id: slot.id,
        serviceId: slot.serviceId, // Will be NULL for shared slots
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: actualDate,
        specificDate: slot.specificDate,
        dayOfWeek: slot.dayOfWeek,
        recurrence: slot.recurrence,
        isRecurring: slot.recurrence !== 'none' && slot.dayOfWeek !== null,
        maxBookings: slot.maxBookings,
        bookingsMade: slot.bookingsMade,
        remainingSpots: slot.maxBookings - slot.bookingsMade,
        dateString: slotDateStr
      },
      formattedInfo: {
        date: actualDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        }),
        time: formatTimeForDisplay(slot.startTime),
        duration: formatDuration(slot.startTime, slot.endTime)
      },
      note: 'Slot is available for any service'
    })
    
  } catch (error) {
    console.error('❌ Error checking slot availability:', error)
    
    return NextResponse.json({
      success: false,
      available: false,
      error: 'Failed to check slot availability',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}

// Helper function to format time for display
function formatTimeForDisplay(timeStr: string): string {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  } catch {
    return timeStr
  }
}

// Helper function to calculate and format duration
function formatDuration(startTime: string, endTime: string): string {
  try {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startTotal = startHour * 60 + startMin
    const endTotal = endHour * 60 + endMin
    
    const durationMinutes = endTotal - startTotal
    
    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`
    } else {
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      return minutes > 0 
        ? `${hours}h ${minutes}m` 
        : `${hours} hour${hours > 1 ? 's' : ''}`
    }
  } catch {
    return `${startTime} - ${endTime}`
  }
}