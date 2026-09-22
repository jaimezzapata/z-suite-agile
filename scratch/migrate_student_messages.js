const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigration() {
  console.log("Creating student_messages table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "public"."student_messages" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "student_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
      "sender_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
      "group_id" UUID REFERENCES "public"."groups"("id") ON DELETE SET NULL,
      "asunto" VARCHAR(255) DEFAULT 'Mensaje del Administrador',
      "contenido" TEXT NOT NULL,
      "leido" BOOLEAN NOT NULL DEFAULT FALSE,
      "leido_at" TIMESTAMPTZ,
      "created_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      "updated_at" TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    );
  `);

  console.log("Creating indexes...");
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_student_messages_student_id" ON "public"."student_messages"("student_id");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_student_messages_sender_id" ON "public"."student_messages"("sender_id");`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_student_messages_group_id" ON "public"."student_messages"("group_id");`);

  console.log("Creating trigger function to enforce Admin-to-Student direction...");
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION check_admin_sender_student_receiver()
    RETURNS TRIGGER AS $$
    DECLARE
      sender_role VARCHAR;
      receiver_role VARCHAR;
    BEGIN
      SELECT rol INTO sender_role FROM public.profiles WHERE id = NEW.sender_id;
      SELECT rol INTO receiver_role FROM public.profiles WHERE id = NEW.student_id;
      
      IF sender_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Acceso denegado: Solo un usuario con rol admin puede enviar mensajes.';
      END IF;
      
      IF receiver_role IS DISTINCT FROM 'student' THEN
        RAISE EXCEPTION 'Acceso denegado: Los mensajes solo pueden enviarse a estudiantes.';
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  console.log("Attaching trigger...");
  await prisma.$executeRawUnsafe(`DROP TRIGGER IF EXISTS trg_validate_student_messages ON public.student_messages;`);
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trg_validate_student_messages
    BEFORE INSERT ON public.student_messages
    FOR EACH ROW
    EXECUTE FUNCTION check_admin_sender_student_receiver();
  `);

  console.log("Migration executed successfully!");
}

runMigration()
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
