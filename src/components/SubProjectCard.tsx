import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { SubProject, WorkTask } from "../types";
import { DateField } from "./DateField";
import { TaskRow } from "./BoardWidgets";

type SubProjectCardProps = {
  subproject: SubProject;
  onChange: (patch: Partial<SubProject>) => void;
  onDelete: () => void;
  onAddTask: () => void;
  onTaskAdvance: (task: WorkTask) => void;
  onTaskChange: (taskId: string, patch: Partial<WorkTask>) => void;
  onTaskDelete: (taskId: string) => void;
};

export function SubProjectCard({
  subproject,
  onChange,
  onDelete,
  onAddTask,
  onTaskAdvance,
  onTaskChange,
  onTaskDelete,
}: SubProjectCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <article className={`subproject-card ${isCollapsed ? "collapsed" : ""}`}>
      <div className="subproject-header editable-header">
        <button
          className="collapse-button"
          onClick={() => setIsCollapsed((current) => !current)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "展开对应内容" : "收起对应内容"}
          title={isCollapsed ? "展开对应内容" : "收起对应内容"}
        >
          <ChevronRight className="collapse-icon" size={16} />
        </button>
        <div className="subproject-editor">
          <input
            className="title-input"
            value={subproject.title}
            onChange={(event) => onChange({ title: event.target.value })}
            aria-label="对应内容名称"
          />
          <div className="inline-controls">
            <label className="date-control">
              预计完成
              <DateField
                value={subproject.dueDate}
                onChange={(dueDate) => onChange({ dueDate })}
                ariaLabel="对应内容预计完成日期"
              />
            </label>
          </div>
        </div>
        <div className="subproject-actions">
          <button
            className="danger-icon-button"
            onClick={onDelete}
            aria-label="删除对应内容"
            title="删除对应内容"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="task-list">
            {subproject.tasks.map((task) => (
              <TaskRow
                task={task}
                key={task.id}
                onAdvance={() => onTaskAdvance(task)}
                onChange={(patch) => onTaskChange(task.id, patch)}
                onDelete={() => onTaskDelete(task.id)}
              />
            ))}
          </div>

          <button className="ghost-button" onClick={onAddTask}>
            <Plus size={15} />
            添加作业
          </button>
        </>
      )}
    </article>
  );
}
