"use client";

import * as React from "react";
import type { groups, profiles } from "@prisma/client";
import { Button } from "@/modules/core/components/ui/Button";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { ArrowLeft, Users, FolderKanban, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { useGroupDetail } from "../hooks/useGroupDetail";
import { useGroupDailySession } from "../hooks/useGroupDailySession";
import { StudentsTable } from "../components/StudentsTable";
import { GroupDayControl } from "../components/GroupDayControl";
import { GroupDetailModals } from "../components/GroupDetailModals";
import { TablePagination } from "../components/TablePagination";

interface GroupDetailScreenProps {
  group: groups;
  students: profiles[];
}

export function GroupDetailScreen({ group, students }: GroupDetailScreenProps) {
  const { pattern } = useDesignPattern();
  const { state, actions } = useGroupDetail(group, students);
  const daily = useGroupDailySession(group.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/grupos" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit">
          <ArrowLeft size={16} /> Volver a Grupos
        </Link>
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{group.nombre}</h2>
            <p className="text-muted-foreground mt-1">{group.descripcion || "Sin descripción"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {state.activeTab === "students" && (
              <>
                {state.selectedIds.length > 0 && (
                  <Button variant="solid" className="gap-2 shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => actions.requestDelete(state.selectedIds)} disabled={state.isDeleting}>
                    <Trash2 size={18} /> Eliminar ({state.selectedIds.length})
                  </Button>
                )}
                <Button onClick={() => actions.setIsImportModalOpen(true)} variant={pattern === "neumorphism" ? "neumorphic" : "solid"} className="gap-2 shrink-0" disabled={state.isDeleting}>
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

      {group.usa_asistencia && (
        <GroupDayControl
          dailySession={daily.dailySession}
          isLoading={daily.isLoading}
          isStarting={daily.isStarting}
          isResettingDay={daily.isResettingDay}
          onRequestStartDay={() => daily.setIsStartDayModalOpen(true)}
          onRequestBreak={() => daily.setIsBreakModalOpen(true)}
          onRequestFinalize={() => daily.setIsFinalizeConfirmOpen(true)}
          onRequestResetDay={() => daily.setIsResetDayConfirmOpen(true)}
        />
      )}

      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => actions.setActiveTab("students")}
          className={`pb-3 text-sm font-semibold transition-all ${state.activeTab === "students" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Estudiantes ({state.studentsCount})
        </button>
        <button
          onClick={() => actions.setActiveTab("projects")}
          className={`pb-3 text-sm font-semibold transition-all ${state.activeTab === "projects" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Proyectos Formativos
        </button>
      </div>

      {state.activeTab === "students" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por cédula o nombre..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all focus:outline-none ${pattern === "neumorphism" ? "neu-pressed border-none" : "bg-secondary/30 border border-border focus:ring-2 focus:ring-primary/50"}`}
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
            <DynamicCard className="overflow-hidden">
              <StudentsTable
                students={state.paginatedStudents}
                selectedIds={state.selectedIds}
                isDeleting={state.isDeleting}
                isResetting={state.isResetting}
                onToggleSelectAll={actions.toggleSelectAll}
                onToggleSelect={actions.toggleSelect}
                onRequestDelete={actions.requestDelete}
                onRequestReset={actions.requestReset}
                onRequestEdit={actions.requestEdit}
                allSelected={state.selectedIds.length === state.filteredStudents.length && state.filteredStudents.length > 0}
              />
              <TablePagination
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                totalItems={state.filteredStudents.length}
                onPageChange={actions.setCurrentPage}
              />
            </DynamicCard>
          )}
        </div>
      )}

      {state.activeTab === "projects" && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <FolderKanban size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">Próximamente</h3>
          <p className="text-sm text-muted-foreground mt-2">Aquí el administrador creará los proyectos para dividir a los estudiantes en subgrupos.</p>
        </div>
      )}

      <GroupDetailModals groupId={group.id} state={state} actions={actions} daily={daily} />
    </div>
  );
}
