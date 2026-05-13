'use client';

import { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, FileText, Paperclip, Plus, Star, Trash2, X } from 'lucide-react';
import { statusLabels } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';
import type { EvidenceFile, Priority, ZoneStatus } from '@/types/domain';

const statuses = Object.keys(statusLabels) as ZoneStatus[];
const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
const bytesInMegabyte = 1024 * 1024;

function formatFileSize(size: number) {
  if (size < bytesInMegabyte) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / bytesInMegabyte).toFixed(1)} MB`;
}

export function ZonePanel() {
  const { zones, selectedZoneId, updateZone, deleteZone, duplicateZone } = useProjectStore();
  const zone = zones.find((item) => item.id === selectedZoneId);
  if (!zone) return <aside className="w-full border-t border-white/10 bg-graphite/80 p-5 xl:w-96 xl:border-l xl:border-t-0"><p className="text-xs uppercase tracking-[0.28em] text-muted">Panel de zona</p><h2 className="mt-2 text-xl font-semibold text-white">Selecciona o dibuja una zona</h2><p className="mt-3 text-sm text-muted">Cuando cierres un polígono en el canvas, la zona aparecerá aquí para editar nombre, estado, avance, responsable, fechas y notas.</p></aside>;

  const selectedZone = { ...zone, attachments: zone.attachments ?? [] };

  function addChecklistItem() {
    const label = `Checklist ${selectedZone.checklist.length + 1}`;
    updateZone(selectedZone.id, { checklist: [...selectedZone.checklist, { id: `check-${crypto.randomUUID()}`, label, done: false }] });
  }

  function toggleChecklistItem(itemId: string) {
    updateZone(selectedZone.id, { checklist: selectedZone.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) });
  }

  function renameChecklistItem(itemId: string, label: string) {
    updateZone(selectedZone.id, { checklist: selectedZone.checklist.map((item) => (item.id === itemId ? { ...item, label } : item)) });
  }

  function deleteChecklistItem(itemId: string) {
    updateZone(selectedZone.id, { checklist: selectedZone.checklist.filter((item) => item.id !== itemId) });
  }

  function handleEvidenceUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    const attachments: EvidenceFile[] = files.map((file) => ({
      id: `evidence-${crypto.randomUUID()}`,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString()
    }));

    updateZone(selectedZone.id, { attachments: [...selectedZone.attachments, ...attachments] });
  }

  function deleteEvidence(fileId: string) {
    updateZone(selectedZone.id, { attachments: selectedZone.attachments.filter((file) => file.id !== fileId) });
  }

  return <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="w-full border-t border-white/10 bg-graphite/90 p-4 backdrop-blur-xl xl:w-96 xl:border-l xl:border-t-0 xl:p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-muted">Zona seleccionada</p><input value={selectedZone.name} onChange={(event) => updateZone(selectedZone.id, { name: event.target.value })} className="mt-1 w-full bg-transparent text-2xl font-semibold text-white outline-none" /></div><span className="rounded-xl bg-white/10 px-2 py-1 text-xs text-muted">{selectedZone.id.slice(0, 12)}</span></div>
    <div className="mt-4 flex gap-2"><button onClick={() => duplicateZone(selectedZone.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"><Copy className="size-4" />Duplicar</button><button onClick={() => deleteZone(selectedZone.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger/30 px-3 py-2 text-sm text-rose-200 hover:bg-danger/10"><Trash2 className="size-4" />Eliminar</button></div>
    <div className="mt-5 grid grid-cols-2 gap-3">
      <label className="space-y-1 text-xs text-muted">Estado<select value={selectedZone.status} onChange={(e) => updateZone(selectedZone.id, { status: e.target.value as ZoneStatus })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
      <label className="space-y-1 text-xs text-muted">Avance<input type="number" min={0} max={100} value={selectedZone.progress} onChange={(e) => updateZone(selectedZone.id, { progress: Math.min(100, Math.max(0, Number(e.target.value))) })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="col-span-2 space-y-1 text-xs text-muted">Responsable<input value={selectedZone.responsible} onChange={(e) => updateZone(selectedZone.id, { responsible: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Inicio<input type="date" value={selectedZone.startDate} onChange={(e) => updateZone(selectedZone.id, { startDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Fin<input type="date" value={selectedZone.endDate} onChange={(e) => updateZone(selectedZone.id, { endDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="col-span-2 space-y-1 text-xs text-muted">Prioridad<select value={selectedZone.priority} onChange={(e) => updateZone(selectedZone.id, { priority: e.target.value as Priority })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white">{priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
    </div>
    <label className="mt-4 block space-y-1 text-xs text-muted">Comentarios<textarea value={selectedZone.notes} onChange={(e) => updateZone(selectedZone.id, { notes: e.target.value })} className="min-h-24 w-full rounded-2xl border border-white/10 bg-obsidian p-3 text-white" /></label>
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-white">Checklist<button onClick={addChecklistItem} className="text-electric" aria-label="Agregar checklist"><Plus className="size-4" /></button></div>
      {selectedZone.checklist.length ? selectedZone.checklist.map((item) => <div key={item.id} className="mb-2 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} className="accent-electric" /><input value={item.label} onChange={(event) => renameChecklistItem(item.id, event.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-obsidian px-2 py-1 text-white outline-none focus:border-electric/70" /><button type="button" onClick={() => deleteChecklistItem(item.id)} className="rounded-lg p-1 text-muted hover:bg-danger/10 hover:text-rose-200" aria-label="Eliminar item"><X className="size-4" /></button></div>) : <p className="text-sm text-muted">Sin checklist todavía.</p>}
    </section>
    <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><div className="text-sm font-semibold text-white"><Paperclip className="mb-2 size-5 text-electric" />Archivos / evidencias</div><label className="cursor-pointer rounded-xl bg-electric px-3 py-2 text-xs font-semibold text-white hover:bg-blue-400"><input type="file" multiple onChange={handleEvidenceUpload} className="hidden" />Agregar</label></div>
      {selectedZone.attachments.length ? <div className="space-y-2">{selectedZone.attachments.map((file) => <div key={file.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian p-2 text-xs text-slate-300"><FileText className="size-4 shrink-0 text-electric" /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{file.name}</p><p className="text-muted">{formatFileSize(file.size)}</p></div>{file.url && <a href={file.url} download={file.name} className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white" aria-label="Descargar evidencia"><Download className="size-4" /></a>}<button type="button" onClick={() => deleteEvidence(file.id)} className="rounded-lg p-1 text-muted hover:bg-danger/10 hover:text-rose-200" aria-label="Eliminar evidencia"><X className="size-4" /></button></div>)}</div> : <p className="text-sm text-muted">Agrega fotos, reportes o evidencias de avance para esta zona.</p>}
    </section>
    <section className="mt-4 rounded-2xl border border-white/10 p-4 text-left text-sm text-white"><Star className="mb-3 size-5 text-review" />Prioridad {selectedZone.priority}</section>
  </motion.aside>;
}
