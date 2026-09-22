"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Lock } from "lucide-react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { GroupDayActionButtons } from "./GroupDayActionButtons";
import type { group_daily_sessions } from "@prisma/client";

interface GroupDayControlProps {
  dailySession: group_daily_sessions | null;
  isLoading: boolean;
  isStarting: boolean;
  isSendingBreak?: boolean;
  isFinalizing?: boolean;
  isResettingDay?: boolean;
  onRequestStartDay: () => void;
  onRequestBreak: () => void;
  onRequestFinalize: () => void;
  onRequestResetDay: () => void;
}

export function GroupDayControl({
  dailySession,
  isLoading,
  isStarting,
  isResettingDay,
  onRequestStartDay,
  onRequestBreak,
  onRequestFinalize,
  onRequestResetDay,
}: GroupDayControlProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) return <div className="h-14 bg-secondary/20 rounded-2xl animate-pulse border border-border" />;

  const estado = dailySession?.estado ?? "no_iniciado";
  const horaProg = dailySession?.hora_inicio_programada 
    ? new Date(dailySession.hora_inicio_programada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  const breakFin = dailySession?.break_fin_esperado_at
    ? new Date(dailySession.break_fin_esperado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const isBeforeStart = dailySession?.hora_inicio_programada
    ? now.getTime() < new Date(dailySession.hora_inicio_programada).getTime()
    : false;

  return (
    <DynamicCard className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jornada</span>
              {estado === "iniciado" && isBeforeStart && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Lock size={12} /> Programada ({horaProg})
                </span>
              )}
              {estado === "iniciado" && !isBeforeStart && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En Curso
                </span>
              )}
              {estado === "en_break" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> En Break
                </span>
              )}
              {estado === "finalizado" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                  <CheckCircle size={12} /> Finalizada
                </span>
              )}
              {estado === "no_iniciado" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border/50">
                  No Iniciada
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5" suppressHydrationWarning>
              {estado === "iniciado" && isBeforeStart && `Apertura programada para las ${horaProg}. Entrada bloqueada hasta esa hora.`}
              {estado === "iniciado" && !isBeforeStart && `Jornada activa. Entrada habilitada para estudiantes desde las ${horaProg}.`}
              {estado === "en_break" && `Descanso activo. ${breakFin ? `Regreso esperado: ${breakFin}.` : ""}`}
              {estado === "finalizado" && "Jornada concluida. Marcaciones bloqueadas."}
              {estado === "no_iniciado" && "Haz clic en 'Iniciar Día' para definir la hora de inicio de jornada."}
            </p>
          </div>
        </div>

        <GroupDayActionButtons
          estado={estado}
          isStarting={isStarting}
          isResettingDay={isResettingDay}
          onRequestStartDay={onRequestStartDay}
          onRequestBreak={onRequestBreak}
          onRequestFinalize={onRequestFinalize}
          onRequestResetDay={onRequestResetDay}
        />
      </div>
    </DynamicCard>
  );
}
