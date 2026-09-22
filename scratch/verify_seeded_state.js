const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GROUP_ID = 'd845f52a-619a-47a7-aad0-0a75154837d7';

async function main() {
  const projects = await prisma.projects.findMany({
    where: { group_id: GROUP_ID },
    include: { subgroups: { include: { members: true } } }
  });
  console.log(`Proyectos en Nutresa G1 (${projects.length}):`);
  projects.forEach(p => {
    const memberCount = p.subgroups.reduce((acc, sg) => acc + sg.members.length, 0);
    console.log(`  - [${p.nombre}] : ${memberCount} integrantes`);
  });

  const totalAssigned = await prisma.subgroup_members.count({
    where: { subgroups: { projects: { group_id: GROUP_ID } } }
  });
  console.log(`Total asignaciones a proyectos: ${totalAssigned} / 35`);

  const sessionsToday = await prisma.work_sessions.count();
  console.log(`Marcaciones de asistencia registradas: ${sessionsToday}`);

  const messagesCount = await prisma.student_messages.count();
  const readMessages = await prisma.student_messages.count({ where: { leido: true } });
  console.log(`Mensajes oficiales creados: ${messagesCount} (${readMessages} leídos, ${messagesCount - readMessages} pendientes)`);

  const acceptedTerms = await prisma.profiles.count({ where: { rol: 'student', terminos_aceptados_at: { not: null } } });
  console.log(`Estudiantes con términos aceptados: ${acceptedTerms} / 35`);
}

main().finally(() => prisma.$disconnect());
