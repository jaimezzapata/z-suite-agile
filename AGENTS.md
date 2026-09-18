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