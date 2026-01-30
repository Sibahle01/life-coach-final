// File: /prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enhanced Life Coach Platform seeding...\n');

  // 1. Clear existing data (in correct order to respect foreign keys)
  console.log('🗑️  Clearing existing data...');
  
  // Clear in reverse order of dependencies
  await prisma.blogPost.deleteMany();
  await prisma.eventTicket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.bookOrderItem.deleteMany();
  await prisma.bookOrder.deleteMany();
  await prisma.book.deleteMany();
  await prisma.sessionBooking.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.service.deleteMany();
  await prisma.speakingRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.adminUser.deleteMany();
  
  console.log('✅ Database cleared\n');

  // 2. Create Admin User
  console.log('👤 Creating Admin User...');
  const hashedPassword = await bcrypt.hash('LifeCoachDB2024!', 10);
  
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@lifecoach.co.za',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin created:', admin.email);

  // 3. Create System Configurations
  console.log('\n⚙️ Creating System Configurations...');
  const systemConfigs = [
    {
      key: 'bank_name',
      value: 'CAPITEC BANK',
      category: 'payment',
      description: 'Bank name for payments'
    },
    {
      key: 'account_number',
      value: '1560 7242 40',
      category: 'payment',
      description: 'Bank account number'
    },
    {
      key: 'branch_code',
      value: '47000',
      category: 'payment',
      description: 'Bank branch code'
    },
    {
      key: 'account_holder',
      value: 'SS NKABINDE',
      category: 'payment',
      description: 'Account holder name'
    },
    {
      key: 'booking_terms',
      value: `1. *Booking & Payment*\n- All booking fees are non-refundable.\n\n2. *Rescheduling & Cancellations*\n- You may reschedule up to 48 hours before the appointment.\n- Cancellations made less than 48 hours before the session forfeit the booking fee.\n\n3. *Session Conduct*\n- Sessions are confidential.\n- Please attend on time and prepared.\n\n4. *Liability*\n- The life coach provides guidance but does not guarantee specific outcomes.\n\n5. *Governing Law*\n- These terms are governed by the laws of South Africa.`,
      category: 'terms',
      description: 'Life coaching booking terms and conditions'
    },
    {
      key: 'business_hours_start',
      value: '09:00',
      category: 'availability',
      description: 'Business hours start time'
    },
    {
      key: 'business_hours_end',
      value: '17:00',
      category: 'availability',
      description: 'Business hours end time'
    },
    {
      key: 'business_days',
      value: '1,2,3,4,5',
      category: 'availability',
      description: 'Business days (1=Monday, 5=Friday)'
    }
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({ data: config });
  }
  console.log(`✅ Created ${systemConfigs.length} system configurations`);

  // 4. Create Services (FIXED: Added isActive, removed packageDescription)
  console.log('\n💼 Creating Coaching Services...');
  const services = [
    {
      name: 'Life Coaching Session',
      description: 'One-on-one coaching to help you achieve personal and professional goals. Discover your purpose and create an actionable plan.',
      duration: 60,
      price: 800.00,
      format: 'both',
      category: 'coaching',
      isActive: true,
      isFeatured: true,
      order: 1,
      imageUrl: '/images/services/coaching.jpg',
      hasPackage: true,
      packageSessions: 3,
      packageDiscount: 10.00
    },
    {
      name: 'Pre-Marital Counselling',
      description: 'Prepare for marriage with expert guidance. Build strong foundations for a lasting, healthy relationship.',
      duration: 90,
      price: 1200.00,
      format: 'both',
      category: 'counselling',
      isActive: true,
      isFeatured: true,
      order: 2,
      imageUrl: '/images/services/counselling.jpg',
      hasPackage: true,
      packageSessions: 5,
      packageDiscount: 15.00
    },
    {
      name: 'Invite to Speak',
      description: 'Book me as a speaker for your event, conference, or workshop. Custom topics on leadership, mindset, and personal development.',
      duration: 60,
      price: 5000.00,
      format: 'both',
      category: 'speaking',
      isActive: true,
      isFeatured: true,
      order: 3,
      imageUrl: '/images/services/speaking.jpg',
      hasPackage: false
    },
    {
      name: 'Virtual Consultation (30min)',
      description: 'Quick virtual session for guidance on specific challenges or questions. Perfect for busy professionals.',
      duration: 30,
      price: 400.00,
      format: 'virtual',
      category: 'coaching',
      isActive: true,
      order: 4,
      isFeatured: false,
      hasPackage: false
    }
  ];

  const createdServices = [];
  for (const serviceData of services) {
    const service = await prisma.service.create({
      data: serviceData
    });
    createdServices.push(service);
  }
  console.log(`✅ Created ${createdServices.length} services`);

  // 5. Create Availability Slots (Monday-Friday, 09:00-17:00)
  console.log('\n📅 Creating Availability Slots...');
  const availabilitySlots = [];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  
  for (let day = 1; day <= 5; day++) {
    for (const timeSlot of timeSlots) {
      availabilitySlots.push(
        prisma.availabilitySlot.create({
          data: {
            dayOfWeek: day,
            startTime: timeSlot,
            endTime: addHour(timeSlot),
            recurrence: 'weekly',
            maxBookings: 1,
            isActive: true,
            notes: `${getDayName(day)} ${timeSlot}-${addHour(timeSlot)} slot`
          }
        })
      );
    }
  }
  
  await Promise.all(availabilitySlots);
  console.log(`✅ Created ${availabilitySlots.length} availability slots`);

  // 6. Create Books
  console.log('\n📚 Creating Books...');
  const books = [
    {
      title: 'The Path to Purpose',
      description: 'A transformative guide to discovering your life\'s calling and living with intention.',
      author: 'Sifiso Nkabinde',
      price: 250.00,
      format: ['physical', 'ebook'],
      stockQuantity: 50,
      isFeatured: true,
      isAvailable: true,
      category: 'self-help',
      pages: 220,
      publicationDate: new Date('2023-05-15'),
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      isbn: '978-0-123456-78-9',
      order: 1
    },
    {
      title: 'Mindset Mastery Workbook',
      description: 'Practical exercises to reprogram limiting beliefs.',
      author: 'Sifiso Nkabinde',
      price: 180.00,
      format: ['physical', 'ebook'],
      stockQuantity: 30,
      isFeatured: false,
      isAvailable: true,
      category: 'workbook',
      pages: 150,
      publicationDate: new Date('2023-08-20'),
      coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
      isbn: '978-0-987654-32-1',
      order: 2
    }
  ];

  const createdBooks = [];
  for (const bookData of books) {
    const book = await prisma.book.create({
      data: bookData
    });
    createdBooks.push(book);
  }
  console.log(`✅ Created ${createdBooks.length} books`);

  // 7. Create Sample Events
  console.log('\n🎟️ Creating Events...');
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(15);
  
  const event = await prisma.event.create({
    data: {
      title: 'Leadership Breakthrough Workshop',
      description: 'A full-day intensive workshop for emerging leaders.',
      eventDate: nextMonth,
      eventTime: '09:00',
      endDate: nextMonth,
      endTime: '17:00',
      location: 'Sandton Convention Centre, Johannesburg',
      venue: 'Hall A',
      address: '161 Maude St, Sandton',
      capacity: 50,
      ticketsSold: 0,
      ticketPrice: 1200.00,
      isVirtual: false,
      category: 'workshop',
      status: 'UPCOMING',
      isFeatured: true
    }
  });
  console.log(`✅ Created event: ${event.title}`);

  // 8. Create Sample Speaking Request
  console.log('\n🎤 Creating Sample Speaking Request...');
  const speakingRequest = await prisma.speakingRequest.create({
    data: {
      requestNumber: `SR-${new Date().getFullYear()}-001`,
      organization: 'Tech Innovations Conference',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@techinnovations.co.za',
      phone: '+27 11 123 4567',
      eventName: 'Annual Tech Leadership Summit',
      eventDate: new Date('2024-08-15'),
      eventType: 'conference',
      audienceSize: 300,
      duration: 45,
      budget: 8000.00,
      location: 'Cape Town',
      description: 'Digital Transformation speech request.',
      status: 'PENDING'
    }
  });
  console.log('✅ Created speaking request:', speakingRequest.requestNumber);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 ENHANCED LIFE COACH PLATFORM SEEDING COMPLETED!');
  console.log('='.repeat(60));
}

// Helper functions
function getDayName(dayNumber) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
}

function addHour(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newHours = (hours + 1) % 24;
  return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

main()
  .catch((e) => {
    console.error('\n❌ SEEDING ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });