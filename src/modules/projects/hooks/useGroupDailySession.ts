"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/modules/core/lib/supabase/client";
import { 
  getGroupDailySession, 
  startGroupDay, 
  sendGroupToBreak, 
  finalizeGroupDay,
  resetGroupDay,
} from "../actions/admin-work-actions";
import type { group_daily_sessions } from "@prisma/client";

export function useGroupDailySession(groupId: string) {
  const router = useRouter();
  const [dailySession, setDailySession] = useState<group_daily_sessions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSendingBreak, setIsSendingBreak] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isStartDayModalOpen, setIsStartDayModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isFinalizeConfirmOpen, setIsFinalizeConfirmOpen] = useState(false);
  const [isResettingDay, setIsResettingDay] = useState(false);
  const [isResetDayConfirmOpen, setIsResetDayConfirmOpen] = useState(false);

  const fetchSession = useCallback(async () => {
    const res = await getGroupDailySession(groupId);
    if (res.success) setDailySession(res.data ?? null);
    setIsLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchSession();
    const supabase = createClient();
    const channel = supabase
      .channel(`group-daily-${groupId}-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_daily_sessions' }, (payload: any) => {
        if (payload.new && payload.new.group_id === groupId) setDailySession(payload.new);
        fetchSession();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId, fetchSession]);

  const handleStartDay = async (horaProgramada?: string) => {
    setIsStarting(true);
    const res = await startGroupDay(groupId, horaProgramada);
    setIsStarting(false);
    if (res.success) {
      toast.success("Jornada del día iniciada exitosamente.");
      setDailySession(res.data ?? null);
      setIsStartDayModalOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || "Error al iniciar la jornada.");
    }
  };

  const handleSendToBreak = async (duracionMinutos: number = 15) => {
    setIsSendingBreak(true);
    const res = await sendGroupToBreak(groupId, duracionMinutos);
    setIsSendingBreak(false);
    if (res.success) {
      toast.success(`Estudiantes enviados al break (${res.data?.count ?? 0}).`);
      setIsBreakModalOpen(false);
      await fetchSession();
      router.refresh();
    } else {
      toast.error(res.error || "Error al enviar al break.");
    }
  };

  const handleFinalizeDay = async () => {
    setIsFinalizing(true);
    const res = await finalizeGroupDay(groupId);
    setIsFinalizing(false);
    setIsFinalizeConfirmOpen(false);
    if (res.success) {
      toast.success("Jornada finalizada para el grupo.");
      setDailySession(res.data ?? null);
      router.refresh();
    } else {
      toast.error(res.error || "Error al finalizar jornada.");
    }
  };

  const handleResetDay = async () => {
    setIsResettingDay(true);
    const res = await resetGroupDay(groupId);
    setIsResettingDay(false);
    setIsResetDayConfirmOpen(false);
    if (res.success) {
      toast.success("Jornada del día reiniciada y marcaciones de hoy borradas.");
      setDailySession(null);
      router.refresh();
    } else {
      toast.error(res.error || "Error al reiniciar la jornada.");
    }
  };

  return {
    dailySession, isLoading, isStarting, isSendingBreak, isFinalizing,
    isStartDayModalOpen, setIsStartDayModalOpen, isBreakModalOpen, setIsBreakModalOpen,
    isFinalizeConfirmOpen, setIsFinalizeConfirmOpen, isResettingDay,
    isResetDayConfirmOpen, setIsResetDayConfirmOpen,
    handleStartDay, handleSendToBreak, handleFinalizeDay, handleResetDay,
  };
}
