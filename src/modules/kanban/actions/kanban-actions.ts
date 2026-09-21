"use server";

import { prisma } from "@/modules/core/lib/prisma";
import type { KanbanProjectOption, KanbanCardItem, KanbanColumnId, QARejectionReason } from "../types";

export async function getKanbanProjects(): Promise<{ success: boolean; projects: KanbanProjectOption[]; error?: string }> {
  try {
    const projects = await prisma.projects.findMany({
      where: { estado: "activo" },
      include: { groups: { select: { nombre: true, id: true } } },
      orderBy: { nombre: "asc" },
    });

    return {
      success: true,
      projects: projects.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        grupoNombre: p.groups.nombre,
        groupId: p.groups.id,
      })),
    };
  } catch (error: any) {
    return { success: false, projects: [], error: error.message };
  }
}

export async function getProjectKanbanBoard(projectId: string): Promise<{
  success: boolean;
  cards: KanbanCardItem[];
  error?: string;
}> {
  try {
    const rawTasks = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        t.id, t.project_id, t.codigo, t.titulo, t.descripcion, t.columna, t.prioridad, t.puntos_historia,
        p.id as assigned_id, p.nombres as assigned_nombres, p.apellidos as assigned_apellidos, p.avatar_url as assigned_avatar
       FROM public.kanban_tasks t
       LEFT JOIN public.profiles p ON t.assigned_to = p.id
       WHERE t.project_id = $1::uuid
       ORDER BY t.codigo ASC`,
      projectId
    );

    const taskIds = rawTasks.map((t) => t.id);
    let rawRejections: any[] = [];
    if (taskIds.length > 0) {
      rawRejections = await prisma.$queryRawUnsafe<any[]>(
        `SELECT task_id, motivo, es_reincidente, penalizacion_puntos
         FROM public.task_qa_rejections
         WHERE task_id = ANY($1::uuid[])
         ORDER BY created_at ASC`,
        taskIds
      );
    }

    const rejectionsByTask: Record<string, any[]> = {};
    rawRejections.forEach((r) => {
      if (!rejectionsByTask[r.task_id]) rejectionsByTask[r.task_id] = [];
      rejectionsByTask[r.task_id].push(r);
    });

    const cards: KanbanCardItem[] = rawTasks.map((t) => {
      const taskRejections = rejectionsByTask[t.id] || [];
      const previousReasons = taskRejections.map((r) => r.motivo as QARejectionReason);
      const isPenalized = taskRejections.some((r) => r.es_reincidente);

      return {
        id: t.id,
        projectId: t.project_id,
        codigo: t.codigo,
        titulo: t.titulo,
        descripcion: t.descripcion || "",
        columna: t.columna as KanbanColumnId,
        prioridad: t.prioridad as any,
        puntosHistoria: Number(t.puntos_historia || 3),
        asignadoA: t.assigned_id
          ? {
              id: t.assigned_id,
              nombre: `${t.assigned_nombres} ${t.assigned_apellidos}`,
              avatarUrl: t.assigned_avatar,
            }
          : undefined,
        rechazosPrevios: previousReasons,
        penalizadoPorReincidencia: isPenalized,
      };
    });

    return { success: true, cards };
  } catch (error: any) {
    return { success: false, cards: [], error: error.message };
  }
}

export async function moveKanbanTask(
  taskId: string,
  toColumn: KanbanColumnId
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE public.kanban_tasks 
       SET columna = $1, updated_at = timezone('utc', now())
       WHERE id = $2::uuid`,
      toColumn,
      taskId
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectKanbanTaskQA(
  taskId: string,
  motivo: QARejectionReason
): Promise<{ success: boolean; esReincidente?: boolean; penalizacionPuntos?: number; error?: string }> {
  try {
    const tasks = await prisma.$queryRawUnsafe<any[]>(
      `SELECT assigned_to FROM public.kanban_tasks WHERE id = $1::uuid`,
      taskId
    );
    if (!tasks || tasks.length === 0) return { success: false, error: "Tarea no encontrada" };

    const userId = tasks[0].assigned_to;
    const prevRejections = await prisma.$queryRawUnsafe<any[]>(
      `SELECT motivo FROM public.task_qa_rejections WHERE task_id = $1::uuid`,
      taskId
    );

    const esReincidente = prevRejections.some((r) => r.motivo === motivo);
    const penalizacionPuntos = esReincidente ? 0.2 : 0.0;

    if (userId) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO public.task_qa_rejections (task_id, user_id, motivo, es_reincidente, penalizacion_puntos)
         VALUES ($1::uuid, $2::uuid, $3, $4, $5)`,
        taskId,
        userId,
        motivo,
        esReincidente,
        penalizacionPuntos
      );
    }

    await prisma.$executeRawUnsafe(
      `UPDATE public.kanban_tasks 
       SET columna = 'in_progress', updated_at = timezone('utc', now())
       WHERE id = $1::uuid`,
      taskId
    );

    return { success: true, esReincidente, penalizacionPuntos };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
