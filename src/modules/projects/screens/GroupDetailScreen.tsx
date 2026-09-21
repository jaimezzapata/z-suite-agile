"use client";

import * as React from "react";
import type { groups, profiles } from "@prisma/client";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { useGroupDetail } from "../hooks/useGroupDetail";
import { useGroupProjects } from "../hooks/useGroupProjects";
import { GroupDetailHeader } from "../components/GroupDetailHeader";
import { GroupDetailModals } from "../components/GroupDetailModals";
import { StudentsTabContent } from "../components/StudentsTabContent";
import { ProjectsTabContent } from "../components/ProjectsTabContent";

interface GroupDetailScreenProps {
  group: groups;
  students: profiles[];
}

export function GroupDetailScreen({ group, students }: GroupDetailScreenProps) {
  const { pattern } = useDesignPattern();
  const { state, actions } = useGroupDetail(group, students);
  const projects = useGroupProjects(group.id);

  return (
    <div className="w-full space-y-6">
      <GroupDetailHeader
        group={group}
        pattern={pattern}
        activeTab={state.activeTab}
        selectedStudentsCount={state.selectedIds.length}
        isDeletingStudents={state.isDeleting}
        onDeleteSelectedStudents={() => actions.requestDelete(state.selectedIds)}
        onOpenImportStudents={() => actions.setIsImportModalOpen(true)}
        onOpenCreateProject={projects.actions.openCreate}
      />

      {group.usa_asistencia && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-xs">
          <div className="flex items-center gap-2.5 text-foreground font-medium">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Clock size={16} />
            </div>
            <span>Control de Asistencia y Jornada de Trabajo habilitado para este grupo.</span>
          </div>
          <Link
            href="/dashboard/workmanager"
            className="font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Operar en WorkManager</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      <div className="flex gap-6 border-b border-border">
        <button
          onClick={() => actions.setActiveTab("students")}
          className={`pb-3 text-sm font-semibold transition-all ${
            state.activeTab === "students"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Estudiantes ({state.studentsCount})
        </button>
        <button
          onClick={() => actions.setActiveTab("projects")}
          className={`pb-3 text-sm font-semibold transition-all ${
            state.activeTab === "projects"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Proyectos Formativos ({projects.state.projects.length})
        </button>
      </div>

      {state.activeTab === "students" && (
        <StudentsTabContent
          students={students as any}
          filteredStudents={state.filteredStudents}
          paginatedStudents={state.paginatedStudents}
          selectedIds={state.selectedIds}
          searchTerm={state.searchTerm}
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          isDeleting={state.isDeleting}
          isResetting={state.isResetting}
          pattern={pattern}
          onSearchChange={actions.setSearchTerm}
          onPageChange={actions.setCurrentPage}
          onToggleSelectAll={actions.toggleSelectAll}
          onToggleSelect={actions.toggleSelect}
          onRequestDelete={actions.requestDelete}
          onRequestReset={actions.requestReset}
          onRequestEdit={actions.requestEdit}
          onRequestMessage={actions.requestMessage}
        />
      )}

      {state.activeTab === "projects" && (
        <ProjectsTabContent
          projects={projects.state.projects}
          isLoading={projects.state.isLoading}
          students={students}
          assignedStudentMap={projects.state.assignedStudentMap}
          isModalOpen={projects.state.isModalOpen}
          editingProject={projects.state.editingProject}
          isDeleteOpen={projects.state.isDeleteOpen}
          projectToDelete={projects.state.projectToDelete}
          isSubmitting={projects.state.isSubmitting}
          onOpenCreate={projects.actions.openCreate}
          onOpenEdit={projects.actions.openEdit}
          onOpenDelete={projects.actions.openDelete}
          onCloseModal={projects.actions.closeModal}
          onCloseDelete={projects.actions.closeDelete}
          onSaveProject={projects.actions.handleSaveProject}
          onDeleteProject={projects.actions.handleDeleteProject}
        />
      )}

      <GroupDetailModals groupId={group.id} state={state} actions={actions} />
    </div>
  );
}
