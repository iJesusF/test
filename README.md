# BuildVision

Aplicación web responsive para gestión visual de avance de construcción sobre planos arquitectónicos. El MVP funciona realmente en navegador: permite subir una imagen de plano, renderizarla en canvas, dibujar zonas, editar vértices, editar metadatos y persistir temporalmente en `localStorage` usando Zustand.

## Arquitectura

- **App Router**: rutas `src/app`, dashboard principal y modo TV/kiosk.
- **Canvas BIM ligero**: `React Konva` renderiza la imagen real del plano, polígonos, hover, selección, nodos editables, pan/zoom y heatmap.
- **Estado global real**: `Zustand` con middleware `persist` guarda planos, zonas, tareas derivadas y selección en `localStorage`.
- **API routes**: endpoints documentales preparados para reemplazar persistencia local por Supabase Storage/DB cuando se pase a multiusuario.
- **Datos**: esquema Supabase en `supabase/schema.sql` para projects, floorplans, zones, tasks, dependencies, comments, attachments y progress_logs.
- **UI**: dark mode premium industrial con sidebar, topbar, panel derecho, métricas, canvas y Gantt responsive.

## Estructura de carpetas

```txt
src/app                 Rutas Next.js, API routes, layout global y modo TV
src/components/canvas   Canvas Konva real y toolbar de herramientas
src/components/layout   Shell, sidebar, topbar/upload y panel CRUD de zona
src/components/timeline Gantt visual derivado de zonas reales
src/components/ui       Componentes reutilizables de UI
src/lib                 Supabase, helpers y estado visual
src/store               Store Zustand persistente
src/types               Modelos TypeScript de dominio
supabase/schema.sql     Modelo relacional de producción
```

## Funcionalidades implementadas

1. Dashboard responsive sin login.
2. Upload real de imágenes PNG/JPG/WebP desde el navegador.
3. Render real del plano subido dentro de React Konva.
4. Zoom por wheel y pan con herramienta dedicada.
5. Dibujo manual de polígonos cerrando cerca del primer punto.
6. Selección, hover highlight y edición drag de vértices.
7. Panel lateral editable conectado al estado real.
8. CRUD local de zonas: crear, editar, duplicar y eliminar.
9. Persistencia temporal automática en `localStorage`.
10. Timeline/Gantt derivado de las zonas dibujadas.
11. Modo TV/kiosk en `/tv`.
12. Dark mode premium con glassmorphism, glow sutil y paleta industrial.

## Paso a paso de ejecución

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000` para el dashboard y `http://localhost:3000/tv` para el modo presentación.

## Flujo de uso del MVP

1. Haz clic en **Subir plano**.
2. Selecciona una imagen PNG, JPG o WebP del plano arquitectónico.
3. Activa la herramienta **Dibujar**.
4. Haz clic sobre el plano para crear vértices.
5. Cierra el polígono haciendo clic cerca del primer punto.
6. Selecciona la zona y edita sus datos en el panel derecho.
7. Arrastra los puntos blancos para modificar vértices.
8. Cambia a **Pan** para mover el plano y usa la rueda del mouse para zoom.
9. Recarga el navegador: el trabajo permanece en `localStorage`.
10. Usa **Reset** para borrar el workspace local.

> Nota MVP: los PDF deben exportarse como imagen para renderizarse en canvas. La integración PDF directa puede añadirse con `pdf.js` en la siguiente fase.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. Crea buckets de storage: `floorplans`, `photos`, `attachments`.
4. Copia variables a `.env.local`.
5. Sustituye la persistencia local de `src/store/project-store.ts` por API routes conectadas a Supabase cuando necesites colaboración multiusuario.

## Roadmap MVP

### Fase 1 completada
- Upload real de imagen.
- Render del plano en canvas.
- Dibujo y edición manual de zonas.
- Panel lateral editable.
- Persistencia temporal local.
- CRUD de zonas.

### Fase 2
- Upload remoto con Supabase Storage.
- Persistencia remota de planos/zonas/tareas.
- Dependencias editables FS/SS/FF/SF.
- Fotos, archivos, comentarios e historial.
- Reportes PDF/CSV y heatmaps por avance/calidad.
- Realtime con canales Supabase.

### Fase 3
- Detección automática de habitaciones con OpenCV.
- Segment Anything para segmentación asistida.
- OCR de etiquetas de cuartos y auto-mapping de zonas.

## Performance

- Canvas en layers separados para plano y overlays.
- Render client-only del canvas para no bloquear SSR.
- Estado persistido parcialmente para evitar guardar UI transitoria.
- Recomendado para producción: tiles de planos grandes, simplificación de polígonos, caching de imágenes, virtualization para listas largas y debounce de persistencia remota.
