"use client";

import * as React from "react";

export type DesignPattern = "minimalism" | "neumorphism";

interface DesignPatternContextType {
  pattern: DesignPattern;
  setPattern: (pattern: DesignPattern) => void;
}

const DesignPatternContext = React.createContext<DesignPatternContextType | undefined>(undefined);

export function DesignPatternProvider({
  children,
  defaultPattern = "minimalism",
}: {
  children: React.ReactNode;
  defaultPattern?: DesignPattern;
}) {
  const [pattern, setPatternState] = React.useState<DesignPattern>(defaultPattern);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zsuite-design-pattern") as DesignPattern;
    if (saved && ["minimalism", "neumorphism"].includes(saved)) {
      setPatternState(saved);
    }
  }, []);

  const setPattern = React.useCallback((newPattern: DesignPattern) => {
    setPatternState(newPattern);
    localStorage.setItem("zsuite-design-pattern", newPattern);
  }, []);

  // Para evitar hydration mismatch, proveemos un default si no está montado,
  // o el valor real si ya montó.
  return (
    <DesignPatternContext.Provider value={{ pattern: mounted ? pattern : defaultPattern, setPattern }}>
      {children}
    </DesignPatternContext.Provider>
  );
}

export function useDesignPattern() {
  const context = React.useContext(DesignPatternContext);
  if (!context) {
    throw new Error("useDesignPattern must be used within a DesignPatternProvider");
  }
  return context;
}
