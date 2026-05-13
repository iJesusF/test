'use client';

/* eslint-disable @next/next/no-img-element */
import { ChangeEvent, useMemo, useState } from 'react';
import { Download, ImagePlus, Printer } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { addDays, differenceInCalendarDays, formatDate } from '@/lib/date';
import { statusColors, statusLabels } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';
import type { EvidenceFile, Floorplan, Task, Zone } from '@/types/domain';

function isImageEvidence(file: EvidenceFile) {
  return Boolean(file.url) && (file.mimeType.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name));
}

function polygonPoints(zone: Zone) {
  return zone.points.map((point) => `${point.x},${point.y}`).join(' ');
}

function ReportGantt({ tasks }: { tasks: Task[] }) {
  const sortedDates = tasks.flatMap((task) => [new Date(task.startDate), new Date(task.endDate)]).sort((a, b) => a.getTime() - b.getTime());
  const start = sortedDates[0] ? addDays(sortedDates[0], -1) : new Date();
  const end = sortedDates.at(-1) ?? addDays(start, 14);
  const dayCount = Math.max(7, differenceInCalendarDays(end, start) + 3);

  return <div className="space-y-3">
    {tasks.length ? tasks.map((task) => {
      const offset = Math.max(0, differenceInCalendarDays(new Date(task.startDate), start));
      const span = Math.max(1, differenceInCalendarDays(new Date(task.endDate), new Date(task.startDate)) + 1);
      return <div key={task.id} className="grid grid-cols-[170px_1fr] items-center gap-3 text-xs">
        <div><p className="font-semibold text-slate-900">{task.name}</p><p className="text-slate-500">{formatDate(new Date(task.startDate))} – {formatDate(new Date(task.endDate))}</p></div>
        <div className="relative h-7 rounded-full bg-slate-100">
          <div className="absolute top-1 h-5 rounded-full" style={{ left: `${(offset / dayCount) * 100}%`, width: `${Math.min(100, (span / dayCount) * 100)}%`, background: `${statusColors[task.status]}55`, border: `1px solid ${statusColors[task.status]}` }}><div className="h-full rounded-full" style={{ width: `${task.progress}%`, background: statusColors[task.status] }} /></div>
        </div>
      </div>;
    }) : <p className="text-sm text-slate-500">No hay tareas generadas todavía.</p>}
  </div>;
}

function PlanWithZones({ floorplan, zones }: { floorplan?: Floorplan; zones: Zone[] }) {
  if (!floorplan) return <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 text-slate-500">Selecciona o sube un plano para generar el reporte.</div>;

  return <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
    {floorplan.fileUrl ? <img src={floorplan.fileUrl} alt={floorplan.name} className="block w-full" /> : <div className="grid min-h-72 place-items-center bg-slate-100 p-8 text-center text-sm text-slate-500">La miniatura local de este plano ya no está disponible en este navegador. Vuelve a subir el plano para incluirlo en el PDF.</div>}
    <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${floorplan.width} ${floorplan.height}`} preserveAspectRatio="none" aria-hidden="true">
      {zones.map((zone) => <g key={zone.id}><polygon points={polygonPoints(zone)} fill={`${zone.color}55`} stroke={statusColors[zone.status]} strokeWidth={6} /><text x={zone.points[0]?.x ?? 0} y={(zone.points[0]?.y ?? 0) - 14} fill="#0f172a" fontSize="34" fontWeight="700">{zone.name} · {zone.progress}%</text></g>)}
    </svg>
  </div>;
}

export function ReportsView() {
  const { project, floorplans, activeFloorplanId, zones, tasks } = useProjectStore();
  const projectFloorplans = useMemo(() => project ? floorplans.filter((floorplan) => floorplan.projectId === project.id) : floorplans, [floorplans, project]);
  const [reportFloorplanId, setReportFloorplanId] = useState(activeFloorplanId ?? projectFloorplans[0]?.id ?? '');
  const [preparedBy, setPreparedBy] = useState('');
  const [reviewedBy, setReviewedBy] = useState('');
  const [logoUrl, setLogoUrl] = useState<string>();
  const reportFloorplan = projectFloorplans.find((floorplan) => floorplan.id === reportFloorplanId) ?? projectFloorplans[0];
  const reportZones = zones.filter((zone) => zone.floorplanId === reportFloorplan?.id);
  const reportTasks = tasks.filter((task) => reportZones.some((zone) => zone.id === task.zoneId));
  const completed = reportZones.filter((zone) => zone.status === 'completed').length;
  const blocked = reportZones.filter((zone) => zone.status === 'blocked').length;
  const review = reportZones.filter((zone) => zone.status === 'in_review').length;
  const photographicEvidence = reportZones.flatMap((zone) => (zone.attachments ?? []).filter(isImageEvidence).map((file) => ({ zone, file })));
  const globalProgress = reportZones.length ? Math.round(reportZones.reduce((sum, zone) => sum + zone.progress, 0) / reportZones.length) : 0;

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function printReport() {
    window.print();
  }

  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-4 shadow-panel backdrop-blur">
    <style>{`@media print { body { background: white !important; } aside, header, .no-print { display: none !important; } .print-report { display: block !important; } main { display: block !important; } .print-break { break-before: page; } }`}</style>
    <div className="no-print">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-muted">Reportes</p><h2 className="text-lg font-semibold text-white">Generador de reporte PDF</h2><p className="mt-1 text-sm text-muted">Genera un PDF imprimible con plano, zonas, Gantt, evidencias fotográficas y área para firma física.</p></div><button onClick={printReport} className="inline-flex items-center gap-2 rounded-xl bg-electric px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-blue-400"><Printer className="size-4" />Imprimir / Guardar PDF</button></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Avance del plano" value={`${globalProgress}%`} /><MetricCard label="Zonas" value={String(reportZones.length)} /><MetricCard label="Completadas" value={`${completed}/${reportZones.length}`} /><MetricCard label="Bloqueadas" value={String(blocked)} /></div>
      <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-xs text-muted">Plano / nivel<select value={reportFloorplan?.id ?? ''} onChange={(event) => setReportFloorplanId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white outline-none">{projectFloorplans.map((floorplan) => <option key={floorplan.id} value={floorplan.id}>{floorplan.name}</option>)}</select></label>
        <label className="space-y-1 text-xs text-muted">Responsable del trabajo<input value={preparedBy} onChange={(event) => setPreparedBy(event.target.value)} placeholder="Nombre / empresa" className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white outline-none" /></label>
        <label className="space-y-1 text-xs text-muted">Encargado de revisión<input value={reviewedBy} onChange={(event) => setReviewedBy(event.target.value)} placeholder="Nombre / empresa" className="w-full rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white outline-none" /></label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /><ImagePlus className="size-4" />Logo del reporte</label>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">Zonas en revisión: <span className="font-semibold text-white">{review}</span>. Al presionar imprimir, selecciona “Guardar como PDF” en el diálogo del navegador.</div>
    </div>

    <article className="print-report mt-6 hidden rounded-2xl bg-white p-8 text-slate-900 print:mt-0 print:rounded-none print:p-0">
      <header className="mb-6 flex items-start justify-between border-b border-slate-200 pb-4">
        <div>{logoUrl ? <img src={logoUrl} alt="Logo del reporte" className="mb-3 max-h-20 max-w-48 object-contain" /> : <div className="mb-3 grid h-16 w-40 place-items-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">Logo</div>}<h1 className="text-3xl font-black">Reporte de avance y calidad</h1><p className="mt-1 text-sm text-slate-500">{project?.name ?? 'Sin proyecto'} · {reportFloorplan?.name ?? 'Sin plano'} · {new Date().toLocaleDateString('es-MX')}</p></div>
        <div className="text-right text-sm"><p><b>Responsable:</b> {preparedBy || 'Pendiente'}</p><p><b>Revisión:</b> {reviewedBy || 'Pendiente'}</p><p><b>Avance:</b> {globalProgress}%</p></div>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-bold">Plano original con zonas marcadas</h2>
        <PlanWithZones floorplan={reportFloorplan} zones={reportZones} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">Lista de zonas</h2>
        <table className="w-full border-collapse text-sm"><thead><tr className="bg-slate-100 text-left"><th className="border border-slate-200 p-2">Zona</th><th className="border border-slate-200 p-2">Estado</th><th className="border border-slate-200 p-2">Avance</th><th className="border border-slate-200 p-2">Responsable</th><th className="border border-slate-200 p-2">Fechas</th></tr></thead><tbody>{reportZones.map((zone) => <tr key={zone.id}><td className="border border-slate-200 p-2 font-semibold">{zone.name}</td><td className="border border-slate-200 p-2">{statusLabels[zone.status]}</td><td className="border border-slate-200 p-2">{zone.progress}%</td><td className="border border-slate-200 p-2">{zone.responsible || '—'}</td><td className="border border-slate-200 p-2">{zone.startDate} – {zone.endDate}</td></tr>)}</tbody></table>
      </section>

      <section className="mt-8 print-break">
        <h2 className="mb-3 text-xl font-bold">Gantt del plano</h2>
        <ReportGantt tasks={reportTasks} />
      </section>

      <section className="mt-8 print-break">
        <h2 className="mb-3 text-xl font-bold">Reporte fotográfico</h2>
        {photographicEvidence.length ? <div className="grid grid-cols-2 gap-4">{photographicEvidence.map(({ zone, file }) => <figure key={file.id} className="break-inside-avoid rounded-2xl border border-slate-200 p-3"><img src={file.url} alt={file.caption || file.name} className="h-56 w-full rounded-xl object-cover" /><figcaption className="mt-2 text-sm"><b>{zone.name}</b><br />{file.caption || 'Sin pie de foto'}<br /><span className="text-xs text-slate-500">{file.name}</span></figcaption></figure>)}</div> : <p className="text-sm text-slate-500">No hay evidencias fotográficas para las zonas de este plano.</p>}
      </section>

      <section className="mt-12 grid grid-cols-2 gap-12 print-break">
        <div className="pt-20"><div className="border-t border-slate-900 pt-2 text-center text-sm font-semibold">Firma responsable del trabajo</div><p className="mt-2 text-center text-xs text-slate-500">{preparedBy || 'Nombre y firma'}</p></div>
        <div className="pt-20"><div className="border-t border-slate-900 pt-2 text-center text-sm font-semibold">Firma encargado de revisión</div><p className="mt-2 text-center text-xs text-slate-500">{reviewedBy || 'Nombre y firma'}</p></div>
      </section>
    </article>

    <button onClick={printReport} className="no-print mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"><Download className="size-4" />Generar PDF</button>
  </section>;
}
