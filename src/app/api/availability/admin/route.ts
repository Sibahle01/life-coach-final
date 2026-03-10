import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    
    console.log(`=== ADMIN AVAILABILITY API CALLED ===`)
    console.log(`📊 Query Parameters: year=${year}, month=${month}`)
    
    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      )
    }
    
    const yearNum = parseInt(year)
    const monthNum = parseInt(month) - 1
    
    // Create dates in UTC
    const startDate = new Date(Date.UTC(yearNum, monthNum, 1, 12, 0, 0))
    const endDate = new Date(Date.UTC(yearNum, monthNum + 1, 0, 12, 0, 0))
    
    console.log(`📅 UTC range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    
    // 🔥 CRITICAL: Fetch ALL slots including inactive/blocked ones
    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        OR: [
          // Specific dates within range
          { 
            specificDate: { 
              gte: startDate, 
              lte: endDate 
            } 
          },
          // OR recurring slots for WEEKDAYS ONLY
          { 
            dayOfWeek: { 
              in: [1, 2, 3, 4, 5]
            }
          }
        ],
        // NO isActive filter here - we want ALL slots!
        serviceId: null  // Shared slots
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { specificDate: 'asc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })
    
    console.log(`📊 Found ${availabilitySlots.length} slots (including inactive/blocked)`)
    
    // Get bookings
    const existingBookings = await prisma.sessionBooking.findMany({
      where: {
        bookingDate: { gte: startDate, lte: endDate },
        status: { notIn: ['CANCELLED'] }
      },
      select: {
        bookingDate: true,
        bookingTime: true,
        status: true
      }
    })
    
    // Generate recurring occurrences (same logic as public API)
    const generateRecurringOccurrences = (slot: any, startDate: Date, endDate: Date) => {
      if (slot.dayOfWeek === null) return []
      
      const occurrences: Date[] = []
      const targetDay = slot.dayOfWeek
      const current = new Date(startDate)
      
      while (current.getUTCDay() !== targetDay && current <= endDate) {
        current.setUTCDate(current.getUTCDate() + 1)
      }
      
      if (current > endDate) return []
      
      while (current <= endDate) {
        if (slot.endDate && current > new Date(slot.endDate)) {
          break
        }
        occurrences.push(new Date(current))
        
        if (slot.recurrence === 'biweekly') {
          current.setUTCDate(current.getUTCDate() + 14)
        } else {
          current.setUTCDate(current.getUTCDate() + 7)
        }
      }
      
      return occurrences
    }
    
    // Format response
    const allFormattedSlots = []
    
    for (const slot of availabilitySlots) {
      let datesToProcess: Date[] = []
      
      if (slot.specificDate) {
        const specificDate = new Date(slot.specificDate)
        const utcDate = new Date(Date.UTC(
          specificDate.getUTCFullYear(),
          specificDate.getUTCMonth(),
          specificDate.getUTCDate(),
          12, 0, 0
        ))
        datesToProcess = [utcDate]
      } else if (slot.dayOfWeek !== null) {
        datesToProcess = generateRecurringOccurrences(slot, startDate, endDate)
      }
      
      for (const date of datesToProcess) {
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        const timeStr = slot.startTime
        
        // Check if slot is booked
        const isBooked = existingBookings.some(
          booking => {
            const bookingDate = new Date(booking.bookingDate)
            const bookingYear = bookingDate.getUTCFullYear()
            const bookingMonth = String(bookingDate.getUTCMonth() + 1).padStart(2, '0')
            const bookingDay = String(bookingDate.getUTCDate()).padStart(2, '0')
            const bookingDateStr = `${bookingYear}-${bookingMonth}-${bookingDay}`
            
            return bookingDateStr === dateStr && booking.bookingTime === timeStr
          }
        )
        
        const isBlocked = slot.isBlocked || slot.isBlockedByAdmin
        const isFullyBooked = slot.bookingsMade >= slot.maxBookings
        const isActive = slot.isActive
        
        // Format times
        const timeParts = timeStr.split(':')
        const hour = parseInt(timeParts[0])
        const minute = timeParts[1]
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        
        const endTimeParts = slot.endTime.split(':')
        const endHour = parseInt(endTimeParts[0])
        const endMinute = endTimeParts[1]
        const endAmpm = endHour >= 12 ? 'PM' : 'AM'
        const endDisplayHour = endHour % 12 || 12
        
        allFormattedSlots.push({
          id: slot.id,
          serviceName: slot.service?.name,
          date: dateStr,
          time: timeStr,
          endTime: slot.endTime,
          formattedTime: `${displayHour}:${minute} ${ampm} - ${endDisplayHour}:${endMinute} ${endAmpm}`,
          isAvailable: !isBooked && !isBlocked && !isFullyBooked && isActive,
          isBlocked,
          isBooked,
          isFullyBooked,
          blockedByAdmin: slot.isBlockedByAdmin,
          blockedReason: slot.blockedReason,
          bookingsMade: slot.bookingsMade || 0,
          maxBookings: slot.maxBookings || 1,
          isActive: slot.isActive,
          // For debugging
          metadata: {
            isBlockedField: slot.isBlocked,
            isBlockedByAdminField: slot.isBlockedByAdmin,
            isActiveField: slot.isActive
          }
        })
      }
    }
    
    // Group by date
    const groupedByDate = allFormattedSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot)
      return acc
    }, {} as Record<string, typeof allFormattedSlots>)
    
    // Sort slots within each date
    Object.keys(groupedByDate).forEach(date => {
      groupedByDate[date].sort((a, b) => a.time.localeCompare(b.time))
    })
    
    // Calculate stats
    const availableCount = allFormattedSlots.filter(s => s.isAvailable).length
    const blockedCount = allFormattedSlots.filter(s => s.isBlocked).length
    const bookedCount = allFormattedSlots.filter(s => s.isBooked).length
    
    console.log(`📊 Admin stats: ${allFormattedSlots.length} total, ${availableCount} available, ${blockedCount} blocked, ${bookedCount} booked`)
    
    return NextResponse.json({
      groupedByDate,
      summary: {
        totalSlots: allFormattedSlots.length,
        available: availableCount,
        blocked: blockedCount,
        booked: bookedCount
      }
    })
    
  } catch (error) {
    console.error('❌ Error in admin availability API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin availability' },
      { status: 500 }
    )
  }
}