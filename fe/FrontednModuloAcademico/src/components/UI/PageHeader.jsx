import React from 'react';
import { COLORS } from '../../constants/color.js';

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <div style={{ width: 4, height: 28, background: COLORS.red, borderRadius: 2 }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, margin: 0 }}>{title}</h1>
      </div>
      {subtitle && <p style={{ color: COLORS.textSecondary, fontSize: 14, margin: "4px 0 0 16px" }}>{subtitle}</p>}
    </div>
  );
}

export default PageHeader;