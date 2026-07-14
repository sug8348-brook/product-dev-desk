import type { Dispatch, SetStateAction } from "react";
import { taskStatusFlow } from "../constants";
import { initialProjects } from "../data/initialData";
import type { BoardRepository } from "../repositories/boardRepository";
import type {
  ActivePanel,
  Attachment,
  BoardData,
  Note,
  Project,
  ProjectFilter,
  SubProject,
  WorkTask,
} from "../types";
import { uniqueStrings } from "../utils/tags";

type UseBoardActionsParams = {
  projects: Project[];
  factoryOptions: string[];
  selectedProject: Project;
  selectedProjectId: string;
  newFactoryName: string;
  notify: {
    error: (message: string) => void;
    info: (message: string) => void;
    success: (message: string) => void;
  };
  repository: BoardRepository;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setFactoryOptions: Dispatch<SetStateAction<string[]>>;
  replaceStoredBoardData: (nextBoardData: BoardData) => void;
  resetBoardData: () => Promise<BoardData>;
  setSelectedProjectId: Dispatch<SetStateAction<string>>;
  setActivePanel: Dispatch<SetStateAction<ActivePanel>>;
  setFilter: Dispatch<SetStateAction<ProjectFilter>>;
  setNewFactoryName: Dispatch<SetStateAction<string>>;
};

function confirmDelete(targetName: string) {
  return window.confirm(`确定要删除「${targetName}」吗？此操作会立即保存到本地。`);
}

export function useBoardActions({
  projects,
  factoryOptions,
  selectedProject,
  selectedProjectId,
  newFactoryName,
  notify,
  repository,
  setProjects,
  setFactoryOptions,
  replaceStoredBoardData,
  resetBoardData,
  setSelectedProjectId,
  setActivePanel,
  setFilter,
  setNewFactoryName,
}: UseBoardActionsParams) {
  function syncBoardSelection(nextBoardData: BoardData) {
    setSelectedProjectId(nextBoardData.projects[0]?.id ?? initialProjects[0].id);
    setFilter("all");
    setActivePanel("project");
  }

  function applyBoardData(nextBoardData: BoardData) {
    replaceStoredBoardData(nextBoardData);
    syncBoardSelection(nextBoardData);
  }

  function exportData() {
    const data = repository.createExport({
      projects,
      factoryOptions,
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateLabel = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `model-dev-board-${dateLabel}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success("数据已导出为 JSON 文件。");
  }

  function importData(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsedData = JSON.parse(String(reader.result)) as unknown;
        const importedBoardData = repository.parseImport(parsedData);

        if (!importedBoardData) {
          notify.error("导入失败：文件格式或版本不匹配。");
          return;
        }

        if (!window.confirm("导入会替换当前看板数据，确定继续吗？")) return;

        applyBoardData(importedBoardData);
        notify.success("导入完成，当前看板数据已替换。");
      } catch {
        notify.error("导入失败：无法解析这个 JSON 文件。");
      }
    };

    reader.readAsText(file);
  }

  async function resetData() {
    if (!window.confirm("确定要恢复内置示例数据吗？当前本地编辑会被替换。")) return;

    try {
      syncBoardSelection(await resetBoardData());
      notify.success("已恢复内置示例数据。");
    } catch {
      notify.error("重置失败：无法写入本地数据库。");
    }
  }

  function addFactoryOption(factoryName: string) {
    const normalizedName = factoryName.trim();
    if (!normalizedName) return;

    setFactoryOptions((current) => uniqueStrings([...current, normalizedName]));
  }

  function submitFactoryOption() {
    addFactoryOption(newFactoryName);
    setNewFactoryName("");
  }

  function deleteFactoryOption(factoryName: string) {
    const usedCount = projects.filter(
      (project) =>
        project.developmentFactory === factoryName || project.manufacturingFactory === factoryName,
    ).length;
    const message =
      usedCount > 0
        ? `「${factoryName}」正在被 ${usedCount} 个机型使用。删除后这些机型的相关工厂选择会被清空，确定继续吗？`
        : `确定要删除备选工厂「${factoryName}」吗？`;

    if (!window.confirm(message)) return;

    setFactoryOptions((current) => current.filter((option) => option !== factoryName));
    setProjects((current) =>
      current.map((project) => ({
        ...project,
        developmentFactory:
          project.developmentFactory === factoryName ? "" : project.developmentFactory,
        manufacturingFactory:
          project.manufacturingFactory === factoryName ? "" : project.manufacturingFactory,
      })),
    );
  }

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
    const projectToDelete = projects.find((project) => project.id === projectId);
    if (!confirmDelete(projectToDelete?.title ?? "这个规划机型")) return;

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
    const subProjectToDelete = selectedProject.subprojects.find((subproject) => subproject.id === subProjectId);
    if (!confirmDelete(subProjectToDelete?.title ?? "这个对应内容")) return;

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
    const taskToDelete = selectedProject.subprojects
      .find((subproject) => subproject.id === subProjectId)
      ?.tasks.find((task) => task.id === taskId);
    if (!confirmDelete(taskToDelete?.title ?? "这个作业")) return;

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

  function addNote() {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: "新提要",
      type: "机型说明",
      body: "记录这条提要的背景、结论或待跟进事项。",
      updatedAt: "刚刚",
    };

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : { ...project, updatedAt: "刚刚", notes: [newNote, ...project.notes] },
      ),
    );
  }

  function updateNote(noteId: string, patch: Partial<Note>) {
    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              notes: project.notes.map((note) =>
                note.id === noteId ? { ...note, ...patch, updatedAt: patch.updatedAt ?? "刚刚" } : note,
              ),
            },
      ),
    );
  }

  function deleteNote(noteId: string) {
    const noteToDelete = selectedProject.notes.find((note) => note.id === noteId);
    if (!confirmDelete(noteToDelete?.title ?? "这个提要")) return;

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              notes: project.notes.filter((note) => note.id !== noteId),
            },
      ),
    );
  }

  function addAttachment() {
    const newAttachment: Attachment = {
      id: `a${Date.now()}`,
      name: "新附件记录",
      kind: "Document",
      size: "未填写",
      note: "记录附件用途、版本或存放位置。",
    };

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : { ...project, updatedAt: "刚刚", attachments: [newAttachment, ...project.attachments] },
      ),
    );
  }

  function updateAttachment(attachmentId: string, patch: Partial<Attachment>) {
    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              attachments: project.attachments.map((attachment) =>
                attachment.id === attachmentId ? { ...attachment, ...patch } : attachment,
              ),
            },
      ),
    );
  }

  function deleteAttachment(attachmentId: string) {
    const attachmentToDelete = selectedProject.attachments.find((attachment) => attachment.id === attachmentId);
    if (!confirmDelete(attachmentToDelete?.name ?? "这个附件记录")) return;

    setProjects((current) =>
      current.map((project) =>
        project.id !== selectedProject.id
          ? project
          : {
              ...project,
              updatedAt: "刚刚",
              attachments: project.attachments.filter((attachment) => attachment.id !== attachmentId),
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
      developmentFactory: "",
      manufacturingFactory: "",
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
      due: "",
      memo: "",
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
      dueDate: "",
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

  return {
    addAttachment,
    addNote,
    addProject,
    addSubProject,
    addTask,
    advanceTaskStatus,
    deleteAttachment,
    deleteFactoryOption,
    deleteNote,
    deleteProject,
    deleteSubProject,
    deleteTask,
    exportData,
    importData,
    resetData,
    submitFactoryOption,
    updateAttachment,
    updateNote,
    updateProject,
    updateSubProject,
    updateTask,
  };
}
