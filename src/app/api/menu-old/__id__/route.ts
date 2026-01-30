import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const menuItem = await prisma.menuItem.findUnique({ where: { id } })
    
    if (!menuItem) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(menuItem)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    if (!data.name || !data.description || !data.price || !data.category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        category: data.category,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}