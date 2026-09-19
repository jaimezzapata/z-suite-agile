"use client";

import * as React from "react";
import { PatternSwitcher } from "@/modules/core/components/ui/PatternSwitcher";
import { ThemeSwitcher } from "@/modules/core/components/ui/ThemeSwitcher";
import { LayoutDashboard, CheckSquare, BarChart, Users, Clock, LogOut, GraduationCap, ArrowRightLeft } from "lucide-react";
import { useDesignPattern } from "@/modules/core/contexts/DesignPatternProvider";
import { useRole } from "@/modules/core/contexts/RoleProvider";
import { Toaster, toast } from "sonner";
import { createClient } from "@/modules/core/lib/supabase/client";
import { useRouter } from "next/navigation";
import { NavItem } from "@/modules/core/components/ui/NavItem";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { pattern } = useDesignPattern();
  const { role, setRole, realRole } = useRole();
  const router = useRouter();

  const handleLogout = React.useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("zsuite_real_role");
    localStorage.removeItem("zsuite_view_role");
    router.push("/login");
  }, [router]);

  // Si el estudiante es reiniciado de fábrica por el admin, cerrar sesión automáticamente
  React.useEffect(() => {
    if (role === "admin") return;

    const supabase = createClient();
    let channel: any = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      channel = supabase
        .channel(`student-session-sync-${user.id}-${Math.random().toString(36).substring(7)}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          async (payload: any) => {
            if (payload.new && payload.new.id === user.id && payload.new.terminos_aceptados_at === null) {
              toast.info("Tu cuenta ha sido restablecida. Inicia sesión de nuevo.");
              await handleLogout();
            }
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [role, handleLogout]);

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors">
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
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {role === "admin" ? "AD" : "ES"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold capitalize">{role === "admin" ? "Docente" : "Estudiante"}</span>
              <span className="text-[10px] text-muted-foreground">En línea</span>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 transition-colors`}>
          <div className="flex items-center gap-4">
            <h2 className="text-sm md:text-base font-bold text-muted-foreground flex items-center gap-2">
              <GraduationCap className="text-primary" size={20} />
              Entorno de Formación
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {realRole === "admin" && (
              <button
                onClick={() => {
                  const nextRole = role === "admin" ? "student" : "admin";
                  setRole(nextRole);
                  localStorage.setItem("zsuite_view_role", nextRole);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-xs"
                title="Cambiar vista para previsualizar como Estudiante"
              >
                <ArrowRightLeft size={14} />
                <span className="hidden sm:inline">Vista:</span>
                <span className="font-bold uppercase tracking-wider">{role}</span>
              </button>
            )}
            <ThemeSwitcher />
            <PatternSwitcher />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-background relative">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors theme="system" />
    </div>
  );
}
