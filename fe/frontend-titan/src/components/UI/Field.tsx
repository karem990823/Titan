import type { ReactNode } from "react";
import { COLORS } from "../../constants/color";

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}

function Field({ label, required, children, error }: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 5 }}>
        {label}{required && <span style={{ color: COLORS.red }}> *</span>}
      </label>
      {children}
      {error && <p style={{ color: COLORS.errorText, fontSize: 12, margin: "4px 0 0 0" }}>{error}</p>}
    </div>
  );
}

export default Field;
