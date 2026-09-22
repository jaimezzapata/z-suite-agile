import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { removeGroupMembers, resetStudentData, getGroupStudents } from "../actions/student-actions";
import { createClient } from "@/modules/core/lib/supabase/client";
import type { groups, profiles } from "@prisma/client";

export function useGroupDetail(group: groups, initialStudents: profiles[]) {
  const [students, setStudents] = useState<any[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<"students" | "projects">("students");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [idToReset, setIdToReset] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messagingStudent, setMessagingStudent] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const refreshStudents = useCallback(async () => {
    const res = await getGroupStudents(group.id);
    if (res.success && res.students) setStudents(res.students);
  }, [group.id]);

  useEffect(() => {
    const supabase = createClient();
    const channelId = `group-realtime-${group.id}-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
        if (payload.new && payload.new.id) {
          setStudents((prev) =>
            prev.map((s) => (s.id === payload.new.id ? { ...s, ...payload.new } : s))
          );
        }
        refreshStudents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_sessions' }, (payload: any) => {
        if (payload.new && payload.new.user_id) {
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id !== payload.new.user_id) return s;
              const currentSessions = s.work_sessions || [];
              const exists = currentSessions.some((w: any) => w.id === payload.new.id);
              const updated = exists
                ? currentSessions.map((w: any) => (w.id === payload.new.id ? { ...w, ...payload.new } : w))
                : [payload.new, ...currentSessions];
              return { ...s, work_sessions: updated };
            })
          );
        }
        refreshStudents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => {
        refreshStudents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [group.id, refreshStudents]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredStudents = students.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.cedula?.toLowerCase().includes(term) || s.nombres?.toLowerCase().includes(term) || s.apellidos?.toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? [] : filteredStudents.map(s => s.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    const result = await removeGroupMembers(group.id, idsToDelete);
    setIsDeleting(false);
    setIsConfirmOpen(false);
    if (result.success) {
      setSelectedIds([]);
      toast.success("Estudiantes eliminados.");
      await refreshStudents();
    } else {
      toast.error(result.error || "Error al eliminar.");
    }
  };

  const executeReset = async () => {
    if (!idToReset) return;
    setIsResetting(true);
    const result = await resetStudentData(idToReset);
    setIsResetting(false);
    setIsResetConfirmOpen(false);
    setIdToReset(null);
    if (result.success) {
      toast.success("Estudiante restablecido.");
      await refreshStudents();
    } else {
      toast.error(result.error || "Error al restablecer.");
    }
  };

  return {
    state: {
      activeTab, isImportModalOpen, selectedIds, isDeleting, isConfirmOpen,
      idsToDelete, isResetting, isResetConfirmOpen, isEditModalOpen, editingStudent,
      isMessageModalOpen, messagingStudent,
      searchTerm, currentPage, totalPages, paginatedStudents, filteredStudents, studentsCount: students.length
    },
    actions: {
      setActiveTab, setIsImportModalOpen, setSearchTerm, setCurrentPage,
      setIsConfirmOpen, setIsResetConfirmOpen, toggleSelectAll, toggleSelect,
      requestDelete: (ids: string[]) => { setIdsToDelete(ids); setIsConfirmOpen(true); },
      executeDelete,
      requestReset: (id: string) => { setIdToReset(id); setIsResetConfirmOpen(true); },
      executeReset,
      requestEdit: (student: any) => { setEditingStudent(student); setIsEditModalOpen(true); },
      closeEditModal: () => { setIsEditModalOpen(false); setEditingStudent(null); },
      requestMessage: (student: any) => { setMessagingStudent(student); setIsMessageModalOpen(true); },
      closeMessageModal: () => { setIsMessageModalOpen(false); setMessagingStudent(null); },
      refreshStudents,
    }
  };
}
