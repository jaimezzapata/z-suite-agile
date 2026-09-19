/**
 * Tipos del modulo Projects
 * Derivados del schema de la base de datos (prisma/schema.prisma -> model profiles)
 */

export interface StudentProfile {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  avatar_url: string | null;
  rol: string | null;
  created_at: Date;
  updated_at: Date;
  terminos_aceptados_at: Date | null;
  work_sessions?: WorkSession[];
}

export interface WorkSession {
  id: string;
  ingreso_jornada_at: Date | string;
  inicio_break_at?: Date | string | null;
  regreso_break_at?: Date | string | null;
  retraso_ingreso_minutos?: number;
  retraso_break_minutos?: number;
  retraso_minutos?: number;
  [key: string]: unknown;
}
