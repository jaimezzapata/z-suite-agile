const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const katherin = await prisma.profiles.findFirst({ where: { nombres: { contains: 'Katherin' } } });
  if (katherin) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const existingToday = await prisma.work_sessions.findFirst({
      where: { user_id: katherin.id, ingreso_jornada_at: { gte: today } }
    });
    if (!existingToday) {
      const proj = await prisma.projects.findFirst();
      await prisma.work_sessions.create({
        data: {
          user_id: katherin.id,
          project_id: proj.id,
          ingreso_jornada_at: new Date(),
          retraso_ingreso_minutos: 14,
          retraso_break_minutos: 0,
          retraso_minutos: 14
        }
      });
    }
  }

  const sessions = await prisma.work_sessions.findMany({
    include: {
      profiles: { select: { nombres: true, apellidos: true, cedula: true } }
    },
    orderBy: { ingreso_jornada_at: 'desc' }
  });

  console.log('Total sesiones registradas:', sessions.length);

  const byUser = {};
  for (const s of sessions) {
    const key = s.profiles ? `${s.profiles.nombres} ${s.profiles.apellidos}` : 'Desconocido';
    if (!byUser[key]) byUser[key] = [];
    byUser[key].push(s);
  }

  console.log('\n--- RESUMEN DE ESTUDIANTES PENALIZADOS ---');
  let penalizedCount = 0;

  for (const [name, userSessions] of Object.entries(byUser)) {
    let penalizedDays = 0;
    const details = [];
    for (const s of userSessions) {
      const ingreso = s.retraso_ingreso_minutos || 0;
      const breakRet = s.retraso_break_minutos || 0;
      const penalized = (ingreso > 0 && breakRet > 0) || ingreso > 10 || breakRet > 5;
      if (penalized) {
        penalizedDays++;
        let motivo = '';
        if (ingreso > 0 && breakRet > 0) motivo = 'Doble retraso (jornada + break)';
        else if (ingreso > 10) motivo = 'Retraso de jornada > 10 min';
        else if (breakRet > 5) motivo = 'Retraso de break > 5 min';

        details.push({
          date: s.ingreso_jornada_at ? s.ingreso_jornada_at.toISOString().slice(0, 10) : 'N/A',
          ingreso: ingreso + 'm',
          break: breakRet + 'm',
          motivo
        });
      }
    }
    const nota = Math.max(0, 5.0 - (penalizedDays * 0.2)).toFixed(1);
    if (penalizedDays > 0) {
      penalizedCount++;
      console.log(`\n• ${name}: Nota Estimada = ${nota}/5.0 (Penalizaciones: ${penalizedDays}, -${(penalizedDays * 0.2).toFixed(1)} pts)`);
      details.forEach(d => console.log(`   └ [${d.date}] ${d.motivo} (Jornada: ${d.ingreso}, Break: ${d.break})`));
    }
  }

  console.log(`\nTotal estudiantes con penalización: ${penalizedCount} de ${Object.keys(byUser).length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
