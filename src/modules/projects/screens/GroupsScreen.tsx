"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { GroupCard } from "../components/GroupCard";
import { GroupForm } from "../components/GroupForm";
import { createGroup, CreateGroupInput } from "../actions/project-actions";
import type { groups } from "@prisma/client";
import { useRouter } from "next/navigation";

interface GroupsScreenProps {
  initialGroups: groups[];
}

export function GroupsScreen({ initialGroups }: GroupsScreenProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "activo" | "inactivo">("all");
  const [moduleFilter, setModuleFilter] = React.useState<"all" | "asistencia" | "kanban" | "evaluacion">("all");

  const handleCreateGroup = async (data: CreateGroupInput) => {
    setIsLoading(true);
    setError(null);
    
    const result = await createGroup(data);
    
    setIsLoading(false);
    
    if (result.success) {
      setIsModalOpen(false);
      // La revalidación en el server action actualizará los datos al recargar la ruta
      router.refresh();
    } else {
      setError(result.error || "Ocurrió un error.");
    }
  };

  const filteredGroups = initialGroups.filter((group) => {
    const matchesSearch = group.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (group.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || group.estado === statusFilter;
    const matchesModule = 
      moduleFilter === "all" || 
      (moduleFilter === "asistencia" && group.usa_asistencia) ||
      (moduleFilter === "kanban" && group.usa_kanban) ||
      (moduleFilter === "evaluacion" && group.usa_evaluacion);
      
    return matchesSearch && matchesStatus && matchesModule;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header de la sección */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Gestión de Grupos</h2>
          <p className="text-muted-foreground mt-1">
            Administra tus proyectos y define qué módulos de Z-Suite estarán activos para cada uno.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
          <Plus size={18} /> Nuevo Grupo
        </Button>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <select 
          value={moduleFilter} 
          onChange={(e) => setModuleFilter(e.target.value as any)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
        >
          <option value="all">Todos los módulos</option>
          <option value="asistencia">Asistencia activa</option>
          <option value="kanban">Kanban activo</option>
          <option value="evaluacion">Evaluación activa</option>
        </select>
      </div>

      {/* Lista de Grupos */}
      {initialGroups.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-secondary/10">
          <h3 className="text-xl font-bold text-muted-foreground">No tienes grupos creados</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Crea tu primer grupo para empezar a usar los módulos.</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            Crear mi primer Grupo
          </Button>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20 border border-border rounded-2xl bg-card">
          <h3 className="text-lg font-semibold text-muted-foreground">No se encontraron resultados</h3>
          <p className="text-sm text-muted-foreground mt-1">Intenta ajustando los filtros de búsqueda.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGroups.map((group) => (
            <motion.div key={group.id} variants={itemVariants}>
              <GroupCard group={group} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal de Creación */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => !isLoading && setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card text-card-foreground p-6 md:p-8 rounded-2xl shadow-2xl border border-border"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-bold mb-6">Crear Nuevo Grupo</h3>
              
              {error && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                  {error}
                </div>
              )}

              <GroupForm 
                onSubmit={handleCreateGroup} 
                isLoading={isLoading} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
