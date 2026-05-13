'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProjectStore } from '@/store/project-store';

export function ZonesView() {
  const { zones, floorplans, selectedZoneId, setSelectedZone, deleteZone } = useProjectStore();
  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-4 shadow-panel backdrop-blur">
    <div className="mb-4 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-muted">Zonas</p><h2 className="text-lg font-semibold text-white">Zonas dibujadas</h2></div><Link href="/" className="rounded-xl bg-electric px-3 py-2 text-sm font-semibold text-white shadow-glow">Dibujar en plano</Link></div>
    {!zones.length ? <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted">Aún no hay zonas. Sube un plano y dibuja polígonos para crear zonas reales.</p> : <div className="space-y-2">{zones.map((zone) => {
      const floorplan = floorplans.find((item) => item.id === zone.floorplanId);
      return <article key={zone.id} className={`rounded-2xl border p-4 transition ${selectedZoneId === zone.id ? 'border-electric bg-electric/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
        <button onClick={() => setSelectedZone(zone.id)} className="flex w-full items-center justify-between gap-4 text-left"><div><h3 className="font-semibold text-white">{zone.name}</h3><p className="text-xs text-muted">{floorplan?.name ?? 'Plano eliminado'} · {zone.points.length} vértices</p></div><div className="flex items-center gap-3"><StatusBadge status={zone.status} /><span className="text-sm text-white">{zone.progress}%</span></div></button>
        <div className="mt-3 flex justify-end"><button onClick={() => deleteZone(zone.id)} className="rounded-xl border border-danger/30 px-3 py-2 text-xs text-rose-200 hover:bg-danger/10">Eliminar</button></div>
      </article>;
    })}</div>}
  </section>;
}
