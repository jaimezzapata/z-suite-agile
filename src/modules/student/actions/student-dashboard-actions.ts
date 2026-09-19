"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";

export async function getStudentDashboardData() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Usuario no autenticado." };
  }

  try {
    // Buscar perfil del usuario
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: {
        nombres: true,
        apellidos: true,
        avatar_url: true,
        terminos_aceptados_at: true,
      }
    });

    if (!profile) {
      return { success: false, error: "Perfil no encontrado." };
    }

    // Buscar a qué grupo pertenece
    const groupMember = await prisma.group_members.findFirst({
      where: { user_id: user.id },
      include: {
        groups: {
          select: { nombre: true }
        }
      }
    });

    // Buscar a qué subgrupo/proyecto pertenece
    const subgroupMember = await prisma.subgroup_members.findFirst({
      where: { user_id: user.id },
      include: {
        subgroups: {
          include: {
            projects: {
              select: { nombre: true }
            }
          }
        }
      }
    });

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
      }
    };
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return { success: false, error: "Error al obtener la información." };
  }
}
