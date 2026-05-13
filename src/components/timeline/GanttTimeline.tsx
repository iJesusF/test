'use client';

import { addDays, differenceInCalendarDays, formatDate } from '@/lib/date';
import { statusColors } from '@/lib/status';
import { useProjectStore } from '@/store/project-store';

const columnWidth = 56;
const rowHeight = 46;
const start = new Date('2026-05-01T00:00:00Z');
const days = Array.from({ length: 28 }, (_, index) => addDays(start, index));

export function GanttTimeline() {
  const { tasks, dependencies } = useProjectStore();
  const height = tasks.length * rowHeight + 44;
  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-4 shadow-panel backdrop-blur">
    <div className="mb-4 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-muted">Cronograma</p><h2 className="text-lg font-semibold text-white">Gantt con dependencias MS Project</h2></div><div className="rounded-xl border border-white/10 px-3 py-2 text-sm text-muted">Semana / Mes</div></div>
    <div className="overflow-x-auto"><div className="grid min-w-[1060px] grid-cols-[220px_1fr]">
      <div className="border-r border-white/10 pr-3 pt-9">{tasks.map((task) => <div key={task.id} className="flex h-[46px] items-center justify-between border-t border-white/5 text-sm"><span className="truncate text-white">{task.name}</span><span className="text-muted">{task.progress}%</span></div>)}</div>
      <div className="relative" style={{ height }}>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, ${columnWidth}px)` }}>{days.map((day) => <div key={day.toISOString()} className="border-r border-white/5 text-center text-xs text-muted"><div className="mb-2">{formatDate(day)}</div><div className="h-[calc(100%-1.5rem)] border-t border-white/10" /></div>)}</div>
        <svg className="pointer-events-none absolute left-0 top-8" width={days.length * columnWidth} height={height - 32}>{dependencies.map((dep) => {
          const fromIndex = tasks.findIndex((task) => task.id === dep.predecessorId); const toIndex = tasks.findIndex((task) => task.id === dep.successorId); if (fromIndex < 0 || toIndex < 0) return null;
          const fromTask = tasks[fromIndex]; const toTask = tasks[toIndex];
          const fromEnd = differenceInCalendarDays(new Date(fromTask.endDate), start) * columnWidth + columnWidth;
          const toStart = differenceInCalendarDays(new Date(toTask.startDate), start) * columnWidth;
          const y1 = fromIndex * rowHeight + 23; const y2 = toIndex * rowHeight + 23; const mid = Math.max(fromEnd + 18, toStart - 18);
          return <g key={dep.id}><path d={`M ${fromEnd} ${y1} L ${mid} ${y1} L ${mid} ${y2} L ${toStart} ${y2}`} fill="none" stroke="#7aa7ff" strokeWidth="2" strokeDasharray={dep.type === 'SS' ? '5 5' : undefined} /><circle cx={toStart} cy={y2} r="4" fill="#7aa7ff" /><text x={mid + 4} y={(y1 + y2) / 2 - 4} fill="#8b98ad" fontSize="10">{dep.type}</text></g>;
        })}</svg>
        <div className="absolute left-0 top-8">{tasks.map((task, index) => { const offset = differenceInCalendarDays(new Date(task.startDate), start) * columnWidth; const span = Math.max(1, differenceInCalendarDays(new Date(task.endDate), new Date(task.startDate)) + 1) * columnWidth; return <div key={task.id} className="absolute flex items-center" style={{ left: offset, top: index * rowHeight + 8, width: span }}><div className="h-7 w-full rounded-full border border-white/15 p-1 shadow-glow" style={{ background: `${statusColors[task.status]}33` }}><div className="h-full rounded-full" style={{ width: `${task.progress}%`, background: statusColors[task.status] }} /></div></div>; })}</div>
      </div>
    </div></div>
  </section>;
}
