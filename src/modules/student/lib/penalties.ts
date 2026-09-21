export interface SessionWithDelays {
  id: string;
  ingreso_jornada_at: Date | string;
  retraso_ingreso_minutos: number;
  retraso_break_minutos: number;
  retraso_minutos?: number;
}

export interface DayPenaltyDetail {
  sessionId: string;
  fecha: Date | string;
  retrasoIngreso: number;
  retrasoBreak: number;
  tienePenalizacion: boolean;
  motivo?: string;
  puntosDescontados: number;
}

export interface AttendancePenaltiesSummary {
  notaBase: number;
  notaEstimada: number;
  totalPenalizaciones: number;
  puntosDescontados: number;
  diasPenalizados: DayPenaltyDetail[];
  todasLasSesiones: DayPenaltyDetail[];
}

export function evaluateSessionPenalty(session: SessionWithDelays): DayPenaltyDetail {
  const ingreso = session.retraso_ingreso_minutos || 0;
  const breakDelay = session.retraso_break_minutos || 0;

  const ambosConRetraso = ingreso > 0 && breakDelay > 0;
  const jornadaSupera10 = ingreso > 10;
  const breakSupera5 = breakDelay > 5;

  const tienePenalizacion = ambosConRetraso || jornadaSupera10 || breakSupera5;

  let motivo: string | undefined;
  if (ambosConRetraso) {
    motivo = `Retraso en jornada (${ingreso} min) y en break (${breakDelay} min)`;
  } else if (jornadaSupera10) {
    motivo = `Retraso en ingreso (${ingreso} min) supera el límite de 10 min`;
  } else if (breakSupera5) {
    motivo = `Retraso en break (${breakDelay} min) supera el límite de 5 min`;
  }

  return {
    sessionId: session.id,
    fecha: session.ingreso_jornada_at,
    retrasoIngreso: ingreso,
    retrasoBreak: breakDelay,
    tienePenalizacion,
    motivo,
    puntosDescontados: tienePenalizacion ? 0.2 : 0,
  };
}

export function calculateAttendancePenalties(sessions: SessionWithDelays[]): AttendancePenaltiesSummary {
  const NOTA_BASE = 5.0;
  const PENALIZACION_POR_DIA = 0.2;

  const todasLasSesiones = (sessions || []).map(evaluateSessionPenalty);
  const diasPenalizados = todasLasSesiones.filter((s) => s.tienePenalizacion);
  const totalPenalizaciones = diasPenalizados.length;
  const puntosDescontados = Number((totalPenalizaciones * PENALIZACION_POR_DIA).toFixed(2));
  const notaEstimada = Math.max(0, Number((NOTA_BASE - puntosDescontados).toFixed(1)));

  return {
    notaBase: NOTA_BASE,
    notaEstimada,
    totalPenalizaciones,
    puntosDescontados,
    diasPenalizados,
    todasLasSesiones,
  };
}
