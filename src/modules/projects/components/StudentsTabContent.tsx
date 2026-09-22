"use client";

import React from "react";
import { Users, Search } from "lucide-react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { StudentsTable } from "./StudentsTable";
import { TablePagination } from "./TablePagination";
import type { StudentProfile } from "../types";

interface StudentsTabContentProps {
  students: StudentProfile[];
  filteredStudents: StudentProfile[];
  paginatedStudents: StudentProfile[];
  selectedIds: string[];
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  isDeleting: boolean;
  isResetting: boolean;
  pattern: string;
  onSearchChange: (val: string) => void;
  onPageChange: (page: number) => void;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onRequestDelete: (ids: string[]) => void;
  onRequestReset: (id: string) => void;
  onRequestEdit: (student: any) => void;
  onRequestMessage: (student: any) => void;
}

export function StudentsTabContent({
  students,
  filteredStudents,
  paginatedStudents,
  selectedIds,
  searchTerm,
  currentPage,
  totalPages,
  isDeleting,
  isResetting,
  pattern,
  onSearchChange,
  onPageChange,
  onToggleSelectAll,
  onToggleSelect,
  onRequestDelete,
  onRequestReset,
  onRequestEdit,
  onRequestMessage,
}: StudentsTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Buscar por cédula o nombre..."
          className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm transition-all focus:outline-none ${
            pattern === "neumorphism"
              ? "neu-pressed border-none"
              : "bg-secondary/30 border border-border focus:ring-2 focus:ring-primary/50"
          }`}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">Sin estudiantes</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {searchTerm ? "No se encontraron resultados para tu búsqueda." : "Aún no hay estudiantes en este grupo."}
          </p>
        </div>
      ) : (
        <DynamicCard className="overflow-hidden">
          <StudentsTable
            students={paginatedStudents}
            selectedIds={selectedIds}
            isDeleting={isDeleting}
            isResetting={isResetting}
            onToggleSelectAll={onToggleSelectAll}
            onToggleSelect={onToggleSelect}
            onRequestDelete={onRequestDelete}
            onRequestReset={onRequestReset}
            onRequestEdit={onRequestEdit}
            onRequestMessage={onRequestMessage}
            allSelected={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
          />
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            onPageChange={onPageChange}
          />
        </DynamicCard>
      )}
    </div>
  );
}
