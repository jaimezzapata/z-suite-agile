"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export type StudentInput = {
  cedula: string;
  nombres: string;
  apellidos: string;
};

// Cliente de administrador para bypass de Row Level Security y Auth
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

    // Procesar en lotes de 10 para balancear velocidad y límites de rate de la API
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      
      await Promise.allSettled(batch.map(async (student) => {
        const email = `${student.cedula}@zsuite.local`;
        const password = student.cedula;

        try {
          // 1. Crear el usuario en Supabase Auth
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

          // Si ya existe intentamos encontrar su ID
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

          // 2. Insertar/Actualizar en Profiles
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

          // 3. Matricular en el Grupo
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
          results.errors.push({ cedula: student.cedula, message: err.message });
        }
      }));
    }

    revalidatePath(`/dashboard/grupos/${groupId}`);
    return { success: true, results };
  } catch (error: any) {
    console.error("Error fatal importando estudiantes:", error);
    return { success: false, error: "Ocurrió un error fatal procesando la importación." };
  }
}

export async function getGroupStudents(groupId: string) {
  try {
    const members = await prisma.group_members.findMany({
      where: { group_id: groupId },
      include: {
        profiles: true,
      },
      orderBy: { created_at: "desc" },
    });
    
    // Retornamos directamente los perfiles para facilitar el renderizado
    const students = members.map(m => m.profiles);
    return { success: true, students };
  } catch (error: any) {
    console.error("Error fetching group students:", error);
    return { success: false, error: "No se pudieron cargar los estudiantes." };
  }
}

export async function removeGroupMembers(groupId: string, userIds: string[]) {
  try {
    await prisma.group_members.deleteMany({
      where: {
        group_id: groupId,
        user_id: { in: userIds }
      }
    });

    revalidatePath(`/dashboard/grupos/${groupId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error eliminando estudiantes:", error);
    return { success: false, error: "No se pudieron eliminar los estudiantes seleccionados." };
  }
}
