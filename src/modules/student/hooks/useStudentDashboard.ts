import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/modules/core/lib/supabase/client";
import { getStudentDashboardData } from "../actions/student-dashboard-actions";
import { getCurrentWorkSession, startWorkday, endBreak } from "../actions/work-actions";
import type { AttendancePenaltiesSummary } from "../lib/penalties";

export function useStudentDashboard() {
  const [studentData, setStudentData] = useState<{
    nombres: string;
    apellidos: string;
    avatar_url: string | null;
    projectName: string;
    groupName: string;
    penaltiesSummary?: AttendancePenaltiesSummary;
  } | null>(null);
  
  const [workSession, setWorkSession] = useState<any>(null);
  const [dailySession, setDailySession] = useState<any>(null);
  const [dailyStatus, setDailyStatus] = useState<string>("no_iniciado");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isGradeBreakdownOpen, setIsGradeBreakdownOpen] = useState(false);

  const loadWorkSession = useCallback(async () => {
    const wsResult = await getCurrentWorkSession();
    if (wsResult.success && wsResult.data) {
      setWorkSession(wsResult.data.workSession ?? null);
      setDailySession(wsResult.data.dailySession ?? null);
      setDailyStatus(wsResult.data.dailyStatus ?? "no_iniciado");
    } else {
      setWorkSession(null);
      setDailySession(null);
    }
  }, []);

  const loadAll = useCallback(async () => {
    const result = await getStudentDashboardData();
    if (result.success && result.data) {
      setStudentData(result.data as any);
      setShowTermsModal(!result.data.terminos_aceptados_at);
    }
    await loadWorkSession();
    setIsLoading(false);
  }, [loadWorkSession]);

  useEffect(() => {
    loadAll();

    const supabase = createClient();
    const channelId = `student-dashboard-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_sessions' }, () => {
        loadAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_daily_sessions' }, () => {
        loadWorkSession();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll, loadWorkSession]);

  const handleStartWorkday = async () => {
    setIsActionLoading(true);
    const res = await startWorkday();
    if (res.success) {
      toast.success("Jornada iniciada.");
      await loadWorkSession();
    } else {
      toast.error(res.error || "Error al iniciar jornada.");
    }
    setIsActionLoading(false);
  };

  const handleEndBreak = async () => {
    setIsActionLoading(true);
    const res = await endBreak();
    if (res.success) {
      toast.success("Regreso del break registrado.");
      await loadWorkSession();
    } else {
      toast.error(res.error || "Error al registrar regreso.");
    }
    setIsActionLoading(false);
  };

  return {
    state: {
      studentData,
      workSession,
      dailySession,
      dailyStatus,
      isLoading,
      isActionLoading,
      showTermsModal,
      isGradeBreakdownOpen,
    },
    actions: {
      setShowTermsModal,
      setIsGradeBreakdownOpen,
      handleStartWorkday,
      handleEndBreak,
      refresh: loadAll,
    }
  };
}
