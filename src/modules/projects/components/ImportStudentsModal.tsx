"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UploadCloud, UserPlus, FileText } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { importStudents, StudentInput } from "../actions/import-students-actions";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface ImportStudentsModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImportStudentsModal({ groupId, isOpen, onClose }: ImportStudentsModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"manual" | "csv">("manual");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Formulario Manual
  const [cedula, setCedula] = React.useState("");
  const [nombreCompleto, setNombreCompleto] = React.useState("");

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = nombreCompleto.trim().split(" ");
    const apellidos = parts.length > 1 ? toTitleCase(parts.pop()!) : ".";
    const nombres = toTitleCase(parts.join(" ")) || toTitleCase(nombreCompleto.trim());
    
    await processImport([{ cedula, nombres, apellidos }]);
  };

  // Importación Masiva (Excel/CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a JSON (array de objetos usando la primera fila como llaves)
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        if (jsonData.length === 0) {
           setError("El archivo está vacío o no tiene encabezados válidos.");
           return;
        }

        const students: StudentInput[] = jsonData.map(row => {
          // Normalizar las llaves (minúsculas y sin espacios/tildes) para buscar sin importar cómo lo escribieron
          const normRow: Record<string, string> = {};
          for (const key in row) {
            const normKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
            normRow[normKey] = String(row[key]);
          }

          // Buscar la columna del ID (cedula, documento, identificacion, id)
          const c = normRow['cedula'] || normRow['documento'] || normRow['documentodeidentidad'] || normRow['identificacion'] || normRow['id'] || "";
          
          // Buscar la columna del Nombre (nombre, nombres, nombrecompleto)
          const nc = normRow['nombre'] || normRow['nombres'] || normRow['nombrecompleto'] || "";

          if (!c.trim() || !nc.trim()) return null;

          const parts = nc.trim().split(" ");
          const apellidos = parts.length > 1 ? toTitleCase(parts.pop()!) : ".";
          const nombres = toTitleCase(parts.join(" ")) || toTitleCase(nc.trim());

          return { cedula: c.trim(), nombres, apellidos };
        }).filter(Boolean) as StudentInput[];

        if (students.length === 0) {
          setError("No se encontraron columnas válidas. Asegúrate de incluir 'Documento' y 'Nombre'.");
          return;
        }

        await processImport(students);
      } catch (err) {
        console.error("Error leyendo archivo:", err);
        setError("Error leyendo el archivo. Asegúrate de que sea un Excel o CSV válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processImport = async (students: StudentInput[]) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const result = await importStudents(groupId, students);
    
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg(`¡Importación completada! ${result.results?.success} estudiantes añadidos.`);
      if (result.results?.errors.length) {
        setError(`Ocurrieron ${result.results.errors.length} errores (ej: usuarios ya matriculados o datos inválidos).`);
      }
      
      // Limpiar formulario
      setCedula(""); setNombreCompleto("");
      
      // Revalidar y cerrar tras unos segundos
      router.refresh();
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setError(null);
      }, 2000);
    } else {
      setError(result.error || "Ocurrió un error en la importación.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !isLoading && onClose()}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card text-card-foreground p-6 rounded-2xl shadow-2xl border border-border"
          >
            <button 
              onClick={() => !isLoading && onClose()}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold mb-6">Agregar Estudiantes</h3>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              <button 
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('manual')}
              >
                <UserPlus size={16} /> Individual
              </button>
              <button 
                className={`flex-1 pb-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'csv' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                onClick={() => setActiveTab('csv')}
              >
                <FileText size={16} /> Carga Masiva (Excel/CSV)
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-sm rounded-md">
                {successMsg}
              </div>
            )}

            {activeTab === "manual" ? (
              <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Documento de Identidad</label>
                    <input
                      type="text"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      required
                      placeholder="Ej. 1017123456"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={nombreCompleto}
                      onChange={(e) => setNombreCompleto(e.target.value)}
                      required
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                  <Button type="submit" disabled={isLoading || !cedula || !nombreCompleto}>
                    {isLoading ? "Creando..." : "Crear Estudiante"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-secondary/20 rounded-md text-sm text-muted-foreground border border-border">
                  <p className="font-semibold text-foreground mb-1">Cualquier orden de columnas es válido:</p>
                  <p className="mt-1 text-xs">Asegúrate de que tu Excel/CSV tenga al menos estas dos columnas:</p>
                  <code className="block bg-background p-2 rounded border mt-2">
                    - Documento (o Cédula)<br/>
                    - Nombre (o Nombre Completo)
                  </code>
                  <p className="mt-3 text-xs font-semibold text-primary">La contraseña inicial de cada estudiante será su propio documento.</p>
                </div>

                <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-8 text-center relative mt-2 bg-card">
                  <input 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                  <UploadCloud size={40} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Haz clic o arrastra tu archivo Excel / CSV</p>
                  {isLoading && <p className="text-primary text-sm font-bold mt-4">Procesando archivo...</p>}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
