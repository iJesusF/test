'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { MetricCard } from '@/components/ui/MetricCard';
import { statusLabels } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';

const PlanCanvas = dynamic(() => import('@/components/canvas/PlanCanvas').then((mod) => mod.PlanCanvas), { ssr: false });

type TvView = 'plan' | 'heatmap' | 'summary';

const viewLabels: Record<TvView, string> = {
  plan: 'Plano operativo',
  heatmap: 'Heat map',
  summary: 'Resumen ejecutivo'
};

export function TvDashboard() {
  const [view, setView] = useState<TvView>('plan');
  const { project, zones, loadWorkspace, setToolMode } = useProjectStore();
  const statusBreakdown = useMemo(() => Object.entries(statusLabels).map(([status, label]) => ({ status, label, total: zones.filter((zone) => zone.status === status).length })), [zones]);

  useEffect(() => { void loadWorkspace(); }, [loadWorkspace]);
  useEffect(() => { setToolMode(view === 'heatmap' ? 'heatmap' : 'select'); }, [setToolMode, view]);

  return <main className="min-h-screen bg-obsidian p-8 text-white">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.35em] text-muted">War room / kiosk</p><h1 className="text-4xl font-black">{project?.name ?? 'Sin proyecto'}</h1></div><div className="flex items-center gap-3"><label className="text-xs uppercase tracking-[0.24em] text-muted">Vista<select value={view} onChange={(event) => setView(event.target.value as TvView)} className="ml-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm normal-case tracking-normal text-white outline-none">{Object.entries(viewLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="text-right text-muted">Modo presentación<br />TV 4K listo</div></div></div>
    <div className="mb-6 grid grid-cols-4 gap-4"><MetricCard label="Avance" value={`${project?.progress ?? 0}%`} /><MetricCard label="Zonas" value={String(zones.length)} /><MetricCard label="Completadas" value={String(zones.filter((z) => z.status === 'completed').length)} /><MetricCard label="Bloqueadas" value={String(zones.filter((z) => z.status === 'blocked').length)} /></div>
    {view === 'summary' ? <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-[2rem] border border-white/10 bg-graphite/80 p-6 shadow-panel"><h2 className="text-2xl font-bold">Estado por zona</h2><div className="mt-6 space-y-4">{statusBreakdown.map((item) => <div key={item.status}><div className="mb-2 flex justify-between text-sm"><span className="text-muted">{item.label}</span><span className="font-semibold text-white">{item.total}</span></div><div className="h-3 rounded-full bg-white/10"><div className="h-full rounded-full bg-electric" style={{ width: `${zones.length ? (item.total / zones.length) * 100 : 0}%` }} /></div></div>)}</div></div><div className="rounded-[2rem] border border-white/10 bg-graphite/80 p-6 shadow-panel"><h2 className="text-2xl font-bold">Top zonas críticas</h2><div className="mt-6 space-y-3">{zones.filter((zone) => zone.status === 'blocked' || zone.priority === 'critical').slice(0, 6).map((zone) => <div key={zone.id} className="rounded-2xl border border-white/10 bg-obsidian p-4"><div className="flex items-center justify-between"><p className="font-semibold">{zone.name}</p><span className="text-sm text-muted">{zone.progress}%</span></div><p className="mt-1 text-sm text-muted">{zone.responsible || 'Sin responsable'} · {statusLabels[zone.status]}</p></div>)}{!zones.some((zone) => zone.status === 'blocked' || zone.priority === 'critical') && <p className="text-muted">No hay zonas críticas o bloqueadas.</p>}</div></div></section> : <PlanCanvas />}
  </main>;
}
