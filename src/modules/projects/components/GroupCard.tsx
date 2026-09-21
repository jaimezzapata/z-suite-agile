"use client";

import * as React from "react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { Clock, CheckSquare, BarChart, Pencil, Trash2 } from "lucide-react";
import type { groups } from "@prisma/client";
import Link from "next/link";

interface GroupCardProps {
  group: groups;
  onEdit?: (group: groups) => void;
  onDelete?: (group: groups) => void;
}

export function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  return (
    <Link href={`/dashboard/grupos/${group.id}`} className="block">
      <DynamicCard className="p-6 flex flex-col gap-4 hover:border-primary/50 transition-colors h-full">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate" title={group.nombre}>
              {group.nombre}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">
              {group.descripcion || "Sin descripción."}
            </p>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <div
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                group.estado === "activo"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {group.estado === "activo" ? "Activo" : "Inactivo"}
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(group);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                title="Editar grupo"
              >
                <Pencil size={15} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(group);
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Eliminar grupo"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Módulos Activos
          </span>
          <div className="flex flex-wrap gap-2 text-sm">
            {group.usa_asistencia ? (
              <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md" title="WorkManager Activo">
                <Clock size={14} /> Asistencia
              </span>
            ) : null}
            {group.usa_kanban ? (
              <span className="flex items-center gap-1 text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md" title="Kanban Activo">
                <CheckSquare size={14} /> Kanban
              </span>
            ) : null}
            {group.usa_evaluacion ? (
              <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md" title="Evaluación Activa">
                <BarChart size={14} /> Evaluación
              </span>
            ) : null}
            {!group.usa_asistencia && !group.usa_kanban && !group.usa_evaluacion && (
              <span className="text-muted-foreground italic text-xs py-1">Ningún módulo activo</span>
            )}
          </div>
        </div>
      </DynamicCard>
    </Link>
  );
}
