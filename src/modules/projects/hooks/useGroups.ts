"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { groups } from "@prisma/client";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  CreateGroupInput,
  UpdateGroupInput,
} from "../actions/project-actions";

export function useGroups(initialGroups: groups[]) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "activo" | "inactivo">("all");
  const [moduleFilter, setModuleFilter] = React.useState<"all" | "asistencia" | "kanban" | "evaluacion">("all");

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<groups | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const filteredGroups = React.useMemo(() => {
    return initialGroups.filter((group) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        group.nombre.toLowerCase().includes(term) ||
        (group.descripcion || "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || group.estado === statusFilter;
      const matchesModule =
        moduleFilter === "all" ||
        (moduleFilter === "asistencia" && group.usa_asistencia) ||
        (moduleFilter === "kanban" && group.usa_kanban) ||
        (moduleFilter === "evaluacion" && group.usa_evaluacion);

      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [initialGroups, searchTerm, statusFilter, moduleFilter]);

  const openCreate = () => {
    setError(null);
    setIsCreateOpen(true);
  };

  const openEdit = (group: groups) => {
    setSelectedGroup(group);
    setError(null);
    setIsEditOpen(true);
  };

  const openDelete = (group: groups) => {
    setSelectedGroup(group);
    setIsDeleteOpen(true);
  };

  const closeModals = () => {
    if (isLoading) return;
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedGroup(null);
    setError(null);
  };

  const handleCreate = async (data: CreateGroupInput) => {
    setIsLoading(true);
    setError(null);
    const result = await createGroup(data);
    setIsLoading(false);

    if (result.success) {
      closeModals();
      router.refresh();
    } else {
      setError(result.error || "Ocurrió un error al crear el grupo.");
    }
  };

  const handleUpdate = async (data: UpdateGroupInput) => {
    if (!selectedGroup) return;
    setIsLoading(true);
    setError(null);
    const result = await updateGroup(selectedGroup.id, data);
    setIsLoading(false);

    if (result.success) {
      closeModals();
      router.refresh();
    } else {
      setError(result.error || "Ocurrió un error al actualizar el grupo.");
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;
    setIsLoading(true);
    const result = await deleteGroup(selectedGroup.id);
    setIsLoading(false);

    if (result.success) {
      closeModals();
      router.refresh();
    } else {
      alert(result.error || "Ocurrió un error al eliminar el grupo.");
    }
  };

  return {
    state: {
      searchTerm,
      statusFilter,
      moduleFilter,
      filteredGroups,
      isCreateOpen,
      isEditOpen,
      isDeleteOpen,
      selectedGroup,
      isLoading,
      error,
    },
    actions: {
      setSearchTerm,
      setStatusFilter,
      setModuleFilter,
      openCreate,
      openEdit,
      openDelete,
      closeModals,
      handleCreate,
      handleUpdate,
      handleDelete,
    },
  };
}
