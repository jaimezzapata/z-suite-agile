"use client";

import * as React from "react";
import { Button } from "@/modules/core/components/ui/Button";
import { CreateGroupInput } from "../actions/project-actions";

interface GroupFormProps {
  onSubmit: (data: CreateGroupInput) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function GroupForm({ onSubmit, isLoading, onCancel }: GroupFormProps) {
  const [nombre, setNombre] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [usaAsistencia, setUsaAsistencia] = React.useState(false);
  const [usaKanban, setUsaKanban] = React.useState(false);
  const [usaEvaluacion, setUsaEvaluacion] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nombre,
      descripcion,
      usa_asistencia: usaAsistencia,
      usa_kanban: usaKanban,
      usa_evaluacion: usaEvaluacion,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Grupo</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ej: Desarrollo Web Avanzado"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción (Opcional)</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ej: Grupo de la mañana, ciclo 3..."
        />
      </div>

      <div className="space-y-3 mt-2 border-t border-border pt-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Módulos Activos (Feature Flags)</h4>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex flex-col">
            <span className="font-semibold text-sm group-hover:text-primary transition-colors">WorkManager (Asistencia)</span>
            <span className="text-xs text-muted-foreground">Control de tiempo y bloqueos antifraude.</span>
          </div>
          <input 
            type="checkbox" 
            checked={usaAsistencia} 
            onChange={(e) => setUsaAsistencia(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex flex-col">
            <span className="font-semibold text-sm group-hover:text-primary transition-colors">Kanban (Auditoría QA)</span>
            <span className="text-xs text-muted-foreground">Historias de usuario y penalizaciones por reincidencia.</span>
          </div>
          <input 
            type="checkbox" 
            checked={usaKanban} 
            onChange={(e) => setUsaKanban(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex flex-col">
            <span className="font-semibold text-sm group-hover:text-primary transition-colors">Motor de Evaluación</span>
            <span className="text-xs text-muted-foreground">Cálculo del 70% individual y 30% grupal automático.</span>
          </div>
          <input 
            type="checkbox" 
            checked={usaEvaluacion} 
            onChange={(e) => setUsaEvaluacion(e.target.checked)}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="solid" disabled={isLoading || !nombre.trim()}>
          {isLoading ? "Creando..." : "Crear Grupo"}
        </Button>
      </div>
    </form>
  );
}
