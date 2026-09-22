import React from "react";
import { Button } from "@/modules/core/components/ui/Button";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: TablePaginationProps) {
  const { pattern } = useDesignPattern();
  const isNeu = pattern === "neumorphism";

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`px-6 py-4 ${isNeu ? "border-t border-border/40" : "bg-secondary/20 border-t border-border"} flex flex-col sm:flex-row justify-between items-center gap-3`}>
      <span className="text-sm text-muted-foreground">
        Mostrando {start} - {end} de {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant={isNeu ? "neumorphic" : "outline"}
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Anterior
        </Button>
        <div className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${isNeu ? "neu-pressed" : "border border-border bg-background"}`}>
          {currentPage} / {totalPages}
        </div>
        <Button
          variant={isNeu ? "neumorphic" : "outline"}
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
