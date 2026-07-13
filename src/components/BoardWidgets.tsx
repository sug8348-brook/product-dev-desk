import {
  ChevronDown,
  CheckCircle2,
  CircleDot,
  FileText,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type React from "react";
import {
  priorityLabel,
  projectStatusOptions,
  statusLabel,
  taskStatusLabel,
} from "../constants";
import type { Attachment, Note, Priority, Project, Status, TaskStatus, WorkTask } from "../types";
import { clampProgress } from "../utils/progress";
import { joinTags, parseTags } from "../utils/tags";
import { DateField } from "./DateField";

export function FilterButton({
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

export function StatCard({
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

export function TaskRow({
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
  const [memoOpen, setMemoOpen] = useState(false);
  const hasMemo = task.memo.trim().length > 0;

  return (
    <div className={`task-row editable-task-row ${memoOpen ? "memo-open" : ""}`}>
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
          <DateField
            value={task.due}
            onChange={(due) => onChange({ due })}
            ariaLabel="作业截止日期"
          />
          <button
            type="button"
            className={`memo-toggle ${hasMemo ? "has-memo" : ""}`}
            onClick={() => setMemoOpen((current) => !current)}
            aria-expanded={memoOpen}
          >
            <FileText size={14} />
            备忘录
            <ChevronDown size={14} />
          </button>
        </div>
        {memoOpen && (
          <textarea
            className="task-memo-input"
            rows={3}
            value={task.memo}
            onChange={(event) => onChange({ memo: event.target.value })}
            placeholder="记录这项作业的背景、结论或注意事项"
            aria-label="作业备忘录"
          />
        )}
      </div>
      <div className="task-status-slot">
        <span className={`pill task-status ${task.status}`}>{taskStatusLabel[task.status]}</span>
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

export function ProjectDrawer({
  project,
  factoryOptions,
  onChange,
  onDelete,
  canDelete,
}: {
  project: Project;
  factoryOptions: string[];
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
        <div className="form-grid-two">
          <label>
            开发工厂
            <select
              value={project.developmentFactory}
              onChange={(event) => onChange({ developmentFactory: event.target.value })}
            >
              <option value="">未选择</option>
              {factoryOptions.map((factoryName) => (
                <option key={factoryName} value={factoryName}>{factoryName}</option>
              ))}
            </select>
          </label>
          <label>
            制造工厂
            <select
              value={project.manufacturingFactory}
              onChange={(event) => onChange({ manufacturingFactory: event.target.value })}
            >
              <option value="">未选择</option>
              {factoryOptions.map((factoryName) => (
                <option key={factoryName} value={factoryName}>{factoryName}</option>
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
        <div>
          <dt>开发工厂</dt>
          <dd>{project.developmentFactory || "未选择"}</dd>
        </div>
        <div>
          <dt>制造工厂</dt>
          <dd>{project.manufacturingFactory || "未选择"}</dd>
        </div>
      </dl>
    </div>
  );
}

export function NotesDrawer({
  notes,
  onAdd,
  onChange,
  onDelete,
}: {
  notes: Note[];
  onAdd: () => void;
  onChange: (noteId: string, patch: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
}) {
  return (
    <div className="drawer-section">
      <div className="drawer-heading">
        <h2>提要</h2>
        <button className="icon-button" onClick={onAdd} aria-label="添加提要">
          <Plus size={16} />
        </button>
      </div>
      {notes.length === 0 ? (
        <div className="empty-mini">还没有提要。</div>
      ) : (
        notes.map((note) => (
          <div className="note-item editable-note-item" key={note.id}>
            <FileText size={17} className="item-icon" />
            <div className="item-editor">
              <input
                value={note.title}
                onChange={(event) => onChange(note.id, { title: event.target.value })}
                aria-label="提要标题"
              />
              <div className="form-grid-two">
                <select
                  value={note.type}
                  onChange={(event) => onChange(note.id, { type: event.target.value })}
                  aria-label="提要类型"
                >
                  <option value="机型说明">机型说明</option>
                  <option value="评审纪要">评审纪要</option>
                  <option value="阶段总结">阶段总结</option>
                  <option value="风险记录">风险记录</option>
                </select>
                <input
                  value={note.updatedAt}
                  onChange={(event) => onChange(note.id, { updatedAt: event.target.value })}
                  aria-label="提要更新时间"
                />
              </div>
              <textarea
                rows={3}
                value={note.body}
                onChange={(event) => onChange(note.id, { body: event.target.value })}
                aria-label="提要内容"
              />
            </div>
            <button
              className="danger-icon-button"
              onClick={() => onDelete(note.id)}
              aria-label="删除提要"
              title="删除提要"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export function AttachmentsDrawer({
  attachments,
  onAdd,
  onChange,
  onDelete,
}: {
  attachments: Attachment[];
  onAdd: () => void;
  onChange: (attachmentId: string, patch: Partial<Attachment>) => void;
  onDelete: (attachmentId: string) => void;
}) {
  return (
    <div className="drawer-section">
      <div className="drawer-heading">
        <h2>附件</h2>
        <button className="icon-button" onClick={onAdd} aria-label="添加附件">
          <Plus size={16} />
        </button>
      </div>
      {attachments.length === 0 ? (
        <div className="empty-mini">还没有附件。</div>
      ) : (
        attachments.map((attachment) => (
          <div className="attachment-item editable-note-item" key={attachment.id}>
            <Paperclip size={17} className="item-icon" />
            <div className="item-editor">
              <input
                value={attachment.name}
                onChange={(event) => onChange(attachment.id, { name: event.target.value })}
                aria-label="附件名称"
              />
              <div className="form-grid-two">
                <input
                  value={attachment.kind}
                  onChange={(event) => onChange(attachment.id, { kind: event.target.value })}
                  aria-label="附件类型"
                />
                <input
                  value={attachment.size}
                  onChange={(event) => onChange(attachment.id, { size: event.target.value })}
                  aria-label="附件大小"
                />
              </div>
              <textarea
                rows={2}
                value={attachment.note}
                onChange={(event) => onChange(attachment.id, { note: event.target.value })}
                aria-label="附件备注"
              />
            </div>
            <button
              className="danger-icon-button"
              onClick={() => onDelete(attachment.id)}
              aria-label="删除附件"
              title="删除附件"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
