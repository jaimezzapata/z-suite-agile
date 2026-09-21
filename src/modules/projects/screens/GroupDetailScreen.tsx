"use client";

import * as React from "react";
import type { groups, profiles } from "@prisma/client";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { useGroupDetail } from "../hooks/useGroupDetail";
import { useGroupDailySession } from "../hooks/useGroupDailySession";
import { useGroupProjects } from "../hooks/useGroupProjects";
import { GroupDetailHeader } from "../components/GroupDetailHeader";
import { GroupDayControl } from "../components/GroupDayControl";
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
  const daily = useGroupDailySession(group.id);
  const projects = useGroupProjects(group.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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

      <GroupDetailModals groupId={group.id} state={state} actions={actions} daily={daily} />
    </div>
  );
}
