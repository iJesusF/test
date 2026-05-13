# Vortech 360

Aplicación full-stack para track visual de proyectos, calidad en obra y evidencias sobre planos arquitectónicos. El flujo principal funciona contra Supabase: crea proyectos, sube planos JPG/PNG/PDF a Supabase Storage, guarda metadatos en PostgreSQL, dibuja zonas sobre el canvas y persiste polígonos/coordenadas reales.

## Arquitectura

- **Next.js App Router**: dashboard, rutas de módulos y API routes reales.
- **Supabase PostgreSQL**: proyectos, niveles, floorplans, zonas, tareas, dependencias, comentarios, adjuntos e historial.
- **Supabase Storage**: buckets `floorplans` y `attachments` para PDF/PNG/JPG y archivos de obra.
- **React Konva**: render del plano como fondo, zoom, pan, dibujo de polígonos, selección y edición de vértices.
- **Zustand**: estado cliente sincronizado con API routes; no usa mock data.
- **UI**: dark mode premium industrial con sidebar, topbar, panel derecho, métricas, canvas y Gantt responsive.

## Estructura

```txt
src/app/api             API routes CRUD reales contra Supabase
src/app/*               Páginas App Router: plano, zonas, tareas, cronograma, reportes, ajustes
src/components/canvas   Canvas Konva real y toolbar
src/components/layout   Shell, navegación, upload y panel CRUD de zona
src/components/timeline Gantt visual conectado a tareas reales
src/components/views    Vistas de zonas, tareas, reportes y ajustes
src/hooks               Hooks cliente para upload
src/lib                 Supabase server/client, mappers, upload PDF/imagen y utilities
src/lib/canvas          Canvas engine: geometría y coordenadas
src/store               Store Zustand sincronizado con Supabase
supabase/schema.sql     Esquema PostgreSQL de producción
```

## Configuración Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL Editor.
3. Crea buckets públicos o con políticas de lectura para:
   - `floorplans`
   - `attachments`
4. Copia `.env.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_FLOORPLANS_BUCKET=floorplans
SUPABASE_ATTACHMENTS_BUCKET=attachments
```

> Las API routes usan `SUPABASE_SERVICE_ROLE_KEY` solo en servidor. No lo expongas en componentes cliente.

### Modo local sin Supabase

Si todavía no configuraste `.env.local`, la app puede crear proyectos, subir planos al navegador y dibujar zonas en modo local-first. En ese modo no verás el mensaje de error de Supabase al crear un proyecto; la sincronización real con PostgreSQL/Storage se activa cuando agregas `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` y reinicias `npm run dev`.

## Ambientes / Environments

Para crear ambientes nuevos (`local`, `preview`, `production`) revisa la guía en [`docs/environments.md`](docs/environments.md). También hay plantillas `.env.local.example`, `.env.preview.example` y `.env.production.example` para copiar valores sin exponer secretos reales.

## Ejecución local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

## Flujo funcional

1. Entra a `/`.
2. Pulsa **Subir plano**.
3. Selecciona PDF, JPG o PNG.
4. Si no existe proyecto, la app crea uno local automáticamente y luego puede sincronizar con Supabase cuando esté configurado.
5. El archivo se previsualiza localmente; con Supabase configurado, puede sincronizarse con Storage y `floorplans`.
6. El canvas renderiza el plano remoto como fondo.
7. Activa **Dibujar**, crea vértices y cierra el polígono cerca del primer punto.
8. La zona se guarda en `zones.polygon` como JSONB y se crea una tarea asociada.
9. Edita nombre, avance, fechas, comentarios, status y checklist en el panel lateral.
10. Navega a `/zones`, `/tasks`, `/schedule`, `/reports` o `/settings`; todas leen el estado sincronizado con Supabase.

## API routes implementadas

- `GET/POST /api/projects`, `PATCH/DELETE /api/projects/[id]`
- `GET/POST /api/levels`, `PATCH/DELETE /api/levels/[id]`
- `GET/POST /api/floorplans`, `PATCH/DELETE /api/floorplans/[id]`
- `GET/POST /api/zones`, `PATCH/DELETE /api/zones/[id]`
- `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/[id]`
- `GET/POST /api/dependencies`, `PATCH/DELETE /api/dependencies/[id]`
- `GET/POST /api/comments`, `PATCH/DELETE /api/comments/[id]`
- `GET/POST /api/attachments`

## Roadmap siguiente

- UI dedicada para crear/editar niveles.
- Editor visual de dependencias FS/SS/FF/SF con drag & drop.
- Políticas RLS por usuario/equipo cuando se agregue login.
- Versionado de planos y comparación de revisiones.
