"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateGroupInput = {
  nombre: string;
  descripcion?: string;
  usa_asistencia: boolean;
  usa_kanban: boolean;
  usa_evaluacion: boolean;
};

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
