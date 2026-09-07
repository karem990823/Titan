interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Único componente de confirmación de la app (HU22) — no duplicar por módulo. */
function ConfirmModal({ open, title, message, confirmLabel = "Confirmar", danger = true, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[1100] bg-on-background/50 flex items-center justify-center p-margin-mobile"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-xl p-gap-lg w-full max-w-sm shadow-xl"
      >
        <p className="font-headline-sm text-headline-sm text-on-surface m-0 mb-gap-2xs">{title}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant m-0 mb-gap-lg">{message}</p>
        <div className="flex justify-end gap-gap-xs">
          <button
            onClick={onCancel}
            className="px-gap-sm py-2 rounded-lg bg-surface-container-high text-on-surface font-label-lg text-label-lg uppercase tracking-wider"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-gap-sm py-2 rounded-lg text-on-primary font-label-lg text-label-lg uppercase tracking-wider ${
              danger ? "bg-primary-container hover:bg-primary" : "bg-secondary hover:bg-on-secondary-fixed"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
