"use client";

import React from "react";
import { History, AlertCircle, CheckCircle2, FolderGit2 } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import type { StudentEvaluationRecord } from "../types";

interface EvaluationStudentTableProps {
  students: StudentEvaluationRecord[];
  onSelectStudent: (student: StudentEvaluationRecord) => void;
}

export function EvaluationStudentTable({ students, onSelectStudent }: EvaluationStudentTableProps) {
  const { pattern } = useDesignPattern();
  const isNeu = pattern === "neumorphism";

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (score >= 3.5) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className={`${isNeu ? "bg-secondary/15 border-b border-border/30" : "bg-secondary/30"} text-muted-foreground uppercase tracking-wider text-[10px] font-bold`}>
          <tr>
            <th className="px-4 py-3 rounded-tl-xl w-28">Cédula</th>
            <th className="px-4 py-3">Estudiante</th>
            <th className="px-4 py-3">Proyecto Formativo</th>
            <th className="px-4 py-3 text-center">Días Registrados</th>
            <th className="px-4 py-3 text-center">Faltas Acumuladas</th>
            <th className="px-4 py-3 text-center">Nota Individual (70%)</th>
            <th className="px-4 py-3 rounded-tr-xl text-right w-28">Historial</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{student.cedula}</td>
              <td className="px-4 py-3 font-semibold text-foreground">
                {student.nombres} {student.apellidos}
              </td>
              <td className="px-4 py-3">
                {student.proyecto ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    <FolderGit2 size={12} /> {student.proyecto}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                )}
              </td>
              <td className="px-4 py-3 text-center font-medium">{student.diasAsistidos}</td>
              <td className="px-4 py-3 text-center">
                {student.totalPenalizaciones > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                    <AlertCircle size={12} /> {student.totalPenalizaciones} ({student.puntosDescontados > 0 ? `-${student.puntosDescontados.toFixed(1)} pts` : "0 pts"})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} /> 0 faltas
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black border ${getScoreBadge(student.notaEstimada)}`}>
                  {student.notaEstimada.toFixed(1)} / 5.0
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant={isNeu ? "neumorphic" : "outline"}
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => onSelectStudent(student)}
                >
                  <History size={14} />
                  <span>Ver Detalle</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
