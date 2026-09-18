# Z-Suite

Plataforma modular tipo SaaS orientada a la gestión académica y operativa de equipos de desarrollo de software. Z-Suite unifica el control de tiempos, el seguimiento ágil de tareas y la evaluación automatizada del rendimiento en un solo entorno.

## 🚀 Módulos Principales

El proyecto está diseñado de forma modular (Feature Flags), permitiendo habilitar o deshabilitar funcionalidades por proyecto:

- **⏱️ WorkManager:** Control de asistencia estricto. Registra inicio de jornada y breaks. Incluye reglas de negocio antifraude, penalizaciones por tiempo de inactividad (>15 min) y control de desconexiones no justificadas.
- **📋 Kanban Ágil:** Tablero de tareas con un pipeline fijo (*Por Hacer > En Progreso > QA > Terminado*). Cuenta con auditoría de calidad: si una Historia de Usuario (HU) es rechazada reiterativamente por el mismo motivo, el sistema lo registra.
- **📊 Motor de Evaluación:** Sistema de calificación dual automatizado. Calcula la nota final cruzando el entregable técnico grupal (30%) con el rendimiento operativo y disciplina individual (70%).

## 🛠️ Stack Tecnológico

- **Frontend/Backend:** Next.js (App Router) + Server Actions
- **Lenguaje:** TypeScript (Tipado estricto)
- **Estilos:** Tailwind CSS
- **Base de Datos & Auth:** Supabase (PostgreSQL, Storage, Realtime)

## 🏗️ Arquitectura

Este proyecto sigue estrictamente el principio de **Screaming Architecture** y los principios **SOLID** (con énfasis en SRP - Single Responsibility Principle). 

La carpeta `/app` se mantiene anémica (solo enrutamiento). La lógica de negocio real, los componentes de UI (Dumb Components), los Custom Hooks y las transacciones de base de datos viven separados por dominio dentro de la carpeta `/src/modules/`.

## ⚙️ Desarrollo Local

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno para Supabase (basado en `.env.example`).
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.