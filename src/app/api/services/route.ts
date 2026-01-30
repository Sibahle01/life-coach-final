// File: /src/app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all services
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
      include: {
        availabilitySlots: true,
        sessionBookings: true
      }
    })
    
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const service = await prisma.service.create({
      data: {
        name: body.name,
        description: body.description,
        duration: parseInt(body.duration),
        price: parseFloat(body.price),
        format: body.format,
        category: body.category,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isFeatured: body.isFeatured || false,
        order: body.order ? parseInt(body.order) : 0,
        imageUrl: body.imageUrl || null
      }
    })
    
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}