import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, reason, action } = body // action: 'block' or 'unblock'
    
    // Validate input
    if (!date || !action) {
      return NextResponse.json(
        { error: 'Date and action are required' },
        { status: 400 }
      )
    }
    
    // Get admin user
    const admin = await prisma.adminUser.findFirst()
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 401 }
      )
    }
    
    // Convert date to start and end of day
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)
    
    // Find all slots for this date
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        OR: [
          // Specific date slots
          { specificDate: { gte: startDate, lte: endDate } },
          // Weekly recurring slots for this day of week
          {
            dayOfWeek: startDate.getDay(),
            specificDate: null
          }
        ]
      }
    })
    
    if (slots.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No slots found for this date',
        affectedSlots: 0
      })
    }
    
    // Update each slot based on action
    const updatedSlots = []
    for (const slot of slots) {
      const updatedSlot = await prisma.availabilitySlot.update({
        where: { id: slot.id },
        data: {
          isBlockedByAdmin: action === 'block',
          blockedReason: action === 'block' ? (reason || 'Day blocked by admin') : null,
          blockedByAdminId: action === 'block' ? admin.id : null,
          blockedAt: action === 'block' ? new Date() : null,
          isActive: action !== 'block', // Deactivate when blocking
        }
      })
      updatedSlots.push(updatedSlot)
    }
    
    return NextResponse.json({
      success: true,
      message: `${action === 'block' ? 'Blocked' : 'Unblocked'} ${updatedSlots.length} slots for ${date}`,
      affectedSlots: updatedSlots.length,
      action
    })
    
  } catch (error) {
    console.error('Error in bulk action:', error)
    return NextResponse.json(
      { error: 'Failed to process bulk action' },
      { status: 500 }
    )
  }
}