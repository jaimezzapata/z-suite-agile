"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";

function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, error: "No autenticado" };

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { rol: true }
  });
  if (profile?.rol !== "admin") {
    return { authorized: false, error: "No tienes permisos para esta acción" };
  }
  return { authorized: true, user };
}

export async function getGroupDailySession(groupId: string) {
  try {
    const session = await prisma.group_daily_sessions.findUnique({
      where: { group_id_fecha: { group_id: groupId, fecha: getTodayDate() } },
    });
    return { success: true, data: session };
  } catch (error) {
    console.error("Error obteniendo sesión diaria:", error);
    return { success: false, error: "Error al consultar jornada diaria." };
  }
}

export async function startGroupDay(groupId: string, horaProgramada?: string) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const today = getTodayDate();
    let scheduledTime = new Date();
    if (horaProgramada && horaProgramada.includes(":")) {
      const [h, m] = horaProgramada.split(":").map(Number);
      scheduledTime.setHours(h, m, 0, 0);
    }
    const session = await prisma.group_daily_sessions.upsert({
      where: { group_id_fecha: { group_id: groupId, fecha: today } },
      update: { estado: "iniciado", iniciado_at: new Date(), hora_inicio_programada: scheduledTime, finalizado_at: null },
      create: { group_id: groupId, fecha: today, estado: "iniciado", iniciado_at: new Date(), hora_inicio_programada: scheduledTime },
    });
    return { success: true, data: session };
  } catch (error) {
    console.error("Error al iniciar día:", error);
    return { success: false, error: "Error al iniciar la jornada diaria." };
  }
}

export async function sendGroupToBreak(groupId: string, duracionMinutos: number = 15) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const today = getTodayDate();
    const now = new Date();
    const finEsperado = new Date(now.getTime() + duracionMinutos * 60 * 1000);
    await prisma.group_daily_sessions.upsert({
      where: { group_id_fecha: { group_id: groupId, fecha: today } },
      update: { estado: "en_break", break_iniciado_at: now, break_duracion_minutos: duracionMinutos, break_fin_esperado_at: finEsperado },
      create: { group_id: groupId, fecha: today, estado: "en_break", break_iniciado_at: now, break_duracion_minutos: duracionMinutos, break_fin_esperado_at: finEsperado },
    });

    const members = await prisma.group_members.findMany({
      where: { group_id: groupId },
      select: { user_id: true }
    });
    const userIds = members.map(m => m.user_id);
    let count = 0;
    if (userIds.length > 0) {
      const result = await prisma.work_sessions.updateMany({
        where: { user_id: { in: userIds }, created_at: { gte: today }, inicio_break_at: null },
        data: { inicio_break_at: now }
      });
      count = result.count;
    }
    return { success: true, data: { count, finEsperado } };
  } catch (error) {
    console.error("Error enviando a break:", error);
    return { success: false, error: "Error al enviar al break." };
  }
}

export async function finalizeGroupDay(groupId: string) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const today = getTodayDate();
    const session = await prisma.group_daily_sessions.upsert({
      where: { group_id_fecha: { group_id: groupId, fecha: today } },
      update: { estado: "finalizado", finalizado_at: new Date() },
      create: { group_id: groupId, fecha: today, estado: "finalizado", finalizado_at: new Date() },
    });
    return { success: true, data: session };
  } catch (error) {
    console.error("Error finalizando día:", error);
    return { success: false, error: "Error al finalizar la jornada." };
  }
}

export async function resetGroupDay(groupId: string) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const today = getTodayDate();
    await prisma.group_daily_sessions.deleteMany({
      where: { group_id: groupId, fecha: today }
    });

    const members = await prisma.group_members.findMany({
      where: { group_id: groupId },
      select: { user_id: true }
    });
    const userIds = members.map(m => m.user_id);

    if (userIds.length > 0) {
      await prisma.work_sessions.deleteMany({
        where: { user_id: { in: userIds }, created_at: { gte: today } }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error reiniciando día:", error);
    return { success: false, error: "Error al reiniciar la jornada del día." };
  }
}
