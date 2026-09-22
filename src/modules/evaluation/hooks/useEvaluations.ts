"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getEvaluationGroups, getGroupEvaluationMetrics } from "../actions/evaluation-actions";
import type { GroupOption, GroupEvaluationData, StudentEvaluationRecord } from "../types";

export function useEvaluations() {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [data, setData] = useState<GroupEvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudentForAudit, setSelectedStudentForAudit] = useState<StudentEvaluationRecord | null>(null);

  const loadGroups = useCallback(async () => {
    setIsLoading(true);
    const res = await getEvaluationGroups();
    if (res.success && res.groups.length > 0) {
      setGroups(res.groups);
      setSelectedGroupId(res.groups[0].id);
    }
    setIsLoading(false);
  }, []);

  const loadMetrics = useCallback(async (groupId: string) => {
    if (!groupId) return;
    setIsLoading(true);
    const res = await getGroupEvaluationMetrics(groupId);
    if (res.success && res.data) {
      setData(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      loadMetrics(selectedGroupId);
    }
  }, [selectedGroupId, loadMetrics]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data.estudiantes;
    const term = searchTerm.toLowerCase();
    return data.estudiantes.filter(
      (s) =>
        s.nombres.toLowerCase().includes(term) ||
        s.apellidos.toLowerCase().includes(term) ||
        s.cedula.includes(term) ||
        (s.proyecto && s.proyecto.toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  return {
    state: {
      groups,
      selectedGroupId,
      data,
      isLoading,
      searchTerm,
      filteredStudents,
      selectedStudentForAudit,
    },
    actions: {
      setSelectedGroupId,
      setSearchTerm,
      setSelectedStudentForAudit,
      refresh: () => loadMetrics(selectedGroupId),
    },
  };
}
