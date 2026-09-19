const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigration() {
  console.log("Adding columns to group_daily_sessions...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "public"."group_daily_sessions" 
    ADD COLUMN IF NOT EXISTS "hora_inicio_programada" TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS "break_duracion_minutos" INTEGER DEFAULT 15,
    ADD COLUMN IF NOT EXISTS "break_fin_esperado_at" TIMESTAMPTZ;
  `);

  console.log("Adding columns to work_sessions...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "public"."work_sessions"
    ADD COLUMN IF NOT EXISTS "retraso_ingreso_minutos" INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "retraso_break_minutos" INTEGER DEFAULT 0;
  `);

  console.log("Migration executed successfully!");
}

runMigration()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
