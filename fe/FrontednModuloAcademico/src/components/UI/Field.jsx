import React from 'react';
import { COLORS } from '../../constants/color.js';
function Field({ label, required, children, error }) {
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
 
const inputStyle = {
  width: "100%", padding: "9px 12px", fontSize: 14,
  border: `1px solid ${COLORS.borderGray}`, borderRadius: 8,
  background: COLORS.white, color: COLORS.textPrimary,
  outline: "none", boxSizing: "border-box",
  fontFamily: "inherit"
};

export default Field;
