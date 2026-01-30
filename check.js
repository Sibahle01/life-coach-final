const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  try {
    const admin = await prisma.adminUser.findFirst()
    console.log('Admin found:', admin ? 'YES' : 'NO')
    if (admin) {
      console.log('Email:', admin.email)
      console.log('Name:', admin.name)
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.\()
  }
}

check()
