// src/app/api/reservations/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { reservationDate: 'desc' }
    })
    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 1. Validate required fields: Added 'time' to validation
    if (!data.customerName || !data.customerEmail || !data.reservationDate || !data.partySize || !data.time) {
      return NextResponse.json(
        { error: 'Missing required fields (name, email, date, time, party size)' },
        { status: 400 }
      )
    }

    const partySizeInt = parseInt(data.partySize)
    
    // 2. Validate party size
    if (isNaN(partySizeInt) || partySizeInt < 1 || partySizeInt > 20) {
      return NextResponse.json(
        { error: 'Party size must be a number between 1 and 20' },
        { status: 400 }
      )
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        // Convert date string to JavaScript Date object for DateTime field
        reservationDate: new Date(data.reservationDate),
        time: data.time, // Mapped to the 'time' field in Prisma schema
        partySize: partySizeInt, // Use the parsed integer
        specialRequests: data.specialRequests || null,
        // Use 'PENDING' to match the schema default
        status: data.status || 'PENDING' 
      }
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error('Error creating reservation:', error)
    // You might want to check for unique constraint violations (e.g., if you added a unique constraint on time/date/etc.)
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}