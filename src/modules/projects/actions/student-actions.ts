"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getGroupStudents(groupId: string) {
  try {
    const members = await prisma.group_members.findMany({
      where: { group_id: groupId },
      include: {
        profiles: {
          include: {
            work_sessions: {
              orderBy: { created_at: "desc" },
              take: 1,
            }
          }
        },
      },
      orderBy: { created_at: "desc" },
    });
    
    const students = members.map((m: any) => m.profiles);
    return { success: true, students };
  } catch (error: any) {
    console.error("Error fetching group students:", error);
    return { success: false, error: "No se pudieron cargar los estudiantes." };
  }
}

export async function removeGroupMembers(groupId: string, userIds: string[]) {
  try {
    for (const userId of userIds) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
    revalidatePath(`/dashboard/grupos/${groupId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error eliminando estudiantes:", error);
    return { success: false, error: "No se pudieron eliminar los estudiantes seleccionados." };
  }
}

export async function resetStudentData(userId: string) {
  try {
    const profile = await prisma.profiles.findUnique({
      where: { id: userId },
      select: { cedula: true }
    });
    if (!profile) return { success: false, error: "Estudiante no encontrado." };

    await prisma.profiles.update({
      where: { id: userId },
      data: { terminos_aceptados_at: null, avatar_url: null } as any
    });
    await prisma.work_sessions.deleteMany({ where: { user_id: userId } });
    await prisma.subgroup_members.deleteMany({ where: { user_id: userId } });

    if (profile.cedula) {
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: profile.cedula });
    }
    return { success: true };
  } catch (error: any) {
    console.error("Error restableciendo estudiante:", error);
    return { success: false, error: "No se pudo restablecer el estudiante por completo." };
  }
}

export async function updateStudent(
  studentId: string,
  data: { cedula: string; nombres: string; apellidos: string }
) {
  try {
    const cedula = data.cedula.trim();
    const nombres = data.nombres.trim();
    const apellidos = data.apellidos.trim();

    if (!cedula || !nombres || !apellidos) {
      return { success: false, error: "Todos los campos son obligatorios." };
    }

    const current = await prisma.profiles.findUnique({
      where: { id: studentId },
      select: { cedula: true }
    });
    if (!current) return { success: false, error: "Estudiante no encontrado." };

    if (cedula !== current.cedula) {
      const existing = await prisma.profiles.findUnique({ where: { cedula } });
      if (existing) return { success: false, error: "Ya existe un estudiante con esa cédula." };

      await supabaseAdmin.auth.admin.updateUserById(studentId, {
        email: `${cedula}@zsuite.local`,
        user_metadata: { cedula, rol: "student" }
      });
    }

    const updated = await prisma.profiles.update({
      where: { id: studentId },
      data: { cedula, nombres, apellidos }
    });
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error actualizando estudiante:", error);
    return { success: false, error: "No se pudo actualizar el estudiante." };
  }
}
