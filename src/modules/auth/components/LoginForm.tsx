import * as React from "react";
import { Input } from "@/modules/core/components/ui/Input";
import { Label } from "@/modules/core/components/ui/Label";
import { Button } from "@/modules/core/components/ui/Button";

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
  return (
    <div className="glass-card w-full max-w-md p-8 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
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
          <Input
            id="clave"
            type="password"
            value={clave}
            onChange={(e) => onClaveChange(e.target.value)}
            disabled={isLoading}
            required
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive mt-1 text-center bg-destructive/10 p-2 rounded-md">
            {error}
          </p>
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
    </div>
  );
}
