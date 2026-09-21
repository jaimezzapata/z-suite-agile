"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { calculateAttendancePenalties, evaluateSessionPenalty } from "@/modules/student/lib/penalties";
import type { GroupEvaluationData, GroupOption, StudentEvaluationRecord, StudentSessionAuditItem } from "../types";

export async function getEvaluationGroups(): Promise<{ success: boolean; groups: GroupOption[]; error?: string }> {
  try {
    const groups = await prisma.groups.findMany({
      where: { estado: "activo" },
      select: { id: true, nombre: true, usa_evaluacion: true },
      orderBy: { nombre: "asc" },
    });
    return { success: true, groups };
  } catch (error: any) {
    return { success: false, groups: [], error: error.message };
  }
}

export async function getGroupEvaluationMetrics(groupId: string): Promise<{ success: boolean; data?: GroupEvaluationData; error?: string }> {
  try {
    const group = await prisma.groups.findUnique({
      where: { id: groupId },
      include: {
        members: { include: { profiles: true } },
        projects: {
          include: {
            subgroups: { include: { members: true } }
          }
        }
      }
    });

    if (!group) return { success: false, error: "Grupo no encontrado" };

    const userProjectMap: Record<string, string> = {};
    group.projects.forEach((proj) => {
      proj.subgroups.forEach((sub) => {
        sub.members.forEach((m) => {
          userProjectMap[m.user_id] = proj.nombre;
        });
      });
    });

    const studentIds = group.members.map((m) => m.user_id);
    const sessions = await prisma.work_sessions.findMany({
      where: { user_id: { in: studentIds } },
      orderBy: { ingreso_jornada_at: "desc" },
    });

    const sessionsByUser: Record<string, typeof sessions> = {};
    sessions.forEach((s) => {
      if (!sessionsByUser[s.user_id]) sessionsByUser[s.user_id] = [];
      sessionsByUser[s.user_id].push(s);
    });

    const qaRejections = studentIds.length > 0 ? await prisma.$queryRawUnsafe<any[]>(
      `SELECT r.id, r.user_id, r.motivo, r.es_reincidente, r.penalizacion_puntos, r.created_at, t.codigo, t.titulo
       FROM public.task_qa_rejections r
       JOIN public.kanban_tasks t ON r.task_id = t.id
       WHERE r.user_id = ANY($1::uuid[])
       ORDER BY r.created_at DESC`,
      studentIds
    ) : [];

    const qaByUser: Record<string, any[]> = {};
    qaRejections.forEach((r) => {
      if (!qaByUser[r.user_id]) qaByUser[r.user_id] = [];
      qaByUser[r.user_id].push(r);
    });

    const studentRecords: StudentEvaluationRecord[] = group.members.map((m) => {
      const p = m.profiles;
      const userSessions = sessionsByUser[p.id] || [];
      const penaltiesSummary = calculateAttendancePenalties(userSessions as any);

      const userQA = qaByUser[p.id] || [];
      const qaPenaltiesCount = userQA.filter((r) => r.es_reincidente).length;
      const totalPenalizaciones = penaltiesSummary.totalPenalizaciones + qaPenaltiesCount;
      const puntosDescontados = Number((penaltiesSummary.puntosDescontados + qaPenaltiesCount * 0.2).toFixed(1));
      const notaEstimada = Math.max(0, Number((5.0 - puntosDescontados).toFixed(1)));

      const auditSessions: StudentSessionAuditItem[] = userSessions.map((s) => ({
        id: s.id,
        fecha: s.ingreso_jornada_at ? s.ingreso_jornada_at.toISOString().slice(0, 10) : "N/A",
        horaIngreso: s.ingreso_jornada_at ? new Date(s.ingreso_jornada_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--",
        retrasoIngreso: s.retraso_ingreso_minutos || 0,
        horaInicioBreak: s.inicio_break_at ? new Date(s.inicio_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        horaFinBreak: s.regreso_break_at ? new Date(s.regreso_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        retrasoBreak: s.retraso_break_minutos || 0,
        totalRetraso: s.retraso_minutos || 0,
        evaluation: evaluateSessionPenalty(s as any),
      }));

      const auditQA = userQA.map((r) => ({
        id: r.id,
        codigoTarea: r.codigo,
        tituloTarea: r.titulo,
        motivo: r.motivo,
        esReincidente: Boolean(r.es_reincidente),
        penalizacionPuntos: Number(r.penalizacion_puntos || 0),
        fecha: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "N/A",
      }));

      return {
        id: p.id,
        cedula: p.cedula,
        nombres: p.nombres,
        apellidos: p.apellidos,
        proyecto: userProjectMap[p.id] || null,
        diasAsistidos: userSessions.length,
        totalPenalizaciones,
        puntosDescontados,
        notaEstimada,
        penaltiesSummary,
        sesiones: auditSessions,
        qaRejections: auditQA,
      };
    });

    const totalStudents = studentRecords.length;
    const conFalta = studentRecords.filter((s) => s.totalPenalizaciones > 0).length;
    const impecables = studentRecords.filter((s) => s.totalPenalizaciones === 0).length;
    const sumaNotas = studentRecords.reduce((acc, s) => acc + s.notaEstimada, 0);
    const promedioGrupal = totalStudents > 0 ? Number((sumaNotas / totalStudents).toFixed(2)) : 5.0;

    return {
      success: true,
      data: {
        groupId: group.id,
        groupNombre: group.nombre,
        promedioGrupal,
        totalEstudiantes: totalStudents,
        estudiantesConFalta: conFalta,
        estudiantesImpecables: impecables,
        estudiantes: studentRecords,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
