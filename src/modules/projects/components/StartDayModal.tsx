"use client";

import React, { useState } from "react";
import { Clock, Play, X } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";

interface StartDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hora: string) => void;
  isLoading: boolean;
}

export function StartDayModal({ isOpen, onClose, onConfirm, isLoading }: StartDayModalProps) {
  const [hora, setHora] = useState(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(hora);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Clock size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Iniciar Jornada</h3>
            <p className="text-xs text-muted-foreground">Configura la hora oficial de entrada al grupo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Hora de Inicio de Jornada
            </label>
            <div className="relative">
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-2xl font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Los estudiantes <strong>no podrán marcar entrada</strong> antes de esta hora. A partir de ella se habilitará la marcación y se computarán los minutos de retraso.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !hora}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              <Play size={16} /> {isLoading ? "Iniciando..." : "Iniciar Jornada"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
