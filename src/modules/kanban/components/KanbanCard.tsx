"use client";

import React from "react";
import { Check, RotateCcw, AlertTriangle, ArrowRight, User } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import type { KanbanCardItem, KanbanColumnId } from "../types";

interface KanbanCardProps {
  card: KanbanCardItem;
  onMoveCard: (cardId: string, toColumn: KanbanColumnId) => void;
  onRequestRejectQA: (card: KanbanCardItem) => void;
}

export function KanbanCard({ card, onMoveCard, onRequestRejectQA }: KanbanCardProps) {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "alta":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive">Alta</span>;
      case "media":
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">Media</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary text-muted-foreground">Baja</span>;
    }
  };

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card/80 shadow-xs hover:shadow-md transition-all flex flex-col gap-2.5">
      <div className="flex justify-between items-center">
        <span className="font-mono text-xs font-bold text-primary">{card.codigo}</span>
        <div className="flex items-center gap-1.5">
          {getPriorityBadge(card.prioridad)}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-secondary text-muted-foreground font-mono">
            {card.puntosHistoria} pts
          </span>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-foreground leading-snug">{card.titulo}</h4>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{card.descripcion}</p>
      </div>

      {card.rechazosPrevios.length > 0 && (
        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertTriangle size={11} className="shrink-0" />
          <span>Rechazos previos: {card.rechazosPrevios.length}</span>
        </div>
      )}

      <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
            {card.asignadoA ? card.asignadoA.nombre[0] : <User size={10} />}
          </div>
          <span className="text-[11px] font-medium truncate max-w-[100px]">
            {card.asignadoA ? card.asignadoA.nombre.split(" ")[0] : "Sin asignar"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {card.columna === "todo" && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1" onClick={() => onMoveCard(card.id, "in_progress")}>
              <span>Iniciar</span> <ArrowRight size={12} />
            </Button>
          )}

          {card.columna === "in_progress" && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1 text-primary hover:text-primary" onClick={() => onMoveCard(card.id, "qa")}>
              <span>A QA</span> <ArrowRight size={12} />
            </Button>
          )}

          {card.columna === "qa" && (
            <>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" title="Devolver a Progreso (Rechazo QA)" onClick={() => onRequestRejectQA(card)}>
                <RotateCcw size={13} />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-500 hover:bg-green-500/10" title="Aprobar Historia a Terminado" onClick={() => onMoveCard(card.id, "done")}>
                <Check size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
