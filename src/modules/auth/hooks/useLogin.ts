import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/modules/core/lib/supabase/client";
import { useRole } from "@/modules/core/contexts/RoleProvider";

export function useLogin() {
  const router = useRouter();
  const { setRealRole } = useRole();
  const [cedula, setCedula] = useState("");
  const [clave, setClave] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generar un random en el error permite que el React Effect se vuelva a disparar 
    // y la tarjeta tiemble siempre que haya un error, incluso si es el mismo texto.
    setError(null);

    if (!cedula.trim() || !clave.trim()) {
      setError("Por favor, completa todos los campos. " + Date.now()); // Date.now() oculto para forzar cambio de ref
      return;
    }

    if (!/^\d+$/.test(cedula)) {
      setError("La cédula debe contener únicamente números. " + Date.now());
      return;
    }

    setIsLoading(true);

    try {
      const phantomEmail = `${cedula}@zsuite.local`;

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: phantomEmail,
        password: clave,
      });

      if (authError || !data.user) {
        throw new Error("Credenciales inválidas o usuario no registrado.");
      }

      console.log("Login exitoso real para:", data.user.id);
      
      // Ir a buscar el rol a la tabla profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (!profileError && profile?.rol) {
        setRealRole(profile.rol as "admin" | "student");
      }
      
      // Activar la animación de éxito
      setIsSuccess(true);
      
      // Esperar 2 segundos para que se aprecie la animación antes de redirigir
      setTimeout(() => {
        router.push("/dashboard"); // Cambiaremos esto cuando el dashboard exista
      }, 2000);
      
    } catch (err: any) {
      // Limpiamos el texto del error de la marca de tiempo visual
      const msg = err.message || "Ocurrió un error al intentar iniciar sesión.";
      setError(msg + "___" + Date.now()); // Hack para forzar el cambio de estado y re-animar
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cedula,
    setCedula,
    clave,
    setClave,
    isLoading,
    error: error ? error.split("___")[0].replace(/\d{13}$/, "").trim() : null, // Limpiamos el timestamp al exponerlo
    isSuccess,
    handleLogin,
  };
}
