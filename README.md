# BuildVision

Aplicación web responsive para gestión visual de avance de construcción sobre planos arquitectónicos. El MVP usa Next.js App Router, TypeScript, TailwindCSS, Framer Motion, React Konva, Zustand y API routes preparadas para Supabase + Supabase Storage.

## Arquitectura

- **App Router**: rutas `src/app`, dashboard principal y modo TV/kiosk.
- **Canvas BIM ligero**: `React Konva` renderiza plano, polígonos, hover, selección, nodos editables, pan/zoom y heatmap.
- **Estado global**: `Zustand` centraliza proyecto, planos, zonas, tareas, dependencias y tool modes.
- **API routes**: endpoints REST internos para proyectos, planos, zonas y tareas.
- **Datos**: esquema Supabase en `supabase/schema.sql` para projects, floorplans, zones, tasks, dependencies, comments, attachments y progress_logs.
- **UI**: dark mode premium industrial con sidebar, topbar, panel derecho, métricas, canvas y Gantt responsive.

## Estructura de carpetas

```txt
src/app                 Rutas Next.js, API routes, layout global y modo TV
src/components/canvas   Canvas Konva y toolbar de herramientas
src/components/layout   Shell, sidebar, topbar y panel de zona
src/components/timeline Gantt visual con dependencias FS/SS/FF/SF
src/components/ui       Componentes reutilizables de UI
src/lib                 Supabase, helpers, mock data y estado visual
src/store               Stores Zustand
src/types               Modelos TypeScript de dominio
supabase/schema.sql     Modelo relacional de producción
```

## Funcionalidades MVP implementadas

1. Dashboard responsive sin login.
2. Upload endpoint para plano (`POST /api/floorplans`) listo para integrar Supabase Storage.
3. Canvas interactivo con zoom por wheel, pan, selección, hover, edición de vértices y creación de polígonos.
4. Panel lateral editable para zona seleccionada.
5. Timeline/Gantt con barras por estado y dependencias visuales tipo MS Project.
6. Modo TV/kiosk en `/tv`.
7. Dark mode premium con glassmorphism, glow sutil y paleta industrial.

## Paso a paso de ejecución

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000` para el dashboard y `http://localhost:3000/tv` para el modo presentación.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. Crea buckets de storage: `floorplans`, `photos`, `attachments`.
4. Copia variables a `.env.local`.
5. Reemplaza los mocks de `src/lib/mock-data.ts` con queries a `src/lib/supabase.ts` en API routes.

## Roadmap MVP

### Fase 1
- Persistencia real de zonas y planos.
- Upload con Supabase Storage firmado.
- Guardado de polígonos y edición de panel.
- Timeline básico con drag/resize.

### Fase 2
- Dependencias editables FS/SS/FF/SF.
- Fotos, archivos, comentarios e historial.
- Reportes PDF/CSV y heatmaps por avance/calidad.
- Realtime con canales Supabase.

### Fase 3
- Detección automática de habitaciones con OpenCV.
- Segment Anything para segmentación asistida.
- OCR de etiquetas de cuartos y auto-mapping de zonas.

## Performance

- Canvas en layers separados para plano, polígonos y overlays.
- Tool modes para evitar listeners innecesarios.
- Render client-only del canvas para no bloquear SSR.
- Estado normalizado y patches parciales en Zustand.
- Recomendado: tiles de planos grandes, simplificación de polígonos, caching de imágenes, virtualization para listas largas y debounce de persistencia.
