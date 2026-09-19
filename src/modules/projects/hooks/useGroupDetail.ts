import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeGroupMembers, resetStudentData } from "../actions/student-actions";
import { sendGroupToBreak } from "../actions/admin-work-actions";
import { createClient } from "@/modules/core/lib/supabase/client";
import type { groups, profiles } from "@prisma/client";

export function useGroupDetail(group: groups, students: profiles[]) {
  const router = useRouter();

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('group-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_sessions' }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);
  
  // Tabs and Modals
  const [activeTab, setActiveTab] = useState<"students" | "projects">("students");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Deletion State
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  // Reset State
  const [isResetting, setIsResetting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [idToReset, setIdToReset] = useState<string | null>(null);

  // Break State
  const [isSendingToBreak, setIsSendingToBreak] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.cedula.toLowerCase().includes(term) ||
      student.nombres.toLowerCase().includes(term) ||
      student.apellidos.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const requestDelete = (ids: string[]) => {
    setIdsToDelete(ids);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    const result = await removeGroupMembers(group.id, idsToDelete);
    setIsDeleting(false);
    setIsConfirmOpen(false);

    if (result.success) {
      setSelectedIds([]);
      toast.success(`Estudiantes eliminados y borrados permanentemente.`);
      router.refresh();
    } else {
      toast.error(result.error || "Ocurrió un error al eliminar.");
    }
  };

  const requestReset = (id: string) => {
    setIdToReset(id);
    setIsResetConfirmOpen(true);
  };

  const executeReset = async () => {
    if (!idToReset) return;
    setIsResetting(true);
    const result = await resetStudentData(idToReset);
    setIsResetting(false);
    setIsResetConfirmOpen(false);
    setIdToReset(null);

    if (result.success) {
      toast.success("El estudiante ha sido restablecido de fábrica.");
      router.refresh();
    } else {
      toast.error(result.error || "Error al restablecer estudiante.");
    }
  };

  const handleSendToBreak = async () => {
    setIsSendingToBreak(true);
    const result = await sendGroupToBreak(group.id);
    setIsSendingToBreak(false);

    if (result.success) {
      toast.success(`Se enviaron ${result.data?.count} estudiantes activos al break.`);
      router.refresh();
    } else {
      toast.error(result.error || "Ocurrió un error al enviar al break.");
    }
  };

  return {
    state: {
      activeTab,
      isImportModalOpen,
      selectedIds,
      isDeleting,
      isConfirmOpen,
      idsToDelete,
      isResetting,
      isResetConfirmOpen,
      isSendingToBreak,
      searchTerm,
      currentPage,
      totalPages,
      paginatedStudents,
      filteredStudents,
    },
    actions: {
      setActiveTab,
      setIsImportModalOpen,
      setSearchTerm,
      setCurrentPage,
      setIsConfirmOpen,
      setIsResetConfirmOpen,
      toggleSelectAll,
      toggleSelect,
      requestDelete,
      executeDelete,
      requestReset,
      executeReset,
      handleSendToBreak,
    }
  };
}
