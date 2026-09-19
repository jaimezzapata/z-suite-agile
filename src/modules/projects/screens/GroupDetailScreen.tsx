"use client";

import * as React from "react";
import { groups, profiles } from "@prisma/client";
import { Button } from "@/modules/core/components/ui/Button";
import { ArrowLeft, Users, FolderKanban, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { ImportStudentsModal } from "../components/ImportStudentsModal";
import { removeGroupMembers } from "../actions/student-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/modules/core/components/ui/ConfirmDialog";

interface GroupDetailScreenProps {
  group: groups;
  students: profiles[];
}

export function GroupDetailScreen({ group, students }: GroupDetailScreenProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"students" | "projects">("students");
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  
  // Estados para Eliminación y Confirmación
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [idsToDelete, setIdsToDelete] = React.useState<string[]>([]);

  // Estado para Búsqueda y Paginación
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  
  // Cuando se busca, se debe regresar a la página 1
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.cedula.toLowerCase().includes(term) ||
      student.nombres.toLowerCase().includes(term) ||
      student.apellidos.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    // Al seleccionar todos, seleccionamos solo los filtrados
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const requestDelete = (ids: string[]) => {
    setIdsToDelete(ids);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    const result = await removeGroupMembers(group.id, idsToDelete);
    setIsDeleting(false);
    setIsConfirmOpen(false);

    if (result.success) {
      setSelectedIds([]);
      toast.success(`${idsToDelete.length} estudiante(s) eliminado(s) correctamente.`);
      router.refresh();
    } else {
      toast.error(result.error || "Ocurrió un error al eliminar.");
    }
  };

  const PaginationControls = totalPages > 1 ? (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground hidden sm:inline-block">
        Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)} de {filteredStudents.length}
      </span>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        >
          Anterior
        </Button>
        <div className="flex items-center px-3 text-sm font-medium border border-border rounded-md bg-background">
          {currentPage} / {totalPages}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        >
          Siguiente
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header con breadcrumbs y acciones */}
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/grupos" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 w-fit">
          <ArrowLeft size={16} /> Volver a Grupos
        </Link>
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{group.nombre}</h2>
            <p className="text-muted-foreground mt-1">
              {group.descripcion || "Sin descripción"}
            </p>
          </div>
          <div className="flex gap-2">
            {activeTab === "students" && (
              <>
                {selectedIds.length > 0 && (
                  <Button 
                    variant="destructive" 
                    className="gap-2 shrink-0 animate-in fade-in zoom-in"
                    onClick={() => requestDelete(selectedIds)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={18} /> 
                    Eliminar Selección ({selectedIds.length})
                  </Button>
                )}
                <Button onClick={() => setIsImportModalOpen(true)} className="gap-2 shrink-0" disabled={isDeleting}>
                  <Users size={18} /> Agregar Estudiantes
                </Button>
              </>
            )}
            {activeTab === "projects" && (
              <Button variant="outline" className="gap-2 shrink-0">
                <FolderKanban size={18} /> Crear Proyecto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border">
        <button 
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={18} /> Estudiantes ({students.length})
        </button>
        <button 
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'projects' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderKanban size={18} /> Proyectos (0)
        </button>
      </div>

      {/* Tab Content: Estudiantes */}
      {activeTab === "students" && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Header del Tab con Buscador y Paginador Superior */}
          {students.length > 0 && (
            <div className="p-4 border-b border-border bg-secondary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <input
                type="text"
                placeholder="Buscar por cédula, nombres o apellidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2 lg:w-1/3 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {PaginationControls}
            </div>
          )}

          {students.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10">
              <Users size={48} className="mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-bold text-muted-foreground">No hay estudiantes matriculados</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-6">Importa tu lista de estudiantes desde un CSV o créalos manualmente.</p>
              <Button onClick={() => setIsImportModalOpen(true)}>
                Agregar Estudiantes
              </Button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20 bg-card">
              <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron estudiantes</h3>
              <p className="text-sm text-muted-foreground mt-1">Nadie coincide con "{searchTerm}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary text-secondary-foreground uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4 w-[50px]">
                      <input 
                        type="checkbox" 
                        className="rounded border-border w-4 h-4 text-primary focus:ring-primary"
                        checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-4">Documento</th>
                    <th className="px-6 py-4">Nombre Completo</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className={`border-b border-border transition-colors ${selectedIds.includes(student.id) ? 'bg-primary/5' : 'hover:bg-secondary/30'}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-border w-4 h-4 text-primary focus:ring-primary"
                          checked={selectedIds.includes(student.id)}
                          onChange={() => toggleSelect(student.id)}
                        />
                      </td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{student.cedula}</td>
                      <td className="px-6 py-4 font-semibold">{student.nombres} {student.apellidos}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          Ver Detalle
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => requestDelete([student.id])}
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Controles de Paginación Inferior */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-secondary/20 border-t border-border flex justify-end md:justify-between items-center">
                  <div className="hidden md:block" /> {/* Spacer for alignment if text is hidden */}
                  {PaginationControls}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Proyectos */}
      {activeTab === "projects" && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <FolderKanban size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground">Próximamente</h3>
          <p className="text-sm text-muted-foreground mt-2">Aquí el administrador creará los proyectos (ej. "Clon de Netflix") para dividir a los estudiantes en subgrupos (equipos).</p>
        </div>
      )}

      {/* Modal de Importación */}
      <ImportStudentsModal 
        groupId={group.id} 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Eliminar Estudiantes"
        description={`¿Estás seguro de que deseas eliminar a ${idsToDelete.length} estudiante(s) de este grupo? Esta acción los desmatriculará, pero no borrará sus cuentas globales.`}
        confirmText="Eliminar"
        isDestructive={true}
        onConfirm={executeDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
