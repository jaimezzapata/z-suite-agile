const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GROUP_ID = 'd845f52a-619a-47a7-aad0-0a75154837d7'; // Nutresa G1

async function run() {
  console.log("=== SIMULANDO DÍAS ANTERIORES PARA PENALIZACIONES ACUMULATIVAS ===");

  const groupMembers = await prisma.group_members.findMany({
    where: { group_id: GROUP_ID },
    include: { profiles: true },
    orderBy: { created_at: 'asc' },
  });
  const students = groupMembers.map(gm => gm.profiles);

  const allProjects = await prisma.projects.findMany({ where: { group_id: GROUP_ID } });
  const allSubgroupMembers = await prisma.subgroup_members.findMany({
    where: { subgroups: { project_id: { in: allProjects.map(p => p.id) } } },
    include: { subgroups: true }
  });
  const userProjectMap = {};
  allSubgroupMembers.forEach(sm => {
    userProjectMap[sm.user_id] = sm.subgroups.project_id;
  });

  // Fecha de Ayer (Day -1)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  // Limpiar sesiones de ayer para repoblar limpiamente
  const nextDay = new Date(yesterday);
  nextDay.setDate(nextDay.getDate() + 1);

  await prisma.work_sessions.deleteMany({
    where: {
      ingreso_jornada_at: {
        gte: yesterday,
        lt: nextDay,
      }
    }
  });

  // Crear group_daily_session para ayer
  await prisma.group_daily_sessions.upsert({
    where: {
      group_id_fecha: {
        group_id: GROUP_ID,
        fecha: yesterday,
      }
    },
    update: { estado: "finalizado" },
    create: {
      group_id: GROUP_ID,
      fecha: yesterday,
      estado: "finalizado",
      hora_inicio_programada: new Date(yesterday.setHours(8, 0, 0, 0)),
      iniciado_at: new Date(yesterday.setHours(7, 56, 0, 0)),
      finalizado_at: new Date(yesterday.setHours(17, 0, 0, 0)),
      break_duracion_minutos: 15,
    }
  });

  // Simular sesiones de ayer con los 3 criterios del usuario:
  // Criterio 1: Retraso simultáneo en jornada y break (retraso_ingreso > 0 && retraso_break > 0)
  // Criterio 2: Retraso de jornada superior a 10 min (retraso_ingreso > 10)
  // Criterio 3: Retraso de break superior a 5 min (retraso_break > 5)
  // Criterio 4: Retraso leve no penalizado (ej. 6 min de jornada y 0 de break)
  // Criterio 5: Puntual (0 min)
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const projId = userProjectMap[s.id] || allProjects[0].id;

    const ingreso = new Date(yesterday);
    const breakIni = new Date(yesterday);
    const breakFin = new Date(yesterday);

    if (i < 10) {
      // PUNTUAL AYER (0 retraso)
      ingreso.setHours(7, 58, 0, 0);
      breakIni.setHours(10, 0, 0, 0);
      breakFin.setHours(10, 15, 0, 0);

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: breakFin,
          retraso_ingreso_minutos: 0,
          retraso_break_minutos: 0,
          retraso_minutos: 0,
        }
      });
    } else if (i < 15) {
      // RETRASO LEVE TOLERADO AYER (ej. 7 min jornada, 0 break -> sin falta)
      ingreso.setHours(8, 7, 0, 0);
      breakIni.setHours(10, 0, 0, 0);
      breakFin.setHours(10, 14, 0, 0);

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: breakFin,
          retraso_ingreso_minutos: 7,
          retraso_break_minutos: 0,
          retraso_minutos: 7,
        }
      });
    } else if (i < 20) {
      // CASO 1: RETRASO SIMULTÁNEO EN JORNADA Y BREAK (ej. 4 min en jornada y 3 min en break) -> FALTA (-0.2)
      ingreso.setHours(8, 4, 0, 0);
      breakIni.setHours(10, 0, 0, 0);
      breakFin.setHours(10, 18, 0, 0); // 18 min break -> 3 min retraso

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: breakFin,
          retraso_ingreso_minutos: 4,
          retraso_break_minutos: 3,
          retraso_minutos: 7,
        }
      });
    } else if (i < 25) {
      // CASO 2: RETRASO DE JORNADA > 10 MIN (ej. 15 min en jornada y 0 en break) -> FALTA (-0.2)
      ingreso.setHours(8, 15, 0, 0);
      breakIni.setHours(10, 0, 0, 0);
      breakFin.setHours(10, 14, 0, 0);

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: breakFin,
          retraso_ingreso_minutos: 15,
          retraso_break_minutos: 0,
          retraso_minutos: 15,
        }
      });
    } else if (i < 28) {
      // CASO 3: RETRASO DE BREAK > 5 MIN (ej. 0 min en jornada y 8 min en break) -> FALTA (-0.2)
      ingreso.setHours(7, 59, 0, 0);
      breakIni.setHours(10, 0, 0, 0);
      breakFin.setHours(10, 23, 0, 0); // 23 min break -> 8 min retraso

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: breakFin,
          retraso_ingreso_minutos: 0,
          retraso_break_minutos: 8,
          retraso_minutos: 8,
        }
      });
    }
  }

  console.log("✓ Sesiones de ayer creadas con los 3 escenarios de penalización.");
  console.log("=== SIMULACIÓN MULTIDÍA COMPLETADA ===");
}

run().catch(console.error).finally(() => prisma.$disconnect());
