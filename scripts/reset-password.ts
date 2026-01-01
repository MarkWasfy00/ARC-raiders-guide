import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.error('❌ Please provide email and new password');
      console.error('   Usage: npm run reset-password <email> <new-password>');
      process.exit(1);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`\n📋 User found:`);
    console.log(`   Username: ${user.username || 'No username'}`);
    console.log(`   Email: ${user.email}`);

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user password and increment session version to force re-login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        sessionVersion: { increment: 1 },
      },
    });

    console.log('\n✅ Password has been reset successfully!');
    console.log(`   New password: ${newPassword}`);
    console.log('   ⚠️  Please log out and log back in with the new password.');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetPassword();
