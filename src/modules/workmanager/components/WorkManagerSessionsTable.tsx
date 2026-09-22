"use client";

import React from "react";
import { Clock, Coffee, CheckCircle2, AlertCircle } from "lucide-react";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import type { WorkManagerStudentStatus } from "../types";

interface WorkManagerSessionsTableProps {
  students: WorkManagerStudentStatus[];
}

export function WorkManagerSessionsTable({ students }: WorkManagerSessionsTableProps) {
  const { pattern } = useDesignPattern();
  const isNeu = pattern === "neumorphism";

  const getStatusBadge = (status: WorkManagerStudentStatus["estadoConexion"]) => {
    switch (status) {
      case "en_linea":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>Conectado</span>;
      case "en_break":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20"><Coffee size={12} /> En Break</span>;
      case "desconectado":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">Desconectado</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/50 text-muted-foreground/70">Sin Marcación</span>;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className={`${isNeu ? "bg-secondary/15 border-b border-border/30" : "bg-secondary/30"} text-muted-foreground uppercase tracking-wider text-[10px] font-bold`}>
          <tr>
            <th className="px-4 py-3 rounded-tl-xl w-28">Cédula</th>
            <th className="px-4 py-3">Estudiante</th>
            <th className="px-4 py-3">Estado en Vivo</th>
            <th className="px-4 py-3">Ingreso Jornada</th>
            <th className="px-4 py-3">Marcación Break</th>
            <th className="px-4 py-3 rounded-tr-xl text-center">Retraso Hoy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{student.cedula}</td>
              <td className="px-4 py-3 font-semibold text-foreground">
                {student.nombres} {student.apellidos}
              </td>
              <td className="px-4 py-3">{getStatusBadge(student.estadoConexion)}</td>
              <td className="px-4 py-3">
                {student.ingresoJornadaAt ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Clock size={13} className="text-primary" />
                    <span>{student.ingresoJornadaAt}</span>
                    {student.retrasoIngreso > 0 ? (
                      <span className="font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-sm text-[10px]">
                        +{student.retrasoIngreso}m
                      </span>
                    ) : (
                      <span className="font-bold text-green-500 bg-green-500/10 px-1 py-0.2 rounded-sm text-[10px]">
                        Puntual
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No ha ingresado</span>
                )}
              </td>
              <td className="px-4 py-3">
                {student.inicioBreakAt ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Coffee size={13} className="text-amber-500" />
                    <span>{student.inicioBreakAt} → {student.regresoBreakAt || "En curso"}</span>
                    {student.retrasoBreak > 0 && (
                      <span className="font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-sm text-[10px]">
                        +{student.retrasoBreak}m
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">--</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                {student.totalRetraso > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <AlertCircle size={12} /> +{student.totalRetraso} min
                  </span>
                ) : student.ingresoJornadaAt ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} /> 0 min
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">--</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
