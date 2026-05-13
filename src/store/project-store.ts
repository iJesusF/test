'use client';

import { create } from 'zustand';
import type { Dependency, Floorplan, Level, Project, Task, Zone, ZoneStatus } from '@/types/domain';

type ToolMode = 'select' | 'draw' | 'edit' | 'pan' | 'heatmap';

type ProjectState = {
  project?: Project;
  projects: Project[];
  levels: Level[];
  floorplans: Floorplan[];
  activeFloorplanId?: string;
  zones: Zone[];
  tasks: Task[];
  dependencies: Dependency[];
  selectedZoneId?: string;
  hoveredZoneId?: string;
  toolMode: ToolMode;
  isFullscreen: boolean;
  isLoading: boolean;
  error?: string;
  loadWorkspace: () => Promise<void>;
  createProject: (input: { name: string; code: string }) => Promise<Project>;
  setActiveProject: (projectId: string) => Promise<void>;
  uploadFloorplan: (file: File, metadata: Pick<Floorplan, 'name' | 'fileType' | 'width' | 'height'>) => Promise<void>;
  setSelectedZone: (zoneId?: string) => void;
  setHoveredZone: (zoneId?: string) => void;
  setToolMode: (mode: ToolMode) => void;
  toggleFullscreen: () => void;
  setActiveFloorplan: (floorplanId: string) => Promise<void>;
  updateZone: (zoneId: string, patch: Partial<Zone>) => Promise<void>;
  addZone: (zone: Zone) => Promise<void>;
  deleteZone: (zoneId: string) => Promise<void>;
  duplicateZone: (zoneId: string) => Promise<void>;
  updateTaskDates: (taskId: string, startDate: string, endDate: string) => Promise<void>;
  setProjectStatus: (status: ZoneStatus) => Promise<void>;
  resetWorkspace: () => void;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? `Request failed: ${response.status}`);
  return payload.data as T;
}

function syncProjectProgress(zones: Zone[], project?: Project): Project | undefined {
  if (!project) return project;
  const progress = zones.length ? Math.round(zones.reduce((sum, zone) => sum + zone.progress, 0) / zones.length) : 0;
  const hasBlocked = zones.some((zone) => zone.status === 'blocked');
  const allCompleted = zones.length > 0 && zones.every((zone) => zone.status === 'completed');
  return { ...project, progress, status: hasBlocked ? 'blocked' : allCompleted ? 'completed' : progress > 0 ? 'in_progress' : 'not_started' };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: undefined,
  projects: [],
  levels: [],
  floorplans: [],
  activeFloorplanId: undefined,
  zones: [],
  tasks: [],
  dependencies: [],
  selectedZoneId: undefined,
  hoveredZoneId: undefined,
  toolMode: 'select',
  isFullscreen: false,
  isLoading: false,
  error: undefined,
  loadWorkspace: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const projects = await api<Project[]>('/api/projects');
      const project = projects[0];
      const [levels, floorplans, schedule] = project ? await Promise.all([
        api<Level[]>(`/api/levels?project_id=${project.id}`),
        api<Floorplan[]>(`/api/floorplans?project_id=${project.id}`),
        api<{ tasks: Task[]; dependencies: Dependency[] }>(`/api/tasks?project_id=${project.id}`)
      ]) : [[], [], { tasks: [], dependencies: [] }];
      const activeFloorplanId = floorplans[0]?.id;
      const zones = activeFloorplanId ? await api<Zone[]>(`/api/zones?floorplan_id=${activeFloorplanId}`) : [];
      set({ projects, project, levels, floorplans, activeFloorplanId, zones, tasks: schedule.tasks, dependencies: schedule.dependencies, selectedZoneId: undefined, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'No se pudo cargar Supabase.', isLoading: false });
    }
  },
  createProject: async (input) => {
    const project = await api<Project>('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, status: 'not_started', progress: 0 }) });
    set((state) => ({ projects: [project, ...state.projects], project }));
    return project;
  },
  setActiveProject: async (projectId) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project) return;
    set({ project, isLoading: true, selectedZoneId: undefined });
    try {
      const [levels, floorplans, schedule] = await Promise.all([
        api<Level[]>(`/api/levels?project_id=${project.id}`),
        api<Floorplan[]>(`/api/floorplans?project_id=${project.id}`),
        api<{ tasks: Task[]; dependencies: Dependency[] }>(`/api/tasks?project_id=${project.id}`)
      ]);
      const activeFloorplanId = floorplans[0]?.id;
      const zones = activeFloorplanId ? await api<Zone[]>(`/api/zones?floorplan_id=${activeFloorplanId}`) : [];
      set({ levels, floorplans, tasks: schedule.tasks, dependencies: schedule.dependencies, activeFloorplanId, zones, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'No se pudo cambiar de proyecto.', isLoading: false });
    }
  },
  uploadFloorplan: async (file, metadata) => {
    let project = get().project;
    if (!project) {
      project = await get().createProject({ name: 'Proyecto BuildVision', code: `BV-${Date.now()}` });
    }
    const form = new FormData();
    form.set('file', file);
    form.set('project_id', project.id);
    form.set('name', metadata.name);
    form.set('width', String(metadata.width));
    form.set('height', String(metadata.height));
    const floorplan = await api<Floorplan>('/api/floorplans', { method: 'POST', body: form });
    set((state) => ({ floorplans: [floorplan, ...state.floorplans], activeFloorplanId: floorplan.id, zones: [], selectedZoneId: undefined }));
  },
  setSelectedZone: (zoneId) => set({ selectedZoneId: zoneId }),
  setHoveredZone: (zoneId) => set({ hoveredZoneId: zoneId }),
  setToolMode: (toolMode) => set({ toolMode }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setActiveFloorplan: async (floorplanId) => {
    set({ activeFloorplanId: floorplanId, selectedZoneId: undefined, isLoading: true });
    try { const zones = await api<Zone[]>(`/api/zones?floorplan_id=${floorplanId}`); set({ zones, isLoading: false }); } catch (error) { set({ error: error instanceof Error ? error.message : 'No se pudieron cargar zonas.', isLoading: false }); }
  },
  updateZone: async (zoneId, patch) => {
    const previous = get().zones;
    const zones = previous.map((zone) => (zone.id === zoneId ? { ...zone, ...patch } : zone));
    set((state) => ({ zones, project: syncProjectProgress(zones, state.project), tasks: state.tasks.map((task) => (task.zoneId === zoneId ? { ...task, name: patch.name ?? task.name, status: patch.status ?? task.status, progress: patch.progress ?? task.progress, startDate: patch.startDate ?? task.startDate, endDate: patch.endDate ?? task.endDate } : task)) }));
    try { await api<Zone>(`/api/zones/${zoneId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }); } catch (error) { set({ zones: previous, error: error instanceof Error ? error.message : 'No se pudo guardar la zona.' }); }
  },
  addZone: async (zone) => {
    const response = await fetch('/api/zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(zone) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? 'No se pudo crear la zona.');
    const createdZone = payload.data as Zone;
    const createdTask = payload.task as Task | null | undefined;
    set((state) => { const zones = [...state.zones, createdZone]; return { zones, selectedZoneId: createdZone.id, project: syncProjectProgress(zones, state.project), tasks: createdTask ? [...state.tasks, createdTask] : state.tasks }; });
  },
  deleteZone: async (zoneId) => {
    const previous = get().zones;
    set((state) => ({ zones: state.zones.filter((zone) => zone.id !== zoneId), tasks: state.tasks.filter((task) => task.zoneId !== zoneId), selectedZoneId: state.selectedZoneId === zoneId ? undefined : state.selectedZoneId }));
    try { await fetch(`/api/zones/${zoneId}`, { method: 'DELETE' }); } catch { set({ zones: previous }); }
  },
  duplicateZone: async (zoneId) => {
    const zone = get().zones.find((item) => item.id === zoneId);
    if (!zone) return;
    await get().addZone({ ...zone, id: '', name: `${zone.name} copia`, points: zone.points.map((point) => ({ x: point.x + 24, y: point.y + 24 })) });
  },
  updateTaskDates: async (taskId, startDate, endDate) => {
    const task = get().tasks.find((item) => item.id === taskId);
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === taskId ? { ...item, startDate, endDate } : item)), zones: task ? state.zones.map((zone) => (zone.id === task.zoneId ? { ...zone, startDate, endDate } : zone)) : state.zones }));
    await api<Task>(`/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate, endDate }) });
  },
  setProjectStatus: async (status) => { const project = get().project; if (!project) return; const updated = await api<Project>(`/api/projects/${project.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); set({ project: updated }); },
  resetWorkspace: () => set({ project: undefined, projects: [], levels: [], floorplans: [], activeFloorplanId: undefined, zones: [], tasks: [], dependencies: [], selectedZoneId: undefined, hoveredZoneId: undefined, toolMode: 'select', error: undefined })
}));
