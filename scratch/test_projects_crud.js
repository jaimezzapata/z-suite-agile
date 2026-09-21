const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProjectsCrud() {
  console.log("Looking for an active group and students...");
  const group = await prisma.groups.findFirst();
  if (!group) {
    console.log("No group found.");
    return;
  }
  console.log(`Found Group: ${group.nombre} (${group.id})`);

  const students = await prisma.profiles.findMany({
    where: { rol: "student" },
    take: 2,
  });
  console.log(`Found ${students.length} students:`, students.map(s => s.nombres).join(", "));

  // 1. Create project with subgroup and members
  console.log("1. Creating test project with members...");
  const newProj = await prisma.projects.create({
    data: {
      group_id: group.id,
      nombre: "Proyecto Demo E-Commerce",
      descripcion: "Tienda virtual con Next.js y Supabase",
      estado: "activo",
      subgroups: {
        create: {
          nombre: "Proyecto Demo E-Commerce",
          members: {
            create: students.map(s => ({
              user_id: s.id,
              rol_en_equipo: "developer",
            }))
          }
        }
      }
    },
    include: {
      subgroups: {
        include: {
          members: {
            include: { profiles: true }
          }
        }
      }
    }
  });
  console.log("Project created with ID:", newProj.id);
  console.log("Assigned members count:", newProj.subgroups[0].members.length);

  // 2. Query project in student dashboard style
  console.log("2. Verifying student assignment query...");
  if (students.length > 0) {
    const studentSubgroupMember = await prisma.subgroup_members.findFirst({
      where: { user_id: students[0].id },
      include: {
        subgroups: {
          include: {
            projects: { select: { nombre: true } }
          }
        }
      }
    });
    console.log("Student 1 assigned to project:", studentSubgroupMember?.subgroups?.projects?.nombre);
  }

  // 3. Cleanup test project (cascade deletes subgroups and subgroup_members)
  console.log("3. Cleaning up test project...");
  await prisma.projects.delete({ where: { id: newProj.id } });
  console.log("Test project cleaned up successfully!");
}

testProjectsCrud()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
