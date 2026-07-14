PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entity_type_configs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL CHECK(system_type IN ('project', 'section', 'task', 'note', 'attachment')),
  display_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK(is_enabled IN (0, 1)),
  view_type TEXT,
  layout_config TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, system_type)
);

CREATE INDEX IF NOT EXISTS idx_entity_type_configs_workspace
  ON entity_type_configs(workspace_id, sort_order);

INSERT OR IGNORE INTO schema_migrations(version, applied_at)
VALUES ('001_core_workspace_and_configs', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
