const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.projects.deleteMany({});
  console.log('All projects deleted');
}

main().catch(console.error).finally(() => prisma.$disconnect());
