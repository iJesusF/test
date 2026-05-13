'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
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
  uploadFloorplan: (floorplan: Floorplan) => void;
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
  resetActiveFloorplanZones: () => void;
  resetActiveProjectFloorplans: () => void;
  resetWorkspace: () => void;
};

const persistenceKey = 'buildvision-upload-workspace-v2';
const legacyPersistenceKey = 'buildvision-upload-workspace-v1';
const localIdPrefix = 'local-';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? `Request failed: ${response.status}`);
  return payload.data as T;
}

function createLocalId(kind: string) {
  return `${localIdPrefix}${kind}-${crypto.randomUUID()}`;
}

function isLocalId(id?: string) {
  return !id || id.startsWith(localIdPrefix) || id.startsWith('floorplan-') || id.startsWith('zone-');
}

function createLocalTask(zone: Zone): Task {
  return { id: createLocalId('task'), zoneId: zone.id, name: zone.name, status: zone.status, progress: zone.progress, startDate: zone.startDate, endDate: zone.endDate, dependencyIds: [] };
}

function isServerBackedFloorplan(floorplan?: Floorplan) {
  return Boolean(floorplan?.storagePath && !isLocalId(floorplan.id) && !isLocalId(floorplan.projectId));
}

function getClientStorage(): StateStorage {
  if (typeof window === 'undefined') {
    return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
  }

  return {
    getItem: (name) => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, value);
      } catch {
        localStorage.removeItem(legacyPersistenceKey);
        try { localStorage.setItem(name, value); } catch { /* keep the app usable even when browser storage is full */ }
      }
    },
    removeItem: (name) => {
      try { localStorage.removeItem(name); } catch { /* noop */ }
    }
  };
}

function syncProjectProgress(zones: Zone[], project?: Project): Project | undefined {
  if (!project) return project;
  const progress = zones.length ? Math.round(zones.reduce((sum, zone) => sum + zone.progress, 0) / zones.length) : 0;
  const hasBlocked = zones.some((zone) => zone.status === 'blocked');
  const allCompleted = zones.length > 0 && zones.every((zone) => zone.status === 'completed');
  return { ...project, progress, status: hasBlocked ? 'blocked' : allCompleted ? 'completed' : progress > 0 ? 'in_progress' : 'not_started' };
}

export const useProjectStore = create<ProjectState>()(persist((set, get) => ({
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
    set({ isLoading: false, error: undefined });
  },
  createProject: async (input) => {
    try {
      const project = await api<Project>('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, status: 'not_started', progress: 0 }) });
      set((state) => ({ projects: [project, ...state.projects.filter((item) => item.id !== project.id)], project, activeFloorplanId: undefined, selectedZoneId: undefined, error: undefined }));
      return project;
    } catch {
      const project: Project = { id: createLocalId('project'), name: input.name, code: input.code, status: 'not_started', progress: 0 };
      set((state) => ({ projects: [project, ...state.projects], project, activeFloorplanId: undefined, selectedZoneId: undefined, error: undefined }));
      return project;
    }
  },
  setActiveProject: async (projectId) => {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project) return;
    set({ project, isLoading: !isLocalId(project.id), selectedZoneId: undefined, error: undefined });
    if (isLocalId(project.id)) {
      const activeFloorplanId = get().floorplans.find((item) => item.projectId === project.id)?.id;
      set({ activeFloorplanId, isLoading: false });
      return;
    }
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
  uploadFloorplan: (floorplan) => {
    set((state) => {
      const project = state.project ?? { id: createLocalId('project'), name: 'Proyecto local', code: 'LOCAL', status: 'not_started', progress: 0 } satisfies Project;
      const nextFloorplan = { ...floorplan, projectId: floorplan.projectId || project.id };
      return {
        project,
        projects: state.projects.some((item) => item.id === project.id) ? state.projects : [project, ...state.projects],
        floorplans: [nextFloorplan, ...state.floorplans.filter((item) => item.id !== nextFloorplan.id)],
        activeFloorplanId: nextFloorplan.id,
        selectedZoneId: undefined,
        error: undefined
      };
    });
  },
  setSelectedZone: (zoneId) => set({ selectedZoneId: zoneId }),
  setHoveredZone: (zoneId) => set({ hoveredZoneId: zoneId }),
  setToolMode: (toolMode) => set({ toolMode }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  setActiveFloorplan: async (floorplanId) => {
    set({ activeFloorplanId: floorplanId, selectedZoneId: undefined, isLoading: false, error: undefined });
  },
  updateZone: async (zoneId, patch) => {
    const previous = get().zones;
    const existingZone = previous.find((zone) => zone.id === zoneId);
    const zones = previous.map((zone) => (zone.id === zoneId ? { ...zone, ...patch } : zone));
    set((state) => ({ zones, project: syncProjectProgress(zones, state.project), tasks: state.tasks.map((task) => (task.zoneId === zoneId ? { ...task, name: patch.name ?? task.name, status: patch.status ?? task.status, progress: patch.progress ?? task.progress, startDate: patch.startDate ?? task.startDate, endDate: patch.endDate ?? task.endDate } : task)), error: undefined }));
    const floorplan = get().floorplans.find((item) => item.id === existingZone?.floorplanId);
    if (isLocalId(zoneId) || !isServerBackedFloorplan(floorplan)) return;
    try { await api<Zone>(`/api/zones/${zoneId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }); } catch (error) { set({ error: error instanceof Error ? `Cambios guardados localmente. Supabase no respondió: ${error.message}` : 'Cambios guardados localmente.' }); }
  },
  addZone: async (zone) => {
    const localZone = { ...zone, id: zone.id || createLocalId('zone') };
    const localTask = createLocalTask(localZone);
    set((state) => {
      const zones = [...state.zones, localZone];
      return { zones, selectedZoneId: localZone.id, project: syncProjectProgress(zones, state.project), tasks: [...state.tasks, localTask], error: undefined };
    });

    const floorplan = get().floorplans.find((item) => item.id === localZone.floorplanId);
    if (!isServerBackedFloorplan(floorplan)) return;

    try {
      const response = await fetch('/api/zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(localZone) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'No se pudo crear la zona.');
      const createdZone = payload.data as Zone;
      const createdTask = payload.task as Task | null | undefined;
      set((state) => {
        const zones = state.zones.map((item) => (item.id === localZone.id ? createdZone : item));
        return {
          zones,
          selectedZoneId: createdZone.id,
          project: syncProjectProgress(zones, state.project),
          tasks: state.tasks.map((task) => (task.id === localTask.id ? createdTask ?? { ...localTask, zoneId: createdZone.id } : task)),
          error: undefined
        };
      });
    } catch (error) {
      set({ error: error instanceof Error ? `Zona guardada localmente. Supabase no respondió: ${error.message}` : 'Zona guardada localmente.' });
    }
  },
  deleteZone: async (zoneId) => {
    const previous = get().zones;
    const existingZone = previous.find((zone) => zone.id === zoneId);
    set((state) => ({ zones: state.zones.filter((zone) => zone.id !== zoneId), tasks: state.tasks.filter((task) => task.zoneId !== zoneId), selectedZoneId: state.selectedZoneId === zoneId ? undefined : state.selectedZoneId, error: undefined }));
    const floorplan = get().floorplans.find((item) => item.id === existingZone?.floorplanId);
    if (isLocalId(zoneId) || !isServerBackedFloorplan(floorplan)) return;
    try { await fetch(`/api/zones/${zoneId}`, { method: 'DELETE' }); } catch { set({ zones: previous, error: 'No se pudo eliminar la zona en Supabase.' }); }
  },
  duplicateZone: async (zoneId) => {
    const zone = get().zones.find((item) => item.id === zoneId);
    if (!zone) return;
    await get().addZone({ ...zone, id: createLocalId('zone'), name: `${zone.name} copia`, points: zone.points.map((point) => ({ x: point.x + 24, y: point.y + 24 })) });
  },
  updateTaskDates: async (taskId, startDate, endDate) => {
    const task = get().tasks.find((item) => item.id === taskId);
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === taskId ? { ...item, startDate, endDate } : item)), zones: task ? state.zones.map((zone) => (zone.id === task.zoneId ? { ...zone, startDate, endDate } : zone)) : state.zones }));
    if (isLocalId(taskId)) return;
    await api<Task>(`/api/tasks/${taskId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate, endDate }) });
  },
  setProjectStatus: async (status) => {
    const project = get().project;
    if (!project) return;
    set({ project: { ...project, status } });
    if (isLocalId(project.id)) return;
    try {
      const updated = await api<Project>(`/api/projects/${project.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      set({ project: updated, projects: get().projects.map((item) => (item.id === updated.id ? updated : item)) });
    } catch (error) {
      set({ error: error instanceof Error ? `Estado guardado localmente. Supabase no respondió: ${error.message}` : 'Estado guardado localmente.' });
    }
  },
  resetActiveFloorplanZones: () => {
    const activeFloorplanId = get().activeFloorplanId;
    if (!activeFloorplanId) return;
    set((state) => {
      const removedZoneIds = new Set(state.zones.filter((zone) => zone.floorplanId === activeFloorplanId).map((zone) => zone.id));
      const zones = state.zones.filter((zone) => zone.floorplanId !== activeFloorplanId);
      return {
        zones,
        tasks: state.tasks.filter((task) => !removedZoneIds.has(task.zoneId)),
        selectedZoneId: undefined,
        hoveredZoneId: undefined,
        project: syncProjectProgress(zones, state.project),
        error: undefined
      };
    });
  },
  resetActiveProjectFloorplans: () => {
    const project = get().project;
    if (!project) return;
    set((state) => {
      const removedFloorplanIds = new Set(state.floorplans.filter((floorplan) => floorplan.projectId === project.id).map((floorplan) => floorplan.id));
      const removedZoneIds = new Set(state.zones.filter((zone) => removedFloorplanIds.has(zone.floorplanId)).map((zone) => zone.id));
      const zones = state.zones.filter((zone) => !removedZoneIds.has(zone.id));
      return {
        floorplans: state.floorplans.filter((floorplan) => !removedFloorplanIds.has(floorplan.id)),
        activeFloorplanId: removedFloorplanIds.has(state.activeFloorplanId ?? '') ? undefined : state.activeFloorplanId,
        zones,
        tasks: state.tasks.filter((task) => !removedZoneIds.has(task.zoneId)),
        selectedZoneId: undefined,
        hoveredZoneId: undefined,
        project: syncProjectProgress(zones, state.project),
        error: undefined
      };
    });
  },
  resetWorkspace: () => {
    try {
      localStorage.removeItem(persistenceKey);
      localStorage.removeItem(legacyPersistenceKey);
    } catch { /* noop */ }
    set({ project: undefined, projects: [], levels: [], floorplans: [], activeFloorplanId: undefined, zones: [], tasks: [], dependencies: [], selectedZoneId: undefined, hoveredZoneId: undefined, toolMode: 'select', error: undefined });
  }
}), {
  name: persistenceKey,
  storage: createJSONStorage(getClientStorage),
  partialize: (state) => ({
    project: state.project,
    projects: state.projects,
    levels: state.levels,
    floorplans: state.floorplans.map((floorplan) => ({ ...floorplan, fileUrl: floorplan.fileUrl.startsWith('data:') ? '' : floorplan.fileUrl })),
    activeFloorplanId: state.activeFloorplanId,
    zones: state.zones.map((zone) => ({ ...zone, attachments: (zone.attachments ?? []).map((file) => ({ ...file, url: file.url?.startsWith('blob:') ? undefined : file.url })) })),
    tasks: state.tasks,
    dependencies: state.dependencies
  })
}));
