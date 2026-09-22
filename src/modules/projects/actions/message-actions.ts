"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SendMessageInput } from "../types/message-types";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false, error: "No autenticado" };

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { id: true, rol: true },
  });
  if (profile?.rol !== "admin") {
    return { authorized: false, error: "Solo los administradores pueden enviar mensajes." };
  }
  return { authorized: true, user: profile };
}

export async function sendMessageToStudent(input: SendMessageInput) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized || !auth.user) {
      return { success: false, error: auth.error };
    }

    if (!input.contenido || !input.contenido.trim()) {
      return { success: false, error: "El contenido del mensaje no puede estar vacío." };
    }

    const student = await prisma.profiles.findUnique({
      where: { id: input.student_id },
      select: { id: true, rol: true },
    });

    if (!student || student.rol !== "student") {
      return { success: false, error: "El destinatario debe ser un estudiante válido." };
    }

    const message = await prisma.student_messages.create({
      data: {
        student_id: input.student_id,
        sender_id: auth.user.id,
        group_id: input.group_id || null,
        asunto: input.asunto?.trim() || "Mensaje del Administrador",
        contenido: input.contenido.trim(),
        leido: false,
        leido_at: null,
      },
    });

    if (input.group_id) {
      revalidatePath(`/dashboard/grupos/${input.group_id}`);
    }

    return { success: true, message };
  } catch (error: any) {
    console.error("Error sending message to student:", error);
    return {
      success: false,
      error: error?.message || "Ocurrió un error al enviar el mensaje.",
    };
  }
}

export async function getStudentMessagesForAdmin(studentId: string) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return { success: false, error: auth.error, messages: [] };
    }

    const messages = await prisma.student_messages.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: "desc" },
      include: {
        sender: {
          select: { nombres: true, apellidos: true },
        },
      },
    });

    return { success: true, messages };
  } catch (error: any) {
    console.error("Error fetching messages for admin:", error);
    return {
      success: false,
      error: "No se pudieron obtener los mensajes.",
      messages: [],
    };
  }
}
