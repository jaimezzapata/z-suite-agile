export interface StudentMessage {
  id: string;
  student_id: string;
  sender_id: string;
  group_id: string | null;
  asunto: string | null;
  contenido: string;
  leido: boolean;
  leido_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
  sender?: {
    nombres: string;
    apellidos: string;
  };
}

export interface SendMessageInput {
  student_id: string;
  contenido: string;
  asunto?: string;
  group_id?: string;
}
