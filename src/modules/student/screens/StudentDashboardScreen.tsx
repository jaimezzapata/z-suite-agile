"use client";

import * as React from "react";
import { motion } from "motion/react";
import { AvatarUpload } from "../components/AvatarUpload";
import { TrendingUp, Mail } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { Skeleton } from "@/modules/core/components/ui/Skeleton";
import { TermsModal } from "../components/TermsModal";
import { useStudentDashboard } from "../hooks/useStudentDashboard";
import { useStudentMessages } from "../hooks/useStudentMessages";
import { StudentMessagesModal } from "../components/StudentMessagesModal";
import { StudentGradeBreakdownModal } from "../components/StudentGradeBreakdownModal";
import { StudentWorkPanel } from "../components/StudentWorkPanel";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export function StudentDashboardScreen() {
  const { state, actions } = useStudentDashboard();
  const messages = useStudentMessages();

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
        <motion.div variants={itemVariants} className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 bg-card border border-border p-6 md:p-10 rounded-3xl shadow-xs">
          <div className="absolute inset-0 opacity-5 pointer-events-none rounded-3xl overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>
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
            <button
              type="button"
              onClick={() => actions.setIsGradeBreakdownOpen(true)}
              className="flex flex-col items-center md:items-end bg-background/50 hover:bg-secondary/40 transition-all px-5 py-2 rounded-xl border border-border cursor-pointer group text-left"
              title="Ver desglose de calificación y faltas"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Nota Estimada</span>
                {state.studentData?.penaltiesSummary && state.studentData.penaltiesSummary.totalPenalizaciones > 0 && (
                  <span className="bg-destructive/15 text-destructive text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                    -{state.studentData.penaltiesSummary.puntosDescontados.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-3xl font-black leading-none ${
                  (state.studentData?.penaltiesSummary?.notaEstimada ?? 5.0) >= 4.5
                    ? "text-primary"
                    : (state.studentData?.penaltiesSummary?.notaEstimada ?? 5.0) >= 3.5
                    ? "text-amber-500"
                    : "text-destructive"
                }`}>
                  {(state.studentData?.penaltiesSummary?.notaEstimada ?? 5.0).toFixed(1)}
                </span>
                <TrendingUp className="text-green-500" size={20} />
              </div>
            </button>
            <Button
              variant="outline"
              onClick={messages.actions.openMessagesModal}
              className="flex-1 md:flex-none gap-2 h-full relative"
            >
              <Mail size={18} /> Mensajes
              {messages.state.unreadCount > 0 ? (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 ml-1 font-bold">
                  {messages.state.unreadCount}
                </span>
              ) : null}
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <StudentWorkPanel
            workSession={state.workSession}
            dailySession={state.dailySession}
            dailyStatus={state.dailyStatus}
            isActionLoading={state.isActionLoading}
            onStartWorkday={actions.handleStartWorkday}
            onEndBreak={actions.handleEndBreak}
            penaltiesSummary={state.studentData?.penaltiesSummary}
          />
        </motion.div>
      </motion.div>

      <StudentMessagesModal
        isOpen={messages.state.isModalOpen}
        onClose={messages.actions.closeMessagesModal}
        messages={messages.state.messages}
        onMarkAsRead={messages.actions.handleMarkAsRead}
        isLoading={messages.state.isLoading}
      />

      <StudentGradeBreakdownModal
        isOpen={state.isGradeBreakdownOpen}
        onClose={() => actions.setIsGradeBreakdownOpen(false)}
        penaltiesSummary={state.studentData?.penaltiesSummary}
      />
    </>
  );
}
