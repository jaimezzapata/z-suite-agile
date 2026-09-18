"use client";

import { useLogin } from "../hooks/useLogin";
import { LoginForm } from "../components/LoginForm";
import { ThemeSwitcher } from "@/modules/core/components/ui/ThemeSwitcher";
import { CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LoginScreen() {
  const loginState = useLogin();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Botón flotante para cambiar temas (para demo/comodidad) */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      {/* Background Shapes para resaltar el Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
      />
      
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

      {/* Modal de Éxito Superpuesto (Fullscreen Takeover) usando Motion */}
      <AnimatePresence>
        {loginState.isSuccess && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 15, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center mb-6">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-32 h-32 bg-primary/20 rounded-full" 
                />
                <motion.div 
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, delay: 0.3 }}
                  className="relative w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(var(--primary),0.5)]"
                >
                  <CheckCircle2 className="w-12 h-12" strokeWidth={3} />
                </motion.div>
              </div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent"
              >
                ¡Acceso Concedido!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-muted-foreground mt-2 font-medium"
              >
                Preparando tu Workspace...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
