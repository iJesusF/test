'use client';

import dynamic from 'next/dynamic';
import { MetricCard } from '@/components/ui/MetricCard';
import { useProjectStore } from '@/store/project-store';

const PlanCanvas = dynamic(() => import('@/components/canvas/PlanCanvas').then((mod) => mod.PlanCanvas), { ssr: false });

export function TvDashboard() {
  const { project, zones } = useProjectStore();
  return <main className="min-h-screen bg-obsidian p-8 text-white">
    <div className="mb-6 flex items-center justify-between"><div><p className="text-sm uppercase tracking-[0.35em] text-muted">War room / kiosk</p><h1 className="text-4xl font-black">{project.name}</h1></div><div className="text-right text-muted">Modo presentación<br />TV 4K listo</div></div>
    <div className="mb-6 grid grid-cols-4 gap-4"><MetricCard label="Avance" value={`${project.progress}%`} /><MetricCard label="Zonas" value={String(zones.length)} /><MetricCard label="Completadas" value={String(zones.filter((z) => z.status === 'completed').length)} /><MetricCard label="Bloqueadas" value={String(zones.filter((z) => z.status === 'blocked').length)} /></div>
    <PlanCanvas />
  </main>;
}
