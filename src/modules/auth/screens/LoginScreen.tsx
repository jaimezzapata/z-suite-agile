"use client";

import { useLogin } from "../hooks/useLogin";
import { LoginForm } from "../components/LoginForm";
import { ThemeSwitcher } from "@/modules/core/components/ui/ThemeSwitcher";

export function LoginScreen() {
  const loginState = useLogin();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Botón flotante para cambiar temas (para demo/comodidad) */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Background Shapes para resaltar el Glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      
      {/* Orquestación: Conectamos la UI Pura (LoginForm) con el Estado (useLogin) */}
      <LoginForm
        cedula={loginState.cedula}
        clave={loginState.clave}
        isLoading={loginState.isLoading}
        error={loginState.error}
        onCedulaChange={loginState.setCedula}
        onClaveChange={loginState.setClave}
        onSubmit={loginState.handleLogin}
      />
    </main>
  );
}
