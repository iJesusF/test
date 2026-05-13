'use client';

import { Expand, MonitorUp, Settings, UploadCloud } from 'lucide-react';
import { useProjectStore } from '@/store/project-store';
import { StatusBadge } from '@/components/ui/StatusBadge';

export function Topbar() {
  const { project, floorplans, activeFloorplanId, toggleFullscreen } = useProjectStore();
  const floorplan = floorplans.find((item) => item.id === activeFloorplanId);
  return <header className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-graphite/80 px-4 py-3 backdrop-blur-xl lg:px-6">
    <div className="min-w-0 flex-1"><p className="text-xs uppercase tracking-[0.28em] text-muted">Proyecto activo</p><h1 className="truncate text-lg font-semibold text-white">{project.name}</h1></div>
    <StatusBadge status={project.status} />
    <select className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none"><option>{floorplan?.name}</option></select>
    <button className="inline-flex items-center gap-2 rounded-xl bg-electric px-3 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"><UploadCloud className="size-4" />Subir plano</button>
    <a href="/tv" className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10 md:inline-flex"><MonitorUp className="size-4" />TV</a>
    <button onClick={toggleFullscreen} className="rounded-xl border border-white/10 p-2 text-white hover:bg-white/10"><Expand className="size-4" /></button>
    <button className="rounded-xl border border-white/10 p-2 text-white hover:bg-white/10"><Settings className="size-4" /></button>
  </header>;
}
