"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PatternSwitcher } from "@/modules/core/components/ui/PatternSwitcher";
import { ThemeSwitcher } from "@/modules/core/components/ui/ThemeSwitcher";
import { LayoutDashboard, CheckSquare, BarChart, Users, Clock, LogOut, GraduationCap, ArrowRightLeft } from "lucide-react";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { useRole } from "@/modules/core/contexts/RoleProvider";
import { Toaster } from "sonner";
import { createClient } from "@/modules/core/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pattern } = useDesignPattern();
  const { role, setRole, realRole } = useRole();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    
    // Limpiar roles mockeados
    localStorage.removeItem("zsuite_real_role");
    localStorage.removeItem("zsuite_view_role");
    
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors">
      {/* Sidebar Fijo */}
      <aside className={`w-64 flex flex-col hidden md:flex transition-colors duration-500 ${pattern === 'neumorphism' ? 'bg-background border-r-0 shadow-[4px_0_15px_rgba(0,0,0,0.05)]' : 'bg-card border-r border-border'}`}>
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-extrabold tracking-tight">Z-Suite</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Workspace</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {role === "admin" ? (
            <>
              <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Inicio (Resumen)" />
              <NavItem href="/dashboard/grupos" icon={<Users size={18} />} label="Mis Grupos" />
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Módulos</p>
              </div>
              <NavItem href="/dashboard/workmanager" icon={<Clock size={18} />} label="WorkManager" />
              <NavItem href="/dashboard/kanban" icon={<CheckSquare size={18} />} label="Kanban (QA)" />
              <NavItem href="/dashboard/evaluaciones" icon={<BarChart size={18} />} label="Evaluaciones" />
            </>
          ) : (
            <>
              <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Mi Panel" />
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estudiante</p>
              </div>
              <NavItem href="/dashboard/mis-entregables" icon={<CheckSquare size={18} />} label="Mis Entregables" />
              <NavItem href="/dashboard/asistencia" icon={<Clock size={18} />} label="Mi Asistencia" />
            </>
          )}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-500'}`}>
              {role === 'admin' ? 'JZ' : 'ES'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">{role === 'admin' ? 'Jaime Zapata' : 'Estudiante Demo'}</span>
              <span className="text-xs text-muted-foreground mt-1 capitalize">{role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Superior */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 relative z-[100]">
          <div className="flex items-center md:hidden">
            <h1 className="font-extrabold text-xl">Z-Suite</h1>
          </div>
          <div className="flex-1 flex justify-center md:justify-start">
            {/* DEV TOOL: Role Switcher - SOLO VISIBLE PARA ADMINS REALES */}
            {realRole === "admin" && (
              <button 
                onClick={() => setRole(role === 'admin' ? 'student' : 'admin')}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-sm font-semibold rounded-full border border-border transition-colors animate-pulse hover:animate-none"
                title="Cambiar vista temporalmente para desarrollo"
              >
                <ArrowRightLeft size={14} />
                Viendo como: <span className={role === 'admin' ? 'text-primary' : 'text-blue-500 capitalize'}>{role}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Controles de Tematización Arquitectónica */}
            <PatternSwitcher />
            <div className="w-px h-6 bg-border" />
            <ThemeSwitcher />
          </div>
        </header>

        {/* Contenido desplazable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-background relative">
          {children}
        </main>
      </div>

      {/* Alertas Modernas de Sonner */}
      <Toaster position="top-right" richColors theme="system" />
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  // Lógica simple para active: coincide exactamente o es subruta (excepto para /dashboard)
  const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
