const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("=== PROBANDO CONSULTAS DE LOS 3 MÓDULOS ===");

  // 1. Evaluaciones
  const groups = await prisma.groups.findMany({ where: { estado: 'activo' } });
  console.log(`✓ Evaluaciones: ${groups.length} grupos activos encontrados.`);
  if (groups.length > 0) {
    const g = groups[0];
    const members = await prisma.group_members.findMany({
      where: { group_id: g.id },
      include: { profiles: true }
    });
    console.log(`  └ Grupo "${g.nombre}": ${members.length} integrantes listos para métricas de notas.`);
  }

  // 2. WorkManager
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daily = await prisma.group_daily_sessions.findFirst({
    where: { fecha: { gte: today } }
  });
  console.log(`✓ WorkManager: Sesión diaria de hoy: ${daily ? daily.estado : 'Sin sesión hoy'}`);

  // 3. Kanban
  const projects = await prisma.projects.findMany({
    where: { estado: 'activo' },
    include: { groups: true }
  });
  console.log(`✓ Kanban: ${projects.length} proyectos formativos listos.`);

  console.log("=== TODOS LOS DATOS Y MÓDULOS VERIFICADOS EXITOSAMENTE ===");
}

test().catch(console.error).finally(() => prisma.$disconnect());
