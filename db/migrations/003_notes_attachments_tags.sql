PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'note',
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  display_updated_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL UNIQUE,
  relative_path TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Document',
  display_size TEXT NOT NULL DEFAULT '',
  mime_type TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0 CHECK(size_bytes >= 0),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (project_id IS NOT NULL) +
    (task_id IS NOT NULL) +
    (note_id IS NOT NULL) = 1
  )
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, name)
);

CREATE TABLE IF NOT EXISTS entity_tags (
  id TEXT PRIMARY KEY,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  CHECK (
    (project_id IS NOT NULL) +
    (task_id IS NOT NULL) +
    (note_id IS NOT NULL) = 1
  )
);

CREATE INDEX IF NOT EXISTS idx_notes_project
  ON notes(project_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_notes_task
  ON notes(task_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_attachments_project
  ON attachments(project_id);

CREATE INDEX IF NOT EXISTS idx_attachments_task
  ON attachments(task_id);

CREATE INDEX IF NOT EXISTS idx_attachments_note
  ON attachments(note_id);

CREATE INDEX IF NOT EXISTS idx_tags_workspace
  ON tags(workspace_id, name);

CREATE INDEX IF NOT EXISTS idx_entity_tags_tag
  ON entity_tags(tag_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_entity_tags_project
  ON entity_tags(tag_id, project_id)
  WHERE project_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_entity_tags_task
  ON entity_tags(tag_id, task_id)
  WHERE task_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_entity_tags_note
  ON entity_tags(tag_id, note_id)
  WHERE note_id IS NOT NULL;

INSERT OR IGNORE INTO schema_migrations(version, applied_at)
VALUES ('003_notes_attachments_tags', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
