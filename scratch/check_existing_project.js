const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projs = await prisma.projects.findMany({
    where: { group_id: 'd845f52a-619a-47a7-aad0-0a75154837d7' },
    include: { subgroups: { include: { members: true } } }
  });
  console.log('Existing projects in Nutresa G1:', JSON.stringify(projs, null, 2));

  const admin = await prisma.profiles.findFirst({ where: { rol: 'admin' } });
  console.log('Admin:', admin);
}

main().finally(() => prisma.$disconnect());
