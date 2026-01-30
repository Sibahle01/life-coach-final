import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Ubuntu Garden Lounge...');

  // Hash password for admin
  const hashedPassword = await bcrypt.hash('Ubuntu2024!', 10);
  
  // Create or update admin user
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@ubuntugarden.co.za' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@ubuntugarden.co.za',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created/updated:', admin.email);

  // Clear and create menu items
  await prisma.menuItem.deleteMany({});
  
  const menuItems = await prisma.menuItem.createMany({
    data: [
      // APPETIZERS
      {
        name: 'Samosas',
        description: 'Crispy pastry filled with spiced potatoes and peas, served with tamarind chutney',
        price: 85.00,
        category: 'APPETIZER',
        isFeatured: true,
        isVegetarian: true,
        isSpicy: true,
        order: 1,
      },
      {
        name: 'Spring Rolls',
        description: 'Crispy vegetable rolls with sweet chili dipping sauce',
        price: 75.00,
        category: 'APPETIZER',
        isFeatured: false,
        isVegetarian: true,
        isSpicy: false,
        order: 2,
      },
      // MAINS
      {
        name: 'Bobotie',
        description: 'Traditional South African spiced minced meat baked with egg topping',
        price: 189.99,
        category: 'MAIN',
        isFeatured: true,
        isVegetarian: false,
        isSpicy: true,
        order: 3,
      },
      {
        name: 'Chakalaka & Pap',
        description: 'Spicy vegetable relish served with maize porridge',
        price: 155.50,
        category: 'MAIN',
        isFeatured: true,
        isVegetarian: true,
        isSpicy: true,
        order: 4,
      },
      {
        name: 'Bunny Chow',
        description: 'Hollowed-out bread loaf filled with Durban curry',
        price: 167.75,
        category: 'MAIN',
        isFeatured: false,
        isVegetarian: false,
        isSpicy: true,
        order: 5,
      },
      // DESSERTS
      {
        name: 'Malva Pudding',
        description: 'Sweet apricot pudding served warm with creamy custard',
        price: 89.99,
        category: 'DESSERT',
        isFeatured: true,
        isVegetarian: true,
        isSpicy: false,
        order: 6,
      },
      // BEVERAGES
      {
        name: 'Rooibos Tea',
        description: 'Traditional South African herbal tea',
        price: 45.00,
        category: 'BEVERAGE',
        isFeatured: false,
        isVegetarian: true,
        isSpicy: false,
        order: 7,
      },
    ],
  });
  console.log(`✅ ${menuItems.count} menu items created`);

  // Create sample reservations
  await prisma.reservation.deleteMany({});
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(20, 30, 0, 0);
  
  const reservations = await prisma.reservation.createMany({
    data: [
      {
        customerName: 'Thabo Mbeki',
        customerEmail: 'thabo@example.co.za',
        customerPhone: '+27111234567',
        reservationDate: tomorrow,
        time: '19:00',
        partySize: 4,
        specialRequests: 'Window table with garden view',
        status: 'CONFIRMED',
      },
      {
        customerName: 'Naledi Pillay',
        customerEmail: 'naledi@example.co.za',
        customerPhone: '+27119876543',
        reservationDate: tomorrow,
        time: '20:30',
        partySize: 2,
        specialRequests: 'Anniversary celebration',
        status: 'PENDING',
      },
    ],
  });
  console.log(`✅ ${reservations.count} sample reservations created`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('👤 Admin login: admin@ubuntugarden.co.za');
  console.log('🔑 Admin password: Ubuntu2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });