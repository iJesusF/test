'use client';

import { Edit3, Flame, Hand, MousePointer2, PenLine } from 'lucide-react';
import { useProjectStore } from '@/store/project-store';

const tools = [ ['select', MousePointer2, 'Seleccionar'], ['draw', PenLine, 'Dibujar'], ['edit', Edit3, 'Editar'], ['pan', Hand, 'Pan'], ['heatmap', Flame, 'Heatmap'] ] as const;

export function CanvasToolbar() {
  const { toolMode, setToolMode } = useProjectStore();
  return <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur">
    {tools.map(([mode, Icon, label]) => <button key={mode} onClick={() => setToolMode(mode)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${toolMode === mode ? 'bg-electric text-white shadow-glow' : 'text-muted hover:bg-white/10 hover:text-white'}`}><Icon className="size-4" />{label}</button>)}
  </div>;
}
