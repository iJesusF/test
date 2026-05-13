export type ZoneStatus = 'not_started' | 'in_progress' | 'in_review' | 'blocked' | 'completed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export type Point = { x: number; y: number };

export type Project = {
  id: string;
  name: string;
  code: string;
  status: ZoneStatus;
  progress: number;
};

export type Level = {
  id: string;
  projectId: string;
  name: string;
  elevation?: number;
  sortOrder: number;
};

export type Floorplan = {
  id: string;
  projectId: string;
  levelId?: string;
  name: string;
  fileUrl: string;
  storagePath?: string;
  fileType: 'image' | 'pdf';
  width: number;
  height: number;
};

export type Zone = {
  id: string;
  floorplanId: string;
  name: string;
  color: string;
  status: ZoneStatus;
  progress: number;
  notes: string;
  responsible: string;
  startDate: string;
  endDate: string;
  points: Point[];
  checklist: { id: string; label: string; done: boolean }[];
  tags: string[];
  priority: Priority;
};

export type Task = {
  id: string;
  zoneId: string;
  name: string;
  status: ZoneStatus;
  progress: number;
  startDate: string;
  endDate: string;
  dependencyIds: string[];
};

export type Dependency = {
  id: string;
  predecessorId: string;
  successorId: string;
  type: DependencyType;
  lagDays: number;
};
