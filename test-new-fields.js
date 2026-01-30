const { PrismaClient } = require('@prisma/client');

async function testNewFields() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing new database fields...\n');
    
    // Test 1: Check new columns exist in session_bookings
    const booking = await prisma.sessionBooking.findFirst({
      select: { 
        bookingNumber: true,
        meetingType: true, 
        sessionAmount: true,
        travelDistanceKm: true,
        travelAmount: true,
        totalAmount: true
      }
    });
    console.log('✅ Booking sample with new fields:');
    console.log(booking);
    console.log('');
    
    // Test 2: Check travel config
    const travelRate = await prisma.systemConfig.findFirst({
      where: { key: 'travel_rate_per_km' }
    });
    console.log('✅ Travel rate per km:', travelRate?.value);
    
    const coachAddress = await prisma.systemConfig.findFirst({
      where: { key: 'coach_base_address' }
    });
    console.log('✅ Coach base address:', coachAddress?.value);
    console.log('');
    
    // Test 3: Check weekend slots (should be none since we filtered them out)
    const weekendSlots = await prisma.availabilitySlot.count({
      where: { isWeekend: true }
    });
    console.log('✅ Weekend slots count:', weekendSlots);
    
    // Test 4: Check all travel config entries
    const allTravelConfig = await prisma.systemConfig.findMany({
      where: { category: 'travel' }
    });
    console.log('\n✅ All travel configuration:');
    allTravelConfig.forEach(config => {
      console.log(`   ${config.key}: ${config.value} (${config.description})`);
    });
    
    // Test 5: Check if columns are accessible
    const columnCheck = await prisma.sessionBooking.findFirst({
      where: { meetingType: { not: null } }
    });
    console.log('\n✅ MeetingType field is accessible:', columnCheck ? 'Yes' : 'No (but may be null for some)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Test completed. Database connection closed.');
  }
}

// Run the test
testNewFields();