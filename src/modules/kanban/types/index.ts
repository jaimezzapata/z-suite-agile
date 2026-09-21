export type KanbanColumnId = "todo" | "in_progress" | "qa" | "done";

export const QA_REJECTION_REASONS = [
  "Criterios de Aceptación Incompletos",
  "Errores de Lógica o Bugs encontrados",
  "Falta de Pruebas Unitarias o Cobertura",
  "Incumplimiento de Estándares de Código",
  "Problemas de Diseño o Responsive",
] as const;

export type QARejectionReason = (typeof QA_REJECTION_REASONS)[number];

export interface KanbanCardItem {
  id: string;
  projectId: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  columna: KanbanColumnId;
  prioridad: "alta" | "media" | "baja";
  asignadoA?: {
    id: string;
    nombre: string;
    avatarUrl?: string;
  };
  puntosHistoria: number;
  rechazosPrevios: QARejectionReason[];
  penalizadoPorReincidencia?: boolean;
}

export interface KanbanProjectOption {
  id: string;
  nombre: string;
  grupoNombre: string;
  groupId: string;
}
