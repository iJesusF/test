'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Map } from 'lucide-react';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ZonePanel } from '@/components/layout/ZonePanel';
import { GanttTimeline } from '@/components/timeline/GanttTimeline';
import { MetricCard } from '@/components/ui/MetricCard';
import { PlaceholderView } from '@/components/views/PlaceholderView';
import { ReportsView } from '@/components/views/ReportsView';
import { SettingsView } from '@/components/views/SettingsView';
import { TasksView } from '@/components/views/TasksView';
import { ZonesView } from '@/components/views/ZonesView';
import { useProjectStore } from '@/store/project-store';

const PlanCanvas = dynamic(() => import('@/components/canvas/PlanCanvas').then((mod) => mod.PlanCanvas), { ssr: false, loading: () => <div className="grid min-h-[460px] place-items-center rounded-[2rem] border border-white/10 bg-obsidian text-muted">Cargando canvas BIM…</div> });

type DashboardView = 'plan' | 'zones' | 'tasks' | 'schedule' | 'reports' | 'notes' | 'files' | 'settings';

function MainContent({ view }: { view: DashboardView }) {
  if (view === 'zones') return <ZonesView />;
  if (view === 'tasks') return <TasksView />;
  if (view === 'schedule') return <GanttTimeline />;
  if (view === 'reports') return <ReportsView />;
  if (view === 'settings') return <SettingsView />;
  if (view === 'notes') return <PlaceholderView eyebrow="Notas" title="Notas de zonas" description="Las notas se editan desde el panel lateral de cada zona y se guardan en Supabase junto con sus polígonos." />;
  if (view === 'files') return <PlaceholderView eyebrow="Archivos" title="Archivos en Supabase Storage" description="Los planos y adjuntos se guardan en buckets reales de Supabase Storage y sus metadatos quedan en PostgreSQL." />;

  return <>
    <CanvasToolbar />
    <PlanCanvas />
    <GanttTimeline />
  </>;
}

export function DashboardShell({ view = 'plan' }: { view?: DashboardView }) {
  const { project, zones, floorplans, loadWorkspace, error, isLoading } = useProjectStore();
  useEffect(() => { void loadWorkspace(); }, [loadWorkspace]);
  const blocked = zones.filter((zone) => zone.status === 'blocked').length;
  const completed = zones.filter((zone) => zone.status === 'completed').length;
  return <div className="min-h-screen bg-obsidian font-sans text-slate-200">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(54,211,255,.10),transparent_28%)]" />
    <div className="relative flex min-h-screen"><Sidebar /><main className="flex min-w-0 flex-1 flex-col"><Topbar />
      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-4 p-4 lg:p-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricCard label="Avance global" value={`${project?.progress ?? 0}%`} icon={<Activity className="size-4" />} /><MetricCard label="Zonas completas" value={`${completed}/${zones.length}`} icon={<CheckCircle2 className="size-4" />} /><MetricCard label="Bloqueos" value={String(blocked)} icon={<AlertTriangle className="size-4" />} /><MetricCard label="Planos cargados" value={String(floorplans.length)} icon={<Map className="size-4" />} /></motion.div>
          {error && <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-rose-100">{error}</div>}
          {isLoading && <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-muted">Sincronizando con Supabase…</div>}
          <MainContent view={view} />
        </div>
        <ZonePanel />
      </div>
    </main></div>
  </div>;
}
