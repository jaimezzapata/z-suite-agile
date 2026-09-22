"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateGroup, deleteGroup } from "../actions/project-actions";
import type { UpdateGroupInput } from "../types/group-types";
import type { groups } from "@prisma/client";

export function useGroupHeaderActions(group: groups) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (data: UpdateGroupInput) => {
    setIsLoading(true);
    setError(null);
    const res = await updateGroup(group.id, data);
    setIsLoading(false);

    if (res.success) {
      setIsEditOpen(false);
      toast.success("Grupo actualizado correctamente.");
      router.refresh();
    } else {
      setError(res.error || "Error al actualizar el grupo.");
      toast.error(res.error || "Error al actualizar el grupo.");
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deleteGroup(group.id);
    setIsLoading(false);

    if (res.success) {
      setIsDeleteOpen(false);
      toast.success("Grupo eliminado exitosamente.");
      router.push("/dashboard/grupos");
    } else {
      toast.error(res.error || "Error al eliminar el grupo.");
    }
  };

  return {
    state: { isEditOpen, isDeleteOpen, isLoading, error },
    actions: {
      openEdit: () => {
        setError(null);
        setIsEditOpen(true);
      },
      closeEdit: () => {
        if (!isLoading) setIsEditOpen(false);
      },
      openDelete: () => setIsDeleteOpen(true),
      closeDelete: () => {
        if (!isLoading) setIsDeleteOpen(false);
      },
      handleUpdate,
      handleDelete,
    },
  };
}
