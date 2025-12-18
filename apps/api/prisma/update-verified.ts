import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Update all users to be verified
  const result = await prisma.user.updateMany({
    data: {
      verified: true,
    },
  });
  
  console.log(`Updated ${result.count} users to verified status`);
  
  // List all users to confirm
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      verified: true,
    },
  });
  
  console.log('\nAll users:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - verified: ${user.verified}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
