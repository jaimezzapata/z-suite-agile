"use client";

import React from "react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { Activity, Clock, Users, Coffee, AlertTriangle } from "lucide-react";
import type { WorkManagerGroupStatus } from "../types";

interface WorkManagerOverviewProps {
  data: WorkManagerGroupStatus;
}

export function WorkManagerOverview({ data }: WorkManagerOverviewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "iniciado":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">En Jornada</span>;
      case "en_break":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">En Break</span>;
      case "finalizado":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">Finalizada</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary text-muted-foreground">Sin Iniciar</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Activity size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado de Jornada</p>
          <div className="mt-1 flex items-center gap-2">
            {getStatusBadge(data.estadoJornada)}
            {data.iniciadoAt && <span className="text-xs text-muted-foreground font-mono">({data.iniciadoAt})</span>}
          </div>
        </div>
      </DynamicCard>

      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Users size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asistencia Hoy</p>
          <p className="text-2xl font-black mt-1">
            {data.presentesHoy} <span className="text-xs text-muted-foreground font-normal">/ {data.totalIntegrantes}</span>
          </p>
        </div>
      </DynamicCard>

      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
          <Coffee size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estudiantes en Break</p>
          <p className="text-2xl font-black mt-1 text-amber-500">{data.enBreakHoy}</p>
        </div>
      </DynamicCard>

      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retrasos Registrados</p>
          <p className="text-2xl font-black mt-1 text-destructive">{data.retrasadosHoy}</p>
        </div>
      </DynamicCard>
    </div>
  );
}
