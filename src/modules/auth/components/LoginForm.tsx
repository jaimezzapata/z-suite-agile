import * as React from "react";
import { motion } from "motion/react";
import { Input } from "@/modules/core/components/ui/Input";
import { Label } from "@/modules/core/components/ui/Label";
import { Button } from "@/modules/core/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  cedula: string;
  clave: string;
  isLoading: boolean;
  error: string | null;
  onCedulaChange: (val: string) => void;
  onClaveChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  cedula,
  clave,
  isLoading,
  error,
  onCedulaChange,
  onClaveChange,
  onSubmit,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        // Animación de shake si hay error
        x: error ? [-10, 10, -8, 8, -5, 5, 0] : 0 
      }}
      transition={{ 
        duration: 0.4,
        x: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className={`glass-card w-full max-w-md p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden transition-shadow ${error ? "border-destructive/50 shadow-[0_0_20px_rgba(255,0,0,0.1)]" : ""}`}
    >
      {/* Decoración Neumórfica sutil de fondo dentro de la tarjeta */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      
      <div className="text-center z-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Z-Suite</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 z-10">
        <div className="space-y-2">
          <Label htmlFor="cedula">Cédula</Label>
          <Input
            id="cedula"
            type="text"
            placeholder="Ej: 1020304050"
            value={cedula}
            onChange={(e) => onCedulaChange(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="username"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="clave">Contraseña</Label>
          </div>
          <div className="relative">
            <Input
              id="clave"
              type={showPassword ? "text" : "password"}
              value={clave}
              onChange={(e) => onClaveChange(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-sm font-medium text-destructive mt-1 text-center bg-destructive/10 p-2 rounded-md"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          variant="neumorphic"
          className="w-full mt-4 h-12 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Validando..." : "Ingresar al Workspace"}
        </Button>
      </form>
    </motion.div>
  );
}
