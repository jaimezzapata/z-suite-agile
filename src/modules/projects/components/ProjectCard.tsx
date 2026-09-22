"use client";

import React from "react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { Button } from "@/modules/core/components/ui/Button";
import { Users, Pencil, Trash2, FolderKanban } from "lucide-react";
import type { ProjectWithMembers } from "../types/project-types";

interface ProjectCardProps {
  project: ProjectWithMembers;
  onEdit: (project: ProjectWithMembers) => void;
  onDelete: (project: ProjectWithMembers) => void;
  onViewKanban?: (project: ProjectWithMembers) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onViewKanban }: ProjectCardProps) {
  return (
    <DynamicCard className="p-6 flex flex-col justify-between h-full space-y-4 hover:border-primary/50 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold truncate" title={project.nombre}>
                {project.nombre}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                project.estado === "activo" ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
              }`}>
                {project.estado === "activo" ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">
              {project.descripcion || "Sin descripción proporcionada."}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
              title="Editar proyecto e integrantes"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(project)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Eliminar proyecto"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><Users size={13} /> Integrantes ({project.members.length})</span>
          </div>

          {project.members.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-1">Sin integrantes asignados al equipo.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {project.members.map((m) => (
                <div
                  key={m.user_id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/40 text-xs font-medium border border-border/40"
                  title={`Cédula: ${m.cedula}`}
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                    {m.nombres[0]}{m.apellidos[0]}
                  </span>
                  <span className="truncate max-w-[120px]">{m.nombres} {m.apellidos}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border/50 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewKanban ? onViewKanban(project) : alert("Tablero Kanban próximamente")}
          className="gap-1.5 w-full text-xs font-semibold hover:border-primary"
        >
          <FolderKanban size={14} /> Tablero Kanban
        </Button>
      </div>
    </DynamicCard>
  );
}
