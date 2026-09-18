"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export type ColorTheme = 
  | "theme-blue" 
  | "theme-purple" 
  | "theme-emerald"
  | "theme-rose"
  | "theme-amber"
  | "theme-cyan"
  | "theme-indigo"
  | "theme-slate"
  | "theme-orange"
  | "theme-teal";

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const THEME_COLORS: ColorTheme[] = [
  "theme-blue", "theme-purple", "theme-emerald", "theme-rose", 
  "theme-amber", "theme-cyan", "theme-indigo", "theme-slate", 
  "theme-orange", "theme-teal"
];

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [colorTheme, setColorTheme] = React.useState<ColorTheme>("theme-blue");

  // Al cambiar el colorTheme, inyectamos la clase en el HTML
  React.useEffect(() => {
    const root = window.document.documentElement;
    // Remover temas anteriores
    root.classList.remove(...THEME_COLORS);
    // Añadir el nuevo tema
    if (colorTheme !== "theme-blue") {
      root.classList.add(colorTheme);
    }
  }, [colorTheme]);

  return (
    <NextThemesProvider {...props}>
      <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

export function useColorTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useColorTheme debe ser usado dentro de un ThemeProvider");
  }
  return context;
}
