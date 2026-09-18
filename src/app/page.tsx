import { ThemeSwitcher } from "@/modules/core/components/ui/ThemeSwitcher";
import { Button } from "@/modules/core/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden bg-background">
      {/* Elementos de fondo para probar el Glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/30 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
      
      <div className="z-10 w-full max-w-5xl flex flex-col gap-12">
        <header className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Z-Suite
            </h1>
            <p className="text-muted-foreground mt-2">
              Plataforma SaaS para gestión académica y operativa
            </p>
          </div>
          <ThemeSwitcher />
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Tarjeta Glassmorfismo */}
          <div className="glass-card p-8 flex flex-col gap-4 rounded-2xl">
            <h3 className="text-xl font-bold">Glassmorphism</h3>
            <p className="text-sm text-muted-foreground">
              Transparencias sutiles con desenfoque de fondo. Ideal para elementos flotantes o modales.
            </p>
            <div className="mt-auto pt-4 flex gap-2">
              <Button variant="glass" className="w-full">Acción Glass</Button>
            </div>
          </div>

          {/* Tarjeta Neumorfismo */}
          <div className="neu-flat p-8 flex flex-col gap-4 rounded-2xl border border-border/50">
            <h3 className="text-xl font-bold">Neumorphism</h3>
            <p className="text-sm text-muted-foreground">
              Profundidad sutil jugando con las luces y sombras del mismo color de fondo.
            </p>
            <div className="mt-auto pt-4 flex gap-2">
              <Button variant="neumorphic" className="w-full">Botón Neu</Button>
            </div>
          </div>

          {/* Tarjeta Estándar / Shadcn */}
          <div className="bg-card text-card-foreground p-8 flex flex-col gap-4 rounded-2xl shadow-sm border">
            <h3 className="text-xl font-bold">Minimalism (Solid)</h3>
            <p className="text-sm text-muted-foreground">
              Estilo clásico limpio. Alto contraste y legibilidad directa usando el color primario.
            </p>
            <div className="mt-auto pt-4 flex gap-2">
              <Button variant="solid" className="w-full">Botón Sólido</Button>
            </div>
          </div>

        </section>

        {/* Sección de Botones Varios */}
        <section className="p-8 border border-border/50 rounded-2xl bg-secondary/30 flex flex-col gap-6 items-center text-center">
          <h2 className="text-2xl font-bold">Prueba de Componentes</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="solid">Guardar Cambios</Button>
            <Button variant="outline">Cancelar</Button>
            <Button variant="ghost">Solo texto</Button>
            <Button variant="neumorphic">Neu Flat</Button>
            <Button variant="glass">Glass</Button>
          </div>
        </section>

      </div>
    </main>
  );
}
