import type { ZoneStatus } from '@/types/domain';

export const statusLabels: Record<ZoneStatus, string> = {
  not_started: 'Sin iniciar',
  in_progress: 'En progreso',
  in_review: 'En revisión',
  blocked: 'Bloqueado',
  completed: 'Completado'
};

export const statusColors: Record<ZoneStatus, string> = {
  not_started: '#8b98ad',
  in_progress: '#4f8cff',
  in_review: '#ffd166',
  blocked: '#ff5c7a',
  completed: '#40d875'
};

export const statusClasses: Record<ZoneStatus, string> = {
  not_started: 'bg-slate-500/15 text-slate-300 ring-slate-400/20',
  in_progress: 'bg-electric/15 text-blue-200 ring-electric/25',
  in_review: 'bg-review/15 text-yellow-200 ring-review/25',
  blocked: 'bg-danger/15 text-rose-200 ring-danger/25',
  completed: 'bg-success/15 text-emerald-200 ring-success/25'
};
