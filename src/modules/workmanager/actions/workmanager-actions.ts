"use server";

import { prisma } from "@/modules/core/lib/prisma";
import type { WorkManagerGroupStatus, WorkManagerStudentStatus } from "../types";

export async function getWorkManagerGroups() {
  try {
    const groups = await prisma.groups.findMany({
      where: { estado: "activo", usa_asistencia: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });
    return { success: true, groups };
  } catch (error: any) {
    return { success: false, groups: [], error: error.message };
  }
}

export async function getWorkManagerGroupLive(groupId: string): Promise<{ success: boolean; data?: WorkManagerGroupStatus; error?: string }> {
  try {
    const group = await prisma.groups.findUnique({
      where: { id: groupId },
      include: { members: { include: { profiles: true } } },
    });

    if (!group) return { success: false, error: "Grupo no encontrado" };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailySession = await prisma.group_daily_sessions.findFirst({
      where: { group_id: groupId, fecha: { gte: today, lt: tomorrow } },
    });

    const memberIds = group.members.map((m) => m.user_id);
    const sessionsToday = await prisma.work_sessions.findMany({
      where: {
        user_id: { in: memberIds },
        ingreso_jornada_at: { gte: today, lt: tomorrow },
      },
    });

    const sessionByStudent: Record<string, (typeof sessionsToday)[0]> = {};
    sessionsToday.forEach((s) => {
      sessionByStudent[s.user_id] = s;
    });

    let presentes = 0;
    let puntuales = 0;
    let retrasados = 0;
    let enBreak = 0;

    const estudiantes: WorkManagerStudentStatus[] = group.members.map((m) => {
      const p = m.profiles;
      const s = sessionByStudent[p.id];

      let estadoConexion: WorkManagerStudentStatus["estadoConexion"] = "sin_ingreso";
      let retrasoIng = 0;
      let retrasoBrk = 0;
      let totRet = 0;

      if (s) {
        presentes++;
        retrasoIng = s.retraso_ingreso_minutos || 0;
        retrasoBrk = s.retraso_break_minutos || 0;
        totRet = s.retraso_minutos || 0;

        if (totRet > 0) retrasados++;
        else puntuales++;

        if (s.inicio_break_at && !s.regreso_break_at) {
          estadoConexion = "en_break";
          enBreak++;
        } else {
          estadoConexion = "en_linea";
        }
      }

      return {
        id: p.id,
        cedula: p.cedula,
        nombres: p.nombres,
        apellidos: p.apellidos,
        estadoConexion,
        ingresoJornadaAt: s?.ingreso_jornada_at ? new Date(s.ingreso_jornada_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        retrasoIngreso: retrasoIng,
        inicioBreakAt: s?.inicio_break_at ? new Date(s.inicio_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        regresoBreakAt: s?.regreso_break_at ? new Date(s.regreso_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        retrasoBreak: retrasoBrk,
        totalRetraso: totRet,
        desconexionesJustificadas: 0,
        enCooldown: false,
      };
    });

    return {
      success: true,
      data: {
        groupId: group.id,
        groupNombre: group.nombre,
        estadoJornada: (dailySession?.estado as any) || "no_iniciado",
        horaInicioProgramada: dailySession?.hora_inicio_programada ? new Date(dailySession.hora_inicio_programada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        iniciadoAt: dailySession?.iniciado_at ? new Date(dailySession.iniciado_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        breakIniciadoAt: dailySession?.break_iniciado_at ? new Date(dailySession.break_iniciado_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        breakDuracionMinutos: dailySession?.break_duracion_minutos || 15,
        breakFinEsperadoAt: dailySession?.break_fin_esperado_at ? new Date(dailySession.break_fin_esperado_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        totalIntegrantes: group.members.length,
        presentesHoy: presentes,
        puntualesHoy: puntuales,
        retrasadosHoy: retrasados,
        enBreakHoy: enBreak,
        estudiantes,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
