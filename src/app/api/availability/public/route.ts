// File: /src/app/api/availability/public/route.ts - MORE AGGRESSIVE CHECKING
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    
    // Get the next 14 days
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Start of today
    
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    
    // Default service if none specified
    if (!serviceId) {
      const firstService = await prisma.service.findFirst({
        where: { isActive: true }
      })
      if (!firstService) {
        return NextResponse.json([])
      }
      // Continue with first service
    }
    
    // Fetch availability slots for the next 14 days
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        OR: [
          { specificDate: { gte: today, lte: twoWeeksLater } },
          { dayOfWeek: { not: null } }
        ],
        isActive: true
      },
      include: {
        service: true
      },
      orderBy: [
        { specificDate: 'asc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })
    
    // 🔥 CRITICAL: Get ALL non-cancelled bookings (including PENDING)
    // This prevents double-booking when multiple people book at the same time
    const existingBookings = await prisma.sessionBooking.findMany({
      where: {
        bookingDate: { gte: today, lte: twoWeeksLater },
        serviceId: serviceId || undefined,
        // IMPORTANT: Include ALL active statuses
        status: { 
          notIn: ['CANCELLED'] // Explicitly exclude only CANCELLED
        }
      },
      select: {
        bookingDate: true,
        bookingTime: true,
        status: true
      }
    })
    
    console.log(`📊 Availability check: Found ${existingBookings.length} active bookings`)
    
    // Format response
    const formattedSlots = availabilitySlots.map(slot => {
      let date: Date
      
      if (slot.specificDate) {
        date = new Date(slot.specificDate)
      } else if (slot.dayOfWeek !== null) {
        // Calculate next occurrence of this day
        const dayIndex = slot.dayOfWeek
        const todayDay = today.getDay()
        let daysToAdd = dayIndex - todayDay
        if (daysToAdd < 0) daysToAdd += 7
        
        date = new Date(today)
        date.setDate(today.getDate() + daysToAdd)
      } else {
        // Should not happen
        date = today
      }
      
      const dateStr = date.toISOString().split('T')[0]
      const timeStr = slot.startTime
      
      // Check if slot is booked (ANY non-cancelled booking counts)
      const isBooked = existingBookings.some(
        booking => 
          booking.bookingDate.toISOString().split('T')[0] === dateStr &&
          booking.bookingTime === timeStr
      )
      
      // Check if slot is blocked by admin
      const isBlocked = slot.isBlockedByAdmin || slot.bookingsMade >= slot.maxBookings
      
      // Format times for display
      const timeParts = timeStr.split(':')
      const hour = parseInt(timeParts[0])
      const minute = timeParts[1]
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      const formattedTime = `${displayHour}:${minute} ${ampm}`
      
      return {
        id: slot.id,
        date: dateStr,
        time: timeStr,
        formattedDate: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        formattedTime,
        isAvailable: !isBooked && !isBlocked,
        isBlocked: isBlocked
      }
    }).filter(slot => {
      // Filter out past dates and times
      const slotDate = new Date(slot.date + 'T' + slot.time)
      const isNotPast = slotDate >= new Date()
      
      // Filter out weekends (Saturday = 6, Sunday = 0)
      const slotDateObj = new Date(slot.date)
      const dayOfWeek = slotDateObj.getDay()
      const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6
      
      return isNotPast && isWeekday
    })
    
    // If no slots found, return empty array
    return NextResponse.json(formattedSlots)
    
  } catch (error) {
    console.error('Error fetching public availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}