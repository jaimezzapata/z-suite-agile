const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GROUP_ID = 'd845f52a-619a-47a7-aad0-0a75154837d7'; // Nutresa G1

async function seed() {
  console.log("=== INICIANDO SIMULACIÓN DE DATOS REALISTAS PARA NUTRESA G1 ===");

  // 1. Obtener Admin
  const admin = await prisma.profiles.findFirst({ where: { rol: 'admin' } });
  if (!admin) throw new Error("No se encontró usuario administrador.");
  console.log(`Admin detectado: ${admin.nombres} ${admin.apellidos} (${admin.id})`);

  // 2. Obtener los 35 estudiantes del grupo
  const groupMembers = await prisma.group_members.findMany({
    where: { group_id: GROUP_ID },
    include: { profiles: true },
    orderBy: { created_at: 'asc' },
  });

  const students = groupMembers.map(gm => gm.profiles);
  console.log(`Total de estudiantes en Nutresa G1: ${students.length}`);

  // 3. Proyectos Formativos
  // Revisar qué estudiantes ya están en "Catálogo de Productos Nutresa"
  const existingSubgroupMembers = await prisma.subgroup_members.findMany({
    where: {
      subgroups: {
        projects: { group_id: GROUP_ID }
      }
    },
    include: { subgroups: { include: { projects: true } } }
  });

  const assignedUserIds = new Set(existingSubgroupMembers.map(m => m.user_id));
  console.log(`Estudiantes ya asignados en proyecto existente: ${assignedUserIds.size}`);

  const unassignedStudents = students.filter(s => !assignedUserIds.has(s.id));
  console.log(`Estudiantes pendientes por asignar a proyectos: ${unassignedStudents.length}`);

  // Proyectos nuevos a crear para cubrir a todos los estudiantes (6 estudiantes por proyecto)
  const newProjectsDef = [
    {
      nombre: "Motor de Recetas y Combinaciones",
      descripcion: "Creación y edición de recetas con ingredientes Nutresa (Zenú, Noel, Doria), cálculo automático de porciones y tabla nutricional.",
      roles: ["Frontend Lead", "Backend Dev", "Database Dev", "QA Engineer", "Fullstack Dev", "UI/UX Designer"],
    },
    {
      nombre: "Planificador de Menús Semanales",
      descripcion: "Organizador de alimentación balanceada para familias, calendario de comidas y optimización de ingredientes por ocasión.",
      roles: ["Frontend Dev", "Backend Lead", "Fullstack Dev", "QA Tester", "Data Engineer", "Frontend Dev"],
    },
    {
      nombre: "Lista Inteligente de Compras",
      descripcion: "Consolidación de compras por receta, cálculo de presupuesto familiar y recomendaciones de presentaciones institucionales.",
      roles: ["Fullstack Lead", "Backend Dev", "Frontend Dev", "Database Dev", "QA Engineer", "DevOps Engineer"],
    },
    {
      nombre: "Comunidad y Reseñas Gastronómicas",
      descripcion: "Muro social de recetas caseras compartidas por consumidores, votaciones, tips culinarios y moderación de comentarios.",
      roles: ["UI/UX Designer", "Frontend Lead", "Backend Dev", "Fullstack Dev", "QA Tester", "Security & QA"],
    },
    {
      nombre: "Panel Administrativo y Analítica Nutricional",
      descripcion: "Dashboard de impacto de marcas, analítica de interacción con recetas y reportes ejecutivos para el equipo de mercadeo.",
      roles: ["Backend Lead", "Data Analyst", "Frontend Dev", "DevOps Engineer", "Fullstack Dev", "QA Engineer"],
    },
  ];

  let studentIdx = 0;
  for (const pDef of newProjectsDef) {
    let existingProj = await prisma.projects.findFirst({
      where: { group_id: GROUP_ID, nombre: pDef.nombre },
    });

    if (!existingProj) {
      existingProj = await prisma.projects.create({
        data: {
          group_id: GROUP_ID,
          nombre: pDef.nombre,
          descripcion: pDef.descripcion,
          estado: "activo",
          subgroups: {
            create: {
              nombre: pDef.nombre,
            }
          }
        },
        include: { subgroups: true }
      });
      console.log(`✓ Creado proyecto: "${pDef.nombre}"`);
    }

    const subgroup = await prisma.subgroups.findFirst({ where: { project_id: existingProj.id } });

    // Asignar hasta 6 estudiantes por proyecto
    const teamStudents = unassignedStudents.slice(studentIdx, studentIdx + 6);
    studentIdx += 6;

    for (let i = 0; i < teamStudents.length; i++) {
      const student = teamStudents[i];
      const role = pDef.roles[i] || "developer";
      await prisma.subgroup_members.upsert({
        where: {
          subgroup_id_user_id: {
            subgroup_id: subgroup.id,
            user_id: student.id,
          }
        },
        update: { rol_en_equipo: role },
        create: {
          subgroup_id: subgroup.id,
          user_id: student.id,
          rol_en_equipo: role,
        }
      });
    }
    console.log(`  -> Asignados ${teamStudents.length} integrantes al equipo "${pDef.nombre}"`);
  }

  // 4. Simulación de Términos y Condiciones
  // ~28 aceptados, ~7 sin aceptar (nunca ha ingresado)
  console.log("\n--- Simulando Aceptación de Términos ---");
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    if (i < 28) {
      // Aceptó entre hace 2 y 5 días
      const daysAgo = (i % 4) + 1;
      const acceptedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 + (i * 3600000));
      await prisma.profiles.update({
        where: { id: student.id },
        data: { terminos_aceptados_at: acceptedDate }
      });
    } else {
      // No ha ingresado nunca
      await prisma.profiles.update({
        where: { id: student.id },
        data: { terminos_aceptados_at: null }
      });
    }
  }
  console.log("✓ 28 estudiantes con términos aceptados y 7 estudiantes sin ingresar aún.");

  // 5. Configurar group_daily_sessions para hoy
  console.log("\n--- Configurando Jornada de Trabajo Diaria del Grupo ---");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const horaInicioProgramada = new Date(today);
  horaInicioProgramada.setHours(8, 0, 0, 0); // 8:00 AM programada

  const iniciadoAt = new Date(today);
  iniciadoAt.setHours(7, 55, 0, 0); // Admin inició a las 7:55 AM

  await prisma.group_daily_sessions.upsert({
    where: {
      group_id_fecha: {
        group_id: GROUP_ID,
        fecha: today,
      }
    },
    update: {
      estado: "iniciado",
      hora_inicio_programada: horaInicioProgramada,
      iniciado_at: iniciadoAt,
      break_duracion_minutos: 15,
      break_iniciado_at: null,
      break_fin_esperado_at: null,
    },
    create: {
      group_id: GROUP_ID,
      fecha: today,
      estado: "iniciado",
      hora_inicio_programada: horaInicioProgramada,
      iniciado_at: iniciadoAt,
      break_duracion_minutos: 15,
    }
  });
  console.log("✓ Jornada de hoy programada a las 08:00 AM.");

  // 6. Simular Marcaciones de Asistencia en work_sessions
  console.log("\n--- Simulando Marcaciones de Asistencia (WorkManager) ---");
  // Limpiar sesiones previas de hoy para el grupo para repoblar limpiamente
  await prisma.work_sessions.deleteMany({
    where: {
      ingreso_jornada_at: { gte: today }
    }
  });

  // Obtener todos los proyectos de este grupo para vincularlos en work_sessions
  const allProjects = await prisma.projects.findMany({ where: { group_id: GROUP_ID } });
  const allSubgroupMembers = await prisma.subgroup_members.findMany({
    where: { subgroups: { project_id: { in: allProjects.map(p => p.id) } } },
    include: { subgroups: true }
  });
  const userProjectMap = {};
  allSubgroupMembers.forEach(sm => {
    userProjectMap[sm.user_id] = sm.subgroups.project_id;
  });

  // Escenarios:
  // Grupo 1: 12 estudiantes puntuales (0 min de retraso)
  // Grupo 2: 8 estudiantes con retraso leve permitido (3 a 12 min de retraso)
  // Grupo 3: 5 estudiantes con retraso grave penalizado (18 a 28 min de retraso)
  // Grupo 4: 4 estudiantes en break o jornada activa
  // Grupo 5: 6 estudiantes sin marcación (inasistentes)
  let punctualCount = 0;
  let slightDelayCount = 0;
  let severeDelayCount = 0;
  let inProgressCount = 0;
  let absentCount = 0;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const projId = userProjectMap[s.id] || allProjects[0].id;

    if (i < 12) {
      // PUNTUAL (0 min retraso)
      // Llegó 7:55 AM - 7:59 AM
      const ingreso = new Date(today);
      ingreso.setHours(7, 55 + (i % 5), 0, 0);

      // Break tomado: 10:00 AM a 10:14 AM (14 min)
      const breakIni = new Date(today);
      breakIni.setHours(10, 0, 0, 0);
      const breakFin = new Date(today);
      breakFin.setHours(10, 14, 0, 0);

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
      punctualCount++;
    } else if (i < 20) {
      // RETRASO LEVE PERMITIDO (3 a 12 min de retraso)
      const delayMin = 4 + (i - 12) * 1; // 4, 5, 6, 7, 8, 9, 10, 11 min
      const ingreso = new Date(today);
      ingreso.setHours(8, delayMin, 0, 0);

      const breakIni = new Date(today);
      breakIni.setHours(10, 5, 0, 0);
      const breakFin = new Date(today);
      breakFin.setHours(10, 18, 0, 0); // 13 min de break (0 retraso en break)

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: breakFin,
          retraso_ingreso_minutos: delayMin,
          retraso_break_minutos: 0,
          retraso_minutos: delayMin,
        }
      });
      slightDelayCount++;
    } else if (i < 25) {
      // RETRASO GRAVE PENALIZADO (> 15 min diarios)
      const ingresoDelay = 16 + (i - 20) * 3; // 16, 19, 22, 25, 28 min
      const ingreso = new Date(today);
      ingreso.setHours(8, ingresoDelay, 0, 0);

      const breakIni = new Date(today);
      breakIni.setHours(10, 15, 0, 0);
      const breakFin = new Date(today);
      breakFin.setHours(10, 32, 0, 0); // 17 min de break (2 min retraso break)
      const breakDelay = 2;

      const totalDelay = ingresoDelay + breakDelay;

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: breakFin,
          retraso_ingreso_minutos: ingresoDelay,
          retraso_break_minutos: breakDelay,
          retraso_minutos: totalDelay,
        }
      });
      severeDelayCount++;
    } else if (i < 29) {
      // EN PROGRESO (Marcó ingreso pero sin break o actualmente en break)
      const ingreso = new Date(today);
      ingreso.setHours(8, 2, 0, 0);

      let breakIni = null;
      if (i % 2 === 0) {
        breakIni = new Date(today);
        breakIni.setHours(10, 0, 0, 0); // Actualmente en break
      }

      await prisma.work_sessions.create({
        data: {
          user_id: s.id,
          project_id: projId,
          ingreso_jornada_at: ingreso,
          inicio_break_at: breakIni,
          regreso_break_at: null,
          retraso_ingreso_minutos: 2,
          retraso_break_minutos: 0,
          retraso_minutos: 2,
        }
      });
      inProgressCount++;
    } else {
      // SIN MARCACIÓN HOY (Inasistente)
      absentCount++;
    }
  }

  console.log(`✓ Marcaciones simuladas:`);
  console.log(`  - ${punctualCount} estudiantes puntuales (0 min de retraso)`);
  console.log(`  - ${slightDelayCount} estudiantes con retraso leve permitido (≤ 15 min)`);
  console.log(`  - ${severeDelayCount} estudiantes con retraso penalizado (> 15 min)`);
  console.log(`  - ${inProgressCount} estudiantes en jornada activa / en break`);
  console.log(`  - ${absentCount} estudiantes inasistentes sin marcación`);

  // 7. Simular Mensajería Oficial (Admin a Estudiante)
  console.log("\n--- Simulando Mensajes Oficiales (Admin -> Estudiantes) ---");
  // Limpiar mensajes previos para poblar un historial rico y coherente
  await prisma.student_messages.deleteMany({ where: { sender_id: admin.id } });

  const messagesToCreate = [
    {
      student_idx: 0, // Jose David Valencia
      asunto: "Aprobación de Arquitectura de Base de Datos",
      contenido: "Jose David, excelente trabajo con la definición de entidades del Catálogo Nutresa. Las tablas de marcas y productos quedaron normalizadas y listas para sprint.",
      leido: true,
      horasAtrasLectura: 3,
    },
    {
      student_idx: 1, // Daniel Acevedo
      asunto: "Revisión de Historias de Usuario - Sprint 1",
      contenido: "Daniel, por favor asegúrate de que cada historia del catálogo cuente con sus criterios de aceptación definidos antes de moverla a 'En Progreso'.",
      leido: false,
    },
    {
      student_idx: 20, // Estudiante con retraso de 18 min
      asunto: "Notificación de Asistencia: Tolerancia Diaria Superada",
      contenido: "Estimado estudiante, el sistema registró un retraso de 18 minutos en tu ingreso de hoy, superando los 15 minutos de tolerancia permitidos por el WorkManager. Recuerda que la reincidencia impacta tu evaluación individual.",
      leido: true,
      horasAtrasLectura: 1,
    },
    {
      student_idx: 6, // Estudiante de Motor de Recetas
      asunto: "Lineamientos de Integración Nutricional",
      contenido: "Hola equipo, para el cálculo de calorías y porciones usen la tabla estandarizada del ICBF que compartí en el repositorio.",
      leido: false,
    },
    {
      student_idx: 12, // Estudiante de Planificador
      asunto: "Reunión de Daily Scrum Virtual",
      contenido: "Mañana a primera hora tendremos una breve sincronización de 10 minutos para revisar bloqueos en la vista de calendario semanal.",
      leido: true,
      horasAtrasLectura: 5,
    },
    {
      student_idx: 18, // Estudiante de Lista Inteligente
      asunto: "Validación de Presupuesto Familiar",
      contenido: "Buen avance en el estimador de costos. Por favor añade la opción de seleccionar marcas recomendadas (Zenú, Doria) como filtro por defecto.",
      leido: false,
    },
    {
      student_idx: 24, // Estudiante con retraso grave
      asunto: "Aviso Operativo: Retraso acumulado en jornada",
      contenido: "Se detectó retraso tanto en tu ingreso como en el tiempo de break de hoy. Por favor justifícate si tuviste problemas de conexión o fuerza mayor.",
      leido: true,
      horasAtrasLectura: 2,
    },
    {
      student_idx: 30, // Estudiante de Panel Analítico
      asunto: "Métricas de Consumo y Gráficos",
      contenido: "Para los dashboards analíticos de mercadeo de Nutresa, asegúrate de utilizar gráficos de barras apiladas para comparar el consumo entre marcas.",
      leido: false,
    },
  ];

  for (const m of messagesToCreate) {
    const student = students[m.student_idx];
    if (!student) continue;

    const createdAt = new Date(Date.now() - 6 * 3600000); // Enviado hace 6 horas
    let leidoAt = null;
    if (m.leido && m.horasAtrasLectura) {
      leidoAt = new Date(Date.now() - m.horasAtrasLectura * 3600000);
    }

    await prisma.student_messages.create({
      data: {
        student_id: student.id,
        sender_id: admin.id,
        group_id: GROUP_ID,
        asunto: m.asunto,
        contenido: m.contenido,
        leido: m.leido,
        leido_at: leidoAt,
        created_at: createdAt,
      }
    });
  }
  console.log(`✓ Creados ${messagesToCreate.length} mensajes oficiales con estados de lectura diversos.`);

  console.log("\n=== SIMULACIÓN COMPLETADA CON ÉXITO ===");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
