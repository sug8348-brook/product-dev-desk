import type React from "react";
import {
  Archive,
  CalendarDays,
  CircleDot,
  Download,
  Inbox,
  Layers3,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { statusLabel } from "../constants";
import type { Project, ProjectFilter } from "../types";
import { getFactoryTagStyle } from "../utils/factoryColors";
import { FilterButton } from "./BoardWidgets";

export function Sidebar({
  projects,
  filteredProjects,
  selectedProject,
  query,
  filter,
  settingsOpen,
  newFactoryName,
  factoryOptions,
  importInputRef,
  onQueryChange,
  onFilterChange,
  onAddProject,
  onSelectProject,
  onExportData,
  onImportFile,
  onResetData,
  onToggleSettings,
  onNewFactoryNameChange,
  onSubmitFactoryOption,
  onDeleteFactoryOption,
}: {
  projects: Project[];
  filteredProjects: Project[];
  selectedProject: Project;
  query: string;
  filter: ProjectFilter;
  settingsOpen: boolean;
  newFactoryName: string;
  factoryOptions: string[];
  importInputRef: React.RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onFilterChange: (filter: ProjectFilter) => void;
  onAddProject: () => void;
  onSelectProject: (projectId: string) => void;
  onExportData: () => void;
  onImportFile: (file: File) => void;
  onResetData: () => void;
  onToggleSettings: () => void;
  onNewFactoryNameChange: (value: string) => void;
  onSubmitFactoryOption: () => void;
  onDeleteFactoryOption: (factoryName: string) => void;
}) {
  return (
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
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜索机型或标签"
        />
      </label>

      <nav className="nav-group" aria-label="工作区导航">
        <FilterButton active={filter === "all"} icon={<Inbox size={17} />} onClick={() => onFilterChange("all")}>
          全部机型
        </FilterButton>
        <FilterButton active={filter === "active"} icon={<CircleDot size={17} />} onClick={() => onFilterChange("active")}>
          开发中
        </FilterButton>
        <FilterButton active={filter === "paused"} icon={<CalendarDays size={17} />} onClick={() => onFilterChange("paused")}>
          企划中
        </FilterButton>
        <FilterButton active={filter === "done"} icon={<Archive size={17} />} onClick={() => onFilterChange("done")}>
          已量产
        </FilterButton>
      </nav>

      <section className="project-list" aria-label="规划机型列表">
        <div className="section-heading">
          <span>规划机型</span>
          <button className="icon-button" onClick={onAddProject} aria-label="新建规划机型">
            <Plus size={16} />
          </button>
        </div>
        {filteredProjects.map((project) => (
          <button
            className={`project-nav-card ${project.id === selectedProject.id ? "selected" : ""}`}
            key={project.id}
            onClick={() => onSelectProject(project.id)}
          >
            <span className={`status-dot ${project.status}`} />
            <span>
              <strong>{project.title}</strong>
              <small>{statusLabel[project.status]} · {project.updatedAt}</small>
              <span
                className="factory-nav-tag"
                style={getFactoryTagStyle(project.developmentFactory)}
              >
                {project.developmentFactory || "未选开发工厂"}
              </span>
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

      <div className="data-actions" aria-label="数据工具">
        <input
          ref={importInputRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImportFile(file);
            event.target.value = "";
          }}
          aria-label="导入 JSON 数据"
        />
        <button className="settings-button" onClick={onExportData}>
          <Download size={17} />
          导出数据
        </button>
        <button className="settings-button" onClick={() => importInputRef.current?.click()}>
          <Upload size={17} />
          导入数据
        </button>
        <button className="settings-button" onClick={onResetData}>
          <RotateCcw size={17} />
          重置示例
        </button>
        <button
          className={`settings-button ${settingsOpen ? "active" : ""}`}
          onClick={onToggleSettings}
          aria-expanded={settingsOpen}
        >
          <Settings size={17} />
          设置
        </button>
        {settingsOpen && (
          <section className="settings-panel" aria-label="设置">
            <div className="section-heading">
              <span>备选工厂</span>
            </div>
            <div className="inline-add-control settings-add-control">
              <input
                value={newFactoryName}
                onChange={(event) => onNewFactoryNameChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSubmitFactoryOption();
                  }
                }}
                placeholder="输入工厂名称"
                aria-label="新增备选工厂"
              />
              <button type="button" className="ghost-button" onClick={onSubmitFactoryOption}>
                <Plus size={15} />
                添加
              </button>
            </div>
            <div className="factory-option-list">
              {factoryOptions.length === 0 ? (
                <div className="empty-mini">还没有备选工厂。</div>
              ) : (
                factoryOptions.map((factoryName) => (
                  <div className="factory-option-item" key={factoryName}>
                    <span style={getFactoryTagStyle(factoryName)}>{factoryName}</span>
                    <button
                      className="danger-icon-button"
                      onClick={() => onDeleteFactoryOption(factoryName)}
                      aria-label={`删除备选工厂 ${factoryName}`}
                      title="删除备选工厂"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
