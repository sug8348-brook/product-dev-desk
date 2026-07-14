import type {
  Attachment,
  BoardData,
  Note,
  Priority,
  Project,
  Status,
  SubProject,
  TaskStatus,
  WorkTask,
} from "../types";
import { clampProgress } from "../utils/progress";
import { uniqueStrings } from "../utils/tags";

export const DEFAULT_WORKSPACE_ID = "ws_default";
export const DEFAULT_WORKSPACE_NAME = "Local Work Board";

type SqliteBoolean = 0 | 1;

export type SqliteWorkspaceRow = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type SqliteProjectRow = {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  development_factory: string;
  manufacturing_factory: string;
  sort_order: number;
  is_pinned: SqliteBoolean;
  is_archived: SqliteBoolean;
  metadata_json: string | null;
  display_updated_at: string;
  created_at: string;
  updated_at: string;
};

export type SqliteProjectSectionRow = {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  due_date: string;
  sort_order: number;
  depth: number;
  is_collapsed: SqliteBoolean;
  view_type: string;
  layout_config: string | null;
  created_at: string;
  updated_at: string;
};

export type SqliteTaskRow = {
  id: string;
  project_id: string;
  section_id: string | null;
  title: string;
  status: string;
  priority: string;
  due_date: string;
  memo: string;
  sort_order: number;
  is_important: SqliteBoolean;
  created_at: string;
  updated_at: string;
};

export type SqliteNoteRow = {
  id: string;
  project_id: string;
  task_id: string | null;
  title: string;
  note_type: string;
  body: string;
  sort_order: number;
  display_updated_at: string;
  created_at: string;
  updated_at: string;
};

export type SqliteAttachmentRow = {
  id: string;
  project_id: string | null;
  task_id: string | null;
  note_id: string | null;
  original_name: string;
  stored_name: string;
  relative_path: string;
  kind: string;
  display_size: string;
  mime_type: string | null;
  size_bytes: number;
  note: string;
  created_at: string;
  updated_at: string;
};

export type SqliteTagRow = {
  id: string;
  workspace_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type SqliteEntityTagRow = {
  id: string;
  tag_id: string;
  project_id: string | null;
  task_id: string | null;
  note_id: string | null;
  created_at: string;
};

export type SqliteFactoryOptionRow = {
  id: string;
  workspace_id: string;
  name: string;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SqliteBoardRows = {
  projects: SqliteProjectRow[];
  projectSections: SqliteProjectSectionRow[];
  tasks: SqliteTaskRow[];
  notes: SqliteNoteRow[];
  attachments: SqliteAttachmentRow[];
  tags: SqliteTagRow[];
  entityTags: SqliteEntityTagRow[];
  factoryOptions: SqliteFactoryOptionRow[];
};

export type SqliteBoardWriteRows = SqliteBoardRows & {
  workspace: SqliteWorkspaceRow;
};

type MapOptions = {
  workspaceId?: string;
  workspaceName?: string;
  now?: string;
};

const statusFallback: Status = "paused";
const taskStatusFallback: TaskStatus = "todo";
const priorityFallback: Priority = "medium";

function toStatus(value: string): Status {
  return value === "active" || value === "paused" || value === "blocked" || value === "done"
    ? value
    : statusFallback;
}

function toTaskStatus(value: string): TaskStatus {
  return value === "todo" || value === "doing" || value === "blocked" || value === "done"
    ? value
    : taskStatusFallback;
}

function toPriority(value: string): Priority {
  return value === "low" || value === "medium" || value === "high" || value === "urgent"
    ? value
    : priorityFallback;
}

function toSqliteTimestamp(value: string, fallback: string) {
  const parsedTime = Date.parse(value);
  return Number.isNaN(parsedTime) ? fallback : new Date(parsedTime).toISOString();
}

function displayUpdatedAt(displayValue: string, updatedAt: string) {
  return displayValue || updatedAt;
}

function safeFileName(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "attachment";
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

function stableId(prefix: string, value: string) {
  return `${prefix}_${hashString(value)}`;
}

function tagId(tagName: string) {
  return stableId("tag", tagName.trim().toLowerCase());
}

function entityTagId(entityType: "project" | "task" | "note", entityId: string, tagName: string) {
  return stableId("entity_tag", `${entityType}:${entityId}:${tagName.trim().toLowerCase()}`);
}

function parseDisplaySize(value: string) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i);
  if (!match) return 0;

  const numericValue = Number(match[1]);
  const unit = (match[2] ?? "b").toLowerCase();
  const multiplier = unit === "gb" ? 1024 ** 3 : unit === "mb" ? 1024 ** 2 : unit === "kb" ? 1024 : 1;

  return Math.round(numericValue * multiplier);
}

function groupBy<T>(values: T[], getKey: (value: T) => string | null) {
  return values.reduce<Record<string, T[]>>((groups, value) => {
    const key = getKey(value);
    if (!key) return groups;
    groups[key] = [...(groups[key] ?? []), value];
    return groups;
  }, {});
}

function tagNamesFor(entityTags: SqliteEntityTagRow[], tagNameById: Record<string, string>) {
  return entityTags.map((entityTag) => tagNameById[entityTag.tag_id]).filter((tagName): tagName is string => Boolean(tagName));
}

export function mapSqliteRowsToBoardData(rows: SqliteBoardRows): BoardData {
  const sortedProjects = [...rows.projects].sort((left, right) => left.sort_order - right.sort_order);
  const sectionsByProjectId = groupBy(rows.projectSections, (section) => section.project_id);
  const tasksBySectionId = groupBy(rows.tasks, (task) => task.section_id);
  const tasksByProjectId = groupBy(rows.tasks, (task) => task.project_id);
  const notesByProjectId = groupBy(rows.notes, (note) => note.project_id);
  const attachmentsByProjectId = groupBy(rows.attachments, (attachment) => attachment.project_id);
  const tagNameById = Object.fromEntries(rows.tags.map((tag) => [tag.id, tag.name]));
  const entityTagsByProjectId = groupBy(rows.entityTags, (entityTag) => entityTag.project_id);
  const entityTagsByTaskId = groupBy(rows.entityTags, (entityTag) => entityTag.task_id);

  const projects = sortedProjects.map<Project>((projectRow) => {
    const sections = [...(sectionsByProjectId[projectRow.id] ?? [])].sort(
      (left, right) => left.sort_order - right.sort_order,
    );
    const sectionIds = new Set(sections.map((section) => section.id));
    const orphanTasks = (tasksByProjectId[projectRow.id] ?? []).filter((task) => !task.section_id || !sectionIds.has(task.section_id));

    const subprojects = sections.map<SubProject>((section) => ({
      id: section.id,
      title: section.title,
      dueDate: section.due_date,
      tasks: [...(tasksBySectionId[section.id] ?? [])]
        .sort((left, right) => left.sort_order - right.sort_order)
        .map<WorkTask>((task) => ({
          id: task.id,
          title: task.title,
          status: toTaskStatus(task.status),
          priority: toPriority(task.priority),
          due: task.due_date,
          memo: task.memo,
          tags: tagNamesFor(entityTagsByTaskId[task.id] ?? [], tagNameById),
        })),
    }));

    if (orphanTasks.length > 0) {
      subprojects.push({
        id: `unassigned_${projectRow.id}`,
        title: "Unassigned",
        dueDate: "",
        tasks: orphanTasks
          .sort((left, right) => left.sort_order - right.sort_order)
          .map<WorkTask>((task) => ({
            id: task.id,
            title: task.title,
            status: toTaskStatus(task.status),
            priority: toPriority(task.priority),
            due: task.due_date,
            memo: task.memo,
            tags: tagNamesFor(entityTagsByTaskId[task.id] ?? [], tagNameById),
          })),
      });
    }

    return {
      id: projectRow.id,
      title: projectRow.title,
      description: projectRow.description,
      developmentFactory: projectRow.development_factory,
      manufacturingFactory: projectRow.manufacturing_factory,
      status: toStatus(projectRow.status),
      priority: toPriority(projectRow.priority),
      progress: clampProgress(projectRow.progress),
      updatedAt: displayUpdatedAt(projectRow.display_updated_at, projectRow.updated_at),
      tags: tagNamesFor(entityTagsByProjectId[projectRow.id] ?? [], tagNameById),
      subprojects,
      notes: [...(notesByProjectId[projectRow.id] ?? [])]
        .sort((left, right) => left.sort_order - right.sort_order)
        .map<Note>((note) => ({
          id: note.id,
          title: note.title,
          type: note.note_type,
          body: note.body,
          updatedAt: displayUpdatedAt(note.display_updated_at, note.updated_at),
        })),
      attachments: [...(attachmentsByProjectId[projectRow.id] ?? [])]
        .sort((left, right) => left.created_at.localeCompare(right.created_at))
        .map<Attachment>((attachment) => ({
          id: attachment.id,
          name: attachment.original_name,
          kind: attachment.kind,
          size: attachment.display_size,
          note: attachment.note,
        })),
    };
  });

  const factoryOptions = uniqueStrings([
    ...rows.factoryOptions.sort((left, right) => left.sort_order - right.sort_order).map((factory) => factory.name),
    ...projects.flatMap((project) => [project.developmentFactory, project.manufacturingFactory]),
  ]);

  return { projects, factoryOptions };
}

export function mapBoardDataToSqliteRows(data: BoardData, options: MapOptions = {}): SqliteBoardWriteRows {
  const workspaceId = options.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const now = options.now ?? new Date().toISOString();
  const workspaceName = options.workspaceName ?? DEFAULT_WORKSPACE_NAME;
  const tags = uniqueStrings([
    ...data.projects.flatMap((project) => project.tags),
    ...data.projects.flatMap((project) => project.subprojects.flatMap((subproject) => subproject.tasks.flatMap((task) => task.tags))),
  ]);
  const tagRows = tags.map<SqliteTagRow>((tagName) => ({
    id: tagId(tagName),
    workspace_id: workspaceId,
    name: tagName,
    color: null,
    created_at: now,
    updated_at: now,
  }));

  const projectRows: SqliteProjectRow[] = [];
  const sectionRows: SqliteProjectSectionRow[] = [];
  const taskRows: SqliteTaskRow[] = [];
  const noteRows: SqliteNoteRow[] = [];
  const attachmentRows: SqliteAttachmentRow[] = [];
  const entityTagRows: SqliteEntityTagRow[] = [];

  data.projects.forEach((project, projectIndex) => {
    const projectUpdatedAt = toSqliteTimestamp(project.updatedAt, now);
    projectRows.push({
      id: project.id,
      workspace_id: workspaceId,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: clampProgress(project.progress),
      development_factory: project.developmentFactory,
      manufacturing_factory: project.manufacturingFactory,
      sort_order: projectIndex,
      is_pinned: 0,
      is_archived: 0,
      metadata_json: null,
      display_updated_at: project.updatedAt,
      created_at: projectUpdatedAt,
      updated_at: projectUpdatedAt,
    });

    project.tags.forEach((tagName) => {
      entityTagRows.push({
        id: entityTagId("project", project.id, tagName),
        tag_id: tagId(tagName),
        project_id: project.id,
        task_id: null,
        note_id: null,
        created_at: now,
      });
    });

    project.subprojects.forEach((subproject, subprojectIndex) => {
      sectionRows.push({
        id: subproject.id,
        project_id: project.id,
        parent_id: null,
        title: subproject.title,
        due_date: subproject.dueDate,
        sort_order: subprojectIndex,
        depth: 0,
        is_collapsed: 0,
        view_type: "collapse",
        layout_config: null,
        created_at: now,
        updated_at: now,
      });

      subproject.tasks.forEach((task, taskIndex) => {
        taskRows.push({
          id: task.id,
          project_id: project.id,
          section_id: subproject.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          due_date: task.due,
          memo: task.memo,
          sort_order: taskIndex,
          is_important: task.priority === "urgent" ? 1 : 0,
          created_at: now,
          updated_at: now,
        });

        task.tags.forEach((tagName) => {
          entityTagRows.push({
            id: entityTagId("task", task.id, tagName),
            tag_id: tagId(tagName),
            project_id: null,
            task_id: task.id,
            note_id: null,
            created_at: now,
          });
        });
      });
    });

    project.notes.forEach((note, noteIndex) => {
      const noteUpdatedAt = toSqliteTimestamp(note.updatedAt, now);
      noteRows.push({
        id: note.id,
        project_id: project.id,
        task_id: null,
        title: note.title,
        note_type: note.type,
        body: note.body,
        sort_order: noteIndex,
        display_updated_at: note.updatedAt,
        created_at: noteUpdatedAt,
        updated_at: noteUpdatedAt,
      });
    });

    project.attachments.forEach((attachment) => {
      const storedName = `${attachment.id}-${safeFileName(attachment.name)}`;
      attachmentRows.push({
        id: attachment.id,
        project_id: project.id,
        task_id: null,
        note_id: null,
        original_name: attachment.name,
        stored_name: storedName,
        relative_path: `attachments/${attachment.id}/${storedName}`,
        kind: attachment.kind,
        display_size: attachment.size,
        mime_type: null,
        size_bytes: parseDisplaySize(attachment.size),
        note: attachment.note,
        created_at: now,
        updated_at: now,
      });
    });
  });

  const factoryOptions = uniqueStrings([
    ...data.factoryOptions,
    ...data.projects.flatMap((project) => [project.developmentFactory, project.manufacturingFactory]),
  ]);
  const factoryOptionRows = factoryOptions.map<SqliteFactoryOptionRow>((factoryName, index) => ({
    id: stableId("factory", factoryName.toLowerCase()),
    workspace_id: workspaceId,
    name: factoryName,
    color: null,
    sort_order: index,
    created_at: now,
    updated_at: now,
  }));

  return {
    workspace: {
      id: workspaceId,
      name: workspaceName,
      description: "",
      created_at: now,
      updated_at: now,
    },
    projects: projectRows,
    projectSections: sectionRows,
    tasks: taskRows,
    notes: noteRows,
    attachments: attachmentRows,
    tags: tagRows,
    entityTags: entityTagRows,
    factoryOptions: factoryOptionRows,
  };
}
