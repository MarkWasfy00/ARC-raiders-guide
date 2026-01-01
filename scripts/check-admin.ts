import { prisma } from '../lib/prisma';

async function checkAndSetAdmin() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('\n📋 Current users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username || 'No username'} (${user.email}) - Role: ${user.role}`);
    });

    // Check if there are any admins
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    console.log(`\n👑 Total admins: ${adminCount}`);

    if (users.length > 0 && adminCount === 0) {
      console.log('\n⚠️  No admin users found. Would you like to make the first user an admin?');
      console.log(`   User: ${users[0].username || users[0].email}`);
      console.log('\n   Run: npm run make-admin <user-email> to set a user as admin');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkAndSetAdmin();
