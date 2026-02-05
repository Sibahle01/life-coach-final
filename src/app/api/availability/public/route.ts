// File: /src/app/api/availability/public/route.ts
// FINAL FIXED VERSION - WITH COMPLETE UTC HANDLING

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    
    console.log(`=== PUBLIC AVAILABILITY API CALLED ===`)
    console.log(`📊 Query Parameters:`)
    console.log(`  - serviceId: ${serviceId}`)
    console.log(`  - startDate: ${startDateParam}`)
    console.log(`  - endDate: ${endDateParam}`)
    console.log(`  - year: ${year}`)
    console.log(`  - month: ${month}`)
    
    let startDate: Date
    let endDate: Date
    
    // 🔥 CRITICAL FIX: Handle year/month parameters from frontend
    if (year && month) {
      // Frontend is requesting a specific month (e.g., February 2026)
      const yearNum = parseInt(year)
      const monthNum = parseInt(month) - 1 // JavaScript months are 0-indexed
      
      // Create dates in UTC to avoid timezone issues
      startDate = new Date(Date.UTC(yearNum, monthNum, 1, 12, 0, 0)) // First day of month at noon UTC
      endDate = new Date(Date.UTC(yearNum, monthNum + 1, 0, 12, 0, 0)) // Last day of month at noon UTC
      
      console.log(`📅 Using year/month parameters: ${year}-${month}`)
      console.log(`📅 UTC range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    } else if (startDateParam && endDateParam) {
      // Custom date range - parse as UTC dates
      startDate = new Date(startDateParam + 'T12:00:00Z')
      endDate = new Date(endDateParam + 'T12:00:00Z')
      console.log(`📅 Using custom date range`)
    } else {
      // Default: next 90 days
      const now = new Date()
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0))
      
      startDate = today
      endDate = new Date(today)
      endDate.setUTCDate(today.getUTCDate() + 90)
      
      console.log(`📅 Using default range: next 90 days`)
    }
    
    // Set proper time boundaries (keeping noon UTC for consistency)
    console.log(`📅 Final UTC range: ${startDate.toISOString()} to ${endDate.toISOString()}`)
    
    // Default service if none specified
    let actualServiceId = serviceId
    if (!actualServiceId) {
      const firstService = await prisma.service.findFirst({
        where: { isActive: true }
      })
      if (!firstService) {
        return NextResponse.json([])
      }
      actualServiceId = firstService.id
    }
    
    // 🔥 FIXED: Fetch all active slots
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
          // OR recurring slots for WEEKDAYS ONLY (Monday-Friday)
          { 
            dayOfWeek: { 
              in: [1, 2, 3, 4, 5] // Monday=1, Tuesday=2, ..., Friday=5
            }
          }
        ],
        isActive: true,
        serviceId: null  // Shared slots
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            format: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { specificDate: 'asc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })
    
    console.log(`📊 Found ${availabilitySlots.length} slot definitions in database`)
    
    // Log database slots by day
    const dbDayCounts: Record<number, number> = {}
    availabilitySlots.forEach(slot => {
      if (slot.dayOfWeek !== null) {
        dbDayCounts[slot.dayOfWeek] = (dbDayCounts[slot.dayOfWeek] || 0) + 1
      }
    })
    console.log('📅 Database slots by dayOfWeek:', dbDayCounts)
    
    // 🔥 FIXED: Get bookings with proper date handling
    const existingBookings = await prisma.sessionBooking.findMany({
      where: {
        bookingDate: { gte: startDate, lte: endDate },
        status: { 
          notIn: ['CANCELLED']
        }
      },
      select: {
        bookingDate: true,
        bookingTime: true,
        status: true,
        serviceId: true
      }
    })
    
    console.log(`📊 Found ${existingBookings.length} active bookings in range`)
    
    // 🔥 FIXED: Recurring slot generator with UTC day matching
    const generateRecurringOccurrences = (slot: any, startDate: Date, endDate: Date) => {
      if (slot.dayOfWeek === null) return []
      
      const occurrences: Date[] = []
      
      // Database dayOfWeek (1=Monday, 5=Friday) matches JavaScript getUTCDay() (1=Monday, 5=Friday)
      const targetDay = slot.dayOfWeek
      
      console.log(`\n🔍 Generating occurrences for slot with dayOfWeek=${targetDay} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDay]})`)
      
      // Start from the first day of the range (using UTC)
      const current = new Date(startDate)
      
      // Find first occurrence of this day of week in the range (using UTC)
      while (current.getUTCDay() !== targetDay && current <= endDate) {
        current.setUTCDate(current.getUTCDate() + 1)
      }
      
      // If no occurrence found in range, return empty
      if (current > endDate) {
        console.log(`  ❌ No occurrences found in date range`)
        return []
      }
      
      console.log(`  ✅ First occurrence: ${current.toISOString()} (UTC day: ${current.getUTCDay()})`)
      
      // Generate all occurrences in range
      while (current <= endDate) {
        // Check if recurrence has ended
        if (slot.endDate && current > new Date(slot.endDate)) {
          break
        }
        
        // Add the occurrence (clone the date)
        occurrences.push(new Date(current))
        console.log(`    Added: ${current.toISOString()} (UTC day: ${current.getUTCDay()})`)
        
        // Move to next occurrence based on recurrence type (using UTC)
        if (slot.recurrence === 'biweekly') {
          current.setUTCDate(current.getUTCDate() + 14)
        } else {
          // Default to weekly
          current.setUTCDate(current.getUTCDate() + 7)
        }
      }
      
      console.log(`  Total occurrences: ${occurrences.length}`)
      return occurrences
    }
    
    // Format response - expand recurring slots into specific dates
    const allFormattedSlots = []
    
    for (const slot of availabilitySlots) {
      let datesToProcess: Date[] = []
      
      if (slot.specificDate) {
        // Specific date slot - convert to UTC date at noon
        const specificDate = new Date(slot.specificDate)
        const utcDate = new Date(Date.UTC(
          specificDate.getUTCFullYear(),
          specificDate.getUTCMonth(),
          specificDate.getUTCDate(),
          12, 0, 0
        ))
        datesToProcess = [utcDate]
        console.log(`📌 Specific date slot: ${utcDate.toISOString()}`)
      } else if (slot.dayOfWeek !== null) {
        // Recurring slot - generate occurrences
        datesToProcess = generateRecurringOccurrences(slot, startDate, endDate)
      }
      
      // Process each date occurrence
      for (const date of datesToProcess) {
        // Get UTC date components
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        const timeStr = slot.startTime
        const jsDay = date.getUTCDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat (UTC)
        
        // 🔥 DEBUG: Track Friday slots (using UTC)
        if (jsDay === 5) {
          console.log(`🎯 FRIDAY SLOT FOUND: ${dateStr} at ${timeStr} (DB dayOfWeek=${slot.dayOfWeek}, UTC day=${jsDay})`)
        }
        
        // Skip if date is in the past (but for calendar view, we want all dates)
        const slotDateTime = new Date(dateStr + 'T' + timeStr + 'Z') // Treat as UTC
        const now = new Date()
        
        // Check if slot is booked - use UTC date string comparison
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
        
        // Check BOTH blocking fields
        const isBlocked = slot.isBlocked || slot.isBlockedByAdmin
        const isFullyBooked = slot.bookingsMade >= slot.maxBookings
        const isActive = slot.isActive
        
        // Format times for display
        const timeParts = timeStr.split(':')
        const hour = parseInt(timeParts[0])
        const minute = timeParts[1]
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        const formattedTime = `${displayHour}:${minute} ${ampm}`
        
        // Calculate end time
        const endTimeParts = slot.endTime.split(':')
        const endHour = parseInt(endTimeParts[0])
        const endMinute = endTimeParts[1]
        const endAmpm = endHour >= 12 ? 'PM' : 'AM'
        const endDisplayHour = endHour % 12 || 12
        const formattedEndTime = `${endDisplayHour}:${endMinute} ${endAmpm}`
        
        // Calculate duration
        const startTotal = hour * 60 + parseInt(minute)
        const endTotal = endHour * 60 + parseInt(endMinute)
        const durationMinutes = endTotal - startTotal
        
        // Determine availability
        const isAvailable = !isBooked && !isBlocked && !isFullyBooked && isActive
        
        allFormattedSlots.push({
          id: slot.id,
          serviceId: slot.serviceId,
          serviceName: slot.service?.name,
          serviceDuration: slot.service?.duration,
          servicePrice: slot.service?.price ? Number(slot.service.price) : null,
          serviceFormat: slot.service?.format,
          date: dateStr,
          time: timeStr,
          endTime: slot.endTime,
          // Format date using UTC timezone
          formattedDate: date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC'
          }),
          formattedTime: `${formattedTime} - ${formattedEndTime}`,
          formattedTimeShort: formattedTime,
          duration: durationMinutes,
          isAvailable,
          isBlocked,
          isFullyBooked,
          isBooked,
          isRecurring: slot.dayOfWeek !== null,
          recurrence: slot.recurrence,
          maxBookings: slot.maxBookings,
          bookingsMade: slot.bookingsMade,
          remainingSpots: Math.max(0, slot.maxBookings - slot.bookingsMade),
          blockedReason: slot.blockedReason,
          blockedByAdmin: slot.isBlockedByAdmin,
          // Metadata for debugging
          metadata: {
            isBlockedField: slot.isBlocked,
            isBlockedByAdminField: slot.isBlockedByAdmin,
            isActive,
            slotType: slot.specificDate ? 'specific' : 'recurring',
            dayOfWeek: slot.dayOfWeek,
            jsDayOfWeek: jsDay,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][jsDay]
          }
        })
      }
    }
    
    // Sort all slots by date and time
    allFormattedSlots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })
    
    // Group by date for easier consumption
    const groupedByDate = allFormattedSlots.reduce((acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = []
      }
      acc[slot.date].push(slot)
      return acc
    }, {} as Record<string, typeof allFormattedSlots>)
    
    // Sort slots within each date by time
    Object.keys(groupedByDate).forEach(date => {
      groupedByDate[date].sort((a, b) => a.time.localeCompare(b.time))
    })
    
    // 🔥 Calculate Friday slots specifically (using UTC)
    const fridaySlots = allFormattedSlots.filter(slot => {
      const date = new Date(slot.date + 'T12:00:00Z')
      return date.getUTCDay() === 5 // Friday in UTC
    })
    
    const availableFridaySlots = fridaySlots.filter(slot => slot.isAvailable)
    const bookedFridaySlots = fridaySlots.filter(slot => slot.isBooked)
    
    // Calculate summary statistics
    const availableCount = allFormattedSlots.filter(s => s.isAvailable).length
    const blockedCount = allFormattedSlots.filter(s => s.isBlocked).length
    const bookedCount = allFormattedSlots.filter(s => s.isBooked).length
    const fullyBookedCount = allFormattedSlots.filter(s => s.isFullyBooked).length
    
    // Log day distribution (using UTC)
    const dayDistribution = allFormattedSlots.reduce((acc, slot) => {
      const date = new Date(slot.date + 'T12:00:00Z')
      const dayName = date.toLocaleDateString('en-US', { 
        weekday: 'long',
        timeZone: 'UTC'
      })
      acc[dayName] = (acc[dayName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log(`\n📊 FINAL SUMMARY:`)
    console.log(`   Total slots generated: ${allFormattedSlots.length}`)
    console.log(`   Friday slots total: ${fridaySlots.length}`)
    console.log(`   Friday slots available: ${availableFridaySlots.length}`)
    console.log(`   Friday slots booked: ${bookedFridaySlots.length}`)
    console.log(`   Available: ${availableCount}`)
    console.log(`   Blocked: ${blockedCount}`)
    console.log(`   Booked: ${bookedCount}`)
    console.log(`   Fully booked: ${fullyBookedCount}`)
    console.log(`   Dates with slots: ${Object.keys(groupedByDate).length}`)
    console.log(`   Day distribution:`, dayDistribution)
    
    // Check specific Fridays in February 2026
    const febFridays = ['2026-02-06', '2026-02-13', '2026-02-20', '2026-02-27']
    console.log('\n🔍 Checking February 2026 Fridays:')
    febFridays.forEach(friday => {
      const slots = groupedByDate[friday] || []
      const available = slots.filter(s => s.isAvailable).length
      const booked = slots.filter(s => s.isBooked).length
      console.log(`  ${friday}: ${slots.length} total, ${available} available, ${booked} booked`)
    })
    
    // Return comprehensive response
    return NextResponse.json({
      slots: allFormattedSlots,
      groupedByDate,
      summary: {
        totalSlots: allFormattedSlots.length,
        available: availableCount,
        blocked: blockedCount,
        booked: bookedCount,
        fullyBooked: fullyBookedCount,
        fridaySlots: fridaySlots.length,
        availableFridaySlots: availableFridaySlots.length,
        bookedFridaySlots: bookedFridaySlots.length,
        dateRange: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        },
        serviceId: actualServiceId,
        generatedAt: new Date().toISOString(),
        dayDistribution,
        timezoneInfo: {
          processingTimezone: 'UTC',
          localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching public availability:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch availability',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}