import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getStudentDashboardData } from "../actions/student-dashboard-actions";
import { getCurrentWorkSession, startWorkday, endBreak } from "../actions/work-actions";

export function useStudentDashboard() {
  const [studentData, setStudentData] = useState<{
    nombres: string;
    apellidos: string;
    avatar_url: string | null;
    projectName: string;
    groupName: string;
  } | null>(null);
  
  const [workSession, setWorkSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const loadWorkSession = async () => {
    const wsResult = await getCurrentWorkSession();
    if (wsResult.success) {
      setWorkSession(wsResult.data);
    }
  };

  useEffect(() => {
    async function loadData() {
      const result = await getStudentDashboardData();
      if (result.success && result.data) {
        setStudentData(result.data as any);
        if (!result.data.terminos_aceptados_at) {
          setShowTermsModal(true);
        }
      }
      await loadWorkSession();
      setIsLoading(false);
    }
    loadData();
  }, []);

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
      isLoading,
      isActionLoading,
      showTermsModal,
    },
    actions: {
      setShowTermsModal,
      handleStartWorkday,
      handleEndBreak,
    }
  };
}
