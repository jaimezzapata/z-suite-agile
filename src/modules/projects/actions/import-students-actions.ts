"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export type StudentInput = {
  cedula: string;
  nombres: string;
  apellidos: string;
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function importStudents(groupId: string, students: StudentInput[]) {
  try {
    const results = {
      success: 0,
      errors: [] as { cedula: string; message: string }[],
    };

    const BATCH_SIZE = 10;
    
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(batch.map(async (student) => {
        const email = `${student.cedula}@zsuite.local`;
        const password = student.cedula;

        try {
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              cedula: student.cedula,
              rol: "student",
            },
          });

          let userId = authData?.user?.id;

          if (authError) {
            if (authError.message.includes("already exists") || authError.status === 422) {
              const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
              const existingUser = listData.users.find(u => u.email === email);
              if (existingUser) {
                userId = existingUser.id;
              } else {
                throw new Error("El usuario ya existe pero no pudo ser encontrado.");
              }
            } else {
              throw new Error(`Auth Error: ${authError.message}`);
            }
          }

          if (!userId) throw new Error("No se pudo obtener el ID del usuario.");

          await prisma.profiles.upsert({
            where: { id: userId },
            update: {
              cedula: student.cedula,
              nombres: student.nombres,
              apellidos: student.apellidos,
              rol: "student",
            },
            create: {
              id: userId,
              cedula: student.cedula,
              nombres: student.nombres,
              apellidos: student.apellidos,
              rol: "student",
            },
          });

          const existingMember = await prisma.group_members.findUnique({
            where: {
              group_id_user_id: { group_id: groupId, user_id: userId }
            }
          });

          if (!existingMember) {
            await prisma.group_members.create({
              data: { group_id: groupId, user_id: userId }
            });
          }

          results.success++;
        } catch (err: any) {
          console.error(`Error importando ${student.cedula}:`, err);
          results.errors.push({ cedula: student.cedula, message: err.message || "Error al procesar." });
        }
      }));
    }

    return {
      success: true,
      results,
    };
  } catch (error: any) {
    console.error("Error fatal en importación masiva:", error);
    return { success: false, error: "Ocurrió un error fatal procesando la importación." };
  }
}
