import { useState } from "react";

export function useLogin() {
  const [cedula, setCedula] = useState("");
  const [clave, setClave] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica sincrónica
    if (!cedula.trim() || !clave.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (!/^\d+$/.test(cedula)) {
      setError("La cédula debe contener únicamente números.");
      return;
    }

    setIsLoading(true);

    try {
      // MOCK: Aquí irá la llamada real a la Server Action de Supabase
      // que construirá el correo "[cedula]@zsuite.local".
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simular un error si la cédula es 123 (para que el usuario lo vea)
      if (cedula === "123") {
        throw new Error("Credenciales inválidas.");
      }

      console.log("Login exitoso simulado para:", cedula);
      // Redirigiríamos al dashboard
      // router.push("/dashboard")
      
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al intentar iniciar sesión.");
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
    error,
    handleLogin,
  };
}
