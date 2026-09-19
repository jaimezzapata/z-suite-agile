"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";

// Enviar a todos los estudiantes de un grupo al break simultáneamente
export async function sendGroupToBreak(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    // 1. Verificar que el usuario sea administrador o tenga acceso
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { rol: true }
    });

    if (profile?.rol !== "admin") {
      return { success: false, error: "No tienes permisos para esta acción" };
    }

    // 2. Buscar a todos los miembros del grupo
    const groupMembers = await prisma.group_members.findMany({
      where: { group_id: groupId },
      select: { user_id: true }
    });

    const userIds = groupMembers.map(m => m.user_id);

    if (userIds.length === 0) {
      return { success: false, error: "El grupo no tiene estudiantes" };
    }

    // 3. Actualizar todas las sesiones activas de hoy de estos estudiantes
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.work_sessions.updateMany({
      where: {
        user_id: { in: userIds },
        created_at: { gte: today },
        inicio_break_at: null // Solo actualizar a los que no han ido al break aún
      },
      data: {
        inicio_break_at: new Date()
      }
    });

    return { 
      success: true, 
      data: { count: result.count } 
    };

  } catch (error) {
    console.error("Error enviando grupo a break:", error);
    return { success: false, error: "Ocurrió un error al enviar al grupo al break." };
  }
}
