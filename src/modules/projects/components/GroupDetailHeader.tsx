"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Users, FolderKanban, Trash2, Pencil } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { ConfirmDialog } from "@/modules/core/components/ui/ConfirmDialog";
import { GroupModal } from "./GroupModal";
import { useGroupHeaderActions } from "../hooks/useGroupHeaderActions";
import type { groups } from "@prisma/client";

interface GroupDetailHeaderProps {
  group: groups;
  pattern: string;
  activeTab: "students" | "projects";
  selectedStudentsCount: number;
  isDeletingStudents: boolean;
  onDeleteSelectedStudents: () => void;
  onOpenImportStudents: () => void;
  onOpenCreateProject?: () => void;
}

export function GroupDetailHeader({
  group,
  pattern,
  activeTab,
  selectedStudentsCount,
  isDeletingStudents,
  onDeleteSelectedStudents,
  onOpenImportStudents,
  onOpenCreateProject,
}: GroupDetailHeaderProps) {
  const { state, actions } = useGroupHeaderActions(group);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard/grupos"
        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit"
      >
        <ArrowLeft size={16} /> Volver a Grupos
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight">{group.nombre}</h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                group.estado === "activo"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {group.estado === "activo" ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="text-muted-foreground mt-1">{group.descripcion || "Sin descripción"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={actions.openEdit}
            className="gap-1.5 shrink-0"
            title="Editar configuración del grupo"
          >
            <Pencil size={15} /> Editar Grupo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={actions.openDelete}
            className="gap-1.5 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Eliminar grupo permanentemente"
          >
            <Trash2 size={15} /> Eliminar Grupo
          </Button>

          {activeTab === "students" && (
            <>
              {selectedStudentsCount > 0 && (
                <Button
                  variant="solid"
                  className="gap-2 shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onDeleteSelectedStudents}
                  disabled={isDeletingStudents}
                >
                  <Trash2 size={18} /> Eliminar ({selectedStudentsCount})
                </Button>
              )}
              <Button
                onClick={onOpenImportStudents}
                variant={pattern === "neumorphism" ? "neumorphic" : "solid"}
                className="gap-2 shrink-0"
                disabled={isDeletingStudents}
              >
                <Users size={18} /> Agregar Estudiantes
              </Button>
            </>
          )}

          {activeTab === "projects" && (
            <Button variant="outline" onClick={onOpenCreateProject} className="gap-2 shrink-0">
              <FolderKanban size={18} /> Crear Proyecto
            </Button>
          )}
        </div>
      </div>

      <GroupModal
        isOpen={state.isEditOpen}
        title="Editar Grupo"
        initialData={group}
        isEditing={true}
        isLoading={state.isLoading}
        error={state.error}
        onSubmit={actions.handleUpdate}
        onClose={actions.closeEdit}
      />

      <ConfirmDialog
        isOpen={state.isDeleteOpen}
        title="Eliminar Grupo"
        description={`¿Estás seguro de que deseas eliminar permanentemente el grupo "${group.nombre}"? Esta acción no se puede deshacer y borrará todos los miembros, proyectos y registros asociados.`}
        isDestructive={true}
        confirmText="Eliminar Grupo"
        onConfirm={actions.handleDelete}
        onCancel={actions.closeDelete}
        isLoading={state.isLoading}
      />
    </div>
  );
}
