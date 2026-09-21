"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { revalidatePath } from "next/cache";
import type { CreateGroupInput, UpdateGroupInput } from "../types/group-types";

export type { CreateGroupInput, UpdateGroupInput };

export async function createGroup(data: CreateGroupInput) {
  try {
    const group = await prisma.groups.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        usa_asistencia: data.usa_asistencia,
        usa_kanban: data.usa_kanban,
        usa_evaluacion: data.usa_evaluacion,
        estado: "activo",
      },
    });

    revalidatePath("/dashboard/grupos");
    return { success: true, group };
  } catch (error: any) {
    console.error("Error creating group:", error);
    return { success: false, error: "No se pudo crear el grupo. Intenta nuevamente." };
  }
}

export async function updateGroup(id: string, data: UpdateGroupInput) {
  try {
    const group = await prisma.groups.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        estado: data.estado || "activo",
        usa_asistencia: data.usa_asistencia,
        usa_kanban: data.usa_kanban,
        usa_evaluacion: data.usa_evaluacion,
      },
    });

    revalidatePath("/dashboard/grupos");
    revalidatePath(`/dashboard/grupos/${id}`);
    return { success: true, group };
  } catch (error: any) {
    console.error("Error updating group:", error);
    return { success: false, error: "No se pudo actualizar el grupo. Intenta nuevamente." };
  }
}

export async function deleteGroup(id: string) {
  try {
    await prisma.groups.delete({
      where: { id },
    });

    revalidatePath("/dashboard/grupos");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting group:", error);
    return { success: false, error: "No se pudo eliminar el grupo. Intenta nuevamente." };
  }
}

export async function getGroups() {
  try {
    const groups = await prisma.groups.findMany({
      orderBy: { created_at: "desc" },
    });
    return { success: true, groups };
  } catch (error: any) {
    console.error("Error fetching groups:", error);
    return { success: false, error: "No se pudieron cargar los grupos." };
  }
}
