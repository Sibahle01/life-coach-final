import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    // Validate if reservation exists
    const existing = await prisma.reservation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        customerName: data.customerName || existing.customerName,
        customerEmail: data.customerEmail || existing.customerEmail,
        customerPhone: data.customerPhone !== undefined ? data.customerPhone : existing.customerPhone,
        reservationDate: data.reservationDate ? new Date(data.reservationDate) : existing.reservationDate,
        time: data.time || existing.time,
        partySize: data.partySize || existing.partySize,
        specialRequests: data.specialRequests !== undefined ? data.specialRequests : existing.specialRequests,
        status: data.status || existing.status
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.reservation.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    )
  }
}