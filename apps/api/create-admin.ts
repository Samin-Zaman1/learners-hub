import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npx ts-node create-admin.ts
const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@champius.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 8) {
    throw new Error('Set ADMIN_PASSWORD (at least 8 characters) to create the admin user');
  }

  console.log('Creating admin user...');

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      passwordHash,
      verified: true
    },
    create: {
      email,
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      verified: true,
      profileImage: 'https://ui-avatars.com/api/?name=Admin+User&background=dc2626'
    }
  });

  console.log('✅ Admin user created/updated successfully!');
  console.log('📧 Email:', admin.email);
  console.log('👤 Role:', admin.role);
}

createAdmin()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
