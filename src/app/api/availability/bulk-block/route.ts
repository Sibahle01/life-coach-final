import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, reason, action } = body // action: 'block' or 'unblock'
    
    console.log(`🔧 BULK ${action.toUpperCase()} REQUEST:`, { date, reason, action })
    
    // Validate input
    if (!date || !action) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Date and action are required',
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      )
    }
    
    // Validate action
    if (action !== 'block' && action !== 'unblock') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Action must be either "block" or "unblock"',
          code: 'INVALID_ACTION' 
        },
        { status: 400 }
      )
    }
    
    // Get admin user
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
          error: 'Admin authentication required',
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      )
    }
    
    // Parse date
    const targetDate = new Date(`${date}T12:00:00Z`)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid date format',
          code: 'INVALID_DATE' 
        },
        { status: 400 }
      )
    }
    
    // Get day of week (0=Sunday, 1=Monday, etc.)
    const jsDay = targetDate.getUTCDay() // 0=Sunday
    const dbDayOfWeek = jsDay === 0 ? 7 : jsDay // Convert to 1=Monday format
    
    console.log(`📅 Target date: ${date} (Day ${dbDayOfWeek} - ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][jsDay]})`)
    
    // ===========================================
    // STEP 1: Find all slots for this specific date
    // ===========================================
    
    // First, get specific date slots that already exist
    const existingSpecificSlots = await prisma.availabilitySlot.findMany({
      where: {
        specificDate: targetDate,
        serviceId: null // Shared slots
      }
    })
    
    console.log(`📊 Found ${existingSpecificSlots.length} existing specific date slots`)
    
    // Get recurring slots for this day of week
    const recurringSlots = await prisma.availabilitySlot.findMany({
      where: {
        dayOfWeek: dbDayOfWeek,
        specificDate: null,
        serviceId: null // Shared slots
      }
    })
    
    console.log(`📊 Found ${recurringSlots.length} recurring slots for day ${dbDayOfWeek}`)
    
    // For recurring slots, we need to check if specific date exceptions exist
    // If they don't exist, we need to create them
    
    const slotsToProcess: Array<{
      id?: string;
      startTime: string;
      endTime: string;
      maxBookings: number;
      serviceId: string | null;
      isRecurring: boolean;
    }> = []
    
    for (const recurringSlot of recurringSlots) {
      // Check if a specific date slot already exists for this time
      const existingSlot = existingSpecificSlots.find(
        s => s.startTime === recurringSlot.startTime && s.serviceId === recurringSlot.serviceId
      )
      
      if (existingSlot) {
        // Use the existing specific date slot
        slotsToProcess.push({
          id: existingSlot.id,
          startTime: existingSlot.startTime,
          endTime: existingSlot.endTime,
          maxBookings: existingSlot.maxBookings,
          serviceId: existingSlot.serviceId,
          isRecurring: false
        })
      } else {
        // No specific date slot exists - we'll need to create one
        slotsToProcess.push({
          startTime: recurringSlot.startTime,
          endTime: recurringSlot.endTime,
          maxBookings: recurringSlot.maxBookings,
          serviceId: recurringSlot.serviceId,
          isRecurring: true
        })
      }
    }
    
    console.log(`📊 Total slots to process: ${slotsToProcess.length}`)
    
    if (slotsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No slots found for this date',
        affectedSlots: 0,
        action,
        date
      })
    }
    
    // For blocking: Check for active bookings
    if (action === 'block') {
      console.log(`🔍 Checking for active bookings on ${date}...`)
      const slotsWithBookings = []
      
      for (const slot of slotsToProcess) {
        const activeBookings = await prisma.sessionBooking.count({
          where: {
            bookingTime: slot.startTime,
            bookingDate: {
              gte: new Date(`${date}T00:00:00Z`),
              lte: new Date(`${date}T23:59:59.999Z`)
            },
            status: { notIn: ['CANCELLED', 'NO_SHOW'] }
          }
        })
        
        if (activeBookings > 0) {
          slotsWithBookings.push({
            time: slot.startTime,
            activeBookings
          })
          console.log(`⚠️ Slot at ${slot.startTime} has ${activeBookings} active bookings`)
        }
      }
      
      if (slotsWithBookings.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Cannot block slots with active bookings',
          code: 'HAS_ACTIVE_BOOKINGS',
          slotsWithBookings,
          affectedSlots: slotsWithBookings.length
        }, { status: 409 })
      }
    }
    
    // ===========================================
    // STEP 2: Process each slot using the SAME logic as individual block API
    // ===========================================
    
    const successful: any[] = []
    const failed: any[] = []
    
    for (const slot of slotsToProcess) {
      try {
        if (action === 'block') {
          // BLOCK ACTION
          
          let slotId: string
          
          if (slot.id) {
            // Existing specific date slot - update it
            slotId = slot.id
            
            const updatedSlot = await prisma.availabilitySlot.update({
              where: { id: slotId },
              data: {
                isBlockedByAdmin: true,
                blockedReason: reason?.trim() || 'Day blocked by admin',
                blockedByAdminId: admin.id,
                blockedAt: new Date(),
                isActive: false,
                updatedAt: new Date()
              }
            })
            
            console.log(`✅ Updated existing slot ${slotId} for ${date} at ${slot.startTime}`)
            
          } else {
            // Need to create a new specific date slot and block it
            const newSlot = await prisma.availabilitySlot.create({
              data: {
                specificDate: targetDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                dayOfWeek: null, // Specific date, not recurring
                recurrence: 'none',
                maxBookings: slot.maxBookings,
                bookingsMade: 0,
                isBlockedByAdmin: true,
                blockedReason: reason?.trim() || 'Day blocked by admin',
                blockedByAdminId: admin.id,
                blockedAt: new Date(),
                isActive: false,
                serviceId: slot.serviceId,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
            
            slotId = newSlot.id
            console.log(`✅ Created and blocked new slot ${slotId} for ${date} at ${slot.startTime}`)
          }
          
          successful.push({
            slotId,
            time: slot.startTime,
            action: 'blocked'
          })
          
        } else {
          // UNBLOCK ACTION
          
          if (slot.id) {
            // Existing specific date slot - unblock it
            const updatedSlot = await prisma.availabilitySlot.update({
              where: { id: slot.id },
              data: {
                isBlockedByAdmin: false,
                blockedReason: null,
                blockedByAdminId: null,
                blockedAt: null,
                isActive: true,
                updatedAt: new Date()
              }
            })
            
            console.log(`✅ Unblocked existing slot ${slot.id} for ${date} at ${slot.startTime}`)
            successful.push({
              slotId: slot.id,
              time: slot.startTime,
              action: 'unblocked'
            })
            
          } else {
            // No specific date slot exists, so nothing to unblock
            console.log(`ℹ️ No specific slot to unblock for ${date} at ${slot.startTime}`)
            successful.push({
              time: slot.startTime,
              action: 'already_unblocked'
            })
          }
        }
      } catch (error: any) {
        console.error(`❌ Error processing slot at ${slot.startTime}:`, error.message)
        failed.push({
          time: slot.startTime,
          error: error.message
        })
      }
    }
    
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    })
    
    console.log(`✅ BULK ${action.toUpperCase()} COMPLETE:`, {
      totalSlots: slotsToProcess.length,
      successful: successful.length,
      failed: failed.length,
      date: date
    })
    
    return NextResponse.json({
      success: true,
      message: `${action === 'block' ? 'Blocked' : 'Unblocked'} ${successful.length} time slots for ${formattedDate}`,
      summary: {
        totalSlots: slotsToProcess.length,
        successful: successful.length,
        failed: failed.length,
        action,
        date,
        formattedDate,
        admin: {
          name: admin.name,
          email: admin.email
        },
        reason: reason || (action === 'block' ? 'Day blocked by admin' : 'Day unblocked by admin')
      },
      successfulSlots: successful,
      ...(failed.length > 0 && {
        failedSlots: failed,
        warning: `${failed.length} slots could not be processed`
      })
    })
    
  } catch (error: any) {
    console.error('❌ Error in bulk block action:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process bulk action',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}