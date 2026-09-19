const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const gds = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'group_daily_sessions';");
  console.log('group_daily_sessions columns:', gds);
  const ws = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'work_sessions';");
  console.log('work_sessions columns:', ws);
  const grp = await prisma.$queryRawUnsafe("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'groups';");
  console.log('groups columns:', grp);
}

main().catch(console.error).finally(() => prisma.$disconnect());
