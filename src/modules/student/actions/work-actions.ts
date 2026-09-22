"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";

const getTodayDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

async function getStudentDailySession(userId: string) {
  const member = await prisma.group_members.findFirst({
    where: { user_id: userId },
    select: { group_id: true }
  });
  if (!member) return null;
  return prisma.group_daily_sessions.findUnique({
    where: { group_id_fecha: { group_id: member.group_id, fecha: getTodayDate() } },
  });
}

export async function getCurrentWorkSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    const today = getTodayDate();
    const session = await prisma.work_sessions.findFirst({
      where: { user_id: user.id, created_at: { gte: today } },
      orderBy: { created_at: 'desc' }
    });
    const dailySession = await getStudentDailySession(user.id);
    return { 
      success: true, 
      data: { workSession: session, dailySession, dailyStatus: dailySession ? dailySession.estado : "no_iniciado" }
    };
  } catch (error) {
    console.error("Error getting work session:", error);
    return { success: false, error: "Error al obtener la sesión de trabajo" };
  }
}

export async function startWorkday() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    const today = getTodayDate();
    const dailySession = await getStudentDailySession(user.id);
    if (!dailySession || dailySession.estado === "no_iniciado") return { success: false, error: "La jornada no ha sido habilitada." };
    if (dailySession.estado === "finalizado") return { success: false, error: "La jornada ya ha sido finalizada." };

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { terminos_aceptados_at: true },
    });
    if (!profile?.terminos_aceptados_at) {
      return { success: false, error: "Debes aceptar los términos y condiciones antes de registrar tu ingreso." };
    }

    const existing = await prisma.work_sessions.findFirst({ where: { user_id: user.id, created_at: { gte: today } } });
    if (existing) return { success: false, error: "Ya registraste tu ingreso hoy." };

    const now = new Date();
    if (dailySession.hora_inicio_programada && now.getTime() < new Date(dailySession.hora_inicio_programada).getTime()) {
      const horaStr = new Date(dailySession.hora_inicio_programada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return { success: false, error: `La jornada inicia a las ${horaStr}. No puedes marcar entrada antes de la hora definida.` };
    }

    const horaEsp = dailySession.hora_inicio_programada || dailySession.iniciado_at;
    let retraso = 0;
    if (horaEsp && now.getTime() > new Date(horaEsp).getTime()) {
      retraso = Math.max(0, Math.floor((now.getTime() - new Date(horaEsp).getTime()) / 60000));
    }

    const session = await prisma.work_sessions.create({
      data: { user_id: user.id, ingreso_jornada_at: now, retraso_ingreso_minutos: retraso, retraso_minutos: retraso }
    });
    return { success: true, data: session };
  } catch (error) {
    console.error("Error starting workday:", error);
    return { success: false, error: "Error al iniciar la jornada" };
  }
}

export async function startBreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    const today = getTodayDate();
    const active = await prisma.work_sessions.findFirst({
      where: { user_id: user.id, created_at: { gte: today } },
      orderBy: { created_at: 'desc' }
    });
    if (!active) return { success: false, error: "No hay jornada activa" };

    const session = await prisma.work_sessions.update({
      where: { id: active.id },
      data: { inicio_break_at: new Date() }
    });
    return { success: true, data: session };
  } catch {
    return { success: false, error: "Error al iniciar break" };
  }
}

export async function endBreak() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  try {
    const today = getTodayDate();
    const daily = await getStudentDailySession(user.id);
    if (daily?.estado === "finalizado") return { success: false, error: "La jornada ya ha sido finalizada." };

    const active = await prisma.work_sessions.findFirst({
      where: { user_id: user.id, created_at: { gte: today } },
      orderBy: { created_at: 'desc' }
    });
    if (!active || !active.inicio_break_at) return { success: false, error: "No hay break activo para retornar" };

    const now = new Date();
    let retrasoBreak = 0;
    if (daily?.break_fin_esperado_at && now.getTime() > new Date(daily.break_fin_esperado_at).getTime()) {
      retrasoBreak = Math.max(0, Math.floor((now.getTime() - new Date(daily.break_fin_esperado_at).getTime()) / 60000));
    }
    const total = (active.retraso_ingreso_minutos || 0) + retrasoBreak;

    const session = await prisma.work_sessions.update({
      where: { id: active.id },
      data: { regreso_break_at: now, retraso_break_minutos: retrasoBreak, retraso_minutos: total }
    });
    return { success: true, data: session };
  } catch {
    return { success: false, error: "Error al regresar del break" };
  }
}
