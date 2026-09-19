import type { profiles, work_sessions } from "@prisma/client";
import { Button } from "@/modules/core/components/ui/Button";
import { Trash2, RotateCcw, Clock, Coffee } from "lucide-react";

type StudentProfile = profiles & { work_sessions?: work_sessions[] };

interface StudentsTableProps {
  students: StudentProfile[];
  selectedIds: string[];
  isDeleting: boolean;
  isResetting: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onRequestDelete: (ids: string[]) => void;
  onRequestReset: (id: string) => void;
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
  allSelected,
}: StudentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-secondary/30 text-muted-foreground uppercase tracking-wider text-[10px] font-bold">
          <tr>
            <th className="px-6 py-4 rounded-tl-xl w-12">
              <input 
                type="checkbox" 
                className="rounded border-border w-4 h-4 text-primary focus:ring-primary"
                checked={allSelected}
                onChange={onToggleSelectAll}
              />
            </th>
            <th className="px-6 py-4">Cédula</th>
            <th className="px-6 py-4">Estudiante</th>
            <th className="px-6 py-4">Estado de Ingreso</th>
            <th className="px-6 py-4">Marcaciones (Últimas)</th>
            <th className="px-6 py-4 rounded-tr-xl text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            <tr key={student.id} className={`transition-colors ${selectedIds.includes(student.id) ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}>
              <td className="px-6 py-4">
                <input 
                  type="checkbox" 
                  className="rounded border-border w-4 h-4 text-primary focus:ring-primary"
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
                {student.work_sessions && student.work_sessions.length > 0 ? (
                  <div className="flex flex-col gap-1 text-[11px] font-medium">
                    <span className="flex items-center gap-1 text-primary">
                      <Clock size={12} /> Ingreso: <span suppressHydrationWarning>{new Date(student.work_sessions[0].ingreso_jornada_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </span>
                    {student.work_sessions[0].inicio_break_at && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Coffee size={12} /> Break: <span suppressHydrationWarning>{new Date(student.work_sessions[0].inicio_break_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">Sin marcaciones</span>
                )}
              </td>
              <td className="px-6 py-4 text-right flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-amber-500"
                  title="Restablecer de Fábrica"
                  onClick={() => onRequestReset(student.id)}
                  disabled={isResetting || isDeleting}
                >
                  <RotateCcw size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onRequestDelete([student.id])}
                  disabled={isDeleting || isResetting}
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
