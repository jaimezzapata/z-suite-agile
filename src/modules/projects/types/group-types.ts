export interface CreateGroupInput {
  nombre: string;
  descripcion?: string | null;
  usa_asistencia: boolean;
  usa_kanban: boolean;
  usa_evaluacion: boolean;
}

export interface UpdateGroupInput {
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
  usa_asistencia: boolean;
  usa_kanban: boolean;
  usa_evaluacion: boolean;
}
