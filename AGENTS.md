# Contexto del Proyecto
Nombre: Z-Suite
Descripción: Plataforma modular tipo SaaS para gestión académica y operativa de equipos de desarrollo. 
Contexto del Autor: El desarrollador líder es Jaime, especialista Full-Stack (Front-end) e instructor de desarrollo de software. El código generado debe cumplir con estándares de la industria aptos para entornos educativos reales y escalables.

# Stack Tecnológico
- Framework: Next.js 14+ (App Router)
- Lenguaje: TypeScript (Tipado estricto)
- Estilos: Tailwind CSS
- Base de datos, Storage y Auth: Supabase (PostgreSQL)

# Reglas de Arquitectura (¡RESTRICCIONES CRÍTICAS!)
El proyecto sigue estrictamente los principios SOLID (énfasis en SRP) y Screaming Architecture. Como IA asistente, DEBES respetar estas reglas en cada línea de código que generes:

1. **Screaming Architecture**: La carpeta `/src/app/` es ANÉMICA y solo se usa para enrutamiento (archivos `page.tsx`). Todo el código real vive en `/src/modules/` organizado por dominio de negocio (ej. `/src/modules/auth`, `/src/modules/attendance`, `/src/modules/kanban`, `/src/modules/evaluation`).
2. **Principio de Responsabilidad Única (SRP)**: ESTRICTAMENTE PROHIBIDO mezclar UI, estado de React y transacciones de base de datos en un solo archivo.
3. **Estructura Interna Obligatoria por Módulo**:
   - `/components`: Solo UI "tonta" (Dumb components). Reciben props, emiten eventos, pintan clases de Tailwind. Cero llamadas a BD o lógicas complejas.
   - `/hooks`: Lógica de vista y estado de React (Custom hooks).
   - `/actions`: Lógica de negocio pura. Next.js Server Actions (`'use server'`) para transacciones con Supabase.
   - `/types`: Definiciones estrictas de interfaces TypeScript que mapean la base de datos.
   - `/screens`: Componente orquestador que une el Custom Hook con la UI pura, diseñado para ser exportado a `/src/app/`.
4. **Límite de líneas**: Prohibido generar archivos monolíticos. Si un archivo supera las 150 líneas de código, asume que violaste SRP y debes refactorizar/dividir la lógica antes de entregar la respuesta.

# Reglas de Negocio Centrales
1. **Autenticación**: UI basada exclusivamente en Cédula y Clave. El backend maneja un correo fantasma interno (`[cedula]@zsuite.local`) para interactuar con Supabase Auth sin requerir correos reales de los usuarios. No hay registro público.
2. **Modularidad SaaS**: Los módulos (WorkManager, Kanban, Evaluación) dependen de Feature Flags booleanos a nivel de tabla `projects` (`usa_asistencia`, `usa_kanban`, `usa_evaluacion`). El renderizado del frontend es condicional a estos flags.
3. **WorkManager (Antifraude)**: Control de tiempo estricto. Marcaciones solo de inicio de jornada y breaks. Límite de 15 min de retraso diario y máximo 3 desconexiones justificadas por proyecto.
4. **Kanban**: Auditoría de QA. Las tareas devueltas a "En Progreso" exigen tipificación del motivo (lista fija). La reincidencia por el mismo motivo dispara una penalización automática.
5. **Evaluación Dual**: El sistema calcula de forma automatizada un 30% correspondiente al entregable técnico grupal (asignado al proyecto) y un 70% de gestión operativa individual (arranca en 5.0 y resta puntos automáticamente por penalizaciones de WorkManager y QA).
6. **Optimización de Assets**: Las fotos de perfil de los usuarios se comprimen obligatoriamente a <200KB en el cliente (navegador) antes de ser enviadas a Supabase Storage.


# Z-Suite: Documento Maestro de Requisitos y Lógica de Negocio

Este documento contiene el levantamiento de requisitos, las reglas de negocio y la lógica operativa de Z-Suite. La IA debe basar toda la lógica de los módulos en estas directrices.

## 1. Visión General y Modularidad
- **Objetivo:** Plataforma SaaS para gestionar hasta 200 estudiantes/desarrolladores no concurrentes, combinando control de tiempo, Kanban y evaluación académica.
- **Modularidad (Feature Flags):** Los módulos se encienden/apagan por proyecto desde la base de datos (`usa_asistencia`, `usa_kanban`, `usa_evaluacion`). Permite usar el sistema a futuro para proyectos freelance puros.

## 2. Autenticación y Perfil de Usuario
- **Login:** Únicamente Cédula y Clave (sin registro público).
- **Mecanismo Backend:** Se usa un correo fantasma (`[cedula]@zsuite.local`) para conectar con Supabase Auth.
- **Perfiles:** Panel de estudiante con foto de avatar. 
- **Regla Técnica de Storage:** Toda foto subida debe comprimirse en el cliente (navegador) usando `browser-image-compression` a un máximo de ~200KB antes de enviarse a Supabase Storage.

## 3. Módulo WorkManager (Control Operativo y Antifraude)
- **Marcaciones Permitidas:** Solo `ingreso_jornada` y `regreso_break` (no se requiere checkout explícito de salida).
- **Tolerancia de Retraso:** Límite de 15 minutos acumulados diarios permitidos antes de aplicar penalización.
- **Mecánica Antifraude (Bloqueo):** Si un usuario cierra sesión o se desconecta, se activa un "cooldown" (bloqueo) de 15 minutos donde el sistema no le permite volver a marcar ingreso.
- **Justificaciones de Caídas:** Límite máximo de 3 desconexiones justificadas por usuario en el proyecto. La 4ta desconexión aplica penalización automática.
- **Fuente de Verdad:** Todas las marcaciones de tiempo usan el timestamp del servidor de PostgreSQL, nunca la hora del dispositivo del cliente.

## 4. Módulo Kanban (Flujo Ágil y Auditoría)
- **Columnas Fijas:** Por Hacer -> En Progreso -> QA -> Terminado.
- **Rol de Aprobación:** Solo el Administrador (Profesor/Líder) puede pasar una historia a "Terminado" o devolverla.
- **Auditoría de QA y Rechazos:**
  - Si una tarea no cumple, el Admin la devuelve a "En Progreso" seleccionando un motivo de rechazo de una lista de categorías fijas.
  - El primer rechazo NO penaliza (fomenta el aprendizaje).
  - **Regla de Penalización Kanban:** Solo se aplica penalización si la historia es devuelta por *el mismo motivo* categórico en un segundo intento (falla de atención al detalle).

## 5. Módulo de Evaluación (Motor de Calificaciones)
- **Distribución de la Nota Final:** 70% Individual (Gestión/Disciplina) + 30% Grupal (Entregables técnicos).
- **Cálculo Grupal (30%):** Se divide en 3 entregables de igual peso (33.3% cada uno) evaluados por el Admin al equipo.
- **Cálculo Individual (70%):** Inicia siempre en la nota máxima (5.0).
- **Sistema de Descuentos Automáticos:** La nota individual baja automáticamente en tiempo real mediante un motor de penalizaciones si el estudiante:
  - Supera los 15 min de retraso diario (WorkManager).
  - Supera las 3 desconexiones (WorkManager).
  - Reincide en un mismo error de QA (Kanban).
- **Dashboard:** El estudiante ve sus métricas en tiempo real y tiene un sistema de buzón de mensajes directos para apelar o comunicarse con el Admin.