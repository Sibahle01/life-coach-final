const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Testing database connection...')
    
    // Try to query something simple
    const result = await prisma.$queryRaw`SELECT version()`
    console.log(' PostgreSQL version:', result[0]?.version)
    
    // Check if our database exists
    const dbCheck = await prisma.$queryRaw`SELECT current_database()`
    console.log(' Connected to database:', dbCheck[0]?.current_database)
    
  } catch (error) {
    console.error(' Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
