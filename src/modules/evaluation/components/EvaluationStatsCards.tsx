"use client";

import React from "react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { Award, Users, CheckCircle2, AlertTriangle } from "lucide-react";

interface EvaluationStatsCardsProps {
  promedioGrupal: number;
  totalEstudiantes: number;
  estudiantesImpecables: number;
  estudiantesConFalta: number;
}

export function EvaluationStatsCards({
  promedioGrupal,
  totalEstudiantes,
  estudiantesImpecables,
  estudiantesConFalta,
}: EvaluationStatsCardsProps) {
  const getAverageBadgeColor = (avg: number) => {
    if (avg >= 4.5) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (avg >= 3.5) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Award size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Promedio Grupal</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black">{promedioGrupal.toFixed(1)}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getAverageBadgeColor(promedioGrupal)}`}>
              de 5.0
            </span>
          </div>
        </div>
      </DynamicCard>

      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Users size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Estudiantes</p>
          <p className="text-2xl font-black mt-1">{totalEstudiantes}</p>
        </div>
      </DynamicCard>

      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nota Perfecta (5.0)</p>
          <p className="text-2xl font-black mt-1 text-emerald-500">{estudiantesImpecables}</p>
        </div>
      </DynamicCard>

      <DynamicCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Con Penalizaciones</p>
          <p className="text-2xl font-black mt-1 text-destructive">{estudiantesConFalta}</p>
        </div>
      </DynamicCard>
    </div>
  );
}
