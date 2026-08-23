import { useEffect } from "react";
import { COLORS } from "../../constants/color.js";

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = type === "success" ? COLORS.successBg : type === "error" ? COLORS.errorBg : COLORS.warningBg;
  const color = type === "success" ? COLORS.successText : type === "error" ? COLORS.errorText : COLORS.warningText;
  const icon = type === "success" ? "✔" : type === "error" ? "✖" : "⚠";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 1000,
      background: bg, color, border: `1px solid ${color}`,
      borderRadius: 10, padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 10,
      fontWeight: 500, fontSize: 14, maxWidth: 380,
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)"
    }}>
      <span>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color, fontSize: 16, padding: 0 }}>×</button>
    </div>
  );
}

export default Toast;