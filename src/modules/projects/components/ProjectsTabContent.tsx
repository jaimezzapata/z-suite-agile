"use client";

import React from "react";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { ConfirmDialog } from "@/modules/core/components/ui/ConfirmDialog";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import type { profiles } from "@prisma/client";
import type { ProjectWithMembers } from "../types/project-types";

interface ProjectsTabContentProps {
  projects: ProjectWithMembers[];
  isLoading: boolean;
  students: profiles[];
  assignedStudentMap: Record<string, string>;
  isModalOpen: boolean;
  editingProject: ProjectWithMembers | null;
  isDeleteOpen: boolean;
  projectToDelete: ProjectWithMembers | null;
  isSubmitting: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (p: ProjectWithMembers) => void;
  onOpenDelete: (p: ProjectWithMembers) => void;
  onCloseModal: () => void;
  onCloseDelete: () => void;
  onSaveProject: (data: any) => Promise<void>;
  onDeleteProject: () => Promise<void>;
}

export function ProjectsTabContent({
  projects,
  isLoading,
  students,
  assignedStudentMap,
  isModalOpen,
  editingProject,
  isDeleteOpen,
  projectToDelete,
  isSubmitting,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onCloseModal,
  onCloseDelete,
  onSaveProject,
  onDeleteProject,
}: ProjectsTabContentProps) {
  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground text-sm">Cargando proyectos formativos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Equipos y Proyectos Formativos</h3>
          <p className="text-xs text-muted-foreground">Divide a tus estudiantes en equipos para iniciar su flujo de trabajo ágil.</p>
        </div>
        <Button size="sm" onClick={onOpenCreate} className="gap-1.5 shrink-0">
          <Plus size={15} /> Nuevo Proyecto
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <FolderKanban size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h4 className="text-lg font-bold text-muted-foreground">Sin proyectos formativos</h4>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Crea el primer proyecto y asigna a los estudiantes para comenzar con el Kanban.</p>
          <Button onClick={onOpenCreate} variant="outline" className="gap-2">
            <Plus size={16} /> Crear Primer Proyecto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={onOpenEdit}
              onDelete={onOpenDelete}
            />
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        project={editingProject}
        students={students}
        assignedStudentMap={assignedStudentMap}
        onSubmit={onSaveProject}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Eliminar Proyecto Formativo"
        description={`¿Estás seguro de eliminar permanentemente el proyecto "${projectToDelete?.nombre}"? Los integrantes asignados quedarán sin proyecto.`}
        confirmText="Eliminar Proyecto"
        isDestructive={true}
        onConfirm={onDeleteProject}
        onCancel={onCloseDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
