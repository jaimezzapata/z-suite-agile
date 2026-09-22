"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { Button } from "@/modules/core/components/ui/Button";
import type { AttendancePenaltiesSummary } from "../lib/penalties";
import { StudentGraceBadge } from "./StudentGraceBadge";

interface StudentWorkPanelProps {
  workSession: any;
  dailySession?: any;
  dailyStatus: string;
  isActionLoading: boolean;
  onStartWorkday: () => void;
  onEndBreak: () => void;
  penaltiesSummary?: AttendancePenaltiesSummary | null;
}

export function StudentWorkPanel({
  workSession, dailySession, dailyStatus, isActionLoading, onStartWorkday, onEndBreak, penaltiesSummary
}: StudentWorkPanelProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const isFinalizado = dailyStatus === "finalizado";
  const isNoIniciado = dailyStatus === "no_iniciado";
  const horaProg = dailySession?.hora_inicio_programada ? new Date(dailySession.hora_inicio_programada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  const breakFin = dailySession?.break_fin_esperado_at ? new Date(dailySession.break_fin_esperado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  const isBeforeStart = dailySession?.hora_inicio_programada ? now.getTime() < new Date(dailySession.hora_inicio_programada).getTime() : false;

  return (
    <DynamicCard className="p-6 md:p-10 space-y-6">
      <div className="flex justify-between items-center border-b border-border/50 pb-4 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Clock className="text-primary" size={30} />
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Control Operativo</h3>
        </div>
        <div className="flex items-center gap-2">
          {penaltiesSummary && (
            <StudentGraceBadge comodinDisponible={penaltiesSummary.comodinDisponible} comodinUsadoEn={penaltiesSummary.comodinUsadoEn} variant="compact" />
          )}
          {isFinalizado ? (
            <span className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-bold rounded-md uppercase">Finalizado</span>
          ) : isNoIniciado ? (
            <span className="px-3 py-1.5 bg-secondary text-muted-foreground text-xs font-bold rounded-md uppercase">Inactivo</span>
          ) : workSession?.inicio_break_at && !workSession?.regreso_break_at ? (
            <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-md uppercase">En Break</span>
          ) : workSession?.ingreso_jornada_at ? (
            <span className="px-3 py-1.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-md uppercase">En Jornada</span>
          ) : (
            <span className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-bold rounded-md uppercase">Entrada Abierta</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase">
            <span>Ingreso a la Jornada</span>
            {horaProg && <span>Inicio: {horaProg}</span>}
          </div>
          <span className="text-4xl font-black text-foreground" suppressHydrationWarning>
            {workSession?.ingreso_jornada_at ? new Date(workSession.ingreso_jornada_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
          </span>
          {workSession?.ingreso_jornada_at && (
            <span className={`text-xs font-semibold ${workSession.retraso_ingreso_minutos > 0 ? "text-amber-500" : "text-emerald-500"}`}>
              {workSession.retraso_ingreso_minutos >= 10 ? `+${workSession.retraso_ingreso_minutos} min (Penalizado -0.2 pts)` : workSession.retraso_ingreso_minutos > 0 ? `+${workSession.retraso_ingreso_minutos} min retraso` : "Ingreso puntual"}
            </span>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-secondary/30 border border-border flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase">
            <span>Break</span>
            {breakFin && !workSession?.regreso_break_at && <span className="text-amber-500">Límite: {breakFin}</span>}
          </div>
          <span className="text-4xl font-black text-foreground" suppressHydrationWarning>
            {workSession?.inicio_break_at ? new Date(workSession.inicio_break_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
          </span>
          {workSession?.regreso_break_at && (
            <span className={`text-xs font-semibold ${workSession.retraso_break_minutos > 0 ? "text-amber-500" : "text-emerald-500"}`} suppressHydrationWarning>
              Retorno: {new Date(workSession.regreso_break_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {workSession.retraso_break_minutos >= 10 ? `(+${workSession.retraso_break_minutos}m, Penalizado -0.2 pts)` : workSession.retraso_break_minutos > 0 ? `(+${workSession.retraso_break_minutos}m)` : "(A tiempo)"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {isNoIniciado ? (
          <div className="flex-1 flex items-center justify-center p-4 bg-secondary/20 rounded-xl border border-dashed border-border text-center">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock size={18} /> El docente aún no ha habilitado la jornada del día.</p>
          </div>
        ) : isFinalizado ? (
          <div className="flex-1 flex items-center justify-center p-4 bg-muted/30 rounded-xl border border-border text-center">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500" /> Jornada finalizada.</p>
          </div>
        ) : !workSession?.ingreso_jornada_at ? (
          isBeforeStart ? (
            <div className="flex-1 flex flex-col justify-center items-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center gap-1">
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2"><Lock size={16} /> Entrada Bloqueada hasta las {horaProg}</span>
              <p className="text-xs text-muted-foreground">Podrás marcar entrada exactamente a partir de esa hora.</p>
            </div>
          ) : (
            <Button size="lg" className="flex-1 gap-3 h-14 text-base font-bold" onClick={onStartWorkday} disabled={isActionLoading}>
              <Clock size={20} /> Marcar Entrada
            </Button>
          )
        ) : !workSession?.regreso_break_at && workSession?.inicio_break_at ? (
          <Button size="lg" className="flex-1 gap-3 h-14 text-base font-bold bg-amber-500 hover:bg-amber-600 text-white" onClick={onEndBreak} disabled={isActionLoading}>
            <Clock size={20} /> Regresar del Break
          </Button>
        ) : workSession?.ingreso_jornada_at && !workSession?.inicio_break_at ? (
          <Button size="lg" variant="outline" className="flex-1 gap-3 h-14 text-base font-bold border-green-500/50 text-green-500 cursor-default opacity-80" disabled>
            <Clock size={20} /> En Jornada (Esperando Break)
          </Button>
        ) : (
          <Button size="lg" variant="outline" className="flex-1 gap-3 h-14 text-base font-bold border-primary/20 text-primary opacity-70 cursor-not-allowed" disabled>
            <CheckCircle size={20} /> Jornada en Curso (Break Registrado)
          </Button>
        )}

        <Button size="lg" variant="outline" className="flex-1 gap-3 h-14 text-base font-bold border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
          <AlertTriangle size={20} /> Reportar Caída de Red
        </Button>
      </div>
    </DynamicCard>
  );
}
