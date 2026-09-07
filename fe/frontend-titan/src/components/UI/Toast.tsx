import { useEffect } from "react";
import type { ToastType } from "../../types";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const ESTILOS: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: "bg-green-50", text: "text-green-800", icon: "check_circle" },
  error: { bg: "bg-error-container", text: "text-on-error-container", icon: "error" },
  warning: { bg: "bg-tertiary-fixed", text: "text-on-tertiary-fixed", icon: "warning" },
};

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const { bg, text, icon } = ESTILOS[type];

  return (
    <div
      className={`fixed bottom-gap-lg right-gap-lg z-[1000] ${bg} ${text} rounded-lg shadow-xl px-gap-md py-gap-sm flex items-center gap-gap-xs max-w-sm font-body-sm text-body-sm`}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className={`${text} text-lg leading-none p-0 bg-transparent border-none cursor-pointer`}>
        ×
      </button>
    </div>
  );
}

export default Toast;
