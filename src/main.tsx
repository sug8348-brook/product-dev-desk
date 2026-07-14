import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppNotice } from "./components/AppNotice";
import { Sidebar } from "./components/Sidebar";
import { Workspace } from "./components/Workspace";
import { initialProjects } from "./data/initialData";
import { useBoardActions } from "./hooks/useBoardActions";
import { useBoardData } from "./hooks/useBoardData";
import { useNotice } from "./hooks/useNotice";
import type { ActivePanel, ProjectFilter } from "./types";
import "./styles.css";

function App() {
  const {
    projects,
    factoryOptions,
    setProjects,
    setFactoryOptions,
    replaceBoardData: replaceStoredBoardData,
    resetBoardData,
    repository,
    loadError,
    saveError,
  } = useBoardData();
  const [selectedProjectId, setSelectedProjectId] = useState(() => projects[0]?.id ?? initialProjects[0].id);
  const [activePanel, setActivePanel] = useState<ActivePanel>("project");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newFactoryName, setNewFactoryName] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const notice = useNotice();

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  useEffect(() => {
    if (loadError) {
      notice.showError("本地数据加载失败，已使用内置示例数据。");
    }
  }, [loadError]);

  useEffect(() => {
    if (saveError) {
      notice.showError("本地数据保存失败，请检查桌面数据库状态。");
    }
  }, [saveError]);

  useEffect(() => {
    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0]?.id ?? initialProjects[0].id);
      setActivePanel("project");
    }
  }, [projects, selectedProjectId]);

  const actions = useBoardActions({
    projects,
    factoryOptions,
    selectedProject,
    selectedProjectId,
    newFactoryName,
    repository,
    setProjects,
    setFactoryOptions,
    replaceStoredBoardData,
    resetBoardData,
    setSelectedProjectId,
    setActivePanel,
    setFilter,
    setNewFactoryName,
    notify: {
      error: notice.showError,
      info: notice.showInfo,
      success: notice.showSuccess,
    },
  });

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        !normalized ||
        project.title.toLowerCase().includes(normalized) ||
        project.description.toLowerCase().includes(normalized) ||
        project.developmentFactory.toLowerCase().includes(normalized) ||
        project.manufacturingFactory.toLowerCase().includes(normalized) ||
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

  return (
    <main className="app-shell">
      <Sidebar
        projects={projects}
        filteredProjects={filteredProjects}
        selectedProject={selectedProject}
        query={query}
        filter={filter}
        settingsOpen={settingsOpen}
        newFactoryName={newFactoryName}
        factoryOptions={factoryOptions}
        importInputRef={importInputRef}
        onQueryChange={setQuery}
        onFilterChange={setFilter}
        onAddProject={actions.addProject}
        onSelectProject={(projectId) => {
          setSelectedProjectId(projectId);
          setActivePanel("project");
        }}
        onExportData={actions.exportData}
        onImportFile={actions.importData}
        onResetData={actions.resetData}
        onToggleSettings={() => setSettingsOpen((current) => !current)}
        onNewFactoryNameChange={setNewFactoryName}
        onSubmitFactoryOption={actions.submitFactoryOption}
        onDeleteFactoryOption={actions.deleteFactoryOption}
      />

      <Workspace
        project={selectedProject}
        projectsCount={projects.length}
        stats={stats}
        activePanel={activePanel}
        factoryOptions={factoryOptions}
        onAddSubProject={actions.addSubProject}
        onSubProjectChange={actions.updateSubProject}
        onSubProjectDelete={actions.deleteSubProject}
        onTaskAdd={actions.addTask}
        onTaskAdvance={actions.advanceTaskStatus}
        onTaskChange={actions.updateTask}
        onTaskDelete={actions.deleteTask}
        onPanelChange={setActivePanel}
        onProjectChange={(patch) => actions.updateProject(selectedProject.id, patch)}
        onProjectDelete={() => actions.deleteProject(selectedProject.id)}
        onNoteAdd={actions.addNote}
        onNoteChange={actions.updateNote}
        onNoteDelete={actions.deleteNote}
        onAttachmentAdd={actions.addAttachment}
        onAttachmentChange={actions.updateAttachment}
        onAttachmentDelete={actions.deleteAttachment}
      />
      <AppNotice notice={notice.notice} onClose={notice.clearNotice} />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);





