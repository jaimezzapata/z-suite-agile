import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface StudentGraceBadgeProps {
  comodinDisponible?: boolean;
  comodinUsadoEn?: {
    fecha: Date | string;
    momento: "ingreso" | "break";
    minutosRetraso: number;
  } | null;
  variant?: "compact" | "detailed";
  className?: string;
}

export function StudentGraceBadge({
  comodinDisponible = true,
  comodinUsadoEn,
  variant = "detailed",
  className = "",
}: StudentGraceBadgeProps) {
  if (comodinDisponible) {
    if (variant === "compact") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 ${className}`}
          title="Tienes 1 oportunidad de retraso menor (<10m) sin penalización"
        >
          <ShieldCheck size={12} className="shrink-0" /> Comodín Disponible
        </span>
      );
    }

    return (
      <div
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium ${className}`}
      >
        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold">Comodín de Gracia Activo:</span> Tienes 1 margen de retraso de hasta 9 min sin descuento en el curso.
        </div>
      </div>
    );
  }

  const momentoLabel = comodinUsadoEn?.momento === "break" ? "del break" : "del inicio";
  const fechaLabel = comodinUsadoEn?.fecha
    ? new Date(comodinUsadoEn.fecha).toLocaleDateString([], { day: "2-digit", month: "short" })
    : "";

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 ${className}`}
        title={`Comodín consumido${fechaLabel ? ` el ${fechaLabel}` : ""}. Próximos retrasos descontarán -0.2 pts`}
      >
        <ShieldAlert size={12} className="shrink-0" /> Comodín Agotado
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-medium ${className}`}
    >
      <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
      <div>
        <span className="font-bold">Comodín Consumido:</span> Usado{" "}
        {fechaLabel && `${fechaLabel} `}por retraso de {comodinUsadoEn?.minutosRetraso ?? 0}m al regreso {momentoLabel}. Próximos retrasos descontarán -0.2 pts.
      </div>
    </div>
  );
}
