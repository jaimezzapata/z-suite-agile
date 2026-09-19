"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";
import { acceptTermsAndConditions } from "../actions/terms-actions";
import { toast } from "sonner";

interface TermsModalProps {
  onAccepted: () => void;
}

export function TermsModal({ onAccepted }: TermsModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAccept = async () => {
    setIsSubmitting(true);
    const result = await acceptTermsAndConditions();
    
    if (result.success) {
      toast.success("¡Gracias! Has aceptado los términos.");
      onAccepted();
    } else {
      toast.error(result.error || "Hubo un problema, intenta nuevamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card border border-border shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden relative"
        >
          {/* Fondo decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="p-8 pb-4 flex flex-col items-center text-center border-b border-border relative z-10">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Acuerdo de Responsabilidad</h2>
            <p className="text-muted-foreground mt-2 font-medium">
              Antes de comenzar, debes leer y aceptar nuestros términos de uso.
            </p>
          </div>

          <div className="p-8 overflow-y-auto flex-1 text-sm md:text-base text-foreground/80 space-y-6 relative z-10 custom-scrollbar">
            <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border/50">
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> 1. Compromiso Académico
              </h3>
              <p>
                Al ingresar a esta plataforma, me comprometo a cumplir con las normas establecidas
                por el equipo docente. Entiendo que el progreso registrado aquí afectará mi
                calificación final y refleja mi desempeño real.
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border/50">
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> 2. Registro de Tiempos
              </h3>
              <p>
                Comprendo que el sistema registrará mis marcaciones de inicio y fin de jornada,
                y que las ausencias o retrasos no justificados conllevarán penalizaciones automáticas
                sobre mi nota individual.
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border/50">
              <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> 3. Calidad de Entregables
              </h3>
              <p>
                Acepto que mis tareas pasarán por una auditoría (QA). De no cumplir con los criterios de
                aceptación, la reincidencia en los mismos errores generará descuentos en mi gestión operativa.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-card flex flex-col items-center relative z-10">
            <Button 
              size="lg" 
              className="w-full md:w-auto min-w-[250px] font-bold text-lg h-14 rounded-full shadow-lg hover:shadow-primary/25 transition-all"
              onClick={handleAccept}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "He leído y Acepto los Términos"}
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Al hacer clic, se registrará tu IP, fecha y hora como firma electrónica vinculante.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
