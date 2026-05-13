'use client';

import { create } from 'zustand';
import { dependencies as seedDependencies, floorplan as seedFloorplan, project as seedProject, tasks as seedTasks, zones as seedZones } from '@/lib/mock-data';
import type { Dependency, Floorplan, Project, Task, Zone, ZoneStatus } from '@/types/domain';

type ToolMode = 'select' | 'draw' | 'edit' | 'pan' | 'heatmap';

type ProjectState = {
  project: Project;
  floorplans: Floorplan[];
  activeFloorplanId: string;
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
  updateZone: (zoneId: string, patch: Partial<Zone>) => void;
  addZone: (zone: Zone) => void;
  updateTaskDates: (taskId: string, startDate: string, endDate: string) => void;
  setProjectStatus: (status: ZoneStatus) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  project: seedProject,
  floorplans: [seedFloorplan],
  activeFloorplanId: seedFloorplan.id,
  zones: seedZones,
  tasks: seedTasks,
  dependencies: seedDependencies,
  selectedZoneId: seedZones[1]?.id,
  toolMode: 'select',
  isFullscreen: false,
  setSelectedZone: (zoneId) => set({ selectedZoneId: zoneId }),
  setHoveredZone: (zoneId) => set({ hoveredZoneId: zoneId }),
  setToolMode: (toolMode) => set({ toolMode }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  updateZone: (zoneId, patch) => set((state) => ({
    zones: state.zones.map((zone) => (zone.id === zoneId ? { ...zone, ...patch } : zone)),
    tasks: state.tasks.map((task) => (task.zoneId === zoneId ? { ...task, status: patch.status ?? task.status, progress: patch.progress ?? task.progress } : task))
  })),
  addZone: (zone) => set((state) => ({ zones: [...state.zones, zone] })),
  updateTaskDates: (taskId, startDate, endDate) => set((state) => ({ tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, startDate, endDate } : task)) })),
  setProjectStatus: (status) => set((state) => ({ project: { ...state.project, status } }))
}));
