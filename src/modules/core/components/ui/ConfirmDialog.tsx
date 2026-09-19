"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";
import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDestructive = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !isLoading && onCancel()}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-card text-card-foreground p-6 rounded-2xl shadow-2xl border border-border flex flex-col items-center text-center"
          >
            <div className={`p-3 rounded-full mb-4 ${isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <AlertCircle size={32} />
            </div>
            
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {description}
            </p>

            <div className="flex justify-center gap-3 w-full">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={onCancel} 
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button 
                variant={isDestructive ? "destructive" : "default"} 
                className="w-full" 
                onClick={onConfirm} 
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
