'use client';

import { motion } from 'framer-motion';
import { Copy, Paperclip, Plus, Star, Trash2 } from 'lucide-react';
import { statusLabels } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';
import type { Priority, ZoneStatus } from '@/types/domain';

const statuses = Object.keys(statusLabels) as ZoneStatus[];
const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];

export function ZonePanel() {
  const { zones, selectedZoneId, updateZone, deleteZone, duplicateZone } = useProjectStore();
  const zone = zones.find((item) => item.id === selectedZoneId);
  if (!zone) return <aside className="w-full border-t border-white/10 bg-graphite/80 p-5 xl:w-96 xl:border-l xl:border-t-0"><p className="text-xs uppercase tracking-[0.28em] text-muted">Panel de zona</p><h2 className="mt-2 text-xl font-semibold text-white">Selecciona o dibuja una zona</h2><p className="mt-3 text-sm text-muted">Cuando cierres un polígono en el canvas, la zona aparecerá aquí para editar nombre, estado, avance, responsable, fechas y notas.</p></aside>;

  const selectedZone = zone;

  function addChecklistItem() {
    const label = `Checklist ${selectedZone.checklist.length + 1}`;
    updateZone(selectedZone.id, { checklist: [...selectedZone.checklist, { id: `check-${crypto.randomUUID()}`, label, done: false }] });
  }

  function toggleChecklistItem(itemId: string) {
    updateZone(selectedZone.id, { checklist: selectedZone.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) });
  }

  return <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="w-full border-t border-white/10 bg-graphite/90 p-4 backdrop-blur-xl xl:w-96 xl:border-l xl:border-t-0 xl:p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-muted">Zona seleccionada</p><input value={zone.name} onChange={(event) => updateZone(zone.id, { name: event.target.value })} className="mt-1 w-full bg-transparent text-2xl font-semibold text-white outline-none" /></div><span className="rounded-xl bg-white/10 px-2 py-1 text-xs text-muted">{zone.id.slice(0, 12)}</span></div>
    <div className="mt-4 flex gap-2"><button onClick={() => duplicateZone(zone.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"><Copy className="size-4" />Duplicar</button><button onClick={() => deleteZone(zone.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger/30 px-3 py-2 text-sm text-rose-200 hover:bg-danger/10"><Trash2 className="size-4" />Eliminar</button></div>
    <div className="mt-5 grid grid-cols-2 gap-3">
      <label className="space-y-1 text-xs text-muted">Estado<select value={zone.status} onChange={(e) => updateZone(zone.id, { status: e.target.value as ZoneStatus })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
      <label className="space-y-1 text-xs text-muted">Avance<input type="number" min={0} max={100} value={zone.progress} onChange={(e) => updateZone(zone.id, { progress: Math.min(100, Math.max(0, Number(e.target.value))) })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="col-span-2 space-y-1 text-xs text-muted">Responsable<input value={zone.responsible} onChange={(e) => updateZone(zone.id, { responsible: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Inicio<input type="date" value={zone.startDate} onChange={(e) => updateZone(zone.id, { startDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Fin<input type="date" value={zone.endDate} onChange={(e) => updateZone(zone.id, { endDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="col-span-2 space-y-1 text-xs text-muted">Prioridad<select value={zone.priority} onChange={(e) => updateZone(zone.id, { priority: e.target.value as Priority })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white">{priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
    </div>
    <label className="mt-4 block space-y-1 text-xs text-muted">Comentarios<textarea value={zone.notes} onChange={(e) => updateZone(zone.id, { notes: e.target.value })} className="min-h-24 w-full rounded-2xl border border-white/10 bg-obsidian p-3 text-white" /></label>
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="mb-3 flex items-center justify-between text-sm font-semibold text-white">Checklist<button onClick={addChecklistItem} className="text-electric"><Plus className="size-4" /></button></div>{zone.checklist.length ? zone.checklist.map((item) => <label key={item.id} className="mb-2 flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} className="accent-electric" />{item.label}</label>) : <p className="text-sm text-muted">Sin checklist todavía.</p>}</section>
    <section className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 p-4 text-left text-sm text-white"><Paperclip className="mb-3 size-5 text-electric" />Archivos Supabase</div><div className="rounded-2xl border border-white/10 p-4 text-left text-sm text-white"><Star className="mb-3 size-5 text-review" />Prioridad {zone.priority}</div></section>
  </motion.aside>;
}
