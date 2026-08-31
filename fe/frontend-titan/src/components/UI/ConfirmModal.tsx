import { COLORS } from "../../constants/color";

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
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.white, borderRadius: 12, padding: "24px 28px",
          width: "100%", maxWidth: 380, boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 16, color: COLORS.textPrimary, margin: "0 0 10px 0" }}>{title}</p>
        <p style={{ fontSize: 14, color: COLORS.textSecondary, margin: "0 0 22px 0" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              background: COLORS.lightGray, border: `1px solid ${COLORS.borderGray}`, borderRadius: 8,
              padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: COLORS.textPrimary,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: danger ? COLORS.red : COLORS.blue, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
