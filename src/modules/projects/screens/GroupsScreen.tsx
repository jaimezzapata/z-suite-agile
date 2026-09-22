"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { ConfirmDialog } from "@/modules/core/components/ui/ConfirmDialog";
import { GroupCard } from "../components/GroupCard";
import { GroupModal } from "../components/GroupModal";
import { useGroups } from "../hooks/useGroups";
import type { groups } from "@prisma/client";

interface GroupsScreenProps {
  initialGroups: groups[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function GroupsScreen({ initialGroups }: GroupsScreenProps) {
  const { state, actions } = useGroups(initialGroups);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Gestión de Grupos</h2>
          <p className="text-muted-foreground mt-1">
            Administra tus proyectos y define qué módulos de Z-Suite estarán activos para cada uno.
          </p>
        </div>
        <Button onClick={actions.openCreate} className="gap-2 shrink-0">
          <Plus size={18} /> Nuevo Grupo
        </Button>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={state.searchTerm}
            onChange={(e) => actions.setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={state.statusFilter}
          onChange={(e) => actions.setStatusFilter(e.target.value as any)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <select
          value={state.moduleFilter}
          onChange={(e) => actions.setModuleFilter(e.target.value as any)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
        >
          <option value="all">Todos los módulos</option>
          <option value="asistencia">Asistencia activa</option>
          <option value="kanban">Kanban activo</option>
          <option value="evaluacion">Evaluación activa</option>
        </select>
      </div>

      {/* Lista de Grupos */}
      {initialGroups.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <h3 className="text-xl font-bold text-muted-foreground">No tienes grupos creados</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Crea tu primer grupo para empezar a usar los módulos.</p>
          <Button onClick={actions.openCreate} variant="outline">
            Crear mi primer Grupo
          </Button>
        </div>
      ) : state.filteredGroups.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-2xl bg-card">
          <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron resultados</h3>
          <p className="text-sm text-muted-foreground mt-1">Intenta ajustando los filtros de búsqueda.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {state.filteredGroups.map((group) => (
            <motion.div key={group.id} variants={itemVariants}>
              <GroupCard group={group} onEdit={actions.openEdit} onDelete={actions.openDelete} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de Creación */}
      <GroupModal
        isOpen={state.isCreateOpen}
        title="Crear Nuevo Grupo"
        isLoading={state.isLoading}
        error={state.error}
        onSubmit={actions.handleCreate}
        onClose={actions.closeModals}
      />

      {/* Modal de Edición */}
      <GroupModal
        isOpen={state.isEditOpen}
        title="Editar Grupo"
        initialData={state.selectedGroup || undefined}
        isEditing={true}
        isLoading={state.isLoading}
        error={state.error}
        onSubmit={actions.handleUpdate}
        onClose={actions.closeModals}
      />

      {/* Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={state.isDeleteOpen}
        title="Eliminar Grupo"
        description={`¿Estás seguro de que deseas eliminar permanentemente el grupo "${state.selectedGroup?.nombre}"? Esta acción eliminará los miembros, proyectos y registros asociados.`}
        isDestructive={true}
        confirmText="Eliminar Grupo"
        onConfirm={actions.handleDelete}
        onCancel={actions.closeModals}
        isLoading={state.isLoading}
      />
    </div>
  );
}
