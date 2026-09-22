export interface ProjectMember {
  id: string;
  user_id: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  avatar_url?: string | null;
  rol_en_equipo?: string | null;
}

export interface ProjectWithMembers {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: string | null;
  group_id: string;
  created_at: Date | string;
  updated_at: Date | string;
  members: ProjectMember[];
}

export interface CreateProjectInput {
  group_id: string;
  nombre: string;
  descripcion?: string | null;
  member_ids: string[];
}

export interface UpdateProjectInput {
  id: string;
  nombre: string;
  descripcion?: string | null;
  estado?: string | null;
  member_ids: string[];
}
