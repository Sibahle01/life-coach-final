// scripts/clear-menu.ts
// Run this script to delete all menu items from the database

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearMenuItems() {
  try {
    console.log('🗑️  Starting to clear all menu items...')
    
    // Delete all menu items
    const result = await prisma.menuItem.deleteMany({})
    
    console.log(`✅ Successfully deleted ${result.count} menu items`)
    console.log('📝 You can now add new items through the admin panel at /admin/menu/new')
    
  } catch (error) {
    console.error('❌ Error clearing menu items:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearMenuItems()
  .then(() => {
    console.log('✨ Database cleared successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to clear database:', error)
    process.exit(1)
  })