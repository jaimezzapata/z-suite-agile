"use client";

import React from "react";
import { X, Clock, Coffee, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import type { StudentEvaluationRecord } from "../types";

interface StudentAuditModalProps {
  student: StudentEvaluationRecord | null;
  onClose: () => void;
}

export function StudentAuditModal({ student, onClose }: StudentAuditModalProps) {
  const { pattern } = useDesignPattern();
  const isNeu = pattern === "neumorphism";

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden ${isNeu ? "neu-flat" : ""}`}>
        <div className="p-5 border-b border-border flex justify-between items-center bg-secondary/20">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-primary" size={20} />
              <h3 className="text-lg font-bold">Auditoría y Registro de Calificación</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {student.nombres} {student.apellidos} &bull; Cédula: {student.cedula}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <X size={18} />
          </Button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-secondary/30 border border-border text-center">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-bold">Nota Individual</p>
              <p className="text-2xl font-black text-primary mt-0.5">{student.notaEstimada.toFixed(1)} / 5.0</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-bold">Faltas Acumuladas</p>
              <p className="text-2xl font-black text-destructive mt-0.5">{student.totalPenalizaciones}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-bold">Puntos Restados</p>
              <p className="text-2xl font-black text-amber-500 mt-0.5">-{student.puntosDescontados.toFixed(1)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Historial de Marcaciones y Asistencia</h4>

            {student.sesiones.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Sin sesiones registradas.</p>
            ) : (
              student.sesiones.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border transition-all text-xs ${
                    s.evaluation.tienePenalizacion
                      ? "bg-destructive/5 border-destructive/20"
                      : "bg-secondary/15 border-border/40"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold font-mono text-foreground">{s.fecha}</span>
                    {s.evaluation.tienePenalizacion ? (
                      <span className="inline-flex items-center gap-1 font-bold text-destructive px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-[11px]">
                        <AlertCircle size={12} /> -0.2 pts (Asistencia)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                        <CheckCircle2 size={12} /> Sin sanción
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px]">
                    <span>Ingreso: <strong>{s.horaIngreso}</strong> {s.retrasoIngreso > 0 && <b className="text-amber-500">(+{s.retrasoIngreso}m)</b>}</span>
                    {s.horaInicioBreak && <span>Break: <strong>{s.horaInicioBreak} → {s.horaFinBreak || "--"}</strong> {s.retrasoBreak > 0 && <b className="text-amber-500">(+{s.retrasoBreak}m)</b>}</span>}
                  </div>
                  {s.evaluation.motivo && <p className="mt-1 text-[11px] text-destructive font-medium">{s.evaluation.motivo}</p>}
                </div>
              ))
            )}
          </div>

          {student.qaRejections && student.qaRejections.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Auditoría Kanban (Rechazos de QA)</h4>
              {student.qaRejections.map((qa) => (
                <div key={qa.id} className={`p-3 rounded-xl border text-xs ${qa.esReincidente ? "bg-destructive/5 border-destructive/20" : "bg-blue-500/5 border-blue-500/20"}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold font-mono text-primary">{qa.codigoTarea}: {qa.tituloTarea}</span>
                    {qa.esReincidente ? (
                      <span className="font-bold text-destructive px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-[11px]">
                        -0.2 pts (Reincidencia)
                      </span>
                    ) : (
                      <span className="font-medium text-blue-500 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px]">
                        1er Rechazo (Formativo)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground"><strong>Motivo:</strong> {qa.motivo} &bull; {qa.fecha}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-secondary/10">
          <Button variant="solid" size="sm" onClick={onClose}>
            Cerrar Historial
          </Button>
        </div>
      </div>
    </div>
  );
}
