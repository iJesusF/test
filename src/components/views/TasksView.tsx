'use client';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProjectStore } from '@/store/project-store';

export function TasksView() {
  const { tasks, updateTaskDates } = useProjectStore();
  return <section className="rounded-[2rem] border border-white/10 bg-graphite/80 p-4 shadow-panel backdrop-blur">
    <p className="text-xs uppercase tracking-[0.28em] text-muted">Tareas</p><h2 className="mb-4 text-lg font-semibold text-white">Tareas reales derivadas de zonas</h2>
    {!tasks.length ? <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted">Cada zona creada en el canvas genera una tarea editable aquí.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.18em] text-muted"><tr><th className="p-3">Tarea</th><th className="p-3">Estado</th><th className="p-3">Avance</th><th className="p-3">Inicio</th><th className="p-3">Fin</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="border-t border-white/10"><td className="p-3 font-medium text-white">{task.name}</td><td className="p-3"><StatusBadge status={task.status} /></td><td className="p-3 text-white">{task.progress}%</td><td className="p-3"><input type="date" value={task.startDate} onChange={(event) => updateTaskDates(task.id, event.target.value, task.endDate)} className="rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></td><td className="p-3"><input type="date" value={task.endDate} onChange={(event) => updateTaskDates(task.id, task.startDate, event.target.value)} className="rounded-xl border border-white/10 bg-obsidian px-3 py-2 text-white" /></td></tr>)}</tbody></table></div>}
  </section>;
}
