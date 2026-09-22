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
  penalizacionesCount: number;
  puntosDescontados: number;
  comodinUsado: boolean;
  motivo?: string;
  motivoComodin?: string;
}

export interface AttendancePenaltiesSummary {
  notaBase: number;
  notaEstimada: number;
  totalPenalizaciones: number;
  puntosDescontados: number;
  diasPenalizados: DayPenaltyDetail[];
  todasLasSesiones: DayPenaltyDetail[];
  comodinDisponible: boolean;
  comodinUsadoEn?: {
    fecha: Date | string;
    momento: "ingreso" | "break";
    minutosRetraso: number;
  } | null;
}

export function calculateAttendancePenalties(sessions: SessionWithDelays[]): AttendancePenaltiesSummary {
  const NOTA_BASE = 5.0;
  const PENALIZACION_VALOR = 0.2;

  const sorted = [...(sessions || [])].sort((a, b) => {
    const timeA = new Date(a.ingreso_jornada_at).getTime();
    const timeB = new Date(b.ingreso_jornada_at).getTime();
    return timeA - timeB;
  });

  let comodinGastado = false;
  let comodinUsadoEn: AttendancePenaltiesSummary["comodinUsadoEn"] = null;

  const todasLasSesiones: DayPenaltyDetail[] = sorted.map((s) => {
    const ingreso = Math.max(0, Number(s.retraso_ingreso_minutos || 0));
    const breakDelay = Math.max(0, Number(s.retraso_break_minutos || 0));

    let penalizacionesCount = 0;
    let sesionUsaComodin = false;
    let motivoComodin: string | undefined;
    const motivos: string[] = [];

    if (ingreso >= 10) {
      penalizacionesCount += 1;
      motivos.push(`Ingreso: ${ingreso} min (retraso mayor >=10m)`);
    } else if (ingreso > 0) {
      if (!comodinGastado) {
        comodinGastado = true;
        sesionUsaComodin = true;
        comodinUsadoEn = { fecha: s.ingreso_jornada_at, momento: "ingreso", minutosRetraso: ingreso };
        motivoComodin = `Comodín aplicado en ingreso (${ingreso} min)`;
      } else {
        penalizacionesCount += 1;
        motivos.push(`Ingreso: ${ingreso} min (sin comodín)`);
      }
    }

    if (breakDelay >= 10) {
      penalizacionesCount += 1;
      motivos.push(`Break: ${breakDelay} min (retraso mayor >=10m)`);
    } else if (breakDelay > 0) {
      if (!comodinGastado) {
        comodinGastado = true;
        sesionUsaComodin = true;
        comodinUsadoEn = { fecha: s.ingreso_jornada_at, momento: "break", minutosRetraso: breakDelay };
        motivoComodin = `Comodín aplicado en break (${breakDelay} min)`;
      } else {
        penalizacionesCount += 1;
        const esDobleRetrasoMismoDia = ingreso > 0 && ingreso < 10;
        motivos.push(
          esDobleRetrasoMismoDia
            ? `Break: ${breakDelay} min (segundo retraso menor en el día)`
            : `Break: ${breakDelay} min (sin comodín)`
        );
      }
    }

    const puntosDescontados = Number((penalizacionesCount * PENALIZACION_VALOR).toFixed(2));
    const tienePenalizacion = penalizacionesCount > 0;

    return {
      sessionId: s.id,
      fecha: s.ingreso_jornada_at,
      retrasoIngreso: ingreso,
      retrasoBreak: breakDelay,
      tienePenalizacion,
      penalizacionesCount,
      puntosDescontados,
      comodinUsado: sesionUsaComodin,
      motivo: motivos.length > 0 ? motivos.join(" • ") : undefined,
      motivoComodin,
    };
  });

  const sesionesDesc = [...todasLasSesiones].reverse();
  const diasPenalizados = sesionesDesc.filter((s) => s.tienePenalizacion);
  const totalPenalizaciones = todasLasSesiones.reduce((acc, s) => acc + s.penalizacionesCount, 0);
  const puntosDescontados = Number((totalPenalizaciones * PENALIZACION_VALOR).toFixed(2));
  const notaEstimada = Math.max(0, Number((NOTA_BASE - puntosDescontados).toFixed(1)));

  return {
    notaBase: NOTA_BASE,
    notaEstimada,
    totalPenalizaciones,
    puntosDescontados,
    diasPenalizados,
    todasLasSesiones: sesionesDesc,
    comodinDisponible: !comodinGastado,
    comodinUsadoEn,
  };
}

export function evaluateSessionPenalty(session: SessionWithDelays): DayPenaltyDetail {
  const res = calculateAttendancePenalties([session]);
  return res.todasLasSesiones[0] || {
    sessionId: session.id,
    fecha: session.ingreso_jornada_at,
    retrasoIngreso: session.retraso_ingreso_minutos || 0,
    retrasoBreak: session.retraso_break_minutos || 0,
    tienePenalizacion: false,
    penalizacionesCount: 0,
    puntosDescontados: 0,
    comodinUsado: false,
  };
}
