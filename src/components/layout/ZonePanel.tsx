'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Copy, Download, FileText, Images, Paperclip, Plus, Star, Trash2, X } from 'lucide-react';
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

function isImageEvidence(file: EvidenceFile) {
  return file.mimeType.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function ZonePanel() {
  const { zones, selectedZoneId, updateZone, deleteZone, duplicateZone } = useProjectStore();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const zone = zones.find((item) => item.id === selectedZoneId);
  const selectedZone = useMemo(() => zone ? { ...zone, attachments: zone.attachments ?? [] } : undefined, [zone]);
  const imageAttachments = useMemo(() => selectedZone?.attachments.filter((file) => file.url && isImageEvidence(file)) ?? [], [selectedZone]);
  const activeImage = imageAttachments[Math.min(galleryIndex, Math.max(imageAttachments.length - 1, 0))];

  if (!selectedZone) return <aside className="w-full border-t border-white/10 bg-graphite/80 p-5 xl:w-96 xl:border-l xl:border-t-0"><p className="text-xs uppercase tracking-[0.28em] text-muted">Panel de zona</p><h2 className="mt-2 text-xl font-semibold text-white">Selecciona o dibuja una zona</h2><p className="mt-3 text-sm text-muted">Cuando cierres un polígono en el canvas, la zona aparecerá aquí para editar nombre, estado, avance, responsable, fechas y notas.</p></aside>;


  const currentZone = selectedZone;
  function addChecklistItem() {
    const label = `Checklist ${currentZone.checklist.length + 1}`;
    updateZone(currentZone.id, { checklist: [...currentZone.checklist, { id: `check-${crypto.randomUUID()}`, label, done: false }] });
  }

  function toggleChecklistItem(itemId: string) {
    updateZone(currentZone.id, { checklist: currentZone.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)) });
  }

  function renameChecklistItem(itemId: string, label: string) {
    updateZone(currentZone.id, { checklist: currentZone.checklist.map((item) => (item.id === itemId ? { ...item, label } : item)) });
  }

  function deleteChecklistItem(itemId: string) {
    updateZone(currentZone.id, { checklist: currentZone.checklist.filter((item) => item.id !== itemId) });
  }

  function updateEvidence(fileId: string, patch: Partial<EvidenceFile>) {
    updateZone(currentZone.id, { attachments: currentZone.attachments.map((file) => (file.id === fileId ? { ...file, ...patch } : file)) });
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
      caption: '',
      createdAt: new Date().toISOString()
    }));

    updateZone(currentZone.id, { attachments: [...currentZone.attachments, ...attachments] });
  }

  function deleteEvidence(fileId: string) {
    updateZone(currentZone.id, { attachments: currentZone.attachments.filter((file) => file.id !== fileId) });
    setGalleryIndex((index) => Math.max(0, index - 1));
  }

  function moveGallery(step: number) {
    if (!imageAttachments.length) return;
    setGalleryIndex((index) => (index + step + imageAttachments.length) % imageAttachments.length);
  }

  return <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="w-full border-t border-white/10 bg-graphite/90 p-4 backdrop-blur-xl xl:w-96 xl:border-l xl:border-t-0 xl:p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-muted">Zona seleccionada</p><input value={currentZone.name} onChange={(event) => updateZone(currentZone.id, { name: event.target.value })} className="mt-1 w-full bg-transparent text-2xl font-semibold text-white outline-none" /></div><span className="rounded-xl bg-white/10 px-2 py-1 text-xs text-muted">{currentZone.id.slice(0, 12)}</span></div>
    <div className="mt-4 flex gap-2"><button onClick={() => duplicateZone(currentZone.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"><Copy className="size-4" />Duplicar</button><button onClick={() => deleteZone(currentZone.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-danger/30 px-3 py-2 text-sm text-rose-200 hover:bg-danger/10"><Trash2 className="size-4" />Eliminar</button></div>
    <div className="mt-5 grid grid-cols-2 gap-3">
      <label className="space-y-1 text-xs text-muted">Estado<select value={currentZone.status} onChange={(e) => updateZone(currentZone.id, { status: e.target.value as ZoneStatus })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white">{statuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label>
      <label className="space-y-1 text-xs text-muted">Avance<input type="number" min={0} max={100} value={currentZone.progress} onChange={(e) => updateZone(currentZone.id, { progress: Math.min(100, Math.max(0, Number(e.target.value))) })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="col-span-2 space-y-1 text-xs text-muted">Responsable<input value={currentZone.responsible} onChange={(e) => updateZone(currentZone.id, { responsible: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Inicio<input type="date" value={currentZone.startDate} onChange={(e) => updateZone(currentZone.id, { startDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="space-y-1 text-xs text-muted">Fin<input type="date" value={currentZone.endDate} onChange={(e) => updateZone(currentZone.id, { endDate: e.target.value })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></label>
      <label className="col-span-2 space-y-1 text-xs text-muted">Prioridad<select value={currentZone.priority} onChange={(e) => updateZone(currentZone.id, { priority: e.target.value as Priority })} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white">{priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label>
    </div>
    <label className="mt-4 block space-y-1 text-xs text-muted">Comentarios<textarea value={currentZone.notes} onChange={(e) => updateZone(currentZone.id, { notes: e.target.value })} className="min-h-24 w-full rounded-2xl border border-white/10 bg-obsidian p-3 text-white" /></label>
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-white">Checklist<button onClick={addChecklistItem} className="text-electric" aria-label="Agregar checklist"><Plus className="size-4" /></button></div>
      {currentZone.checklist.length ? currentZone.checklist.map((item) => <div key={item.id} className="mb-2 flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} className="accent-electric" /><input value={item.label} onChange={(event) => renameChecklistItem(item.id, event.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-obsidian px-2 py-1 text-white outline-none focus:border-electric/70" /><button type="button" onClick={() => deleteChecklistItem(item.id)} className="rounded-lg p-1 text-muted hover:bg-danger/10 hover:text-rose-200" aria-label="Eliminar item"><X className="size-4" /></button></div>) : <p className="text-sm text-muted">Sin checklist todavía.</p>}
    </section>
    <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><div className="text-sm font-semibold text-white"><Paperclip className="mb-2 size-5 text-electric" />Archivos / evidencias</div><label className="cursor-pointer rounded-xl bg-electric px-3 py-2 text-xs font-semibold text-white hover:bg-blue-400"><input type="file" multiple onChange={handleEvidenceUpload} className="hidden" />Agregar</label></div>
      {activeImage && <div className="mb-4 rounded-2xl border border-white/10 bg-obsidian p-2"><div className="relative overflow-hidden rounded-xl"><span role="img" aria-label={activeImage.caption || activeImage.name} className="block h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${activeImage.url})` }} /><button type="button" onClick={() => moveGallery(-1)} className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Imagen anterior"><ChevronLeft className="size-4" /></button><button type="button" onClick={() => moveGallery(1)} className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Imagen siguiente"><ChevronRight className="size-4" /></button><span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">{Math.min(galleryIndex + 1, imageAttachments.length)}/{imageAttachments.length}</span></div><label className="mt-2 block text-xs text-muted">Pie de foto<input value={activeImage.caption ?? ''} onChange={(event) => updateEvidence(activeImage.id, { caption: event.target.value })} placeholder="Describe qué se observa o a qué partida pertenece" className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-electric/70" /></label></div>}
      {currentZone.attachments.length ? <div className="space-y-2">{currentZone.attachments.map((file) => <div key={file.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian p-2 text-xs text-slate-300"><FileText className="size-4 shrink-0 text-electric" /><div className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{file.name}</p><p className="text-muted">{formatFileSize(file.size)}{file.caption ? ` · ${file.caption}` : ''}</p></div>{isImageEvidence(file) && <button type="button" onClick={() => setGalleryIndex(Math.max(0, imageAttachments.findIndex((image) => image.id === file.id)))} className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white" aria-label="Ver en galería"><Images className="size-4" /></button>}{file.url && <a href={file.url} download={file.name} className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white" aria-label="Descargar evidencia"><Download className="size-4" /></a>}<button type="button" onClick={() => deleteEvidence(file.id)} className="rounded-lg p-1 text-muted hover:bg-danger/10 hover:text-rose-200" aria-label="Eliminar evidencia"><X className="size-4" /></button></div>)}</div> : <p className="text-sm text-muted">Agrega fotos, reportes o evidencias de avance para esta zona.</p>}
    </section>
    <section className="mt-4 rounded-2xl border border-white/10 p-4 text-left text-sm text-white"><Star className="mb-3 size-5 text-review" />Prioridad {currentZone.priority}</section>
  </motion.aside>;
}
