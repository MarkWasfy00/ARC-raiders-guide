import { prisma } from '../lib/prisma';

async function makeAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.error('❌ Please provide an email address');
      console.error('   Usage: npm run make-admin <email>');
      process.exit(1);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`\n📋 Current user details:`);
    console.log(`   Username: ${user.username || 'No username'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current role: ${user.role}`);

    if (user.role === 'ADMIN') {
      console.log('\n✅ User is already an admin!');
      await prisma.$disconnect();
      return;
    }

    // Update user to admin
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'ADMIN',
        sessionVersion: { increment: 1 }, // Force re-login to get new role
      },
    });

    console.log('\n✅ User has been granted admin privileges!');
    console.log('   ⚠️  User must log out and log back in for changes to take effect.');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

makeAdmin();
