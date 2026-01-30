const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  const item = await prisma.menuItem.findFirst()
  console.log('First item:', item?.id, item?.name)
  await prisma.$disconnect()
}
test()
