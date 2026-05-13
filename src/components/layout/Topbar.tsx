'use client';

import Link from 'next/link';
import { Expand, MonitorUp, RotateCcw, Settings, UploadCloud } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useFloorplanUpload } from '@/hooks/useFloorplanUpload';
import { useProjectStore } from '@/store/project-store';

export function Topbar() {
  const { inputRef, uploadError, isUploading, handleUpload, openFilePicker } = useFloorplanUpload();
  const { project, floorplans, activeFloorplanId, setActiveFloorplan, resetWorkspace } = useProjectStore();
  const floorplan = floorplans.find((item) => item.id === activeFloorplanId);

  async function enterFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }
    await document.exitFullscreen();
  }

  return <header className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-graphite/80 px-4 py-3 backdrop-blur-xl lg:px-6">
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={handleUpload} className="hidden" />
    <div className="min-w-0 flex-1"><p className="text-xs uppercase tracking-[0.28em] text-muted">Proyecto activo</p><h1 className="truncate text-lg font-semibold text-white">{project.name}</h1>{uploadError && <p className="mt-1 text-xs text-danger">{uploadError}</p>}</div>
    <StatusBadge status={project.status} />
    <select value={activeFloorplanId ?? ''} onChange={(event) => setActiveFloorplan(event.target.value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none" disabled={!floorplans.length}>
      <option value="">{floorplan?.name ?? 'Sin plano'}</option>
      {floorplans.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
    </select>
    <button onClick={openFilePicker} disabled={isUploading} className="inline-flex items-center gap-2 rounded-xl bg-electric px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400 disabled:cursor-wait disabled:opacity-60"><UploadCloud className="size-4" />{isUploading ? 'Procesando…' : 'Subir plano'}</button>
    <button onClick={resetWorkspace} className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10 md:inline-flex"><RotateCcw className="size-4" />Reset</button>
    <Link href="/tv" className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10 md:inline-flex"><MonitorUp className="size-4" />TV</Link>
    <button onClick={enterFullscreen} className="rounded-xl border border-white/10 p-2 text-white hover:bg-white/10"><Expand className="size-4" /></button>
    <Link href="/settings" className="rounded-xl border border-white/10 p-2 text-white hover:bg-white/10"><Settings className="size-4" /></Link>
  </header>;
}
