const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== CREANDO TABLAS DE KANBAN Y AUDITORÍA QA ===");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.kanban_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      codigo VARCHAR(50) NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT,
      columna VARCHAR(50) NOT NULL DEFAULT 'todo',
      prioridad VARCHAR(50) NOT NULL DEFAULT 'media',
      puntos_historia INT NOT NULL DEFAULT 3,
      created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
      updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS public.task_qa_rejections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES public.kanban_tasks(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      motivo VARCHAR(255) NOT NULL,
      es_reincidente BOOLEAN DEFAULT false,
      penalizacion_puntos NUMERIC(3,2) DEFAULT 0.0,
      created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
    );
  `);

  console.log("✓ Tablas kanban_tasks y task_qa_rejections creadas correctamente.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
