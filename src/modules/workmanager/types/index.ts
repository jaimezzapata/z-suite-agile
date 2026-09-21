export interface WorkManagerStudentStatus {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  estadoConexion: "en_linea" | "en_break" | "desconectado" | "sin_ingreso";
  ingresoJornadaAt?: string;
  retrasoIngreso: number;
  inicioBreakAt?: string;
  regresoBreakAt?: string;
  retrasoBreak: number;
  totalRetraso: number;
  desconexionesJustificadas: number;
  enCooldown: boolean;
}

export interface WorkManagerGroupStatus {
  groupId: string;
  groupNombre: string;
  estadoJornada: "no_iniciado" | "iniciado" | "en_break" | "finalizado";
  horaInicioProgramada?: string;
  iniciadoAt?: string;
  breakIniciadoAt?: string;
  breakDuracionMinutos?: number;
  breakFinEsperadoAt?: string;
  totalIntegrantes: number;
  presentesHoy: number;
  puntualesHoy: number;
  retrasadosHoy: number;
  enBreakHoy: number;
  estudiantes: WorkManagerStudentStatus[];
}
