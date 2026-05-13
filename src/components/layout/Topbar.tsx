'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Expand, MonitorUp, RotateCcw, Settings, UploadCloud } from 'lucide-react';
import { useProjectStore } from '@/store/project-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Floorplan } from '@/types/domain';

function readImage(file: File) {
  return new Promise<Floorplan>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const fileUrl = String(reader.result);
      const image = new Image();
      image.onload = () => resolve({
        id: `floorplan-${crypto.randomUUID()}`,
        projectId: 'local-project',
        name: file.name,
        fileUrl,
        fileType: 'image',
        width: image.naturalWidth,
        height: image.naturalHeight
      });
      image.onerror = () => reject(new Error('El archivo no es una imagen válida. Exporta el PDF como PNG/JPG para este MVP.'));
      image.src = fileUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function Topbar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string>();
  const { project, floorplans, activeFloorplanId, addFloorplan, setActiveFloorplan, toggleFullscreen, resetWorkspace } = useProjectStore();
  const floorplan = floorplans.find((item) => item.id === activeFloorplanId);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError(undefined);
    if (!file.type.startsWith('image/')) {
      setUploadError('Este MVP renderiza imágenes reales en canvas. Exporta el PDF como PNG/JPG antes de subirlo.');
      return;
    }
    try {
      addFloorplan(await readImage(file));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'No se pudo subir el plano.');
    }
  }

  return <header className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-graphite/80 px-4 py-3 backdrop-blur-xl lg:px-6">
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} className="hidden" />
    <div className="min-w-0 flex-1"><p className="text-xs uppercase tracking-[0.28em] text-muted">Proyecto activo</p><h1 className="truncate text-lg font-semibold text-white">{project.name}</h1>{uploadError && <p className="mt-1 text-xs text-danger">{uploadError}</p>}</div>
    <StatusBadge status={project.status} />
    <select value={activeFloorplanId ?? ''} onChange={(event) => setActiveFloorplan(event.target.value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none" disabled={!floorplans.length}>
      <option value="">{floorplan?.name ?? 'Sin plano'}</option>
      {floorplans.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-electric px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"><UploadCloud className="size-4" />Subir plano</button>
    <button onClick={resetWorkspace} className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10 md:inline-flex"><RotateCcw className="size-4" />Reset</button>
    <a href="/tv" className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10 md:inline-flex"><MonitorUp className="size-4" />TV</a>
    <button onClick={toggleFullscreen} className="rounded-xl border border-white/10 p-2 text-white hover:bg-white/10"><Expand className="size-4" /></button>
    <button className="rounded-xl border border-white/10 p-2 text-white hover:bg-white/10"><Settings className="size-4" /></button>
  </header>;
}
