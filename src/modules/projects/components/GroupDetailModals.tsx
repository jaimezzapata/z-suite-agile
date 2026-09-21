"use client";

import React from "react";
import { ImportStudentsModal } from "./ImportStudentsModal";
import { EditStudentModal } from "./EditStudentModal";
import { StudentMessageModal } from "./StudentMessageModal";
import { ConfirmDialog } from "@/modules/core/components/ui/ConfirmDialog";

interface GroupDetailModalsProps {
  groupId: string;
  state: {
    isImportModalOpen: boolean;
    isConfirmOpen: boolean;
    idsToDelete: string[];
    isDeleting: boolean;
    isResetConfirmOpen: boolean;
    isResetting: boolean;
    isEditModalOpen: boolean;
    editingStudent: any | null;
    isMessageModalOpen: boolean;
    messagingStudent: any | null;
  };
  actions: {
    setIsImportModalOpen: (open: boolean) => void;
    executeDelete: () => void;
    setIsConfirmOpen: (open: boolean) => void;
    executeReset: () => void;
    setIsResetConfirmOpen: (open: boolean) => void;
    closeEditModal: () => void;
    closeMessageModal: () => void;
    refreshStudents: () => Promise<void>;
  };
}

export function GroupDetailModals({ groupId, state, actions }: GroupDetailModalsProps) {
  return (
    <>
      <ImportStudentsModal
        groupId={groupId}
        isOpen={state.isImportModalOpen}
        onClose={() => actions.setIsImportModalOpen(false)}
      />
      <EditStudentModal
        isOpen={state.isEditModalOpen}
        student={state.editingStudent}
        onClose={actions.closeEditModal}
        onSuccess={actions.refreshStudents}
      />
      <StudentMessageModal
        isOpen={state.isMessageModalOpen}
        student={state.messagingStudent}
        onClose={actions.closeMessageModal}
        groupId={groupId}
      />
      <ConfirmDialog
        isOpen={state.isConfirmOpen}
        title="Eliminar Estudiantes"
        description={`¿Estás seguro de eliminar a ${state.idsToDelete.length} estudiante(s)? Esta acción borrará sus datos permanentemente.`}
        confirmText="Eliminar"
        isDestructive={true}
        onConfirm={actions.executeDelete}
        onCancel={() => actions.setIsConfirmOpen(false)}
        isLoading={state.isDeleting}
      />
      <ConfirmDialog
        isOpen={state.isResetConfirmOpen}
        title="Restablecer de Fábrica"
        description="¿Estás seguro de restablecer a este estudiante? Se borrarán todos sus registros y se restablecerá su clave a su cédula."
        confirmText="Restablecer"
        isDestructive={true}
        onConfirm={actions.executeReset}
        onCancel={() => actions.setIsResetConfirmOpen(false)}
        isLoading={state.isResetting}
      />
    </>
  );
}
