"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getGroupProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../actions/project-crud-actions";
import type { ProjectWithMembers } from "../types/project-types";

export function useGroupProjects(groupId: string) {
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithMembers | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectWithMembers | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    const res = await getGroupProjects(groupId);
    if (res.success && res.projects) {
      setProjects(res.projects);
    }
    setIsLoading(false);
  }, [groupId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const assignedStudentMap = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => {
      p.members.forEach((m) => {
        map[m.user_id] = p.nombre;
      });
    });
    return map;
  }, [projects]);

  const openCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEdit = (project: ProjectWithMembers) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const openDelete = (project: ProjectWithMembers) => {
    setProjectToDelete(project);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    if (isSubmitting) return;
    setIsDeleteOpen(false);
    setProjectToDelete(null);
  };

  const handleSaveProject = async (data: {
    nombre: string;
    descripcion: string;
    estado: string;
    member_ids: string[];
  }) => {
    setIsSubmitting(true);
    let res;
    if (editingProject) {
      res = await updateProject(
        {
          id: editingProject.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          estado: data.estado,
          member_ids: data.member_ids,
        },
        groupId
      );
    } else {
      res = await createProject({
        group_id: groupId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        member_ids: data.member_ids,
      });
    }
    setIsSubmitting(false);

    if (res.success) {
      toast.success(editingProject ? "Proyecto actualizado." : "Proyecto creado exitosamente.");
      closeModal();
      await loadProjects();
    } else {
      toast.error(res.error || "Error al guardar el proyecto.");
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsSubmitting(true);
    const res = await deleteProject(projectToDelete.id, groupId);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Proyecto eliminado.");
      closeDelete();
      await loadProjects();
    } else {
      toast.error(res.error || "Error al eliminar el proyecto.");
    }
  };

  return {
    state: {
      projects,
      isLoading,
      isModalOpen,
      editingProject,
      isDeleteOpen,
      projectToDelete,
      isSubmitting,
      assignedStudentMap,
    },
    actions: {
      openCreate,
      openEdit,
      closeModal,
      openDelete,
      closeDelete,
      handleSaveProject,
      handleDeleteProject,
      loadProjects,
    },
  };
}
