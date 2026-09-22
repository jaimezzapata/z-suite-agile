"use client";

import * as React from "react";
import { DynamicCard } from "@/modules/core/components/ui/DynamicCard";
import { motion } from "motion/react";
import { Clock, AlertTriangle, ShieldCheck, TrendingUp, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";

export function DashboardScreen() {
  const { pattern } = useDesignPattern();

  // Variantes para la animación de entrada en cascada
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Encabezado del Dashboard */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Bienvenido, Jaime</h2>
          <p className="text-muted-foreground mt-1">
            Aquí está el resumen operativo de tu equipo para hoy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Sistema en Línea
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Widget: WorkManager (Control Operativo) */}
        <DynamicCard className="col-span-1 md:col-span-8 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-primary" size={24} />
              <h3 className="text-xl font-bold">WorkManager</h3>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Regla Antifraude Activa</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Estado Actual</span>
              <span className="text-2xl font-bold text-green-500 flex items-center gap-2">
                <CheckCircle size={20} /> En Jornada
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Retraso Acumulado</span>
              <span className="text-2xl font-bold flex items-center gap-2">
                05 <span className="text-sm text-muted-foreground font-normal">/ 15 min</span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Desconexiones</span>
              <span className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                <AlertTriangle size={20} /> 1 <span className="text-sm text-muted-foreground font-normal">/ 3 máx</span>
              </span>
            </div>
          </div>
          
          <div className="mt-auto pt-4 flex gap-3">
            <Button variant={pattern === "neumorphism" ? "neumorphic" : "solid"} className="flex-1">
              Marcar Break
            </Button>
            <Button variant="outline" className="flex-1">
              Justificar Caída
            </Button>
          </div>
        </DynamicCard>

        {/* Widget: Evaluación (Motor de Calificaciones) */}
        <DynamicCard className="col-span-1 md:col-span-4 p-6 flex flex-col gap-4 bg-primary/5">
          <div className="flex justify-between items-center border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary" size={24} />
              <h3 className="text-xl font-bold">Nota Individual</h3>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="376" strokeDashoffset="37.6" className="text-primary" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold">4.8</span>
                <span className="text-xs text-muted-foreground">/ 5.0</span>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-4">
              -0.2 pts por reincidencia en QA
            </p>
          </div>
        </DynamicCard>

        {/* Widget: Kanban (Auditoría de QA) */}
        <DynamicCard className="col-span-1 md:col-span-12 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={24} />
              <h3 className="text-xl font-bold">Auditoría Kanban (QA)</h3>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              Ver Tablero Completo <ArrowRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {[
              { status: "Por Hacer", count: 12, color: "text-muted-foreground" },
              { status: "En Progreso", count: 4, color: "text-blue-500" },
              { status: "QA / Revisión", count: 2, color: "text-amber-500" },
              { status: "Terminado", count: 18, color: "text-green-500" },
            ].map((col, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border/50 flex flex-col gap-2">
                <span className="text-sm font-semibold text-muted-foreground">{col.status}</span>
                <span className={`text-3xl font-bold ${col.color}`}>{col.count}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex gap-4 items-start">
            <XCircle className="text-destructive mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-destructive">Atención requerida</h4>
              <p className="text-sm text-destructive/80 mt-1">
                Una historia de usuario ("Login Form") fue devuelta por QA por el mismo motivo (Falta de validación). 
                Esto ha generado una penalización automática en tu nota individual.
              </p>
            </div>
          </div>
        </DynamicCard>

      </div>
    </motion.div>
  );
}
