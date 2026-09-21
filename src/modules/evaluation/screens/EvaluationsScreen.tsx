"use client";

import React from "react";
import { BarChart3, Search, RefreshCw, Filter } from "lucide-react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { Button } from "@/modules/core/components/ui/Button";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { useEvaluations } from "../hooks/useEvaluations";
import { EvaluationStatsCards } from "../components/EvaluationStatsCards";
import { EvaluationStudentTable } from "../components/EvaluationStudentTable";
import { StudentAuditModal } from "../components/StudentAuditModal";

export function EvaluationsScreen() {
  const { state, actions } = useEvaluations();
  const { pattern } = useDesignPattern();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Módulo de Evaluaciones y Métricas</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Historial de notas individuales (70%) calculadas en tiempo real con auditoría de penalizaciones
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-xs">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={state.selectedGroupId}
              onChange={(e) => actions.setSelectedGroupId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {state.groups.map((g) => (
                <option key={g.id} value={g.id} className="bg-card text-foreground">
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={actions.refresh}
            disabled={state.isLoading}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw size={14} className={state.isLoading ? "animate-spin" : ""} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {state.data && (
        <EvaluationStatsCards
          promedioGrupal={state.data.promedioGrupal}
          totalEstudiantes={state.data.totalEstudiantes}
          estudiantesImpecables={state.data.estudiantesImpecables}
          estudiantesConFalta={state.data.estudiantesConFalta}
        />
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Buscar estudiante por nombre o cédula..."
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Mostrando {state.filteredStudents.length} estudiantes
          </span>
        </div>

        <DynamicCard className="overflow-hidden">
          {state.isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando métricas de evaluación...
            </div>
          ) : (
            <EvaluationStudentTable
              students={state.filteredStudents}
              onSelectStudent={actions.setSelectedStudentForAudit}
            />
          )}
        </DynamicCard>
      </div>

      <StudentAuditModal
        student={state.selectedStudentForAudit}
        onClose={() => actions.setSelectedStudentForAudit(null)}
      />
    </div>
  );
}
