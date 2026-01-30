// File: /src/app/api/session-bookings/[id]/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// GET single booking
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        speakingRequest: true
      }
    })
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PATCH update booking - UPDATED TO HANDLE TRAVEL DISTANCE CALCULATION
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    console.log('🔧 Admin updating booking:', params.id, body)
    
    // Special handling for travel distance calculation
    if (body.travelDistanceKm !== undefined) {
      // Get current booking to calculate session amount
      const existingBooking = await prisma.sessionBooking.findUnique({
        where: { id: params.id },
        include: { service: true }
      })
      
      if (!existingBooking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
      
      // Calculate travel fee (R6.50 per km)
      const travelDistanceKm = parseFloat(body.travelDistanceKm)
      const travelRatePerKm = 6.50
      
      // IMPORTANT: Convert Decimal to number for calculation
      const travelAmount = travelDistanceKm * travelRatePerKm
      
      // Get session amount - convert Decimal to number
      const sessionAmount = existingBooking.sessionAmount 
        ? parseFloat(existingBooking.sessionAmount.toString()) 
        : parseFloat(existingBooking.service.price.toString())
      
      const totalAmount = sessionAmount + travelAmount
      
      console.log('💰 Travel calculation:', {
        distance: travelDistanceKm,
        rate: travelRatePerKm,
        travelFee: travelAmount,
        sessionFee: sessionAmount,
        total: totalAmount
      })
      
      const booking = await prisma.sessionBooking.update({
        where: { id: params.id },
        data: {
          travelDistanceKm: travelDistanceKm,
          travelAmount: travelAmount,
          totalAmount: totalAmount,
          // Also update notes to record the calculation
          notes: existingBooking.notes 
            ? `${existingBooking.notes}\n[Travel fee calculated: ${travelDistanceKm}km × R${travelRatePerKm} = R${travelAmount.toFixed(2)}]`
            : `[Travel fee calculated: ${travelDistanceKm}km × R${travelRatePerKm} = R${travelAmount.toFixed(2)}]`
        },
        include: {
          service: true
        }
      })
      
      return NextResponse.json(booking)
    }
    
    // Handle other updates normally
    const updateData: any = {
      status: body.status,
      paymentStatus: body.paymentStatus,
      meetingLink: body.meetingLink,
      reminderSent: body.reminderSent,
      confirmationSent: body.confirmationSent,
      notes: body.notes
    }
    
    // Convert Decimal fields properly
    if (body.sessionAmount !== undefined) {
      updateData.sessionAmount = parseFloat(body.sessionAmount)
    }
    
    if (body.travelAmount !== undefined) {
      updateData.travelAmount = parseFloat(body.travelAmount)
    }
    
    if (body.totalAmount !== undefined) {
      updateData.totalAmount = parseFloat(body.totalAmount)
    }
    
    const booking = await prisma.sessionBooking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        service: true
      }
    })
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE booking
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await prisma.sessionBooking.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}