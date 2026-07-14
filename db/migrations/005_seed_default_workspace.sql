PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO workspaces(id, name, description, created_at, updated_at)
VALUES (
  'ws_default',
  'Local Board',
  '',
  '2026-07-13T00:00:00.000Z',
  '2026-07-13T00:00:00.000Z'
);

INSERT OR IGNORE INTO entity_type_configs(
  id,
  workspace_id,
  system_type,
  display_name,
  icon,
  color,
  sort_order,
  is_enabled,
  view_type,
  layout_config,
  created_at,
  updated_at
)
VALUES
  ('etc_project', 'ws_default', 'project', 'Project', 'Folder', '#2f6f62', 0, 1, 'list', NULL, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'),
  ('etc_section', 'ws_default', 'section', 'Section', 'Layers3', '#5f6f9f', 1, 1, 'collapse', NULL, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'),
  ('etc_task', 'ws_default', 'task', 'Task', 'ListChecks', '#b88316', 2, 1, 'list', NULL, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'),
  ('etc_note', 'ws_default', 'note', 'Note', 'FileText', '#6f6257', 3, 1, 'drawer', NULL, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'),
  ('etc_attachment', 'ws_default', 'attachment', 'Attachment', 'Paperclip', '#8f5148', 4, 1, 'drawer', NULL, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z');

INSERT OR IGNORE INTO factory_options(id, workspace_id, name, color, sort_order, created_at, updated_at)
VALUES
  ('factory_proto_suzhou', 'ws_default', 'Suzhou Prototype Factory', '#2f6f62', 0, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'),
  ('factory_mfg_ningbo', 'ws_default', 'Ningbo Manufacturing Factory', '#5f6f9f', 1, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'),
  ('factory_mfg_chengdu', 'ws_default', 'Chengdu Manufacturing Base', '#b88316', 2, '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z');

INSERT OR IGNORE INTO settings(key, value, updated_at)
VALUES
  ('active_workspace_id', 'ws_default', '2026-07-13T00:00:00.000Z'),
  ('schema_plan_version', 'sqlite_schema_draft_v1', '2026-07-13T00:00:00.000Z');

INSERT OR IGNORE INTO schema_migrations(version, applied_at)
VALUES ('005_seed_default_workspace', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
