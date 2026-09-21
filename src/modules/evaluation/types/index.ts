import type { AttendancePenaltiesSummary, DayPenaltyDetail } from "@/modules/student/lib/penalties";

export interface StudentSessionAuditItem {
  id: string;
  fecha: string;
  horaIngreso: string;
  retrasoIngreso: number;
  horaInicioBreak?: string;
  horaFinBreak?: string;
  retrasoBreak: number;
  totalRetraso: number;
  evaluation: DayPenaltyDetail;
}

export interface StudentQAAuditItem {
  id: string;
  codigoTarea: string;
  tituloTarea: string;
  motivo: string;
  esReincidente: boolean;
  penalizacionPuntos: number;
  fecha: string;
}

export interface StudentEvaluationRecord {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  proyecto: string | null;
  diasAsistidos: number;
  totalPenalizaciones: number;
  puntosDescontados: number;
  notaEstimada: number;
  penaltiesSummary: AttendancePenaltiesSummary;
  sesiones: StudentSessionAuditItem[];
  qaRejections: StudentQAAuditItem[];
}

export interface GroupEvaluationData {
  groupId: string;
  groupNombre: string;
  promedioGrupal: number;
  totalEstudiantes: number;
  estudiantesConFalta: number;
  estudiantesImpecables: number;
  estudiantes: StudentEvaluationRecord[];
}

export interface GroupOption {
  id: string;
  nombre: string;
  usa_evaluacion: boolean;
}
