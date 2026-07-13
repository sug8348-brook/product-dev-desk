import { STORAGE_VERSION } from "./constants";
import { initialFactoryOptions } from "./data/initialData";
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
} from "./types";
import { clampProgress } from "./utils/progress";
import { uniqueStrings } from "./utils/tags";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStatus(value: unknown): value is Status {
  return value === "active" || value === "paused" || value === "blocked" || value === "done";
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "doing" || value === "blocked" || value === "done";
}

function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high" || value === "urgent";
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeTask(value: unknown): WorkTask | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  return {
    id: value.id,
    title: toStringValue(value.title, "未命名作业"),
    status: isTaskStatus(value.status) ? value.status : "todo",
    priority: isPriority(value.priority) ? value.priority : "medium",
    due: toStringValue(value.due, "未设置"),
    memo: toStringValue(value.memo, toStringArray(value.tags).join("、")),
    tags: toStringArray(value.tags),
  };
}

function normalizeSubProject(value: unknown): SubProject | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  return {
    id: value.id,
    title: toStringValue(value.title, "未命名对应内容"),
    dueDate: toStringValue(value.dueDate),
    ...(isStatus(value.status) ? { status: value.status } : {}),
    ...(typeof value.progress === "number" ? { progress: clampProgress(value.progress) } : {}),
    tasks: Array.isArray(value.tasks)
      ? value.tasks.map(normalizeTask).filter((task): task is WorkTask => task !== null)
      : [],
  };
}

function normalizeNote(value: unknown): Note | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  return {
    id: value.id,
    title: toStringValue(value.title, "未命名提要"),
    type: toStringValue(value.type, "机型说明"),
    body: toStringValue(value.body),
    updatedAt: toStringValue(value.updatedAt, "未知"),
  };
}

function normalizeAttachment(value: unknown): Attachment | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  return {
    id: value.id,
    name: toStringValue(value.name, "未命名附件"),
    kind: toStringValue(value.kind, "Document"),
    size: toStringValue(value.size, "未填写"),
    note: toStringValue(value.note),
  };
}

function normalizeProject(value: unknown): Project | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  return {
    id: value.id,
    title: toStringValue(value.title, "未命名规划机型"),
    description: toStringValue(value.description),
    developmentFactory: toStringValue(value.developmentFactory),
    manufacturingFactory: toStringValue(value.manufacturingFactory),
    status: isStatus(value.status) ? value.status : "paused",
    priority: isPriority(value.priority) ? value.priority : "medium",
    progress: clampProgress(Number(value.progress)),
    updatedAt: toStringValue(value.updatedAt, "未知"),
    tags: toStringArray(value.tags),
    subprojects: Array.isArray(value.subprojects)
      ? value.subprojects
          .map(normalizeSubProject)
          .filter((subproject): subproject is SubProject => subproject !== null)
      : [],
    notes: Array.isArray(value.notes)
      ? value.notes.map(normalizeNote).filter((note): note is Note => note !== null)
      : [],
    attachments: Array.isArray(value.attachments)
      ? value.attachments
          .map(normalizeAttachment)
          .filter((attachment): attachment is Attachment => attachment !== null)
      : [],
  };
}

function normalizeProjectList(value: unknown) {
  if (!Array.isArray(value)) return null;

  const projects = value
    .map(normalizeProject)
    .filter((project): project is Project => project !== null);

  return projects.length > 0 ? projects : null;
}

export function parseStoredBoardData(value: unknown): BoardData | null {
  if (!isRecord(value) || value.version !== STORAGE_VERSION || !Array.isArray(value.projects)) {
    return null;
  }

  const projects = normalizeProjectList(value.projects);
  if (!projects) return null;

  const savedFactoryOptions = Array.isArray(value.factoryOptions)
    ? toStringArray(value.factoryOptions)
    : initialFactoryOptions;
  const factoryOptions = uniqueStrings([
    ...savedFactoryOptions,
    ...projects.flatMap((project) => [project.developmentFactory, project.manufacturingFactory]),
  ]);

  return { projects, factoryOptions };
}
