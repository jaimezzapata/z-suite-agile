"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CreateProjectInput, UpdateProjectInput, ProjectWithMembers } from "../types/project-types";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authorized: false, error: "No autenticado" };
  const profile = await prisma.profiles.findUnique({ where: { id: user.id }, select: { id: true, rol: true } });
  if (profile?.rol !== "admin") return { authorized: false, error: "Solo administradores." };
  return { authorized: true, user: profile };
}

async function syncMembers(tx: any, subgroupId: string, memberIds: string[], groupId: string) {
  await tx.subgroup_members.deleteMany({ where: { subgroup_id: subgroupId } });
  if (!memberIds || memberIds.length === 0) return;

  const groupProjs = await tx.projects.findMany({ where: { group_id: groupId }, select: { id: true } });
  const pIds = groupProjs.map((p: any) => p.id);

  await tx.subgroup_members.deleteMany({
    where: { user_id: { in: memberIds }, subgroups: { project_id: { in: pIds } } },
  });

  await tx.subgroup_members.createMany({
    data: memberIds.map((uid) => ({ subgroup_id: subgroupId, user_id: uid, rol_en_equipo: "developer" })),
  });
}

export async function getGroupProjects(groupId: string): Promise<{ success: boolean; error?: string; projects: ProjectWithMembers[] }> {
  try {
    const list = await prisma.projects.findMany({
      where: { group_id: groupId },
      include: {
        subgroups: {
          include: {
            members: { include: { profiles: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const projects: ProjectWithMembers[] = list.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      estado: p.estado,
      group_id: p.group_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
      members: (p.subgroups || []).flatMap((sg) =>
        (sg.members || []).map((m) => ({
          id: m.id,
          user_id: m.user_id,
          nombres: m.profiles.nombres,
          apellidos: m.profiles.apellidos,
          cedula: m.profiles.cedula,
          avatar_url: m.profiles.avatar_url,
          rol_en_equipo: m.rol_en_equipo,
        }))
      ),
    }));

    return { success: true, projects };
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Error al cargar proyectos.", projects: [] };
  }
}

export async function createProject(data: CreateProjectInput) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return { success: false, error: auth.error };

    const project = await prisma.$transaction(async (tx) => {
      const newProj = await tx.projects.create({
        data: {
          group_id: data.group_id,
          nombre: data.nombre.trim(),
          descripcion: data.descripcion?.trim() || null,
          estado: "activo",
        },
      });

      const subgroup = await tx.subgroups.create({
        data: { project_id: newProj.id, nombre: newProj.nombre },
      });

      await syncMembers(tx, subgroup.id, data.member_ids, data.group_id);
      return newProj;
    });

    revalidatePath(`/dashboard/grupos/${data.group_id}`);
    return { success: true, project };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al crear proyecto." };
  }
}

export async function updateProject(data: UpdateProjectInput, groupId: string) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return { success: false, error: auth.error };

    await prisma.$transaction(async (tx) => {
      await tx.projects.update({
        where: { id: data.id },
        data: {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion?.trim() || null,
          estado: data.estado || "activo",
        },
      });

      let subgroup = await tx.subgroups.findFirst({ where: { project_id: data.id } });
      if (!subgroup) {
        subgroup = await tx.subgroups.create({ data: { project_id: data.id, nombre: data.nombre.trim() } });
      }

      await syncMembers(tx, subgroup.id, data.member_ids, groupId);
    });

    revalidatePath(`/dashboard/grupos/${groupId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al actualizar proyecto." };
  }
}

export async function deleteProject(projectId: string, groupId: string) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return { success: false, error: auth.error };

    await prisma.projects.delete({ where: { id: projectId } });
    revalidatePath(`/dashboard/grupos/${groupId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al eliminar proyecto." };
  }
}
