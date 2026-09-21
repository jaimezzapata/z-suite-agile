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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className={`${isNeu ? "bg-secondary/15 border-b border-border/30" : "bg-secondary/30"} text-muted-foreground uppercase tracking-wider text-[10px] font-bold`}>
          <tr>
            <th className="px-6 py-4 rounded-tl-xl w-12">
              <input 
                type="checkbox" 
                className="rounded border-border w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                checked={allSelected}
                onChange={onToggleSelectAll}
              />
            </th>
            <th className="px-6 py-4">Cédula</th>
            <th className="px-6 py-4">Estudiante</th>
            <th className="px-6 py-4">Estado de Ingreso</th>
            <th className="px-6 py-4">Marcaciones</th>
            <th className="px-6 py-4">Retraso</th>
            <th className="px-6 py-4 rounded-tr-xl text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => {
            const latestSession = student.work_sessions && student.work_sessions.length > 0 
              ? student.work_sessions[0] 
              : undefined;

            return (
              <tr key={student.id} className={`transition-colors ${selectedIds.includes(student.id) ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-border w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.includes(student.id)}
                    onChange={() => onToggleSelect(student.id)}
                  />
                </td>
                <td className="px-6 py-4 font-mono text-muted-foreground">{student.cedula}</td>
                <td className="px-6 py-4 font-semibold">{student.nombres} {student.apellidos}</td>
                <td className="px-6 py-4">
                  {(student as any).terminos_aceptados_at ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">Ingresó y Aceptó</span>
                        <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                          {new Date((student as any).terminos_aceptados_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="text-xs font-semibold text-muted-foreground">Nunca ha ingresado</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StudentAttendanceCell session={latestSession} />
                </td>
                <td className="px-6 py-4">
                  <StudentDelayBadge session={latestSession} />
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-1">
                  {onRequestMessage && (
                    <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className={isNeu ? "h-8 w-8 p-0 rounded-lg text-foreground hover:text-blue-500" : "text-muted-foreground hover:text-blue-500"} title="Enviar Mensaje" onClick={() => onRequestMessage(student)} disabled={isResetting || isDeleting}>
                      <MessageSquare size={16} />
                    </Button>
                  )}
                  <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className={isNeu ? "h-8 w-8 p-0 rounded-lg text-foreground hover:text-primary" : "text-muted-foreground hover:text-primary"} title="Editar Estudiante" onClick={() => onRequestEdit(student)} disabled={isResetting || isDeleting}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className={isNeu ? "h-8 w-8 p-0 rounded-lg text-foreground hover:text-amber-500" : "text-muted-foreground hover:text-amber-500"} title="Restablecer de Fábrica" onClick={() => onRequestReset(student.id)} disabled={isResetting || isDeleting}>
                    <RotateCcw size={16} />
                  </Button>
                  <Button variant={isNeu ? "neumorphic" : "ghost"} size="sm" className={isNeu ? "h-8 w-8 p-0 rounded-lg text-foreground hover:text-destructive" : "text-muted-foreground hover:text-destructive"} onClick={() => onRequestDelete([student.id])} disabled={isDeleting || isResetting}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
