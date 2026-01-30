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
    const body = await request.json()
    const { block, reason } = body
    
    // For now, use first admin until auth is implemented
    const admin = await prisma.adminUser.findFirst()
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 401 }
      )
    }
    
    // Check if slot exists first
    const existingSlot = await prisma.availabilitySlot.findUnique({
      where: { id: params.id }
    })
    
    if (!existingSlot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      )
    }
    
    const updatedSlot = await prisma.availabilitySlot.update({
      where: { id: params.id },
      data: {
        isBlockedByAdmin: block,
        blockedReason: reason || null,
        blockedByAdminId: block ? admin.id : null,
        blockedAt: block ? new Date() : null,
        isActive: !block, // Also update isActive for consistency
      }
    })
    
    return NextResponse.json({
      success: true,
      slot: updatedSlot
    })
    
  } catch (error) {
    console.error('Error blocking slot:', error)
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    )
  }
}

// POST alternative (optional, but good to have)
export async function POST(request: NextRequest, { params }: Params) {
  return PATCH(request, { params })
}