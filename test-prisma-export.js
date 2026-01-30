// Test if your prisma.ts export works
const { prisma } = require('../src/lib/prisma')

async function test() {
  try {
    console.log('Testing prisma export from src/lib/prisma.ts...')
    const admin = await prisma.adminUser.findFirst()
    console.log(' AdminUser found:', admin?.email)
  } catch (error) {
    console.error(' Error:', error.message)
  }
}

test()
