"use client";

import { useDesignPattern, DesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { LayoutTemplate, Square } from "lucide-react";
import { motion } from "motion/react";

export function PatternSwitcher() {
  const { pattern, setPattern } = useDesignPattern();

  const patterns: { id: DesignPattern; icon: React.ReactNode; label: string }[] = [
    { id: "minimalism", icon: <Square size={13} />, label: "Minimalism" },
    { id: "neumorphism", icon: <LayoutTemplate size={13} />, label: "Neumorphism" },
  ];

  return (
    <div className="flex bg-secondary/50 p-1 rounded-full border border-border/50 relative overflow-hidden backdrop-blur-md">
      {patterns.map((p) => {
        const isActive = pattern === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setPattern(p.id)}
            className={`relative flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors z-10 ${
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title={p.label}
          >
            {isActive && (
              <motion.div
                layoutId="pattern-active-pill"
                className="absolute inset-0 bg-primary rounded-full -z-10 shadow-xs"
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            )}
            {p.icon}
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
