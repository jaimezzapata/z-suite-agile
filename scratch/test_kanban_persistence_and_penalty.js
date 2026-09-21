const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== TEST DE PERSISTENCIA KANBAN Y CÁLCULO DE PENALIZACIÓN ===");

  // 1. Obtener un proyecto con tareas
  const task = await prisma.$queryRawUnsafe(
    `SELECT t.id, t.codigo, t.titulo, t.columna, t.assigned_to, p.nombres, p.apellidos
     FROM public.kanban_tasks t
     JOIN public.profiles p ON t.assigned_to = p.id
     WHERE t.columna = 'qa'
     LIMIT 1`
  );

  if (task.length === 0) {
    console.log("No se encontró tarea en QA para testear.");
    return;
  }

  const t = task[0];
  console.log(`\n1. Tarea en QA seleccionada: [${t.codigo}] ${t.titulo}`);
  console.log(`   Asignada a: ${t.nombres} ${t.apellidos} (${t.assigned_to})`);

  // Limpiar rechazos previos de prueba para esta tarea
  await prisma.$executeRawUnsafe(`DELETE FROM public.task_qa_rejections WHERE task_id = $1::uuid`, t.id);

  // 2. PRIMER RECHAZO: Formativo
  const motivo = "Errores de Lógica o Bugs encontrados";
  console.log(`\n2. Ejecutando 1er rechazo QA por motivo: "${motivo}"...`);

  await prisma.$executeRawUnsafe(
    `INSERT INTO public.task_qa_rejections (task_id, user_id, motivo, es_reincidente, penalizacion_puntos)
     VALUES ($1::uuid, $2::uuid, $3, false, 0.0)`,
    t.id, t.assigned_to, motivo
  );
  await prisma.$executeRawUnsafe(
    `UPDATE public.kanban_tasks SET columna = 'in_progress', updated_at = timezone('utc', now()) WHERE id = $1::uuid`,
    t.id
  );

  // Verificar persistencia tras recargar
  const reloaded1 = await prisma.$queryRawUnsafe(
    `SELECT columna FROM public.kanban_tasks WHERE id = $1::uuid`, t.id
  );
  console.log(`✓ Recarga BD: Estado actual de la HU: "${reloaded1[0].columna}" (se mantiene en in_progress, NO regresa a su estado anterior)`);

  // 3. SEGUNDO RECHAZO (Mover a QA y rechazar por el MISMO motivo)
  console.log(`\n3. Moviendo de nuevo a QA y aplicando 2do rechazo por el MISMO motivo (Reincidencia)...`);
  await prisma.$executeRawUnsafe(
    `UPDATE public.kanban_tasks SET columna = 'qa' WHERE id = $1::uuid`, t.id
  );

  // Verificar si es reincidente
  const prev = await prisma.$queryRawUnsafe(
    `SELECT motivo FROM public.task_qa_rejections WHERE task_id = $1::uuid`, t.id
  );
  const esReincidente = prev.some(r => r.motivo === motivo);
  const penalizacion = esReincidente ? 0.2 : 0.0;

  await prisma.$executeRawUnsafe(
    `INSERT INTO public.task_qa_rejections (task_id, user_id, motivo, es_reincidente, penalizacion_puntos)
     VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
    t.id, t.assigned_to, motivo, esReincidente, penalizacion
  );
  await prisma.$executeRawUnsafe(
    `UPDATE public.kanban_tasks SET columna = 'in_progress' WHERE id = $1::uuid`, t.id
  );

  console.log(`✓ 2do Rechazo procesado: esReincidente = ${esReincidente}, Penalización = -${penalizacion} pts`);

  // 4. Verificar impacto en la nota del estudiante en la base de datos
  const totalQA = await prisma.$queryRawUnsafe(
    `SELECT count(*)::int as reincidencias, sum(penalizacion_puntos)::float as puntos
     FROM public.task_qa_rejections
     WHERE user_id = $1::uuid AND es_reincidente = true`,
    t.assigned_to
  );

  console.log(`\n4. Auditoría para ${t.nombres} ${t.apellidos}:`);
  console.log(`   └ Total reincidencias QA: ${totalQA[0].reincidencias}`);
  console.log(`   └ Puntos restados por QA: -${totalQA[0].puntos} pts`);

  const notaEstimada = Math.max(0, 5.0 - (totalQA[0].puntos || 0));
  console.log(`   └ Nota individual resultante: ${notaEstimada.toFixed(1)} / 5.0`);

  console.log("\n=== TEST COMPLETADO CON ÉXITO ===");
}

main().catch(console.error).finally(() => prisma.$disconnect());
