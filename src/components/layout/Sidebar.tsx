'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CalendarDays, ClipboardCheck, Files, FolderKanban, Map, MessageSquare, Settings, SquareStack } from 'lucide-react';

const nav = [
  { label: 'Plano', href: '/', icon: Map },
  { label: 'Zonas', href: '/zones', icon: SquareStack },
  { label: 'Tareas', href: '/tasks', icon: ClipboardCheck },
  { label: 'Cronograma', href: '/schedule', icon: CalendarDays },
  { label: 'Reportes', href: '/reports', icon: BarChart3 },
  { label: 'Notas', href: '/notes', icon: MessageSquare },
  { label: 'Archivos', href: '/files', icon: Files },
  { label: 'Ajustes', href: '/settings', icon: Settings }
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden w-20 shrink-0 border-r border-white/10 bg-obsidian/95 p-3 lg:flex xl:w-64 xl:flex-col">
    <Link href="/" className="mb-8 flex items-center gap-3 rounded-2xl border border-electric/20 bg-electric/10 p-3 shadow-glow">
      <div className="grid size-10 place-items-center rounded-xl bg-electric text-sm font-black text-white">BV</div>
      <div className="hidden xl:block"><p className="font-semibold text-white">BuildVision</p><p className="text-xs text-muted">Visual BIM Ops</p></div>
    </Link>
    <nav className="space-y-1">
      {nav.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return <Link key={href} href={href} className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${isActive ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/[0.06] hover:text-white'}`}>
          <Icon className="size-5" /><span className="hidden xl:inline">{label}</span>
        </Link>;
      })}
    </nav>
  </aside>;
}
