'use client';

import { BarChart3, CalendarDays, ClipboardCheck, Files, FolderKanban, Map, MessageSquare, Settings, SquareStack } from 'lucide-react';

const nav = [
  ['Plano', Map], ['Zonas', SquareStack], ['Tareas', ClipboardCheck], ['Cronograma', CalendarDays], ['Reportes', BarChart3], ['Notas', MessageSquare], ['Archivos', Files], ['Ajustes', Settings]
] as const;

export function Sidebar() {
  return <aside className="hidden w-20 shrink-0 border-r border-white/10 bg-obsidian/95 p-3 lg:flex xl:w-64 xl:flex-col">
    <div className="mb-8 flex items-center gap-3 rounded-2xl border border-electric/20 bg-electric/10 p-3 shadow-glow">
      <div className="grid size-10 place-items-center rounded-xl bg-electric text-sm font-black text-white">BV</div>
      <div className="hidden xl:block"><p className="font-semibold text-white">BuildVision</p><p className="text-xs text-muted">Visual BIM Ops</p></div>
    </div>
    <nav className="space-y-1">
      {nav.map(([label, Icon], index) => <button key={label} className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${index === 0 ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/[0.06] hover:text-white'}`}>
        <Icon className="size-5" /><span className="hidden xl:inline">{label}</span>
      </button>)}
    </nav>
  </aside>;
}
