PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'paused' CHECK(status IN ('active', 'paused', 'blocked', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
  development_factory TEXT NOT NULL DEFAULT '',
  manufacturing_factory TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0 CHECK(is_pinned IN (0, 1)),
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK(is_archived IN (0, 1)),
  metadata_json TEXT,
  display_updated_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_sections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES project_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  depth INTEGER NOT NULL DEFAULT 0 CHECK(depth BETWEEN 0 AND 2),
  is_collapsed INTEGER NOT NULL DEFAULT 0 CHECK(is_collapsed IN (0, 1)),
  view_type TEXT NOT NULL DEFAULT 'collapse',
  layout_config TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES project_sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'doing', 'blocked', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_important INTEGER NOT NULL DEFAULT 0 CHECK(is_important IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_workspace
  ON projects(workspace_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_projects_status
  ON projects(workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_sections_project
  ON project_sections(project_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_sections_parent
  ON project_sections(parent_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_tasks_project
  ON tasks(project_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_tasks_section
  ON tasks(section_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_tasks_status
  ON tasks(project_id, status);

INSERT OR IGNORE INTO schema_migrations(version, applied_at)
VALUES ('002_projects_sections_tasks', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
