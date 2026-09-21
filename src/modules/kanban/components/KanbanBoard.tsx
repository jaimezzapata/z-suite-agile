"use client";

import React from "react";
import { KanbanCard } from "./KanbanCard";
import type { KanbanCardItem, KanbanColumnId } from "../types";

interface KanbanBoardProps {
  cards: KanbanCardItem[];
  onMoveCard: (cardId: string, toColumn: KanbanColumnId) => void;
  onRequestRejectQA: (card: KanbanCardItem) => void;
}

const COLUMNS: { id: KanbanColumnId; label: string; dotColor: string }[] = [
  { id: "todo", label: "Por Hacer", dotColor: "bg-slate-400" },
  { id: "in_progress", label: "En Progreso", dotColor: "bg-blue-500" },
  { id: "qa", label: "Control de Calidad (QA)", dotColor: "bg-amber-500" },
  { id: "done", label: "Terminado", dotColor: "bg-emerald-500" },
];

export function KanbanBoard({ cards, onMoveCard, onRequestRejectQA }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {COLUMNS.map((col) => {
        const columnCards = cards.filter((c) => c.columna === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl border border-border bg-secondary/10 p-3.5 min-h-[480px]"
          >
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {col.label}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-full">
                {columnCards.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
              {columnCards.length === 0 ? (
                <div className="h-32 border border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground italic">
                  Sin tareas
                </div>
              ) : (
                columnCards.map((card) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    onMoveCard={onMoveCard}
                    onRequestRejectQA={onRequestRejectQA}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
