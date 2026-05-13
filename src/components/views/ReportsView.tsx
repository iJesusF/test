'use client';

import { MetricCard } from '@/components/ui/MetricCard';
import { useProjectStore } from '@/store/project-store';

export function ReportsView() {
  const { project, zones, floorplans } = useProjectStore();
  const completed = zones.filter((zone) => zone.status === 'completed').length;
  const blocked = zones.filter((zone) => zone.status === 'blocked').length;
  const review = zones.filter((zone) => zone.status === 'in_review').length;
  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-4 shadow-panel backdrop-blur">
    <p className="text-xs uppercase tracking-[0.28em] text-muted">Reportes</p><h2 className="mb-4 text-lg font-semibold text-white">Reporte local del avance</h2>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Avance global" value={`${project.progress}%`} /><MetricCard label="Planos" value={String(floorplans.length)} /><MetricCard label="Completadas" value={`${completed}/${zones.length}`} /><MetricCard label="Bloqueadas" value={String(blocked)} /></div>
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">Zonas en revisión: <span className="font-semibold text-white">{review}</span>. Este reporte se calcula directamente desde el store persistido.</div>
  </section>;
}
