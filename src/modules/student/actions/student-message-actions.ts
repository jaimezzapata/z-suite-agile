"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";

export async function getMyMessages() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "No autenticado", messages: [] };
    }

    const messages = await prisma.student_messages.findMany({
      where: { student_id: user.id },
      orderBy: { created_at: "desc" },
      include: {
        sender: {
          select: { nombres: true, apellidos: true },
        },
      },
    });

    return { success: true, messages };
  } catch (error: any) {
    console.error("Error fetching my messages:", error);
    return { success: false, error: "Error al cargar los mensajes", messages: [] };
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    const message = await prisma.student_messages.findFirst({
      where: { id: messageId, student_id: user.id },
    });

    if (!message) {
      return { success: false, error: "Mensaje no encontrado" };
    }

    if (!message.leido) {
      await prisma.student_messages.update({
        where: { id: messageId },
        data: {
          leido: true,
          leido_at: new Date(),
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error marking message as read:", error);
    return { success: false, error: "Error al actualizar mensaje" };
  }
}
