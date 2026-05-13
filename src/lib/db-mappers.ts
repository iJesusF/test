import type { Dependency, Floorplan, Level, Project, Task, Zone } from '@/types/domain';

export function projectFromDb(row: any): Project {
  return { id: row.id, name: row.name, code: row.code, status: row.status, progress: Number(row.progress ?? 0) };
}

export function levelFromDb(row: any): Level {
  return { id: row.id, projectId: row.project_id, name: row.name, elevation: row.elevation ?? undefined, sortOrder: row.sort_order ?? 0 };
}

export function floorplanFromDb(row: any): Floorplan {
  return { id: row.id, projectId: row.project_id, levelId: row.level_id ?? undefined, name: row.name, fileUrl: row.public_url, storagePath: row.storage_path, fileType: row.file_type, width: row.width ?? 1, height: row.height ?? 1 };
}

export function zoneFromDb(row: any): Zone {
  return { id: row.id, floorplanId: row.floorplan_id, name: row.name, color: row.color, status: row.status, progress: Number(row.progress ?? 0), notes: row.notes ?? '', responsible: row.responsible ?? '', startDate: row.start_date ?? new Date().toISOString().slice(0, 10), endDate: row.end_date ?? new Date().toISOString().slice(0, 10), points: row.polygon ?? [], checklist: row.checklist ?? [], tags: row.tags ?? [], priority: row.priority ?? 'medium' };
}

export function taskFromDb(row: any): Task {
  return { id: row.id, zoneId: row.zone_id, name: row.name, status: row.status, progress: Number(row.progress ?? 0), startDate: row.start_date, endDate: row.end_date, dependencyIds: row.dependency_ids ?? [] };
}

export function dependencyFromDb(row: any): Dependency {
  return { id: row.id, predecessorId: row.predecessor_task_id, successorId: row.successor_task_id, type: row.type, lagDays: row.lag_days ?? 0 };
}
