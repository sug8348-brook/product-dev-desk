import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  Folder,
  Inbox,
  Layers3,
  ListChecks,
  Paperclip,
  Plus,
  Search,
  Settings,
  Tag,
  Trash2,
} from "lucide-react";
import "./styles.css";

type Status = "active" | "paused" | "blocked" | "done";
type TaskStatus = "todo" | "doing" | "blocked" | "done";
type Priority = "low" | "medium" | "high" | "urgent";
type ProjectFilter = "all" | Status;

type WorkTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  due: string;
  tags: string[];
};

type SubProject = {
  id: string;
  title: string;
  status: Status;
  progress: number;
  tasks: WorkTask[];
};

type Note = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
};

type Attachment = {
  id: string;
  name: string;
  kind: string;
  size: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  progress: number;
  updatedAt: string;
  tags: string[];
  subprojects: SubProject[];
  notes: Note[];
  attachments: Attachment[];
};

const initialProjects: Project[] = [
  {
    id: "p1",
    title: "MX-2400 模块化输送机",
    description: "跟进结构方案、电控选型、样机验证和量产风险。",
    status: "active",
    priority: "high",
    progress: 68,
    updatedAt: "今天 15:20",
    tags: ["输送设备", "样机", "本周重点"],
    subprojects: [
      {
        id: "sp1",
        title: "结构与传动方案",
        status: "active",
        progress: 80,
        tasks: [
          {
            id: "t1",
            title: "确认皮带张紧机构调整方案",
            status: "doing",
            priority: "high",
            due: "7月10日",
            tags: ["结构"],
          },
          {
            id: "t2",
            title: "输出电机减速比复核记录",
            status: "todo",
            priority: "medium",
            due: "7月11日",
            tags: ["传动"],
          },
        ],
      },
      {
        id: "sp2",
        title: "样机验证准备",
        status: "blocked",
        progress: 45,
        tasks: [
          {
            id: "t3",
            title: "等待供应商确认导轨交期",
            status: "blocked",
            priority: "urgent",
            due: "待确认",
            tags: ["供应链"],
          },
        ],
      },
    ],
    notes: [
      { id: "n1", title: "7月9日方案评审纪要", type: "评审纪要", updatedAt: "今天" },
      { id: "n2", title: "样机阶段风险摘要", type: "阶段总结", updatedAt: "昨天" },
    ],
    attachments: [
      { id: "a1", name: "BOM-样机版.xlsx", kind: "Spreadsheet", size: "82 KB" },
      { id: "a2", name: "结构方案评审记录.docx", kind: "Document", size: "124 KB" },
    ],
  },
  {
    id: "p2",
    title: "EP-18 电驱控制箱",
    description: "沉淀控制箱布局、线束规范、散热验证和测试记录。",
    status: "active",
    priority: "medium",
    progress: 35,
    updatedAt: "昨天 18:40",
    tags: ["电控", "验证"],
    subprojects: [
      {
        id: "sp3",
        title: "电气设计输入",
        status: "active",
        progress: 35,
        tasks: [
          {
            id: "t4",
            title: "整理端子排与线束编号规则",
            status: "todo",
            priority: "medium",
            due: "7月15日",
            tags: ["电气"],
          },
        ],
      },
    ],
    notes: [{ id: "n3", title: "控制箱设计输入草案", type: "机型说明", updatedAt: "昨天" }],
    attachments: [{ id: "a3", name: "I-O点表.xlsx", kind: "Spreadsheet", size: "9 KB" }],
  },
  {
    id: "p3",
    title: "AT-05 自动上料单元",
    description: "企划阶段，待确认目标节拍、成本边界和关键供应商。",
    status: "paused",
    priority: "low",
    progress: 20,
    updatedAt: "周一",
    tags: ["自动化", "企划"],
    subprojects: [],
    notes: [],
    attachments: [],
  },
];

const statusLabel: Record<Status, string> = {
  active: "开发中",
  paused: "企划中",
  blocked: "阻塞",
  done: "已量产",
};

const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "待处理",
  doing: "作业中",
  blocked: "阻塞",
  done: "已完成",
};

const priorityLabel: Record<Priority, string> = {
  low: "低",
  medium: "中",
  high: "高",
  urgent: "紧急",
};

const taskStatusFlow: TaskStatus[] = ["todo", "doing", "done"];
const projectStatusOptions: Array<{ value: Status; label: string }> = [
  { value: "active", label: statusLabel.active },
  { value: "paused", label: statusLabel.paused },
  { value: "done", label: statusLabel.done },
];

const contentStatusOptions: Array<{ value: Status; label: string }> = Object.entries(statusLabel).map(
  ([value, label]) => ({ value: value as Status, label }),
);

function parseTags(value: string) {
  return value
    .split(/[，,]/)
    .map((tagName) => tagName.trim())
    .filter(Boolean);
}

function joinTags(tags: string[]) {
  return tags.join("，");
}

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0].id);
  const [activePanel, setActivePanel] = useState<"project" | "notes" | "attachments">("project");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        !normalized ||
        project.title.toLowerCase().includes(normalized) ||
        project.description.toLowerCase().includes(normalized) ||
        project.tags.some((tagName) => tagName.toLowerCase().includes(normalized));
      const matchesStatus = filter === "all" || project.status === filter;

      return matchesQuery && matchesStatus;
    });
  }, [filter, projects, query]);

  const stats = useMemo(() => {
    const taskList = projects.flatMap((project) =>
      project.subprojects.flatMap((subproject) => subproject.tasks),
    );

    return {
      projects: projects.length,
      active: projects.filter((project) => project.status === "active").length,
      tasks: taskList.length,
      blocked: taskList.filter((task) => task.status === "blocked").length,
    };
  }, [projects]);

  function updateProject(projectId: string, patch: Partial<Project>) {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? { ...project, ...patch, updatedAt: "刚刚" } : project,
      ),
    );
  }

  function updateSubProject(subProjectId: string, patch: Partial<SubProject>) {
    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              subprojects: project.subprojects.map((subproject) =>
                subproject.id === subProjectId ? { ...subproject, ...patch } : subproject,
              ),
            },
      ),
    );
  }

  function updateTask(subProjectId: string, taskId: string, patch: Partial<WorkTask>) {
    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              subprojects: project.subprojects.map((subproject) =>
                subproject.id !== subProjectId
                  ? subproject
                  : {
                      ...subproject,
                      tasks: subproject.tasks.map((task) =>
                        task.id === taskId ? { ...task, ...patch } : task,
                      ),
                    },
              ),
            },
      ),
    );
  }


  function deleteProject(projectId: string) {
    if (projects.length <= 1) return;

    setProjects((current) => {
      const nextProjects = current.filter((project) => project.id !== projectId);

      if (selectedProjectId === projectId) {
        setSelectedProjectId(nextProjects[0]?.id ?? "");
        setActivePanel("project");
      }

      return nextProjects;
    });
  }

  function deleteSubProject(subProjectId: string) {
    if (!selectedProject) return;

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              subprojects: project.subprojects.filter((subproject) => subproject.id !== subProjectId),
            },
      ),
    );
  }

  function deleteTask(subProjectId: string, taskId: string) {
    if (!selectedProject) return;

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              subprojects: project.subprojects.map((subproject) =>
                subproject.id !== subProjectId
                  ? subproject
                  : {
                      ...subproject,
                      tasks: subproject.tasks.filter((task) => task.id !== taskId),
                    },
              ),
            },
      ),
    );
  }
  function addProject() {
    const nextIndex = projects.length + 1;
    const newProject: Project = {
      id: `p${Date.now()}`,
      title: `新规划机型 ${nextIndex}`,
      description: "这里记录机型定位、开发目标、关键配置和当前推进重点。",
      status: "paused",
      priority: "medium",
      progress: 0,
      updatedAt: "刚刚",
      tags: ["企划"],
      subprojects: [],
      notes: [],
      attachments: [],
    };

    setProjects([newProject, ...projects]);
    setSelectedProjectId(newProject.id);
    setFilter("all");
    setActivePanel("project");
  }

  function addTask(subProjectId: string) {
    const newTask: WorkTask = {
      id: `t${Date.now()}`,
      title: "新的作业事项",
      status: "todo",
      priority: "medium",
      due: "未设置",
      tags: ["待整理"],
    };

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              subprojects: project.subprojects.map((subproject) =>
                subproject.id === subProjectId
                  ? { ...subproject, tasks: [newTask, ...subproject.tasks] }
                  : subproject,
              ),
            },
      ),
    );
  }

  function addSubProject() {
    const newSubProject: SubProject = {
      id: `sp${Date.now()}`,
      title: "新对应内容",
      status: "active",
      progress: 0,
      tasks: [],
    };

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : { ...project, updatedAt: "刚刚", subprojects: [newSubProject, ...project.subprojects] },
      ),
    );
  }

  function advanceTaskStatus(subProjectId: string, task: WorkTask) {
    if (task.status === "blocked") {
      updateTask(subProjectId, task.id, { status: "doing" });
      return;
    }

    const currentIndex = taskStatusFlow.indexOf(task.status);
    const nextStatus = taskStatusFlow[(currentIndex + 1) % taskStatusFlow.length];
    updateTask(subProjectId, task.id, { status: nextStatus });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Layers3 size={18} />
          </div>
          <div>
            <strong>Model Dev Board</strong>
            <span>机种开发看板</span>
          </div>
        </div>

        <label className="search-box">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索机型或标签"
          />
        </label>

        <nav className="nav-group" aria-label="工作区导航">
          <FilterButton active={filter === "all"} icon={<Inbox size={17} />} onClick={() => setFilter("all")}>
            全部机型
          </FilterButton>
          <FilterButton active={filter === "active"} icon={<CircleDot size={17} />} onClick={() => setFilter("active")}>
            开发中
          </FilterButton>
          <FilterButton active={filter === "paused"} icon={<CalendarDays size={17} />} onClick={() => setFilter("paused")}>
            企划中
          </FilterButton>
          <FilterButton active={filter === "done"} icon={<Archive size={17} />} onClick={() => setFilter("done")}>
            已量产
          </FilterButton>
        </nav>

        <section className="project-list" aria-label="规划机型列表">
          <div className="section-heading">
            <span>规划机型</span>
            <button className="icon-button" onClick={addProject} aria-label="新建规划机型">
              <Plus size={16} />
            </button>
          </div>
          {filteredProjects.map((project) => (
            <button
              className={`project-nav-card ${project.id === selectedProject.id ? "selected" : ""}`}
              key={project.id}
              onClick={() => {
                setSelectedProjectId(project.id);
                setActivePanel("project");
              }}
            >
              <span className={`status-dot ${project.status}`} />
              <span>
                <strong>{project.title}</strong>
                <small>{statusLabel[project.status]} · {project.updatedAt}</small>
              </span>
            </button>
          ))}
        </section>

        <section className="tag-cloud" aria-label="标签">
          <div className="section-heading">
            <span>标签</span>
          </div>
          {Array.from(new Set(projects.flatMap((project) => project.tags))).map((tagName) => (
            <button key={tagName} className="tag-filter">
              <Tag size={13} />
              {tagName}
            </button>
          ))}
        </section>

        <button className="settings-button">
          <Settings size={17} />
          设置
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">当前规划机型</p>
            <h1>{selectedProject.title}</h1>
            <p>{selectedProject.description}</p>
          </div>
          <button className="primary-button" onClick={addSubProject}>
            <Plus size={17} />
            添加对应内容
          </button>
        </header>

        <section className="stats-grid" aria-label="工作统计">
          <StatCard icon={<Folder size={18} />} label="机型" value={stats.projects} />
          <StatCard icon={<CircleDot size={18} />} label="开发中" value={stats.active} />
          <StatCard icon={<ListChecks size={18} />} label="作业" value={stats.tasks} />
          <StatCard icon={<Clock3 size={18} />} label="阻塞" value={stats.blocked} />
        </section>

        <section className="project-summary">
          <div>
            <div className="summary-label">总体进度</div>
            <div className="progress-row">
              <div className="progress-track">
                <span style={{ width: `${selectedProject.progress}%` }} />
              </div>
              <strong>{selectedProject.progress}%</strong>
            </div>
          </div>
          <div className="summary-tags">
            {selectedProject.tags.map((tagName) => (
              <span key={tagName}>{tagName}</span>
            ))}
          </div>
        </section>

        <section className="content-grid">
          <div className="subproject-column">
            <div className="section-title">
              <div>
                <p className="eyebrow">结构层级</p>
                <h2>对应内容与作业</h2>
              </div>
            </div>

            {selectedProject.subprojects.length === 0 ? (
              <div className="empty-state">
                <Folder size={22} />
                <strong>还没有对应内容</strong>
                <span>先拆出一个阶段、模块或专业内容，再往里面放作业。</span>
              </div>
            ) : (
              selectedProject.subprojects.map((subproject) => (
                <article className="subproject-card" key={subproject.id}>
                  <div className="subproject-header editable-header">
                    <button className="collapse-button" aria-label="展开对应内容">
                      <ChevronRight size={16} />
                    </button>
                    <div className="subproject-editor">
                      <input
                        className="title-input"
                        value={subproject.title}
                        onChange={(event) => updateSubProject(subproject.id, { title: event.target.value })}
                        aria-label="对应内容名称"
                      />
                      <div className="inline-controls">
                        <select
                          value={subproject.status}
                          onChange={(event) =>
                            updateSubProject(subproject.id, { status: event.target.value as Status })
                          }
                          aria-label="对应内容状态"
                        >
                          {contentStatusOptions.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <label className="mini-number">
                          进度
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={subproject.progress}
                            onChange={(event) =>
                              updateSubProject(subproject.id, { progress: clampProgress(Number(event.target.value)) })
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <div className="subproject-actions">
                      <div className="subproject-progress">{subproject.progress}%</div>
                      <button
                        className="danger-icon-button"
                        onClick={() => deleteSubProject(subproject.id)}
                        aria-label="删除对应内容"
                        title="删除对应内容"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="task-list">
                    {subproject.tasks.map((task) => (
                      <TaskRow
                        task={task}
                        key={task.id}
                        onAdvance={() => advanceTaskStatus(subproject.id, task)}
                        onChange={(patch) => updateTask(subproject.id, task.id, patch)}
                        onDelete={() => deleteTask(subproject.id, task.id)}
                      />
                    ))}
                  </div>

                  <button className="ghost-button" onClick={() => addTask(subproject.id)}>
                    <Plus size={15} />
                    添加作业
                  </button>
                </article>
              ))
            )}
          </div>

          <aside className="quick-panel">
            <div className="panel-tabs">
              <button
                className={activePanel === "project" ? "active" : ""}
                onClick={() => setActivePanel("project")}
              >
                概览
              </button>
              <button
                className={activePanel === "notes" ? "active" : ""}
                onClick={() => setActivePanel("notes")}
              >
                提要
              </button>
              <button
                className={activePanel === "attachments" ? "active" : ""}
                onClick={() => setActivePanel("attachments")}
              >
                附件
              </button>
            </div>

            {activePanel === "project" && (
              <ProjectDrawer
                project={selectedProject}
                onChange={(patch) => updateProject(selectedProject.id, patch)}
                onDelete={() => deleteProject(selectedProject.id)}
                canDelete={projects.length > 1}
              />
            )}
            {activePanel === "notes" && <NotesDrawer notes={selectedProject.notes} />}
            {activePanel === "attachments" && <AttachmentsDrawer attachments={selectedProject.attachments} />}
          </aside>
        </section>
      </section>
    </main>
  );
}

function FilterButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onAdvance,
  onChange,
  onDelete,
}: {
  task: WorkTask;
  onAdvance: () => void;
  onChange: (patch: Partial<WorkTask>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="task-row editable-task-row">
      <button className="task-check" onClick={onAdvance} aria-label="切换作业状态">
        {task.status === "done" ? <CheckCircle2 size={17} /> : <CircleDot size={17} />}
      </button>
      <div className="task-main task-editor">
        <input
          className="task-title-input"
          value={task.title}
          onChange={(event) => onChange({ title: event.target.value })}
          aria-label="作业名称"
        />
        <div className="task-control-grid">
          <select
            value={task.status}
            onChange={(event) => onChange({ status: event.target.value as TaskStatus })}
            aria-label="作业状态"
          >
            {Object.entries(taskStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={task.priority}
            onChange={(event) => onChange({ priority: event.target.value as Priority })}
            aria-label="作业优先级"
          >
            {Object.entries(priorityLabel).map(([value, label]) => (
              <option key={value} value={value}>优先级 {label}</option>
            ))}
          </select>
          <input
            value={task.due}
            onChange={(event) => onChange({ due: event.target.value })}
            aria-label="作业截止日期"
          />
          <input
            value={joinTags(task.tags)}
            onChange={(event) => onChange({ tags: parseTags(event.target.value) })}
            aria-label="作业标签"
          />
        </div>
      </div>
      <div className="task-tags">
        {task.tags.map((tagName) => (
          <small key={tagName}>{tagName}</small>
        ))}
      </div>
      <button
        className="danger-icon-button task-delete-button"
        onClick={onDelete}
        aria-label="删除作业"
        title="删除作业"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function ProjectDrawer({
  project,
  onChange,
  onDelete,
  canDelete,
}: {
  project: Project;
  onChange: (patch: Partial<Project>) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div className="drawer-section">
      <div className="drawer-heading">
        <h2>机型抽屉</h2>
        <div className="drawer-actions">
          <span className={`pill ${project.status}`}>{statusLabel[project.status]}</span>
          <button
            className="danger-icon-button"
            onClick={onDelete}
            disabled={!canDelete}
            aria-label="删除规划机型"
            title={canDelete ? "删除规划机型" : "至少保留一个规划机型"}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="form-stack">
        <label>
          机型名称
          <input value={project.title} onChange={(event) => onChange({ title: event.target.value })} />
        </label>
        <label>
          机型说明
          <textarea
            rows={4}
            value={project.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </label>
        <div className="form-grid-two">
          <label>
            状态
            <select
              value={project.status}
              onChange={(event) => onChange({ status: event.target.value as Status })}
            >
              {projectStatusOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            优先级
            <select
              value={project.priority}
              onChange={(event) => onChange({ priority: event.target.value as Priority })}
            >
              {Object.entries(priorityLabel).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          总体进度
          <input
            type="range"
            min="0"
            max="100"
            value={project.progress}
            onChange={(event) => onChange({ progress: clampProgress(Number(event.target.value)) })}
          />
        </label>
        <label>
          标签
          <input
            value={joinTags(project.tags)}
            onChange={(event) => onChange({ tags: parseTags(event.target.value) })}
          />
        </label>
      </div>

      <dl className="detail-list compact-detail-list">
        <div>
          <dt>最近更新</dt>
          <dd>{project.updatedAt}</dd>
        </div>
        <div>
          <dt>对应内容</dt>
          <dd>{project.subprojects.length}</dd>
        </div>
        <div>
          <dt>提要</dt>
          <dd>{project.notes.length}</dd>
        </div>
      </dl>
    </div>
  );
}

function NotesDrawer({ notes }: { notes: Note[] }) {
  return (
    <div className="drawer-section">
      <div className="drawer-heading">
        <h2>提要</h2>
        <button className="icon-button" aria-label="添加提要">
          <Plus size={16} />
        </button>
      </div>
      {notes.length === 0 ? (
        <div className="empty-mini">还没有提要。</div>
      ) : (
        notes.map((note) => (
          <div className="note-item" key={note.id}>
            <FileText size={17} />
            <div>
              <strong>{note.title}</strong>
              <span>{note.type} · {note.updatedAt}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AttachmentsDrawer({ attachments }: { attachments: Attachment[] }) {
  return (
    <div className="drawer-section">
      <div className="drawer-heading">
        <h2>附件</h2>
        <button className="icon-button" aria-label="添加附件">
          <Plus size={16} />
        </button>
      </div>
      {attachments.length === 0 ? (
        <div className="empty-mini">还没有附件。</div>
      ) : (
        attachments.map((attachment) => (
          <div className="attachment-item" key={attachment.id}>
            <Paperclip size={17} />
            <div>
              <strong>{attachment.name}</strong>
              <span>{attachment.kind} · {attachment.size}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);




