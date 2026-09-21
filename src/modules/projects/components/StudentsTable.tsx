import { Button } from "@/modules/core/components/ui/Button";
import { Trash2, RotateCcw, Pencil, MessageSquare } from "lucide-react";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { StudentAttendanceCell, StudentDelayBadge } from "./StudentAttendanceCell";
import type { StudentProfile } from "@/modules/projects/types";

interface StudentsTableProps {
  students: StudentProfile[];
  selectedIds: string[];
  isDeleting: boolean;
  isResetting: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onRequestDelete: (ids: string[]) => void;
  onRequestReset: (id: string) => void;
  onRequestEdit: (student: StudentProfile) => void;
  onRequestMessage?: (student: StudentProfile) => void;
  allSelected: boolean;
}

export function StudentsTable({
  students,
  selectedIds,
  isDeleting,
  isResetting,
  onToggleSelectAll,
  onToggleSelect,
  onRequestDelete,
  onRequestReset,
  onRequestEdit,
  onRequestMessage,
  allSelected,
}: StudentsTableProps) {
  const { pattern } = useDesignPattern();
  const isNeu = pattern === "neumorphism";

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className={`${isNeu ? "bg-secondary/15 border-b border-border/30" : "bg-secondary/30"} text-muted-foreground uppercase tracking-wider text-[10px] font-bold`}>
          <tr>
            <th className="px-3 py-3 rounded-tl-xl w-10 text-center">
              <input 
                type="checkbox" 
                className="rounded border-border w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                checked={allSelected}
                onChange={onToggleSelectAll}
              />
            </th>
            <th className="px-3 py-3 w-28">Cédula</th>
            <th className="px-3.5 py-3">Estudiante</th>
            <th className="px-3.5 py-3">Estado de Ingreso</th>
            <th className="px-3.5 py-3">Marcaciones</th>
            <th className="px-3.5 py-3">Retraso</th>
            <th className="px-3.5 py-3 rounded-tr-xl text-right w-36">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => {
            const latestSession = student.work_sessions && student.work_sessions.length > 0 
              ? student.work_sessions[0] 
              : undefined;

            return (
              <tr key={student.id} className={`transition-colors ${selectedIds.includes(student.id) ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}>
                <td className="px-3 py-2.5 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-border w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => onToggleSelect(student.id)}
                  />
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{student.cedula}</td>
                <td className="px-3.5 py-2.5 font-semibold text-sm">{student.nombres} {student.apellidos}</td>
                <td className="px-3.5 py-2.5">
                  {(student as any).terminos_aceptados_at ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">Ingresó y Aceptó</span>
                        <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                          {new Date((student as any).terminos_aceptados_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                      <span className="text-xs font-semibold text-muted-foreground">Nunca ha ingresado</span>
                    </div>
                  )}
                </td>
                <td className="px-3.5 py-2.5">
                  <StudentAttendanceCell session={latestSession} />
                </td>
                <td className="px-3.5 py-2.5">
                  <StudentDelayBadge session={latestSession} />
                </td>
                <td className="px-3.5 py-2.5 text-right">
                  <div className="flex justify-end items-center gap-1">
                    {onRequestMessage && (
                      <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-blue-500" title="Enviar Mensaje" onClick={() => onRequestMessage(student)} disabled={isResetting || isDeleting}>
                        <MessageSquare size={15} />
                      </Button>
                    )}
                    <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary" title="Editar Estudiante" onClick={() => onRequestEdit(student)} disabled={isResetting || isDeleting}>
                      <Pencil size={15} />
                    </Button>
                    <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-amber-500" title="Restablecer de Fábrica" onClick={() => onRequestReset(student.id)} disabled={isResetting || isDeleting}>
                      <RotateCcw size={15} />
                    </Button>
                    <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive" title="Eliminar Estudiante" onClick={() => onRequestDelete([student.id])} disabled={isDeleting || isResetting}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
