'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, Map } from 'lucide-react';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { ZonePanel } from '@/components/layout/ZonePanel';
import { GanttTimeline } from '@/components/timeline/GanttTimeline';
import { MetricCard } from '@/components/ui/MetricCard';
import { useProjectStore } from '@/store/project-store';

const PlanCanvas = dynamic(() => import('@/components/canvas/PlanCanvas').then((mod) => mod.PlanCanvas), { ssr: false, loading: () => <div className="grid min-h-[460px] place-items-center rounded-[2rem] border border-white/10 bg-obsidian text-muted">Cargando canvas BIM…</div> });

export function DashboardShell() {
  const { project, zones, floorplans } = useProjectStore();
  const blocked = zones.filter((zone) => zone.status === 'blocked').length;
  const completed = zones.filter((zone) => zone.status === 'completed').length;
  return <div className="min-h-screen bg-obsidian font-sans text-slate-200">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(54,211,255,.10),transparent_28%)]" />
    <div className="relative flex min-h-screen"><Sidebar /><main className="flex min-w-0 flex-1 flex-col"><Topbar />
      <div className="grid flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-4 p-4 lg:p-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricCard label="Avance global" value={`${project.progress}%`} icon={<Activity className="size-4" />} /><MetricCard label="Zonas completas" value={`${completed}/${zones.length}`} icon={<CheckCircle2 className="size-4" />} /><MetricCard label="Bloqueos" value={String(blocked)} icon={<AlertTriangle className="size-4" />} /><MetricCard label="Planos cargados" value={String(floorplans.length)} icon={<Map className="size-4" />} /></motion.div>
          <CanvasToolbar />
          <PlanCanvas />
          <GanttTimeline />
        </div>
        <ZonePanel />
      </div>
    </main></div>
  </div>;
}
