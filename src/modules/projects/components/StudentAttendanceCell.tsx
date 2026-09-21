import React from "react";
import { Clock, Coffee, AlertCircle, CheckCircle2 } from "lucide-react";
import { evaluateSessionPenalty } from "@/modules/student/lib/penalties";
import type { WorkSession } from "../types";

interface StudentAttendanceCellProps {
  session?: WorkSession;
}

export function StudentAttendanceCell({ session }: StudentAttendanceCellProps) {
  if (!session) {
    return <span className="text-[11px] text-muted-foreground italic">Sin marcaciones</span>;
  }

  const retrasoIngreso = Number(session.retraso_ingreso_minutos ?? 0);
  const retrasoBreak = Number(session.retraso_break_minutos ?? 0);

  return (
    <div className="flex flex-col gap-1 text-[11px] font-medium">
      <div className="flex items-center gap-1.5 text-primary">
        <Clock size={12} />
        <span>Ingreso:</span>
        <span className="font-semibold" suppressHydrationWarning>
          {new Date(session.ingreso_jornada_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        {retrasoIngreso > 0 ? (
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-sm">
            +{retrasoIngreso}m
          </span>
        ) : (
          <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1 py-0.2 rounded-sm">
            Puntual
          </span>
        )}
      </div>

      {session.inicio_break_at && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Coffee size={12} className="text-amber-500" />
          <span>Break:</span>
          <span className="font-semibold" suppressHydrationWarning>
            {new Date(session.inicio_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {session.regreso_break_at && (
            <>
              <span className="text-muted-foreground/60">→</span>
              <span className="font-semibold" suppressHydrationWarning>
                {new Date(session.regreso_break_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {retrasoBreak > 0 ? (
                <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-sm">
                  +{retrasoBreak}m
                </span>
              ) : (
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1 py-0.2 rounded-sm">
                  A tiempo
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function StudentDelayBadge({ session }: StudentAttendanceCellProps) {
  if (!session) {
    return <span className="text-xs text-muted-foreground italic">--</span>;
  }

  const penalty = evaluateSessionPenalty(session as any);
  const totalRetraso = Number(session.retraso_minutos ?? 0);

  if (totalRetraso === 0 && !penalty.tienePenalizacion) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={12} /> 0 min (Puntual)
      </span>
    );
  }

  if (penalty.tienePenalizacion) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20"
        title={penalty.motivo}
      >
        <AlertCircle size={12} /> -0.2 pts ({totalRetraso}m)
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
      title="Retraso leve dentro de tolerancia (sin penalización)"
    >
      <Clock size={12} /> +{totalRetraso} min (Tolerado)
    </span>
  );
}
