"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useColorTheme, THEME_COLORS } from "@/modules/core/contexts/ThemeProvider";
import { Button } from "./Button";
import { Moon, Sun, Palette } from "lucide-react";

// Mapeo de colores visuales para los botones del popover
const COLOR_INDICATORS: Record<string, string> = {
  "theme-blue": "bg-blue-500",
  "theme-purple": "bg-purple-500",
  "theme-emerald": "bg-emerald-500",
  "theme-rose": "bg-rose-500",
  "theme-amber": "bg-amber-500",
  "theme-cyan": "bg-cyan-500",
  "theme-indigo": "bg-indigo-500",
  "theme-slate": "bg-slate-500",
  "theme-orange": "bg-orange-500",
  "theme-teal": "bg-teal-500",
};

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = React.useState(false);
  const [showPalette, setShowPalette] = React.useState(false);
  
  // Referencia para cerrar el popover al hacer clic afuera
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPalette(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-24 animate-pulse bg-muted rounded-full" />;
  }

  const toggleDarkMode = (event: React.MouseEvent) => {
    const isDark = theme === "dark";
    const newTheme = isDark ? "light" : "dark";

    // Si el navegador no soporta View Transitions, hace el cambio normal
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    // Coordenadas del clic para iniciar el círculo desde ahí
    const x = event.clientX;
    const y = event.clientY;

    // Calcular el radio máximo necesario para cubrir toda la pantalla
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <div className="relative flex items-center gap-2 glass p-2 rounded-full w-fit z-[100]" ref={containerRef}>
      <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Cambiar modo oscuro" className="rounded-full">
        {theme === "dark" ? <Sun className="h-5 w-5 transition-all" /> : <Moon className="h-5 w-5 transition-all" />}
      </Button>
      
      <div className="w-[1px] h-6 bg-foreground/20 mx-1" />

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setShowPalette(!showPalette)} 
        title="Seleccionar color" 
        className={`rounded-full transition-colors ${showPalette ? "bg-accent" : ""}`}
      >
        <Palette className="h-5 w-5 text-primary" />
      </Button>

      {/* Menú Desplegable Manual (Popover) para Colores */}
      {showPalette && (
        <div className="absolute top-full right-0 mt-3 p-4 bg-popover text-popover-foreground border shadow-xl rounded-2xl flex flex-wrap gap-3 w-56 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <p className="w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Paleta de Acentos
          </p>
          {THEME_COLORS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setColorTheme(t);
                setShowPalette(false);
              }}
              title={t.replace("theme-", "")}
              className={`w-7 h-7 rounded-full shadow-sm transition-transform hover:scale-110 ${COLOR_INDICATORS[t]} ${
                colorTheme === t 
                  ? "ring-2 ring-offset-2 ring-ring dark:ring-offset-background scale-110" 
                  : "hover:ring-2 hover:ring-offset-1 hover:ring-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
