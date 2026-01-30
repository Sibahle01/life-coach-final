// src/app/api/menu/clear/route.ts
// API endpoint to clear all menu items (use with caution!)

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE() {
  try {
    // Delete all menu items
    const result = await prisma.menuItem.deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} menu items`,
      deletedCount: result.count
    })
    
  } catch (error) {
    console.error('Error clearing menu items:', error)
    return NextResponse.json(
      { error: 'Failed to clear menu items' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}