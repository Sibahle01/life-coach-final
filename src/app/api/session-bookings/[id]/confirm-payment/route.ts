import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    const { paymentMethod, status, paymentStatus } = body
    
    // First get the booking to know the total amount
    const existingBooking = await prisma.sessionBooking.findUnique({
      where: { id: params.id },
      select: { totalAmount: true }
    })
    
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Update booking with ALL payment fields
    const booking = await prisma.sessionBooking.update({
      where: { id: params.id },
      data: {
        status: status || 'CONFIRMED',
        paymentStatus: paymentStatus || 'PAID',
        paymentMethod: paymentMethod || 'simulated',
        paymentVerifiedAt: new Date(),
        confirmationSent: true,
        // CRITICAL: Update amountPaid to match totalAmount
        amountPaid: existingBooking.totalAmount
      },
      include: {
        service: true
      }
    })
    
    // TODO: Send confirmation email
    // TODO: Generate calendar invite
    // TODO: Send notification to admin
    
    return NextResponse.json({
      success: true,
      booking,
      message: 'Payment confirmed successfully'
    })
    
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment', details: error.message },
      { status: 500 }
    )
  }
}