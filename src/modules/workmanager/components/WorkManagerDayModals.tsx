"use client";

import React from "react";
import { StartDayModal } from "@/modules/projects/components/StartDayModal";
import { SendBreakModal } from "@/modules/projects/components/SendBreakModal";
import { ConfirmDialog } from "@/modules/core/components/ui/ConfirmDialog";

interface WorkManagerDayModalsProps {
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
    setIsFinalizeConfirmOpen: (open: boolean) => void;
    handleFinalizeDay: () => void;
    isFinalizing: boolean;
    isResetDayConfirmOpen: boolean;
    setIsResetDayConfirmOpen: (open: boolean) => void;
    handleResetDay: () => void;
    isResettingDay: boolean;
  };
  onActionComplete?: () => void;
}

export function WorkManagerDayModals({ daily, onActionComplete }: WorkManagerDayModalsProps) {
  return (
    <>
      <StartDayModal
        isOpen={daily.isStartDayModalOpen}
        onClose={() => daily.setIsStartDayModalOpen(false)}
        onConfirm={async (hora) => {
          await daily.handleStartDay(hora);
          if (onActionComplete) onActionComplete();
        }}
        isLoading={daily.isStarting}
      />

      <SendBreakModal
        isOpen={daily.isBreakModalOpen}
        onClose={() => daily.setIsBreakModalOpen(false)}
        onConfirm={async (duracion) => {
          await daily.handleSendToBreak(duracion);
          if (onActionComplete) onActionComplete();
        }}
        isLoading={daily.isSendingBreak}
      />

      <ConfirmDialog
        isOpen={daily.isFinalizeConfirmOpen}
        title="Finalizar Jornada del Día"
        description="¿Estás seguro de que deseas finalizar la jornada para este grupo? Los estudiantes no podrán hacer más marcaciones hoy."
        confirmText="Finalizar Jornada"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={daily.isFinalizing}
        onCancel={() => daily.setIsFinalizeConfirmOpen(false)}
        onConfirm={async () => {
          await daily.handleFinalizeDay();
          if (onActionComplete) onActionComplete();
        }}
      />

      <ConfirmDialog
        isOpen={daily.isResetDayConfirmOpen}
        title="Restablecer Jornada del Día (Emergencia)"
        description="¡ADVERTENCIA! Esta acción borrará todas las marcaciones de asistencia, ingresos y breaks registrados hoy para este grupo. Úsalo solo si necesitas reiniciar la jornada."
        confirmText="Restablecer y Borrar Hoy"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={daily.isResettingDay}
        onCancel={() => daily.setIsResetDayConfirmOpen(false)}
        onConfirm={async () => {
          await daily.handleResetDay();
          if (onActionComplete) onActionComplete();
        }}
      />
    </>
  );
}
