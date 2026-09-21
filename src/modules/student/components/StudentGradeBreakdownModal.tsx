"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Award, AlertTriangle, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import type { AttendancePenaltiesSummary } from "../lib/penalties";

interface StudentGradeBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  penaltiesSummary?: AttendancePenaltiesSummary | null;
}

export function StudentGradeBreakdownModal({
  isOpen,
  onClose,
  penaltiesSummary,
}: StudentGradeBreakdownModalProps) {
  if (!penaltiesSummary) return null;

  const { notaEstimada, totalPenalizaciones, puntosDescontados, diasPenalizados } = penaltiesSummary;
  const gradeColor =
    notaEstimada >= 4.5 ? "text-green-500" : notaEstimada >= 3.5 ? "text-amber-500" : "text-destructive";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-lg bg-card text-card-foreground p-6 md:p-8 rounded-2xl shadow-2xl border border-border max-h-[85vh] flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              <X size={20} />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
                <Award size={16} /> Evaluación Operativa Individual (70%)
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Desglose de Calificación</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Inicia en 5.0 y descuenta 0.2 puntos acumulativos por cada día con falta de asistencia.
              </p>
            </div>

            <div className="p-4 bg-secondary/20 rounded-2xl border border-border flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Nota Actual Estimada</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-4xl font-black leading-none ${gradeColor}`}>{notaEstimada.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Faltas Acumuladas</span>
                <div className="text-lg font-bold text-destructive mt-0.5">
                  {totalPenalizaciones} {totalPenalizaciones === 1 ? "día" : "días"} (-{puntosDescontados.toFixed(1)} pts)
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Historial de Penalizaciones</h4>
              {diasPenalizados.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-xl bg-green-500/5 text-muted-foreground">
                  <CheckCircle2 size={36} className="mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-semibold text-foreground">¡Puntualidad Perfecta!</p>
                  <p className="text-xs text-muted-foreground mt-1">No tienes penalizaciones acumuladas en el proyecto.</p>
                </div>
              ) : (
                diasPenalizados.map((d, idx) => (
                  <div key={d.sessionId || idx} className="p-3.5 rounded-xl border border-destructive/30 bg-destructive/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Calendar size={13} className="text-muted-foreground" />
                        {new Date(d.fecha).toLocaleDateString()}
                      </div>
                      <span className="bg-destructive/15 text-destructive font-extrabold px-2 py-0.5 rounded-md text-[11px]">
                        -0.2 pts
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle size={12} className="text-destructive shrink-0" />
                      <span>{d.motivo}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-muted-foreground/80 font-mono pt-1 border-t border-destructive/20">
                      <span>Jornada: {d.retrasoIngreso} min</span>
                      <span>•</span>
                      <span>Break: {d.retrasoBreak} min</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-border mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={onClose}>Entendido</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
