"use client";

import React from "react";
import { Clock, Search, RefreshCw, Filter } from "lucide-react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { Button } from "@/modules/core/components/ui/Button";
import { useWorkManager } from "../hooks/useWorkManager";
import { WorkManagerOverview } from "../components/WorkManagerOverview";
import { WorkManagerSessionsTable } from "../components/WorkManagerSessionsTable";

export function WorkManagerScreen() {
  const { state, actions } = useWorkManager();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Clock size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Supervisión en Vivo: WorkManager</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control operativo, antifraude y monitoreo de marcaciones en tiempo real
            </p>
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
            <span>Monitorear</span>
          </Button>
        </div>
      </div>

      {state.liveData && <WorkManagerOverview data={state.liveData} />}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Buscar estudiante en jornada..."
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/40 focus:outline-none"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Total en lista: {state.filteredStudents.length}
          </span>
        </div>

        <DynamicCard className="overflow-hidden">
          {state.isLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Cargando monitor de WorkManager...
            </div>
          ) : (
            <WorkManagerSessionsTable students={state.filteredStudents} />
          )}
        </DynamicCard>
      </div>
    </div>
  );
}
