export type Status = "active" | "paused" | "blocked" | "done";
export type TaskStatus = "todo" | "doing" | "blocked" | "done";
export type Priority = "low" | "medium" | "high" | "urgent";
export type ProjectFilter = "all" | Status;
export type ActivePanel = "project" | "notes" | "attachments";

export type WorkTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  due: string;
  memo: string;
  tags: string[];
};

export type SubProject = {
  id: string;
  title: string;
  dueDate: string;
  status?: Status;
  progress?: number;
  tasks: WorkTask[];
};

export type Note = {
  id: string;
  title: string;
  type: string;
  body: string;
  updatedAt: string;
};

export type Attachment = {
  id: string;
  name: string;
  kind: string;
  size: string;
  note: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  developmentFactory: string;
  manufacturingFactory: string;
  status: Status;
  priority: Priority;
  progress: number;
  updatedAt: string;
  tags: string[];
  subprojects: SubProject[];
  notes: Note[];
  attachments: Attachment[];
};

export type StoredBoardData = {
  version: 1;
  projects: Project[];
  factoryOptions: string[];
};

export type BoardData = {
  projects: Project[];
  factoryOptions: string[];
};
