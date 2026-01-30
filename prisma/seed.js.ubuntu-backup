// prisma/seed.js - MINIMAL VERSION (ADMIN ONLY)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("🌍 Starting database seeding for Ubuntu Garden Lounge...\n");

  // ==========================================
  // 1. CLEAR EXISTING DATA (OPTIONAL - BE CAREFUL!)
  // ==========================================
  console.log("🗑️  Clearing existing data...");
  
  // Optional: Uncomment if you want to clear everything
  /*
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.galleryImage.deleteMany({});
  console.log("✅ All existing data cleared\n");
  */
  
  // OR just clear admin users if you want to keep other data
  await prisma.adminUser.deleteMany({});
  console.log("✅ Admin users cleared\n");

  // ==========================================
  // 2. CREATE ADMIN USER (ESSENTIAL)
  // ==========================================
  console.log("👤 Creating Admin User...");
  const hashedPassword = await bcrypt.hash("Ubuntu2024!", 10);
  
  const admin = await prisma.adminUser.create({
    data: {
      email: "admin@ubuntugarden.co.za",
      password: hashedPassword,
      name: "System Administrator",
      role: "ADMIN",
    },
  });
  
  console.log("✅ Admin user created:");
  console.log(`   • Email: ${admin.email}`);
  console.log(`   • Password: Ubuntu2024!`);
  console.log(`   • Role: ${admin.role}`);
  console.log(`   • Name: ${admin.name}`);

  // ==========================================
  // 3. SUMMARY
  // ==========================================
  console.log("\n" + "=" .repeat(60));
  console.log("🎉 Database seeding completed successfully!");
  console.log("=" .repeat(60));
  
  console.log("\n📊 SEEDING SUMMARY:");
  console.log("   • Admin Users: 1 (admin@ubuntugarden.co.za)");
  console.log("   • Menu Items: 0 (add via admin panel)");
  console.log("   • Gallery Images: 0 (upload via admin panel)");
  console.log("   • Other Data: Preserved (if not cleared)");
  
  console.log("\n🚀 NEXT STEPS:");
  console.log("   1. Run: npm run dev");
  console.log("   2. Visit: http://localhost:3000");
  console.log("   3. Admin Login: http://localhost:3000/admin/login");
  console.log("   4. Add menu items via Admin → Menu → Add New");
  console.log("   5. Upload gallery images via Admin → Gallery");
  
  console.log("\n🔑 DEFAULT ADMIN CREDENTIALS:");
  console.log("   Email: admin@ubuntugarden.co.za");
  console.log("   Password: Ubuntu2024!");
  console.log("=" .repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("\n❌ SEEDING ERROR:");
    console.error(e);
    console.error("\n💡 TROUBLESHOOTING:");
    console.error("   • Check DATABASE_URL in .env.local");
    console.error("   • Run: npx prisma generate");
    console.error("   • Run: npx prisma migrate dev");
    console.error("   • Ensure PostgreSQL is running");
    console.error("   • Check if tables exist: npx prisma db pull");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });