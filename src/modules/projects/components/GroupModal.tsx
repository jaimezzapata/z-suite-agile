"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { GroupForm } from "./GroupForm";
import type { UpdateGroupInput } from "../types/group-types";

interface GroupModalProps {
  isOpen: boolean;
  title: string;
  initialData?: Partial<UpdateGroupInput>;
  isEditing?: boolean;
  isLoading: boolean;
  error?: string | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export function GroupModal({
  isOpen,
  title,
  initialData,
  isEditing = false,
  isLoading,
  error,
  onSubmit,
  onClose,
}: GroupModalProps) {
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
            className="relative w-full max-w-lg bg-card text-card-foreground p-6 md:p-8 rounded-2xl shadow-2xl border border-border"
          >
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-2xl font-bold mb-6">{title}</h3>

            {error && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            <GroupForm
              initialData={initialData}
              isEditing={isEditing}
              onSubmit={onSubmit}
              isLoading={isLoading}
              onCancel={onClose}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
