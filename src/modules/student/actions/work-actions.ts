"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";

// Obtener la sesión actual de trabajo del día
export async function getCurrentWorkSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "No autenticado" };

  // Buscar una sesión iniciada hoy (esto es simplificado, en un sistema real se usa timezone)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const session = await prisma.work_sessions.findFirst({
      where: {
        user_id: user.id,
        created_at: {
          gte: today,
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return { success: true, data: session };
  } catch (error) {
    console.error("Error getting work session:", error);
    return { success: false, error: "Error al obtener la sesión de trabajo" };
  }
}

// Iniciar Jornada
export async function startWorkday() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    const session = await prisma.work_sessions.create({
      data: {
        user_id: user.id,
        ingreso_jornada_at: new Date(),
      }
    });
    return { success: true, data: session };
  } catch (error) {
    console.error("Error starting workday:", error);
    return { success: false, error: "Error al iniciar la jornada" };
  }
}

// Iniciar Break
export async function startBreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const activeSession = await prisma.work_sessions.findFirst({
      where: { user_id: user.id, created_at: { gte: today } },
      orderBy: { created_at: 'desc' }
    });

    if (!activeSession) return { success: false, error: "No hay jornada activa" };

    const session = await prisma.work_sessions.update({
      where: { id: activeSession.id },
      data: { inicio_break_at: new Date() }
    });
    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: "Error al iniciar break" };
  }
}

// Regresar del Break
export async function endBreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const activeSession = await prisma.work_sessions.findFirst({
      where: { user_id: user.id, created_at: { gte: today } },
      orderBy: { created_at: 'desc' }
    });

    if (!activeSession || !activeSession.inicio_break_at) {
      return { success: false, error: "No hay break activo" };
    }

    const session = await prisma.work_sessions.update({
      where: { id: activeSession.id },
      data: { regreso_break_at: new Date() }
    });
    return { success: true, data: session };
  } catch (error) {
    return { success: false, error: "Error al regresar del break" };
  }
}
