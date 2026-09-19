"use client";

import * as React from "react";
import type { groups, profiles } from "@prisma/client";
import { Button } from "@/modules/core/components/ui/Button";
import { ArrowLeft, Users, FolderKanban, Trash2, Coffee, Search } from "lucide-react";
import Link from "next/link";
import { ImportStudentsModal } from "../components/ImportStudentsModal";
import { ConfirmDialog } from "@/modules/core/components/ui/ConfirmDialog";
import { useGroupDetail } from "../hooks/useGroupDetail";
import { StudentsTable } from "../components/StudentsTable";

interface GroupDetailScreenProps {
  group: groups;
  students: profiles[];
}

export function GroupDetailScreen({ group, students }: GroupDetailScreenProps) {
  const { state, actions } = useGroupDetail(group, students);

  const PaginationControls = state.totalPages > 1 ? (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground hidden sm:inline-block">
        Mostrando {(state.currentPage - 1) * 10 + 1} - {Math.min(state.currentPage * 10, state.filteredStudents.length)} de {state.filteredStudents.length}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={state.currentPage === 1}
          onClick={() => actions.setCurrentPage(p => Math.max(1, p - 1))}
        >
          Anterior
        </Button>
        <div className="flex items-center px-3 text-sm font-medium border border-border rounded-md bg-background">
          {state.currentPage} / {state.totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={state.currentPage === state.totalPages}
          onClick={() => actions.setCurrentPage(p => Math.min(state.totalPages, p + 1))}
        >
          Siguiente
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header con breadcrumbs y acciones */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/grupos" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit">
          <ArrowLeft size={16} /> Volver a Grupos
        </Link>
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{group.nombre}</h2>
            <p className="text-muted-foreground mt-1">
              {group.descripcion || "Sin descripción"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="gap-2 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-all shrink-0"
              onClick={actions.handleSendToBreak}
              disabled={state.isSendingToBreak}
            >
              <Coffee size={18} /> {state.isSendingToBreak ? "Enviando..." : "Mandar a Break Global"}
            </Button>
            {state.activeTab === "students" && (
              <>
                {state.selectedIds.length > 0 && (
                  <Button
                    variant="solid"
                    className="gap-2 shrink-0 animate-in fade-in zoom-in bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => actions.requestDelete(state.selectedIds)}
                    disabled={state.isDeleting}
                  >
                    <Trash2 size={18} />
                    Eliminar Selección ({state.selectedIds.length})
                  </Button>
                )}
                <Button onClick={() => actions.setIsImportModalOpen(true)} className="gap-2 shrink-0" disabled={state.isDeleting}>
                  <Users size={18} /> Agregar Estudiantes
                </Button>
              </>
            )}
            {state.activeTab === "projects" && (
              <Button variant="outline" className="gap-2 shrink-0">
                <FolderKanban size={18} /> Crear Proyecto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => actions.setActiveTab("students")}
          className={`pb-3 text-sm font-semibold transition-all ${state.activeTab === "students" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Estudiantes ({students.length})
        </button>
        <button
          onClick={() => actions.setActiveTab("projects")}
          className={`pb-3 text-sm font-semibold transition-all ${state.activeTab === "projects" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Proyectos Formativos
        </button>
      </div>

      {/* Tab Content: Estudiantes */}
      {state.activeTab === "students" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por cédula o nombre..."
              className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
            />
          </div>

          {state.filteredStudents.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
              <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold text-muted-foreground">Sin estudiantes</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {state.searchTerm ? "No se encontraron resultados para tu búsqueda." : "Aún no hay estudiantes en este grupo."}
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StudentsTable
                students={state.paginatedStudents}
                selectedIds={state.selectedIds}
                isDeleting={state.isDeleting}
                isResetting={state.isResetting}
                onToggleSelectAll={actions.toggleSelectAll}
                onToggleSelect={actions.toggleSelect}
                onRequestDelete={actions.requestDelete}
                onRequestReset={actions.requestReset}
                allSelected={state.selectedIds.length === state.filteredStudents.length && state.filteredStudents.length > 0}
              />

              {state.totalPages > 1 && (
                <div className="px-6 py-4 bg-secondary/20 border-t border-border flex justify-end md:justify-between items-center">
                  <div className="hidden md:block" />
                  {PaginationControls}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Proyectos */}
      {state.activeTab === "projects" && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <FolderKanban size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">Próximamente</h3>
          <p className="text-sm text-muted-foreground mt-2">Aquí el administrador creará los proyectos (ej. "Clon de Netflix") para dividir a los estudiantes en subgrupos (equipos).</p>
        </div>
      )}

      {/* Modals */}
      <ImportStudentsModal
        groupId={group.id}
        isOpen={state.isImportModalOpen}
        onClose={() => actions.setIsImportModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={state.isConfirmOpen}
        title="Eliminar Estudiantes"
        description={`¿Estás seguro de que deseas eliminar a ${state.idsToDelete.length} estudiante(s)? Esta acción borrará permanentemente todas sus métricas, asistencias y su cuenta del sistema.`}
        confirmText="Eliminar"
        isDestructive={true}
        onConfirm={actions.executeDelete}
        onCancel={() => actions.setIsConfirmOpen(false)}
        isLoading={state.isDeleting}
      />

      <ConfirmDialog
        isOpen={state.isResetConfirmOpen}
        title="Restablecer de Fábrica"
        description="¿Estás seguro de que deseas restablecer a este estudiante? Esto borrará sus marcaciones de asistencia (WorkManager) y su aceptación de términos de uso, pero lo mantendrá en el sistema."
        confirmText="Restablecer"
        isDestructive={true}
        onConfirm={actions.executeReset}
        onCancel={() => actions.setIsResetConfirmOpen(false)}
        isLoading={state.isResetting}
      />
    </div>
  );
}
