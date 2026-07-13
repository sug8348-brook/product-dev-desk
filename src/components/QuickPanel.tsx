import {
  AttachmentsDrawer,
  NotesDrawer,
  ProjectDrawer,
} from "./BoardWidgets";
import type { ActivePanel, Attachment, Note, Project } from "../types";

type QuickPanelProps = {
  activePanel: ActivePanel;
  project: Project;
  factoryOptions: string[];
  canDeleteProject: boolean;
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

export function QuickPanel({
  activePanel,
  project,
  factoryOptions,
  canDeleteProject,
  onPanelChange,
  onProjectChange,
  onProjectDelete,
  onNoteAdd,
  onNoteChange,
  onNoteDelete,
  onAttachmentAdd,
  onAttachmentChange,
  onAttachmentDelete,
}: QuickPanelProps) {
  return (
    <aside className="quick-panel">
      <div className="panel-tabs">
        <button
          className={activePanel === "project" ? "active" : ""}
          onClick={() => onPanelChange("project")}
        >
          概览
        </button>
        <button
          className={activePanel === "notes" ? "active" : ""}
          onClick={() => onPanelChange("notes")}
        >
          提要
        </button>
        <button
          className={activePanel === "attachments" ? "active" : ""}
          onClick={() => onPanelChange("attachments")}
        >
          附件
        </button>
      </div>

      {activePanel === "project" && (
        <ProjectDrawer
          project={project}
          factoryOptions={factoryOptions}
          onChange={onProjectChange}
          onDelete={onProjectDelete}
          canDelete={canDeleteProject}
        />
      )}
      {activePanel === "notes" && (
        <NotesDrawer
          notes={project.notes}
          onAdd={onNoteAdd}
          onChange={onNoteChange}
          onDelete={onNoteDelete}
        />
      )}
      {activePanel === "attachments" && (
        <AttachmentsDrawer
          attachments={project.attachments}
          onAdd={onAttachmentAdd}
          onChange={onAttachmentChange}
          onDelete={onAttachmentDelete}
        />
      )}
    </aside>
  );
}
