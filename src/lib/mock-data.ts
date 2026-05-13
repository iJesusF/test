import type { Dependency, Floorplan, Project, Task, Zone } from '@/types/domain';

export const project: Project = { id: 'prj-001', name: 'Torre Norte · Nivel 12', code: 'TN-12', status: 'in_progress', progress: 63 };

export const floorplan: Floorplan = {
  id: 'fp-001', projectId: project.id, name: 'Arquitectónico L12 Rev C', fileUrl: '', fileType: 'image', width: 1600, height: 1000
};

export const zones: Zone[] = [
  { id: 'Z-1201', floorplanId: floorplan.id, name: 'Lobby elevadores', color: '#4f8cff', status: 'completed', progress: 100, notes: 'Pintura y plafón liberados.', responsible: 'Constructora Atlas', startDate: '2026-05-01', endDate: '2026-05-08', points: [{ x: 180, y: 180 }, { x: 520, y: 170 }, { x: 540, y: 360 }, { x: 190, y: 380 }], checklist: [{ id: 'c1', label: 'Muros cerrados', done: true }, { id: 'c2', label: 'MEP inspeccionado', done: true }], tags: ['MEP', 'acabados'], priority: 'high' },
  { id: 'Z-1202', floorplanId: floorplan.id, name: 'Sala juntas A', color: '#36d3ff', status: 'in_progress', progress: 58, notes: 'Pendiente cristal templado.', responsible: 'Equipo Interiores', startDate: '2026-05-06', endDate: '2026-05-18', points: [{ x: 620, y: 170 }, { x: 1000, y: 170 }, { x: 990, y: 420 }, { x: 620, y: 410 }], checklist: [{ id: 'c3', label: 'Piso instalado', done: true }, { id: 'c4', label: 'Cancelaría', done: false }], tags: ['interiores'], priority: 'medium' },
  { id: 'Z-1203', floorplanId: floorplan.id, name: 'Cuarto eléctrico', color: '#ff5c7a', status: 'blocked', progress: 22, notes: 'Bloqueado por tablero principal.', responsible: 'MEP Prime', startDate: '2026-05-03', endDate: '2026-05-22', points: [{ x: 1080, y: 190 }, { x: 1390, y: 210 }, { x: 1370, y: 530 }, { x: 1080, y: 500 }], checklist: [{ id: 'c5', label: 'Canalización', done: true }, { id: 'c6', label: 'Tablero energizado', done: false }], tags: ['crítico', 'MEP'], priority: 'critical' },
  { id: 'Z-1204', floorplanId: floorplan.id, name: 'Open office', color: '#ffd166', status: 'in_review', progress: 84, notes: 'Punch list en revisión.', responsible: 'QA/QC', startDate: '2026-05-02', endDate: '2026-05-14', points: [{ x: 230, y: 500 }, { x: 930, y: 490 }, { x: 920, y: 820 }, { x: 250, y: 850 }], checklist: [{ id: 'c7', label: 'Luminarias', done: true }, { id: 'c8', label: 'Prueba HVAC', done: false }], tags: ['QA'], priority: 'high' }
];

export const tasks: Task[] = zones.map((zone, index) => ({ id: `T-${index + 1}`, zoneId: zone.id, name: zone.name, status: zone.status, progress: zone.progress, startDate: zone.startDate, endDate: zone.endDate, dependencyIds: index ? [`D-${index}`] : [] }));

export const dependencies: Dependency[] = [
  { id: 'D-1', predecessorId: 'T-1', successorId: 'T-2', type: 'FS', lagDays: 1 },
  { id: 'D-2', predecessorId: 'T-2', successorId: 'T-3', type: 'SS', lagDays: 0 },
  { id: 'D-3', predecessorId: 'T-2', successorId: 'T-4', type: 'FF', lagDays: 0 }
];
