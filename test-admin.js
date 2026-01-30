const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAdminUser() {
  try {
    console.log('1. Testing AdminUser model access...')
    
    // Count AdminUsers
    const count = await prisma.adminUser.count()
    console.log(`2. AdminUser count: ${count}`)
    
    if (count === 0) {
      console.log('3. No admin users found. Creating one...')
      // We'll need bcrypt for this, but let's first check if model works
      console.log('4. AdminUser model IS accessible!')
    }
    
    // Test MenuItem model (we know this works)
    const menuCount = await prisma.menuItem.count()
    console.log(`5. MenuItem count: ${menuCount}`)
    
    // Show some menu items
    if (menuCount > 0) {
      const items = await prisma.menuItem.findMany({ take: 2 })
      console.log('6. Sample menu items:', items.map(i => ({ id: i.id, name: i.name })))
    }
    
  } catch (error) {
    console.error(' Error:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminUser()
