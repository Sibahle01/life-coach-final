const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    const admin = await prisma.adminUser.findFirst()
    console.log('Current admin user:')
    console.log('- ID:', admin?.id)
    console.log('- Email:', admin?.email)
    console.log('- Name:', admin?.name)
    console.log('- Role:', admin?.role)
    console.log('- Created:', admin?.createdAt)
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
