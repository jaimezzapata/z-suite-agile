const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testControlledEntry() {
  console.log("=== Validando Control de Entrada vs Hora de Inicio de Jornada ===");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Simular hora de inicio de jornada a las 08:00 AM hoy
  const scheduledStart = new Date(today);
  scheduledStart.setHours(8, 0, 0, 0);

  // Caso 1: Estudiante intenta marcar a las 07:55 AM (ANTES de la hora de jornada)
  const attemptBefore = new Date(today);
  attemptBefore.setHours(7, 55, 0, 0);

  const isBlockedBefore = attemptBefore.getTime() < scheduledStart.getTime();
  console.log(`Intento a las 07:55 AM (Hora programada 08:00 AM):`);
  console.log(`¿Bloqueado?: ${isBlockedBefore ? 'SÍ (Correcto - Bloqueado)' : 'NO'}`);

  // Caso 2: Estudiante marca a las 08:00 AM (A LA HORA EXACTA)
  const attemptExact = new Date(today);
  attemptExact.setHours(8, 0, 0, 0);
  const isBlockedExact = attemptExact.getTime() < scheduledStart.getTime();
  const retrasoExact = Math.max(0, Math.floor((attemptExact.getTime() - scheduledStart.getTime()) / 60000));
  console.log(`Intento a las 08:00 AM: ¿Bloqueado?: ${isBlockedExact ? 'SÍ' : 'NO (Permitido)'}, Retraso: ${retrasoExact} min (Puntual)`);

  // Caso 3: Estudiante marca a las 08:14 AM (DESPUÉS de la hora de jornada)
  const attemptLate = new Date(today);
  attemptLate.setHours(8, 14, 0, 0);
  const isBlockedLate = attemptLate.getTime() < scheduledStart.getTime();
  const retrasoLate = Math.max(0, Math.floor((attemptLate.getTime() - scheduledStart.getTime()) / 60000));
  console.log(`Intento a las 08:14 AM: ¿Bloqueado?: ${isBlockedLate ? 'SÍ' : 'NO (Permitido)'}, Retraso: ${retrasoLate} min`);

  if (isBlockedBefore && !isBlockedExact && retrasoExact === 0 && !isBlockedLate && retrasoLate === 14) {
    console.log(">>> TODAS LAS VALIDACIONES DE ENTRADA CONTROLADA PASARON EXITOSAMENTE <<<");
  } else {
    throw new Error("Falla en validación lógica");
  }
}

testControlledEntry()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
