import * as React from "react";
import { motion } from "motion/react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { AvatarUpload } from "../components/AvatarUpload";
import { Clock, TrendingUp, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { Skeleton } from "@/modules/core/components/ui/Skeleton";
import { TermsModal } from "../components/TermsModal";
import { useStudentDashboard } from "../hooks/useStudentDashboard";

export function StudentDashboardScreen() {
  const { state, actions } = useStudentDashboard();

  // Variantes para la animación de entrada
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <>
      {state.showTermsModal && (
        <TermsModal onAccepted={() => actions.setShowTermsModal(false)} />
      )}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto space-y-8"
      >
      {/* Header Perfil */}
      <motion.div variants={itemVariants} className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 bg-card border border-border p-6 md:p-10 rounded-3xl shadow-sm">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-3xl overflow-hidden">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <AvatarUpload 
          initialAvatarUrl={state.studentData?.avatar_url} 
          userInitials={state.studentData ? `${state.studentData.nombres[0]}${state.studentData.apellidos[0]}` : "ES"} 
        />
        
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            Desarrollador / Estudiante
          </div>
          {state.isLoading ? (
            <div className="space-y-2 mt-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {state.studentData?.nombres} {state.studentData?.apellidos}
              </h2>
              <p className="text-muted-foreground mt-1 text-lg">
                Proyecto: <span className="font-semibold text-foreground">{state.studentData?.projectName} ({state.studentData?.groupName})</span>
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 z-10 w-full md:w-auto items-center">
          <div className="flex flex-col items-center md:items-end bg-background/50 px-5 py-2 rounded-xl border border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nota Estimada</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-3xl font-black text-primary leading-none">4.8</span>
              <TrendingUp className="text-green-500" size={20} />
            </div>
          </div>
          <Button variant="outline" className="flex-1 md:flex-none gap-2 h-full">
            <Mail size={18} /> Mensajes <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-1">2</span>
          </Button>
        </div>
      </motion.div>

      <div className="w-full">
        <DynamicCard className="p-6 md:p-10">
          <div className="flex justify-between items-center border-b border-border/50 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="text-primary" size={32} />
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Control Operativo</h3>
            </div>
            {state.workSession?.inicio_break_at && !state.workSession?.regreso_break_at ? (
              <span className="px-4 py-2 bg-amber-500/10 text-amber-500 text-sm font-bold rounded-md uppercase tracking-wider">
                En Break
              </span>
            ) : state.workSession?.ingreso_jornada_at ? (
              <span className="px-4 py-2 bg-green-500/10 text-green-500 text-sm font-bold rounded-md uppercase tracking-wider">
                En Jornada
              </span>
            ) : (
              <span className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-bold rounded-md uppercase tracking-wider">
                Inactiva
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex flex-col gap-2">
              <span className="text-base font-semibold text-muted-foreground uppercase tracking-wider">Ingreso a la Jornada</span>
              <span className="text-5xl font-black text-foreground drop-shadow-sm">
                {state.workSession?.ingreso_jornada_at ? new Date(state.workSession.ingreso_jornada_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
              </span>
            </div>
            <div className="p-6 rounded-2xl bg-secondary/30 border border-border flex flex-col gap-2">
              <span className="text-base font-semibold text-muted-foreground uppercase tracking-wider">Ingreso al Break</span>
              <span className="text-5xl font-black text-foreground drop-shadow-sm">
                {state.workSession?.inicio_break_at ? new Date(state.workSession.inicio_break_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {!state.workSession?.ingreso_jornada_at ? (
              <Button 
                size="lg"
                className="flex-1 gap-3 h-16 text-lg font-bold" 
                onClick={actions.handleStartWorkday} 
                disabled={state.isActionLoading}
              >
                <Clock size={24} /> Iniciar Jornada
              </Button>
            ) : !state.workSession?.regreso_break_at && state.workSession?.inicio_break_at ? (
              <Button 
                size="lg"
                variant="solid" 
                className="flex-1 gap-3 h-16 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all"
                onClick={actions.handleEndBreak}
                disabled={state.isActionLoading}
              >
                <Clock size={24} /> Regresar del Break
              </Button>
            ) : state.workSession?.ingreso_jornada_at && !state.workSession?.inicio_break_at ? (
              <Button 
                size="lg"
                variant="outline" 
                className="flex-1 gap-3 h-16 text-lg font-bold border-green-500/50 text-green-500 cursor-default opacity-80"
                disabled={true}
              >
                <Clock size={24} /> En Jornada (Esperando Break)
              </Button>
            ) : (
              <Button 
                size="lg"
                variant="outline" 
                className="flex-1 gap-3 h-16 text-lg font-bold border-primary/20 text-primary opacity-50 cursor-not-allowed"
                disabled={true}
              >
                <CheckCircle size={24} /> Jornada Completada
              </Button>
            )}
            <Button size="lg" variant="outline" className="flex-1 gap-3 h-16 text-lg font-bold border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-all">
              <AlertTriangle size={24} /> Reportar Caída de Red
            </Button>
          </div>
        </DynamicCard>
      </div>
    </motion.div>
    </>
  );
}
