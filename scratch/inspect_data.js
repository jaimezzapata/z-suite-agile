const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.groups.findMany();
  console.log("Groups found:", groups.length);
  for (const g of groups) {
    const memberCount = await prisma.group_members.count({ where: { group_id: g.id } });
    const projectCount = await prisma.projects.count({ where: { group_id: g.id } });
    console.log(`- ${g.nombre} (ID: ${g.id}): ${memberCount} miembros, ${projectCount} proyectos`);
  }

  const profiles = await prisma.profiles.findMany({ where: { rol: "student" } });
  console.log(`Total students in profiles: ${profiles.length}`);

  const sessions = await prisma.work_sessions.count();
  console.log(`Total work sessions: ${sessions}`);

  const messages = await prisma.student_messages.count();
  console.log(`Total messages: ${messages}`);
}

main().finally(() => prisma.$disconnect());
