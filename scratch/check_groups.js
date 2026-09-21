const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const g = await prisma.groups.findMany();
  console.log('Grupos:', g.map(x => ({ id: x.id, nombre: x.nombre, usa_asistencia: x.usa_asistencia })));
}
main().finally(() => prisma.$disconnect());
