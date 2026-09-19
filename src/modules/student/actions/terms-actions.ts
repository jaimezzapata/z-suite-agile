"use server";

import { prisma } from "@/modules/core/lib/prisma";
import { createClient } from "@/modules/core/lib/supabase/server";

export async function acceptTermsAndConditions() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Usuario no autenticado." };
  }

  try {
    // Actualizamos el campo terminos_aceptados_at con la fecha actual
    await prisma.profiles.update({
      where: { id: user.id },
      data: {
        terminos_aceptados_at: new Date()
      } as any // casteado a any temporalmente si Prisma Client no ha actualizado sus tipos localmente
    });

    return { success: true };
  } catch (error) {
    console.error("Error aceptando términos:", error);
    return { success: false, error: "Ocurrió un error al guardar tu respuesta." };
  }
}
