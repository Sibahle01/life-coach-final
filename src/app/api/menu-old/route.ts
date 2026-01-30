// src/app/api/menu/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all menu items
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: {
        order: 'asc' // Sort by order field
      }
    })
    
    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST - Create new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      name,
      description,
      price,
      category,
      imageUrl,
      isSpicy = false,
      isVegetarian = false,
      isAvailable = true,
      isFeatured = false,
      order = 0
    } = body

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: price.toString(), // Convert to string for Decimal type
        category,
        imageUrl: imageUrl || null,
        isSpicy,
        isVegetarian,
        isAvailable,
        isFeatured,
        order
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}