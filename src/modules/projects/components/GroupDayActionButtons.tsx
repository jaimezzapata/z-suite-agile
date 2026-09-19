"use client";

import React from "react";
import { Play, Coffee, Power, RotateCcw } from "lucide-react";
import { Button } from "@/modules/core/components/ui/Button";

interface GroupDayActionButtonsProps {
  estado: string;
  isStarting?: boolean;
  isResettingDay?: boolean;
  onRequestStartDay: () => void;
  onRequestBreak: () => void;
  onRequestFinalize: () => void;
  onRequestResetDay: () => void;
}

export function GroupDayActionButtons({
  estado,
  isStarting,
  isResettingDay,
  onRequestStartDay,
  onRequestBreak,
  onRequestFinalize,
  onRequestResetDay,
}: GroupDayActionButtonsProps) {
  return (
    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
      {estado === "no_iniciado" && (
        <Button
          onClick={onRequestStartDay}
          disabled={isStarting}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 h-9 rounded-xl shadow-xs"
        >
          <Play size={15} /> Iniciar Día
        </Button>
      )}

      {estado === "iniciado" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestBreak}
            className="gap-1.5 border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-medium h-9 px-3 rounded-xl"
          >
            <Coffee size={15} /> Mandar a Break
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestFinalize}
            className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 font-medium h-9 px-3 rounded-xl"
          >
            <Power size={15} /> Finalizar Día
          </Button>
        </>
      )}

      {estado === "en_break" && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestFinalize}
          className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 font-medium h-9 px-3 rounded-xl"
        >
          <Power size={15} /> Finalizar Día
        </Button>
      )}

      {estado !== "no_iniciado" && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestResetDay}
          disabled={isResettingDay}
          className="gap-1.5 text-muted-foreground hover:text-foreground h-9 px-3 rounded-xl"
          title="Reiniciar jornada de hoy"
        >
          <RotateCcw size={14} /> Reiniciar
        </Button>
      )}
    </div>
  );
}
