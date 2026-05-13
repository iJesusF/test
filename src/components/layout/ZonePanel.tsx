'use client';

import { motion } from 'framer-motion';
import { Paperclip, Plus, Star } from 'lucide-react';
import { statusLabels } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';
import type { ZoneStatus } from '@/types/domain';

const statuses = Object.keys(statusLabels) as ZoneStatus[];

export function ZonePanel() {
  const { zones, selectedZoneId, updateZone } = useProjectStore();
  const zone = zones.find((item) => item.id === selectedZoneId);
  if (!zone) return <aside className="hidden w-96 border-l border-white/10 bg-graphite/80 p-5 xl:block"><p className="text-muted">Selecciona una zona del plano.</p></aside>;
  return <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="w-full border-t border-white/10 bg-graphite/90 p-4 backdrop-blur-xl xl:w-96 xl:border-l xl:border-t-0 xl:p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-muted">Zona seleccionada</p><input value={zone.name} onChange={(event) => updateZone(zone.id, { name: event.target.value })} className="mt-1 w-full bg-transparent text-2xl font-semibold text-white outline-none" /></div><span className="rounded-xl bg-white/10 px-2 py-1 text-xs text-muted">{zone.id}</span></div>
    <div className="mt-5 grid grid-cols-2 gap-3">
      <label className="space-y-1 text-xs text-muted">Estado<select value={zone.status} onChange={(e) => updateZone(zone.id, { status: e.target.value as ZoneStatus })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
      <label className="space-y-1 text-xs text-muted">Avance<input type="number" min={0} max={100} value={zone.progress} onChange={(e) => updateZone(zone.id, { progress: Number(e.target.value) })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="col-span-2 space-y-1 text-xs text-muted">Responsable<input value={zone.responsible} onChange={(e) => updateZone(zone.id, { responsible: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Inicio<input type="date" value={zone.startDate} onChange={(e) => updateZone(zone.id, { startDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Fin<input type="date" value={zone.endDate} onChange={(e) => updateZone(zone.id, { endDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
    </div>
    <label className="mt-4 block space-y-1 text-xs text-muted">Comentarios<textarea value={zone.notes} onChange={(e) => updateZone(zone.id, { notes: e.target.value })} className="min-h-24 w-full rounded-2xl border border-white/10 bg-obsidian p-3 text-white" /></label>
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="mb-3 flex items-center justify-between text-sm font-semibold text-white">Checklist<button className="text-electric"><Plus className="size-4" /></button></div>{zone.checklist.map((item) => <label key={item.id} className="mb-2 flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={item.done} readOnly className="accent-electric" />{item.label}</label>)}</section>
    <section className="mt-4 grid grid-cols-2 gap-3"><button className="rounded-2xl border border-white/10 p-4 text-left text-sm text-white hover:bg-white/10"><Paperclip className="mb-3 size-5 text-electric" />Archivos</button><button className="rounded-2xl border border-white/10 p-4 text-left text-sm text-white hover:bg-white/10"><Star className="mb-3 size-5 text-review" />Prioridad {zone.priority}</button></section>
  </motion.aside>;
}
