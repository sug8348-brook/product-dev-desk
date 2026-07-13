import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { Notice } from "../hooks/useNotice";

type AppNoticeProps = {
  notice: Notice | null;
  onClose: () => void;
};

export function AppNotice({ notice, onClose }: AppNoticeProps) {
  if (!notice) return null;

  const Icon =
    notice.type === "success" ? CheckCircle2 : notice.type === "error" ? AlertCircle : Info;

  return (
    <div className={`app-notice ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
      <Icon size={18} />
      <span>{notice.message}</span>
      <button type="button" onClick={onClose} aria-label="关闭提示">
        <X size={15} />
      </button>
    </div>
  );
}
