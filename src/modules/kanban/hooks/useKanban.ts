"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getKanbanProjects, getProjectKanbanBoard, moveKanbanTask, rejectKanbanTaskQA } from "../actions/kanban-actions";
import type { KanbanProjectOption, KanbanCardItem, KanbanColumnId, QARejectionReason } from "../types";

export function useKanban() {
  const [projects, setProjects] = useState<KanbanProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [cards, setCards] = useState<KanbanCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cardToReject, setCardToReject] = useState<KanbanCardItem | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    const res = await getKanbanProjects();
    if (res.success && res.projects.length > 0) {
      setProjects(res.projects);
      setSelectedProjectId(res.projects[0].id);
    }
    setIsLoading(false);
  }, []);

  const loadBoard = useCallback(async (projId: string) => {
    if (!projId) return;
    setIsLoading(true);
    const res = await getProjectKanbanBoard(projId);
    if (res.success) {
      setCards(res.cards);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (selectedProjectId) {
      loadBoard(selectedProjectId);
    }
  }, [selectedProjectId, loadBoard]);

  const handleMoveCard = async (cardId: string, toColumn: KanbanColumnId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, columna: toColumn } : c))
    );
    const res = await moveKanbanTask(cardId, toColumn);
    if (!res.success) {
      toast.error("Error al mover historia: " + (res.error || ""));
      if (selectedProjectId) loadBoard(selectedProjectId);
      return;
    }
    if (toColumn === "done") {
      toast.success("Historia aprobada y completada");
    }
  };

  const handleConfirmReject = async (cardId: string, reason: QARejectionReason) => {
    setCardToReject(null);
    const res = await rejectKanbanTaskQA(cardId, reason);
    if (!res.success) {
      toast.error("Error al rechazar historia: " + (res.error || ""));
      return;
    }

    if (res.esReincidente) {
      toast.error(`Reincidencia en QA: -0.2 pts descontados de la nota individual (${reason})`);
    } else {
      toast.info(`Historia devuelta para corrección (${reason}). Primer rechazo formativo sin penalización.`);
    }

    if (selectedProjectId) {
      await loadBoard(selectedProjectId);
    }
  };

  return {
    state: {
      projects,
      selectedProjectId,
      cards,
      isLoading,
      cardToReject,
    },
    actions: {
      setSelectedProjectId,
      setCardToReject,
      moveCard: handleMoveCard,
      confirmRejectQA: handleConfirmReject,
      refresh: () => loadBoard(selectedProjectId),
    },
  };
}
