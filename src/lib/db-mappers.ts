import type { Dependency, EvidenceFile, Floorplan, Level, Point, Priority, Project, Task, Zone, ZoneStatus } from '@/types/domain';

type DbRow = Record<string, unknown>;

function stringField(row: DbRow, key: string, fallback = '') {
  return typeof row[key] === 'string' ? row[key] : fallback;
}

function numberField(row: DbRow, key: string, fallback = 0) {
  return typeof row[key] === 'number' ? row[key] : Number(row[key] ?? fallback);
}

function arrayField<T>(row: DbRow, key: string, fallback: T[] = []) {
  return Array.isArray(row[key]) ? row[key] as T[] : fallback;
}

export function projectFromDb(row: DbRow): Project {
  return { id: stringField(row, 'id'), name: stringField(row, 'name'), code: stringField(row, 'code'), status: stringField(row, 'status', 'not_started') as ZoneStatus, progress: numberField(row, 'progress') };
}

export function levelFromDb(row: DbRow): Level {
  return { id: stringField(row, 'id'), projectId: stringField(row, 'project_id'), name: stringField(row, 'name'), elevation: row.elevation === null ? undefined : numberField(row, 'elevation'), sortOrder: numberField(row, 'sort_order') };
}

export function floorplanFromDb(row: DbRow): Floorplan {
  return { id: stringField(row, 'id'), projectId: stringField(row, 'project_id'), levelId: row.level_id === null ? undefined : stringField(row, 'level_id'), name: stringField(row, 'name'), fileUrl: stringField(row, 'public_url'), storagePath: stringField(row, 'storage_path'), fileType: stringField(row, 'file_type', 'image') as Floorplan['fileType'], width: numberField(row, 'width', 1), height: numberField(row, 'height', 1) };
}

export function zoneFromDb(row: DbRow): Zone {
  return { id: stringField(row, 'id'), floorplanId: stringField(row, 'floorplan_id'), name: stringField(row, 'name'), color: stringField(row, 'color', '#4f8cff'), status: stringField(row, 'status', 'not_started') as ZoneStatus, progress: numberField(row, 'progress'), notes: stringField(row, 'notes'), responsible: stringField(row, 'responsible'), startDate: stringField(row, 'start_date', new Date().toISOString().slice(0, 10)), endDate: stringField(row, 'end_date', new Date().toISOString().slice(0, 10)), points: arrayField<Point>(row, 'polygon'), checklist: arrayField<Zone['checklist'][number]>(row, 'checklist'), attachments: arrayField<EvidenceFile>(row, 'attachments'), tags: arrayField<string>(row, 'tags'), priority: stringField(row, 'priority', 'medium') as Priority };
}

export function taskFromDb(row: DbRow): Task {
  return { id: stringField(row, 'id'), zoneId: stringField(row, 'zone_id'), name: stringField(row, 'name'), status: stringField(row, 'status', 'not_started') as ZoneStatus, progress: numberField(row, 'progress'), startDate: stringField(row, 'start_date'), endDate: stringField(row, 'end_date'), dependencyIds: arrayField<string>(row, 'dependency_ids') };
}

export function dependencyFromDb(row: DbRow): Dependency {
  return { id: stringField(row, 'id'), predecessorId: stringField(row, 'predecessor_task_id'), successorId: stringField(row, 'successor_task_id'), type: stringField(row, 'type', 'FS') as Dependency['type'], lagDays: numberField(row, 'lag_days') };
}
