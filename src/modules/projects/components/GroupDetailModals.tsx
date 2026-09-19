"use client";

import React from "react";
import { ImportStudentsModal } from "./ImportStudentsModal";
import { EditStudentModal } from "./EditStudentModal";
import { StartDayModal } from "./StartDayModal";
import { SendBreakModal } from "./SendBreakModal";
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
  };
  actions: {
    setIsImportModalOpen: (open: boolean) => void;
    executeDelete: () => void;
    setIsConfirmOpen: (open: boolean) => void;
    executeReset: () => void;
    setIsResetConfirmOpen: (open: boolean) => void;
    closeEditModal: () => void;
    refreshStudents: () => Promise<void>;
  };
  daily: {
    isStartDayModalOpen: boolean;
    setIsStartDayModalOpen: (open: boolean) => void;
    handleStartDay: (hora?: string) => void;
    isStarting: boolean;
    isBreakModalOpen: boolean;
    setIsBreakModalOpen: (open: boolean) => void;
    handleSendToBreak: (duracion?: number) => void;
    isSendingBreak: boolean;
    isFinalizeConfirmOpen: boolean;
    isFinalizing: boolean;
    handleFinalizeDay: () => void;
    setIsFinalizeConfirmOpen: (open: boolean) => void;
    isResetDayConfirmOpen: boolean;
    isResettingDay: boolean;
    handleResetDay: () => void;
    setIsResetDayConfirmOpen: (open: boolean) => void;
  };
}

export function GroupDetailModals({ groupId, state, actions, daily }: GroupDetailModalsProps) {
  return (
    <>
      <StartDayModal
        isOpen={daily.isStartDayModalOpen}
        onClose={() => daily.setIsStartDayModalOpen(false)}
        onConfirm={daily.handleStartDay}
        isLoading={daily.isStarting}
      />
      <SendBreakModal
        isOpen={daily.isBreakModalOpen}
        onClose={() => daily.setIsBreakModalOpen(false)}
        onConfirm={daily.handleSendToBreak}
        isLoading={daily.isSendingBreak}
      />
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
      <ConfirmDialog
        isOpen={daily.isFinalizeConfirmOpen}
        title="Finalizar Jornada del Día"
        description="¿Estás seguro de finalizar la jornada de hoy para todo el grupo? Los estudiantes ya no podrán realizar marcaciones de tiempo."
        confirmText="Finalizar Día"
        isDestructive={true}
        onConfirm={daily.handleFinalizeDay}
        onCancel={() => daily.setIsFinalizeConfirmOpen(false)}
        isLoading={daily.isFinalizing}
      />
      <ConfirmDialog
        isOpen={daily.isResetDayConfirmOpen}
        title="Reiniciar Jornada de Hoy"
        description="¿Estás seguro de reiniciar la jornada del día? Se borrarán todas las marcaciones de hoy y el día volverá al estado 'No Iniciado'."
        confirmText="Reiniciar Día"
        isDestructive={true}
        onConfirm={daily.handleResetDay}
        onCancel={() => daily.setIsResetDayConfirmOpen(false)}
        isLoading={daily.isResettingDay}
      />
    </>
  );
}
