"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { useDesignPattern, DesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { cn } from "@/modules/core/lib/utils";

const patternClasses: Record<DesignPattern, string> = {
  minimalism: "bg-card text-card-foreground border shadow-sm",
  neumorphism: "neu-flat border border-border/50",
};

interface DynamicCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function DynamicCard({ children, className, ...props }: DynamicCardProps) {
  const { pattern } = useDesignPattern();

  return (
    <motion.div
      layout
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={cn(
        "rounded-2xl transition-all duration-500 overflow-hidden",
        patternClasses[pattern],
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
