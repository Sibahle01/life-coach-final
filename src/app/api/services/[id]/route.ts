// File: /src/app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// GET single service
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        availabilitySlots: true,
        sessionBookings: true
      }
    })
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// PUT update service
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        duration: parseInt(body.duration),
        price: parseFloat(body.price),
        format: body.format,
        category: body.category,
        isActive: body.isActive,
        isFeatured: body.isFeatured,
        order: body.order ? parseInt(body.order) : 0,
        imageUrl: body.imageUrl || null
      }
    })
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE service
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await prisma.service.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}