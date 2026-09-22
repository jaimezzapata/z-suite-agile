"use client";

import React, { useState } from "react";
import { Coffee, X } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";

interface SendBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (duracionMinutos: number) => void;
  isLoading: boolean;
}

const PRESETS = [10, 15, 20, 30, 45];

export function SendBreakModal({ isOpen, onClose, onConfirm, isLoading }: SendBreakModalProps) {
  const [duracion, setDuracion] = useState(15);

  if (!isOpen) return null;

  const returnTime = new Date(Date.now() + duracion * 60 * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(duracion);
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
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Coffee size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Mandar Grupo a Break</h3>
            <p className="text-xs text-muted-foreground">Configura los minutos de descanso permitidos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Duración del Break (Minutos)
            </label>
            <div className="flex gap-2 mb-3">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDuracion(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    duracion === p
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                      : "bg-secondary/30 border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p} min
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border text-center">
              <span className="text-xs text-muted-foreground">Regreso límite esperado:</span>
              <p className="text-xl font-bold font-mono text-amber-500 mt-0.5">{returnTime}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || duracion <= 0}
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              <Coffee size={16} /> {isLoading ? "Enviando..." : "Confirmar Break"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
