import { useEffect, useRef, useState } from "react";

export type NoticeType = "success" | "error" | "info";

export type Notice = {
  id: number;
  type: NoticeType;
  message: string;
};

function createNotice(type: NoticeType, message: string): Notice {
  return {
    id: Date.now(),
    type,
    message,
  };
}

export function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function showNotice(type: NoticeType, message: string) {
    clearTimer();
    setNotice(createNotice(type, message));
    timerRef.current = window.setTimeout(() => {
      setNotice(null);
      timerRef.current = null;
    }, 3200);
  }

  function clearNotice() {
    clearTimer();
    setNotice(null);
  }

  useEffect(() => clearTimer, []);

  return {
    notice,
    clearNotice,
    showError: (message: string) => showNotice("error", message),
    showInfo: (message: string) => showNotice("info", message),
    showSuccess: (message: string) => showNotice("success", message),
  };
}
