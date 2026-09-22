"use client";

import * as React from "react";

type Role = "admin" | "student";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  realRole: Role;
  setRealRole: (role: Role) => void;
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [realRole, setRealRole] = React.useState<Role>("admin");
  const [role, setRole] = React.useState<Role>("admin");

  // Al inicio, recuperar los roles guardados si existen
  React.useEffect(() => {
    const savedRealRole = localStorage.getItem("zsuite_real_role") as Role;
    const savedViewRole = localStorage.getItem("zsuite_view_role") as Role;

    if (savedRealRole && ["admin", "student"].includes(savedRealRole)) {
      setRealRole(savedRealRole);
      
      // Si el rol real es estudiante, se fuerza siempre la vista de estudiante
      if (savedRealRole === "student") {
        setRole("student");
      } else if (savedViewRole && ["admin", "student"].includes(savedViewRole)) {
        setRole(savedViewRole);
      }
    }
  }, []);

  const handleSetRealRole = (newRealRole: Role) => {
    setRealRole(newRealRole);
    localStorage.setItem("zsuite_real_role", newRealRole);
    
    // Si el usuario es un estudiante, su vista DEBE ser estudiante, sin importar qué intenten ver
    if (newRealRole === "student") {
      setRole("student");
      localStorage.setItem("zsuite_view_role", "student");
    } else {
      setRole(newRealRole); // Por defecto un admin entra viendo como admin
      localStorage.setItem("zsuite_view_role", newRealRole);
    }
  };

  const handleSetViewRole = (newViewRole: Role) => {
    // Si el rol real es admin, se le permite cambiar la vista. Si no, se ignora.
    if (realRole === "admin") {
      setRole(newViewRole);
      localStorage.setItem("zsuite_view_role", newViewRole);
    }
  };

  return (
    <RoleContext.Provider value={{ 
      role, 
      setRole: handleSetViewRole,
      realRole,
      setRealRole: handleSetRealRole
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
