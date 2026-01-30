const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdminFields() {
  try {
    const admin = await prisma.adminUser.findFirst()
    
    console.log('Admin user fields:')
    console.log('==================')
    console.log('ID:', admin.id)
    console.log('Email:', admin.email)
    console.log('Name:', admin.name)
    console.log('Role:', admin.role)
    
    // Check what password field exists
    console.log('Has password field?:', 'password' in admin)
    console.log('Has passwordHash field?:', 'passwordHash' in admin)
    
    // Show all fields
    console.log('All fields:', Object.keys(admin))
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminFields()
