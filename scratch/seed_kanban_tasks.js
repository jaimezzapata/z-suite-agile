const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== POBLANDO HISTORIAS KANBAN REALES EN BASE DE DATOS ===");

  const projects = await prisma.projects.findMany({
    include: {
      subgroups: {
        include: { members: { include: { profiles: true } } }
      }
    }
  });

  console.log(`Encontrados ${projects.length} proyectos formativos.`);

  for (const proj of projects) {
    // Check if tasks already exist for this project
    const existing = await prisma.$queryRawUnsafe(
      `SELECT count(*)::int as count FROM public.kanban_tasks WHERE project_id = $1::uuid`,
      proj.id
    );

    if (existing[0]?.count > 0) {
      console.log(`Proyecto "${proj.nombre}" ya tiene ${existing[0].count} tareas.`);
      continue;
    }

    const members = [];
    proj.subgroups.forEach(sg => {
      sg.members.forEach(m => {
        members.push(m.profiles);
      });
    });

    const m0 = members[0]?.id || null;
    const m1 = members[1]?.id || m0;
    const m2 = members[2]?.id || m0;
    const m3 = members[3]?.id || m0;

    const tasks = [
      {
        codigo: "US-01",
        titulo: "Autenticación de Usuarios con Cédula",
        descripcion: "Implementar flujo de inicio de sesión con correo fantasma interno y contraseña.",
        columna: "done",
        prioridad: "alta",
        assigned_to: m0,
        puntos_historia: 5
      },
      {
        codigo: "US-02",
        titulo: "Control Antifraude y Marcación de Jornada",
        descripcion: "Registrar hora del servidor en ingreso y regreso del break con validación de cooldown.",
        columna: "qa",
        prioridad: "alta",
        assigned_to: m1,
        puntos_historia: 8
      },
      {
        codigo: "US-03",
        titulo: "Cálculo Automático de Penalizaciones",
        descripcion: "Descontar 0.2 puntos en nota individual si incurre en retrasos bajo los 3 criterios.",
        columna: "in_progress",
        prioridad: "media",
        assigned_to: m2,
        puntos_historia: 5
      },
      {
        codigo: "US-04",
        titulo: "Compresión de Avatar a <200KB en Cliente",
        descripcion: "Integrar browser-image-compression para optimizar fotos antes de enviar a Storage.",
        columna: "todo",
        prioridad: "baja",
        assigned_to: m3,
        puntos_historia: 3
      }
    ];

    for (const t of tasks) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO public.kanban_tasks (project_id, assigned_to, codigo, titulo, descripcion, columna, prioridad, puntos_historia)
         VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8)`,
        proj.id, t.assigned_to, t.codigo, t.titulo, t.descripcion, t.columna, t.prioridad, t.puntos_historia
      );
    }

    console.log(`✓ 4 tareas iniciales creadas para "${proj.nombre}".`);
  }

  console.log("=== SEED DE KANBAN COMPLETADO ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
