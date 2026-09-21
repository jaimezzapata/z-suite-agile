"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Check, ShieldAlert, Calendar } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import type { StudentMessage } from "@/modules/projects/types/message-types";

interface StudentMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: StudentMessage[];
  onMarkAsRead: (id: string) => void;
  isLoading: boolean;
}

export function StudentMessagesModal({
  isOpen,
  onClose,
  messages,
  onMarkAsRead,
  isLoading,
}: StudentMessagesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-2xl bg-card text-card-foreground p-6 md:p-8 rounded-2xl shadow-2xl border border-border max-h-[85vh] flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              <X size={20} />
            </button>

            <div className="mb-4 pr-8">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
                <Mail size={16} /> Buzón de Notificaciones
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Mensajes Oficiales</h3>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ShieldAlert size={14} className="text-primary/70 shrink-0" />
                Canal informativo unidireccional emitido exclusivamente por el Administrador.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <div className="text-center py-12 text-sm text-muted-foreground">Cargando tus mensajes...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/10">
                  <Mail size={40} className="mx-auto text-muted-foreground/40 mb-3" />
                  <h4 className="font-semibold text-base">Buzón al día</h4>
                  <p className="text-xs text-muted-foreground mt-1">No tienes mensajes pendientes ni notificaciones registradas.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const senderName = msg.sender ? `${msg.sender.nombres} ${msg.sender.apellidos}` : "Administrador";
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        !msg.leido
                          ? "bg-primary/5 border-primary/40 shadow-xs"
                          : "bg-background border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{msg.asunto}</span>
                            {!msg.leido && (
                              <span className="bg-primary text-primary-foreground text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Nuevo
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">De: <strong className="text-foreground">{senderName}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                          <Calendar size={12} />
                          {new Date(msg.created_at).toLocaleString()}
                        </div>
                      </div>

                      <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed bg-card/60 p-3 rounded-lg border border-border/40">
                        {msg.contenido}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs">
                        <div>
                          {msg.leido && msg.leido_at ? (
                            <span className="text-[11px] text-muted-foreground">
                              Leído: {new Date(msg.leido_at).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-500">
                              No leído aún
                            </span>
                          )}
                        </div>
                        {!msg.leido && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMarkAsRead(msg.id)}
                            className="h-7 text-xs gap-1 border-primary/30 hover:bg-primary hover:text-primary-foreground"
                          >
                            <Check size={12} /> Marcar como leído
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
