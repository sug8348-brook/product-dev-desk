PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS factory_options (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, name)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_factory_options_workspace
  ON factory_options(workspace_id, sort_order);

INSERT OR IGNORE INTO schema_migrations(version, applied_at)
VALUES ('004_settings_and_factory_options', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
