"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getWorkManagerGroups, getWorkManagerGroupLive } from "../actions/workmanager-actions";
import type { WorkManagerGroupStatus } from "../types";

export function useWorkManager() {
  const [groups, setGroups] = useState<{ id: string; nombre: string }[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [liveData, setLiveData] = useState<WorkManagerGroupStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    const res = await getWorkManagerGroups();
    if (res.success && res.groups.length > 0) {
      setGroups(res.groups);
      setSelectedGroupId(res.groups[0].id);
    }
    setIsLoading(false);
  }, []);

  const loadLive = useCallback(async (groupId: string) => {
    if (!groupId) return;
    setIsLoading(true);
    const res = await getWorkManagerGroupLive(groupId);
    if (res.success && res.data) {
      setLiveData(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      loadLive(selectedGroupId);
    }
  }, [selectedGroupId, loadLive]);

  const filteredStudents = useMemo(() => {
    if (!liveData) return [];
    if (!searchTerm.trim()) return liveData.estudiantes;
    const term = searchTerm.toLowerCase();
    return liveData.estudiantes.filter(
      (s) =>
        s.nombres.toLowerCase().includes(term) ||
        s.apellidos.toLowerCase().includes(term) ||
        s.cedula.includes(term)
    );
  }, [liveData, searchTerm]);

  return {
    state: {
      groups,
      selectedGroupId,
      liveData,
      isLoading,
      searchTerm,
      filteredStudents,
    },
    actions: {
      setSelectedGroupId,
      setSearchTerm,
      refresh: () => loadLive(selectedGroupId),
    },
  };
}
