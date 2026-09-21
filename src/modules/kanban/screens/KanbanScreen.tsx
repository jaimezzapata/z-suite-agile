"use client";

import React from "react";
import { CheckSquare, RefreshCw, Filter, FolderKanban } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { useKanban } from "../hooks/useKanban";
import { KanbanBoard } from "../components/KanbanBoard";
import { KanbanQARejectModal } from "../components/KanbanQARejectModal";

export function KanbanScreen() {
  const { state, actions } = useKanban();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <CheckSquare size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Tablero Kanban & Auditoría QA</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Flujo ágil de historias: Por Hacer &rarr; En Progreso &rarr; QA &rarr; Terminado con política de rechazos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-xs">
            <FolderKanban size={14} className="text-muted-foreground" />
            <select
              value={state.selectedProjectId}
              onChange={(e) => actions.setSelectedProjectId(e.target.value)}
              className="bg-transparent text-sm font-semibold text-foreground focus:outline-none cursor-pointer"
            >
              {state.projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-card text-foreground">
                  {p.nombre} ({p.grupoNombre})
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
            <span>Recargar</span>
          </Button>
        </div>
      </div>

      {state.isLoading ? (
        <div className="p-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/10">
          Cargando tablero del proyecto...
        </div>
      ) : (
        <KanbanBoard
          cards={state.cards}
          onMoveCard={actions.moveCard}
          onRequestRejectQA={actions.setCardToReject}
        />
      )}

      <KanbanQARejectModal
        card={state.cardToReject}
        onClose={() => actions.setCardToReject(null)}
        onConfirmReject={actions.confirmRejectQA}
      />
    </div>
  );
}
