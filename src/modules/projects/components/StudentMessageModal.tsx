"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Clock, CheckCheck, MessageSquare } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { toast } from "sonner";
import { sendMessageToStudent, getStudentMessagesForAdmin } from "../actions/message-actions";
import type { StudentMessage } from "../types/message-types";

interface StudentMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { id: string; nombres: string; apellidos: string; cedula: string } | null;
  groupId?: string;
}

export function StudentMessageModal({ isOpen, onClose, student, groupId }: StudentMessageModalProps) {
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [asunto, setAsunto] = useState("Mensaje del Administrador");
  const [contenido, setContenido] = useState("");
  const [isSending, setIsSending] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!student) return;
    setIsLoadingMessages(true);
    const res = await getStudentMessagesForAdmin(student.id);
    if (res.success && res.messages) {
      setMessages(res.messages as any);
    }
    setIsLoadingMessages(false);
  }, [student]);

  useEffect(() => {
    if (isOpen && student) {
      loadMessages();
      setContenido("");
    }
  }, [isOpen, student, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !contenido.trim()) return;
    setIsSending(true);
    const res = await sendMessageToStudent({
      student_id: student.id,
      asunto: asunto.trim() || "Mensaje del Administrador",
      contenido: contenido.trim(),
      group_id: groupId,
    });
    setIsSending(false);

    if (res.success) {
      toast.success("Mensaje enviado al estudiante.");
      setContenido("");
      await loadMessages();
    } else {
      toast.error(res.error || "Error al enviar mensaje.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && student && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-2xl bg-card text-card-foreground p-6 md:p-8 rounded-2xl shadow-2xl border border-border max-h-[90vh] flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              <X size={20} />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
                <MessageSquare size={16} /> Comunicación Oficial
              </div>
              <h3 className="text-xl font-bold">{student.nombres} {student.apellidos}</h3>
              <p className="text-xs text-muted-foreground font-mono">C.C. {student.cedula}</p>
            </div>

            <form onSubmit={handleSend} className="space-y-3 p-4 bg-secondary/20 rounded-xl border border-border/60 mb-4">
              <input type="text" value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Asunto del mensaje..." className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="Escribe el mensaje para el estudiante..." required rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              <div className="flex justify-end">
                <Button type="submit" size="sm" variant="solid" disabled={isSending || !contenido.trim()} className="gap-2">
                  <Send size={14} /> {isSending ? "Enviando..." : "Enviar Mensaje"}
                </Button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Historial de Mensajes</h4>
              {isLoadingMessages ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Cargando historial...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">No has enviado mensajes a este estudiante.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-xl border border-border bg-background space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground text-sm">{msg.asunto}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap text-xs leading-relaxed">{msg.contenido}</p>
                    <div className="flex items-center justify-end pt-1 border-t border-border/40">
                      {msg.leido && msg.leido_at ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCheck size={13} /> Leído el {new Date(msg.leido_at).toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Clock size={12} /> No leído aún
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
