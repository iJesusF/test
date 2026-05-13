'use client';

import { useState } from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { useProjectStore } from '@/store/project-store';

type ResetAction = 'zones' | 'floorplans' | 'workspace';

const resetLabels: Record<ResetAction, string> = {
  zones: 'borrar las zonas del plano activo',
  floorplans: 'borrar los planos y zonas del proyecto activo',
  workspace: 'borrar todo el estado local'
};

export function SettingsView() {
  const { project, activeFloorplanId, floorplans, zones, tasks, resetActiveFloorplanZones, resetActiveProjectFloorplans, resetWorkspace } = useProjectStore();
  const [pendingReset, setPendingReset] = useState<ResetAction>();
  const activeProjectFloorplans = project ? floorplans.filter((floorplan) => floorplan.projectId === project.id) : [];
  const activeFloorplanZones = zones.filter((zone) => zone.floorplanId === activeFloorplanId);

  function runReset(action: ResetAction) {
    if (action === 'zones') resetActiveFloorplanZones();
    if (action === 'floorplans') resetActiveProjectFloorplans();
    if (action === 'workspace') resetWorkspace();
    setPendingReset(undefined);
  }

  function ResetCard({ action, title, description, disabled = false }: { action: ResetAction; title: string; description: string; disabled?: boolean }) {
    const isPending = pendingReset === action;
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-white">{title}</h3><p className="mt-1 text-sm text-muted">{description}</p></div><RotateCcw className="size-5 text-muted" /></div>
      {isPending ? <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3"><p className="flex items-center gap-2 text-sm font-semibold text-rose-100"><ShieldAlert className="size-4" />¿Estas seguro de borrar esta informacion?</p><p className="mt-1 text-xs text-rose-200/80">Esta acción va a {resetLabels[action]}.</p><div className="mt-3 flex gap-2"><button onClick={() => runReset(action)} className="rounded-lg bg-danger px-3 py-2 text-xs font-semibold text-white">Sí, borrar</button><button onClick={() => setPendingReset(undefined)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Cancelar</button></div></div> : <button disabled={disabled} onClick={() => setPendingReset(action)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-danger/30 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"><RotateCcw className="size-4" />Reset</button>}
    </div>;
  }

  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-4 shadow-panel backdrop-blur">
    <p className="text-xs uppercase tracking-[0.28em] text-muted">Ajustes</p><h2 className="mb-4 text-lg font-semibold text-white">Workspace Vortech 360</h2>
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">Persistencia activa en <code className="rounded bg-black/40 px-2 py-1 text-white">Supabase PostgreSQL + Storage</code>. Proyecto: <span className="text-white">{project?.name ?? 'Sin proyecto'}</span>. Planos del proyecto: {activeProjectFloorplans.length}. Zonas del plano activo: {activeFloorplanZones.length}. Tareas: {tasks.length}.</div>
    <div className="mt-4 grid gap-3 lg:grid-cols-3">
      <ResetCard action="zones" title="Reset de zonas" description="Elimina únicamente las zonas y tareas del plano activo. Conserva proyecto y planos." disabled={!activeFloorplanId || !activeFloorplanZones.length} />
      <ResetCard action="floorplans" title="Reset de planos" description="Elimina los planos del proyecto activo y las zonas relacionadas. Conserva los demás proyectos." disabled={!project || !activeProjectFloorplans.length} />
      <ResetCard action="workspace" title="Reset total local" description="Limpia proyectos, planos, zonas y tareas guardadas localmente en este navegador." disabled={!floorplans.length && !zones.length && !tasks.length} />
    </div>
  </section>;
}
