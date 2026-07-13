import {
  CircleDot,
  Clock3,
  Folder,
  ListChecks,
  Plus,
} from "lucide-react";
import { StatCard } from "./BoardWidgets";
import { QuickPanel } from "./QuickPanel";
import { SubProjectCard } from "./SubProjectCard";
import type { ActivePanel, Attachment, Note, Project, SubProject, WorkTask } from "../types";

type WorkspaceStats = {
  projects: number;
  active: number;
  tasks: number;
  blocked: number;
};

type WorkspaceProps = {
  project: Project;
  projectsCount: number;
  stats: WorkspaceStats;
  activePanel: ActivePanel;
  factoryOptions: string[];
  onAddSubProject: () => void;
  onSubProjectChange: (subProjectId: string, patch: Partial<SubProject>) => void;
  onSubProjectDelete: (subProjectId: string) => void;
  onTaskAdd: (subProjectId: string) => void;
  onTaskAdvance: (subProjectId: string, task: WorkTask) => void;
  onTaskChange: (subProjectId: string, taskId: string, patch: Partial<WorkTask>) => void;
  onTaskDelete: (subProjectId: string, taskId: string) => void;
  onPanelChange: (panel: ActivePanel) => void;
  onProjectChange: (patch: Partial<Project>) => void;
  onProjectDelete: () => void;
  onNoteAdd: () => void;
  onNoteChange: (noteId: string, patch: Partial<Note>) => void;
  onNoteDelete: (noteId: string) => void;
  onAttachmentAdd: () => void;
  onAttachmentChange: (attachmentId: string, patch: Partial<Attachment>) => void;
  onAttachmentDelete: (attachmentId: string) => void;
};

export function Workspace({
  project,
  projectsCount,
  stats,
  activePanel,
  factoryOptions,
  onAddSubProject,
  onSubProjectChange,
  onSubProjectDelete,
  onTaskAdd,
  onTaskAdvance,
  onTaskChange,
  onTaskDelete,
  onPanelChange,
  onProjectChange,
  onProjectDelete,
  onNoteAdd,
  onNoteChange,
  onNoteDelete,
  onAttachmentAdd,
  onAttachmentChange,
  onAttachmentDelete,
}: WorkspaceProps) {
  return (
    <section className="workspace">
      <header className="topbar">
        <div>
          <p className="eyebrow">当前规划机型</p>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
        <button className="primary-button" onClick={onAddSubProject}>
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
              <span style={{ width: `${project.progress}%` }} />
            </div>
            <strong>{project.progress}%</strong>
          </div>
        </div>
        <div className="summary-tags">
          {project.developmentFactory && <span>开发：{project.developmentFactory}</span>}
          {project.manufacturingFactory && <span>制造：{project.manufacturingFactory}</span>}
          {project.tags.map((tagName) => (
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

          {project.subprojects.length === 0 ? (
            <div className="empty-state">
              <Folder size={22} />
              <strong>还没有对应内容</strong>
              <span>先拆出一个阶段、模块或专业内容，再往里面放作业。</span>
            </div>
          ) : (
            project.subprojects.map((subproject) => (
              <SubProjectCard
                key={subproject.id}
                subproject={subproject}
                onChange={(patch) => onSubProjectChange(subproject.id, patch)}
                onDelete={() => onSubProjectDelete(subproject.id)}
                onAddTask={() => onTaskAdd(subproject.id)}
                onTaskAdvance={(task) => onTaskAdvance(subproject.id, task)}
                onTaskChange={(taskId, patch) => onTaskChange(subproject.id, taskId, patch)}
                onTaskDelete={(taskId) => onTaskDelete(subproject.id, taskId)}
              />
            ))
          )}
        </div>

        <QuickPanel
          activePanel={activePanel}
          project={project}
          factoryOptions={factoryOptions}
          canDeleteProject={projectsCount > 1}
          onPanelChange={onPanelChange}
          onProjectChange={onProjectChange}
          onProjectDelete={onProjectDelete}
          onNoteAdd={onNoteAdd}
          onNoteChange={onNoteChange}
          onNoteDelete={onNoteDelete}
          onAttachmentAdd={onAttachmentAdd}
          onAttachmentChange={onAttachmentChange}
          onAttachmentDelete={onAttachmentDelete}
        />
      </section>
    </section>
  );
}
