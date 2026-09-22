"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";
import { calculateAttendancePenalties } from "../lib/penalties";

export async function getStudentDashboardData() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Usuario no autenticado." };
  }

  try {
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        nombres: true,
        apellidos: true,
        avatar_url: true,
        terminos_aceptados_at: true,
      },
    });

    if (!profile) {
      return { success: false, error: "Perfil no encontrado." };
    }

    const groupMember = await prisma.group_members.findFirst({
      where: { user_id: user.id },
      include: {
        groups: { select: { nombre: true } },
      },
    });

    const subgroupMember = await prisma.subgroup_members.findFirst({
      where: { user_id: user.id },
      include: {
        subgroups: {
          include: {
            projects: { select: { nombre: true } },
          },
        },
      },
    });

    const sessions = await prisma.work_sessions.findMany({
      where: { user_id: user.id },
      orderBy: { ingreso_jornada_at: "desc" },
      select: {
        id: true,
        ingreso_jornada_at: true,
        retraso_ingreso_minutos: true,
        retraso_break_minutos: true,
        retraso_minutos: true,
      },
    });

    const penaltiesSummary = calculateAttendancePenalties(sessions as any);

    const qaRejections = await prisma.$queryRawUnsafe<any[]>(
      `SELECT r.id, r.motivo, r.es_reincidente, r.penalizacion_puntos, r.created_at, t.codigo, t.titulo
       FROM public.task_qa_rejections r
       JOIN public.kanban_tasks t ON r.task_id = t.id
       WHERE r.user_id = $1::uuid
       ORDER BY r.created_at DESC`,
      user.id
    );

    const qaRecidivismCount = qaRejections.filter((r) => r.es_reincidente).length;
    if (qaRecidivismCount > 0) {
      penaltiesSummary.totalPenalizaciones += qaRecidivismCount;
      penaltiesSummary.puntosDescontados = Number((penaltiesSummary.puntosDescontados + qaRecidivismCount * 0.2).toFixed(1));
      penaltiesSummary.notaEstimada = Math.max(0, Number((5.0 - penaltiesSummary.puntosDescontados).toFixed(1)));
    }

    let projectName = "Sin proyecto asignado";
    let groupName = "Sin grupo asignado";

    if (groupMember?.groups) {
      groupName = groupMember.groups.nombre;
    }

    if (subgroupMember?.subgroups?.projects) {
      projectName = subgroupMember.subgroups.projects.nombre;
    }

    return {
      success: true,
      data: {
        nombres: profile.nombres,
        apellidos: profile.apellidos,
        avatar_url: profile.avatar_url,
        projectName,
        groupName,
        terminos_aceptados_at: profile.terminos_aceptados_at,
        penaltiesSummary,
      },
    };
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return { success: false, error: "Error al obtener la información." };
  }
}
