import Database from "@tauri-apps/plugin-sql";
import type {
  SqliteAttachmentRow,
  SqliteBoardRows,
  SqliteBoardWriteRows,
  SqliteEntityTagRow,
  SqliteFactoryOptionRow,
  SqliteNoteRow,
  SqliteProjectRow,
  SqliteProjectSectionRow,
  SqliteTagRow,
  SqliteTaskRow,
} from "./sqliteBoardMapper";
import type { SqliteBoardRepositoryDriver } from "./sqliteBoardRepository";

export const TAURI_BOARD_DATABASE_URL = "sqlite:product-dev-desk.db";

type DatabaseConnection = Pick<Database, "execute" | "select">;

async function defaultDatabaseFactory() {
  return Database.load(TAURI_BOARD_DATABASE_URL);
}

async function transaction(database: DatabaseConnection, callback: () => Promise<void>) {
  await database.execute("BEGIN");
  try {
    await callback();
    await database.execute("COMMIT");
  } catch (error) {
    await database.execute("ROLLBACK");
    throw error;
  }
}

async function executeMany<T>(values: T[], callback: (value: T) => Promise<unknown>) {
  for (const value of values) {
    await callback(value);
  }
}

async function clearWorkspaceData(database: DatabaseConnection, workspaceId: string) {
  await database.execute("DELETE FROM projects WHERE workspace_id = $1", [workspaceId]);
  await database.execute("DELETE FROM tags WHERE workspace_id = $1", [workspaceId]);
  await database.execute("DELETE FROM factory_options WHERE workspace_id = $1", [workspaceId]);
}

async function insertProjects(database: DatabaseConnection, rows: SqliteProjectRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO projects (
        id, workspace_id, title, description, status, priority, progress,
        development_factory, manufacturing_factory, sort_order, is_pinned, is_archived,
        metadata_json, display_updated_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        row.id,
        row.workspace_id,
        row.title,
        row.description,
        row.status,
        row.priority,
        row.progress,
        row.development_factory,
        row.manufacturing_factory,
        row.sort_order,
        row.is_pinned,
        row.is_archived,
        row.metadata_json,
        row.display_updated_at,
        row.created_at,
        row.updated_at,
      ],
    ),
  );
}

async function insertProjectSections(database: DatabaseConnection, rows: SqliteProjectSectionRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO project_sections (
        id, project_id, parent_id, title, due_date, sort_order, depth,
        is_collapsed, view_type, layout_config, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        row.id,
        row.project_id,
        row.parent_id,
        row.title,
        row.due_date,
        row.sort_order,
        row.depth,
        row.is_collapsed,
        row.view_type,
        row.layout_config,
        row.created_at,
        row.updated_at,
      ],
    ),
  );
}

async function insertTasks(database: DatabaseConnection, rows: SqliteTaskRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO tasks (
        id, project_id, section_id, title, status, priority, due_date, memo,
        sort_order, is_important, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        row.id,
        row.project_id,
        row.section_id,
        row.title,
        row.status,
        row.priority,
        row.due_date,
        row.memo,
        row.sort_order,
        row.is_important,
        row.created_at,
        row.updated_at,
      ],
    ),
  );
}

async function insertNotes(database: DatabaseConnection, rows: SqliteNoteRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO notes (
        id, project_id, task_id, title, note_type, body, sort_order,
        display_updated_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        row.id,
        row.project_id,
        row.task_id,
        row.title,
        row.note_type,
        row.body,
        row.sort_order,
        row.display_updated_at,
        row.created_at,
        row.updated_at,
      ],
    ),
  );
}

async function insertAttachments(database: DatabaseConnection, rows: SqliteAttachmentRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO attachments (
        id, project_id, task_id, note_id, original_name, stored_name, relative_path,
        kind, display_size, mime_type, size_bytes, note, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        row.id,
        row.project_id,
        row.task_id,
        row.note_id,
        row.original_name,
        row.stored_name,
        row.relative_path,
        row.kind,
        row.display_size,
        row.mime_type,
        row.size_bytes,
        row.note,
        row.created_at,
        row.updated_at,
      ],
    ),
  );
}

async function insertTags(database: DatabaseConnection, rows: SqliteTagRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO tags (id, workspace_id, name, color, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [row.id, row.workspace_id, row.name, row.color, row.created_at, row.updated_at],
    ),
  );
}

async function insertEntityTags(database: DatabaseConnection, rows: SqliteEntityTagRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO entity_tags (id, tag_id, project_id, task_id, note_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [row.id, row.tag_id, row.project_id, row.task_id, row.note_id, row.created_at],
    ),
  );
}

async function insertFactoryOptions(database: DatabaseConnection, rows: SqliteFactoryOptionRow[]) {
  await executeMany(rows, (row) =>
    database.execute(
      `INSERT INTO factory_options (id, workspace_id, name, color, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [row.id, row.workspace_id, row.name, row.color, row.sort_order, row.created_at, row.updated_at],
    ),
  );
}

export function createTauriSqliteBoardDriver(
  createDatabase: () => Promise<DatabaseConnection> = defaultDatabaseFactory,
): SqliteBoardRepositoryDriver {
  return {
    async loadBoardRows(workspaceId) {
      const database = await createDatabase();
      const projects = await database.select<SqliteProjectRow[]>(
        "SELECT * FROM projects WHERE workspace_id = $1 ORDER BY sort_order",
        [workspaceId],
      );

      if (projects.length === 0) return null;

      return {
        projects,
        projectSections: await database.select<SqliteProjectSectionRow[]>(
          `SELECT project_sections.*
           FROM project_sections
           JOIN projects ON projects.id = project_sections.project_id
           WHERE projects.workspace_id = $1
           ORDER BY project_sections.sort_order`,
          [workspaceId],
        ),
        tasks: await database.select<SqliteTaskRow[]>(
          `SELECT tasks.*
           FROM tasks
           JOIN projects ON projects.id = tasks.project_id
           WHERE projects.workspace_id = $1
           ORDER BY tasks.sort_order`,
          [workspaceId],
        ),
        notes: await database.select<SqliteNoteRow[]>(
          `SELECT notes.*
           FROM notes
           JOIN projects ON projects.id = notes.project_id
           WHERE projects.workspace_id = $1
           ORDER BY notes.sort_order`,
          [workspaceId],
        ),
        attachments: await database.select<SqliteAttachmentRow[]>(
          `SELECT attachments.*
           FROM attachments
           LEFT JOIN projects ON projects.id = attachments.project_id
           LEFT JOIN tasks ON tasks.id = attachments.task_id
           LEFT JOIN notes ON notes.id = attachments.note_id
           WHERE projects.workspace_id = $1
              OR tasks.project_id IN (SELECT id FROM projects WHERE workspace_id = $1)
              OR notes.project_id IN (SELECT id FROM projects WHERE workspace_id = $1)`,
          [workspaceId],
        ),
        tags: await database.select<SqliteTagRow[]>(
          "SELECT * FROM tags WHERE workspace_id = $1 ORDER BY name",
          [workspaceId],
        ),
        entityTags: await database.select<SqliteEntityTagRow[]>(
          `SELECT entity_tags.*
           FROM entity_tags
           JOIN tags ON tags.id = entity_tags.tag_id
           WHERE tags.workspace_id = $1`,
          [workspaceId],
        ),
        factoryOptions: await database.select<SqliteFactoryOptionRow[]>(
          "SELECT * FROM factory_options WHERE workspace_id = $1 ORDER BY sort_order",
          [workspaceId],
        ),
      };
    },

    async replaceBoardRows(rows: SqliteBoardWriteRows) {
      const database = await createDatabase();
      await transaction(database, async () => {
        await database.execute(
          `INSERT INTO workspaces (id, name, description, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             description = excluded.description,
             updated_at = excluded.updated_at`,
          [
            rows.workspace.id,
            rows.workspace.name,
            rows.workspace.description,
            rows.workspace.created_at,
            rows.workspace.updated_at,
          ],
        );
        await clearWorkspaceData(database, rows.workspace.id);
        await insertProjects(database, rows.projects);
        await insertProjectSections(database, rows.projectSections);
        await insertTasks(database, rows.tasks);
        await insertNotes(database, rows.notes);
        await insertAttachments(database, rows.attachments);
        await insertTags(database, rows.tags);
        await insertEntityTags(database, rows.entityTags);
        await insertFactoryOptions(database, rows.factoryOptions);
      });
    },

    async clearWorkspace(workspaceId) {
      const database = await createDatabase();
      await transaction(database, async () => {
        await clearWorkspaceData(database, workspaceId);
      });
    },
  };
}
