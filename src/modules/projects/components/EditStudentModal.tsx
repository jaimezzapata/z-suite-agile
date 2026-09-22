"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UserCheck, Save } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { updateStudent } from "../actions/student-actions";
import { toast } from "sonner";
import type { profiles } from "@prisma/client";

interface EditStudentModalProps {
  isOpen: boolean;
  student: profiles | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditStudentModal({ isOpen, student, onClose, onSuccess }: EditStudentModalProps) {
  const { pattern } = useDesignPattern();
  const isNeu = pattern === "neumorphism";
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (student) {
      setCedula(student.cedula);
      setNombres(student.nombres);
      setApellidos(student.apellidos);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim() || !nombres.trim() || !apellidos.trim()) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    setIsSaving(true);
    const res = await updateStudent(student.id, { cedula, nombres, apellidos });
    setIsSaving(false);

    if (res.success) {
      toast.success("Estudiante actualizado exitosamente.");
      onSuccess();
      onClose();
    } else {
      toast.error(res.error || "Error al actualizar estudiante.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md ${isNeu ? "neu-flat border border-border/50" : "bg-card border border-border shadow-2xl"} rounded-2xl overflow-hidden p-6`}
        >
          <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <UserCheck size={20} />
              </div>
              <h3 className="text-xl font-bold text-foreground">Editar Estudiante</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Número de Cédula
              </label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono transition-all focus:outline-none ${isNeu ? "neu-pressed border-none" : "bg-secondary/30 border border-border focus:ring-2 focus:ring-primary/50"}`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Nombres
              </label>
              <input
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${isNeu ? "neu-pressed border-none" : "bg-secondary/30 border border-border focus:ring-2 focus:ring-primary/50"}`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Apellidos
              </label>
              <input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none ${isNeu ? "neu-pressed border-none" : "bg-secondary/30 border border-border focus:ring-2 focus:ring-primary/50"}`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant={isNeu ? "neumorphic" : "outline"} onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" variant={isNeu ? "neumorphic" : "solid"} disabled={isSaving} className="gap-2">
                <Save size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
