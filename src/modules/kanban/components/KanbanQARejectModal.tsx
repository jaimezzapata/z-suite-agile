"use client";

import React, { useState } from "react";
import { X, AlertOctagon, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { QA_REJECTION_REASONS, type KanbanCardItem, type QARejectionReason } from "../types";

interface KanbanQARejectModalProps {
  card: KanbanCardItem | null;
  onClose: () => void;
  onConfirmReject: (cardId: string, reason: QARejectionReason) => void;
}

export function KanbanQARejectModal({ card, onClose, onConfirmReject }: KanbanQARejectModalProps) {
  const [selectedReason, setSelectedReason] = useState<QARejectionReason>(QA_REJECTION_REASONS[0]);

  if (!card) return null;

  const esReincidente = card.rechazosPrevios.includes(selectedReason);
  const esPrimerRechazo = card.rechazosPrevios.length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/20">
          <div className="flex items-center gap-2">
            <AlertOctagon className="text-destructive" size={20} />
            <h3 className="text-lg font-bold">Auditoría QA: Devolver a Progreso</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div>
            <span className="text-xs font-mono font-bold text-primary">{card.codigo}</span>
            <h4 className="text-base font-bold text-foreground mt-0.5">{card.titulo}</h4>
            <p className="text-xs text-muted-foreground mt-1">{card.descripcion}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Motivo Categórico de Rechazo:
            </label>
            <div className="space-y-1.5">
              {QA_REJECTION_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === r
                      ? "bg-primary/10 border-primary text-foreground font-semibold"
                      : "bg-secondary/20 border-border hover:bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-xs">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {esReincidente ? (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-destructive text-xs">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">¡Reincidencia Detectada!</p>
                <p className="text-[11px] mt-0.5 text-destructive/90">
                  Esta historia ya fue devuelta previamente por el mismo motivo. Se aplicará una <strong>penalización automática de -0.2 pts</strong> al estudiante.
                </p>
              </div>
            </div>
          ) : esPrimerRechazo ? (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-2.5 text-blue-500 text-xs">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Primer Rechazo Formativo</p>
                <p className="text-[11px] mt-0.5 text-blue-500/90">
                  El primer rechazo de QA <strong>NO penaliza</strong> para fomentar el aprendizaje continuo del equipo.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 bg-secondary/10">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="solid"
            size="sm"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onConfirmReject(card.id, selectedReason)}
          >
            Devolver a "En Progreso"
          </Button>
        </div>
      </div>
    </div>
  );
}
