"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Users, Check } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import type { profiles } from "@prisma/client";
import type { ProjectWithMembers } from "../types/project-types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithMembers | null;
  students: profiles[];
  assignedStudentMap: Record<string, string>;
  onSubmit: (data: { nombre: string; descripcion: string; estado: string; member_ids: string[] }) => Promise<void>;
  isLoading: boolean;
}

export function ProjectModal({
  isOpen,
  onClose,
  project,
  students,
  assignedStudentMap,
  onSubmit,
  isLoading,
}: ProjectModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("activo");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (project) {
      setNombre(project.nombre);
      setDescripcion(project.descripcion || "");
      setEstado(project.estado || "activo");
      setSelectedMembers(project.members.map((m) => m.user_id));
    } else {
      setNombre("");
      setDescripcion("");
      setEstado("activo");
      setSelectedMembers([]);
    }
    setSearch("");
  }, [project, isOpen]);

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]));
  };

  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    return s.nombres.toLowerCase().includes(term) || s.apellidos.toLowerCase().includes(term) || s.cedula.includes(term);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await onSubmit({ nombre, descripcion, estado, member_ids: selectedMembers });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-2xl bg-card text-card-foreground p-6 md:p-8 rounded-2xl shadow-2xl border border-border max-h-[90vh] flex flex-col">
            <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors">
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-4">{project ? "Editar Proyecto Formativo" : "Nuevo Proyecto Formativo"}</h3>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Nombre del Proyecto</label>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej: EcoStore App" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                {project && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Estado</label>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Descripción (Opcional)</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} placeholder="Objetivo o alcance del proyecto..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users size={14} /> Asignar Integrantes ({selectedMembers.length} seleccionados)
                  </label>
                  <div className="relative w-48">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar alumno..." className="w-full pl-8 pr-2 py-1 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-border rounded-xl divide-y divide-border/50 bg-secondary/10">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">No se encontraron estudiantes.</div>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = selectedMembers.includes(s.id);
                      const otherProj = assignedStudentMap[s.id];
                      return (
                        <div key={s.id} onClick={() => toggleMember(s.id)} className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${isSelected ? "bg-primary/10" : "hover:bg-secondary/40"}`}>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                            <div>
                              <span className="font-semibold">{s.nombres} {s.apellidos}</span>
                              <span className="text-[10px] text-muted-foreground font-mono ml-2">C.C. {s.cedula}</span>
                            </div>
                          </div>
                          {otherProj && otherProj !== project?.nombre && (
                            <span className="text-[10px] text-amber-500 font-medium">Asignado en: {otherProj}</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                <Button type="submit" size="sm" variant="solid" disabled={isLoading || !nombre.trim()}>{isLoading ? "Guardando..." : project ? "Guardar Cambios" : "Crear Proyecto"}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
