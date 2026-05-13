create extension if not exists "uuid-ossp";

create type zone_status as enum ('not_started', 'in_progress', 'in_review', 'blocked', 'completed');
create type priority_level as enum ('low', 'medium', 'high', 'critical');
create type dependency_type as enum ('FS', 'SS', 'FF', 'SF');

create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  status zone_status not null default 'not_started',
  progress numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table levels (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  elevation numeric(10,2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table floorplans (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  level_id uuid references levels(id) on delete set null,
  name text not null,
  storage_path text not null,
  public_url text not null,
  file_type text not null check (file_type in ('image','pdf')),
  width integer,
  height integer,
  revision text default 'A',
  created_at timestamptz not null default now()
);

create table zones (
  id uuid primary key default uuid_generate_v4(),
  floorplan_id uuid not null references floorplans(id) on delete cascade,
  code text not null,
  name text not null,
  color text not null default '#4f8cff',
  status zone_status not null default 'not_started',
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  notes text default '',
  responsible text default '',
  start_date date,
  end_date date,
  polygon jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  priority priority_level not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(floorplan_id, code)
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  name text not null,
  status zone_status not null default 'not_started',
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  start_date date not null,
  end_date date not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table dependencies (
  id uuid primary key default uuid_generate_v4(),
  predecessor_task_id uuid not null references tasks(id) on delete cascade,
  successor_task_id uuid not null references tasks(id) on delete cascade,
  type dependency_type not null default 'FS',
  lag_days integer not null default 0,
  created_at timestamptz not null default now(),
  check (predecessor_task_id <> successor_task_id)
);

create table comments (
  id uuid primary key default uuid_generate_v4(),
  zone_id uuid references zones(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  author text not null default 'Equipo',
  body text not null,
  created_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  zone_id uuid references zones(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  mime_type text not null,
  kind text not null check (kind in ('photo','file','plan')),
  created_at timestamptz not null default now()
);

create table progress_logs (
  id uuid primary key default uuid_generate_v4(),
  zone_id uuid references zones(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  previous_progress numeric(5,2),
  new_progress numeric(5,2) not null,
  status zone_status,
  note text default '',
  created_at timestamptz not null default now()
);

create index idx_levels_project on levels(project_id);
create index idx_floorplans_project on floorplans(project_id);
create index idx_floorplans_level on floorplans(level_id);
create index idx_zones_floorplan on zones(floorplan_id);
create index idx_tasks_project_dates on tasks(project_id, start_date, end_date);
create index idx_dependencies_successor on dependencies(successor_task_id);
