'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Dependency, Floorplan, Project, Task, Zone, ZoneStatus } from '@/types/domain';

type ToolMode = 'select' | 'draw' | 'edit' | 'pan' | 'heatmap';

type ProjectState = {
  project: Project;
  floorplans: Floorplan[];
  activeFloorplanId?: string;
  zones: Zone[];
  tasks: Task[];
  dependencies: Dependency[];
  selectedZoneId?: string;
  hoveredZoneId?: string;
  toolMode: ToolMode;
  isFullscreen: boolean;
  setSelectedZone: (zoneId?: string) => void;
  setHoveredZone: (zoneId?: string) => void;
  setToolMode: (mode: ToolMode) => void;
  toggleFullscreen: () => void;
  addFloorplan: (floorplan: Floorplan) => void;
  setActiveFloorplan: (floorplanId: string) => void;
  updateZone: (zoneId: string, patch: Partial<Zone>) => void;
  addZone: (zone: Zone) => void;
  deleteZone: (zoneId: string) => void;
  duplicateZone: (zoneId: string) => void;
  updateTaskDates: (taskId: string, startDate: string, endDate: string) => void;
  setProjectStatus: (status: ZoneStatus) => void;
  resetWorkspace: () => void;
};

const projectId = 'local-project';

const initialProject: Project = {
  id: projectId,
  name: 'Proyecto local',
  code: 'LOCAL',
  status: 'not_started',
  progress: 0
};

function taskFromZone(zone: Zone): Task {
  return {
    id: `task-${zone.id}`,
    zoneId: zone.id,
    name: zone.name,
    status: zone.status,
    progress: zone.progress,
    startDate: zone.startDate,
    endDate: zone.endDate,
    dependencyIds: []
  };
}

function syncProjectProgress(zones: Zone[], project: Project): Project {
  const progress = zones.length ? Math.round(zones.reduce((sum, zone) => sum + zone.progress, 0) / zones.length) : 0;
  const hasBlocked = zones.some((zone) => zone.status === 'blocked');
  const allCompleted = zones.length > 0 && zones.every((zone) => zone.status === 'completed');
  return { ...project, progress, status: hasBlocked ? 'blocked' : allCompleted ? 'completed' : progress > 0 ? 'in_progress' : 'not_started' };
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      project: initialProject,
      floorplans: [],
      activeFloorplanId: undefined,
      zones: [],
      tasks: [],
      dependencies: [],
      selectedZoneId: undefined,
      hoveredZoneId: undefined,
      toolMode: 'select',
      isFullscreen: false,
      setSelectedZone: (zoneId) => set({ selectedZoneId: zoneId }),
      setHoveredZone: (zoneId) => set({ hoveredZoneId: zoneId }),
      setToolMode: (toolMode) => set({ toolMode }),
      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
      addFloorplan: (floorplan) => set((state) => ({
        floorplans: [floorplan, ...state.floorplans],
        activeFloorplanId: floorplan.id,
        selectedZoneId: undefined
      })),
      setActiveFloorplan: (floorplanId) => set({ activeFloorplanId: floorplanId, selectedZoneId: undefined }),
      updateZone: (zoneId, patch) => set((state) => {
        const zones = state.zones.map((zone) => (zone.id === zoneId ? { ...zone, ...patch } : zone));
        return {
          zones,
          project: syncProjectProgress(zones, state.project),
          tasks: state.tasks.map((task) => (task.zoneId === zoneId ? {
            ...task,
            name: patch.name ?? task.name,
            status: patch.status ?? task.status,
            progress: patch.progress ?? task.progress,
            startDate: patch.startDate ?? task.startDate,
            endDate: patch.endDate ?? task.endDate
          } : task))
        };
      }),
      addZone: (zone) => set((state) => {
        const zones = [...state.zones, zone];
        return { zones, selectedZoneId: zone.id, project: syncProjectProgress(zones, state.project), tasks: [...state.tasks, taskFromZone(zone)] };
      }),
      deleteZone: (zoneId) => set((state) => {
        const zones = state.zones.filter((zone) => zone.id !== zoneId);
        return {
          zones,
          project: syncProjectProgress(zones, state.project),
          tasks: state.tasks.filter((task) => task.zoneId !== zoneId),
          dependencies: state.dependencies.filter((dependency) => {
            const taskId = `task-${zoneId}`;
            return dependency.predecessorId !== taskId && dependency.successorId !== taskId;
          }),
          selectedZoneId: state.selectedZoneId === zoneId ? undefined : state.selectedZoneId
        };
      }),
      duplicateZone: (zoneId) => {
        const zone = get().zones.find((item) => item.id === zoneId);
        if (!zone) return;
        const id = `zone-${crypto.randomUUID()}`;
        get().addZone({ ...zone, id, name: `${zone.name} copia`, points: zone.points.map((point) => ({ x: point.x + 24, y: point.y + 24 })) });
      },
      updateTaskDates: (taskId, startDate, endDate) => set((state) => {
        const task = state.tasks.find((item) => item.id === taskId);
        return {
          tasks: state.tasks.map((item) => (item.id === taskId ? { ...item, startDate, endDate } : item)),
          zones: task ? state.zones.map((zone) => (zone.id === task.zoneId ? { ...zone, startDate, endDate } : zone)) : state.zones
        };
      }),
      setProjectStatus: (status) => set((state) => ({ project: { ...state.project, status } })),
      resetWorkspace: () => set({ project: initialProject, floorplans: [], activeFloorplanId: undefined, zones: [], tasks: [], dependencies: [], selectedZoneId: undefined, hoveredZoneId: undefined, toolMode: 'select' })
    }),
    {
      name: 'buildvision-local-workspace-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        project: state.project,
        floorplans: state.floorplans,
        activeFloorplanId: state.activeFloorplanId,
        zones: state.zones,
        tasks: state.tasks,
        dependencies: state.dependencies
      })
    }
  )
);
