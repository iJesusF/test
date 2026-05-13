'use client';

import { RotateCcw } from 'lucide-react';
import { useProjectStore } from '@/store/project-store';

export function SettingsView() {
  const { floorplans, zones, tasks, resetWorkspace } = useProjectStore();
  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-4 shadow-panel backdrop-blur">
    <p className="text-xs uppercase tracking-[0.28em] text-muted">Ajustes</p><h2 className="mb-4 text-lg font-semibold text-white">Workspace local</h2>
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">Persistencia activa en <code className="rounded bg-black/40 px-2 py-1 text-white">localStorage/buildvision-local-workspace-v1</code>. Planos: {floorplans.length}. Zonas: {zones.length}. Tareas: {tasks.length}.</div>
    <button onClick={resetWorkspace} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-danger/30 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-danger/10"><RotateCcw className="size-4" />Borrar workspace local</button>
  </section>;
}
