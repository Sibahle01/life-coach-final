// prisma/seed.ts

import { PrismaClient } from '@prisma/client'

// Initialize the Prisma Client
const prisma = new PrismaClient()

// Array of menu items with updated URLs and details
const menuItems = [
  // APPETIZERS
  {
    name: 'Samosas',
    description: 'Crispy pastry filled with spiced potatoes and peas, served with tamarind chutney',
    price: 85.00,
    category: 'APPETIZERS',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop&auto=format',
    isFeatured: true,
    isVegetarian: true,
    isSpicy: true,
    order: 1,
  },
  {
    name: 'Chakalaka Dip',
    description: 'Spicy vegetable relish served with warm bread',
    price: 75.00,
    category: 'APPETIZERS',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&auto=format',
    isFeatured: false,
    isVegetarian: true,
    isSpicy: true,
    order: 2,
  },
  
  // MAIN COURSES
  {
    name: 'Braised Oxtail',
    description: 'Slow-cooked oxtail with aromatic spices, served with pap and chakalaka',
    price: 280.00,
    category: 'MAIN_COURSES',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&auto=format',
    isFeatured: true,
    isVegetarian: false,
    isSpicy: true,
    order: 3,
  },
  {
    name: 'Bobotie',
    description: 'Traditional Cape Malay spiced minced meat bake with egg custard topping',
    price: 220.00,
    category: 'MAIN_COURSES',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop&auto=format',
    isFeatured: true,
    isVegetarian: false,
    isSpicy: false,
    order: 4,
  },
  {
    name: 'Vegetarian Bunny Chow',
    description: 'Hollowed bread loaf filled with spiced lentil curry',
    price: 180.00,
    category: 'MAIN_COURSES',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d9d6?w=800&h=600&fit=crop&auto=format',
    isFeatured: false,
    isVegetarian: true,
    isSpicy: true,
    order: 5,
  },
  
  // DESSERTS
  {
    name: 'Malva Pudding',
    description: 'Traditional South African sweet pudding with apricot jam, served with custard',
    price: 120.00,
    category: 'DESSERTS',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop&auto=format',
    isFeatured: true,
    isVegetarian: true,
    isSpicy: false,
    order: 6,
  },
  
  // DRINKS
  {
    name: 'Rooibos Tea',
    description: 'Traditional South African herbal tea',
    price: 45.00,
    category: 'DRINKS',
    imageUrl: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=800&h=600&fit=crop&auto=format',
    isFeatured: false,
    isVegetarian: true,
    isSpicy: false,
    order: 7,
  },
  {
    name: 'Springbokkie Shot',
    description: 'Layered peppermint and Amarula cream liqueur',
    price: 65.00,
    category: 'DRINKS',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=600&fit=crop&auto=format',
    isFeatured: true,
    isVegetarian: true,
    isSpicy: false,
    order: 8,
  },
]

/**
 * Main function to seed the database
 */
async function main() {
  console.log('Start seeding the menu items...')

  // 1. Optional: Delete all existing data to prevent duplicates
  await prisma.menuItem.deleteMany({}) 
  console.log('Cleared existing MenuItem records.')

  // 2. Create new menu items
  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.create({
      data: item,
    })
    console.log(`Created menu item with id: ${menuItem.id} (${menuItem.name})`)
  }

  console.log('Menu item seeding finished.')
}

// Execute the main seeding function
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Disconnect Prisma Client
    await prisma.$disconnect()
  })