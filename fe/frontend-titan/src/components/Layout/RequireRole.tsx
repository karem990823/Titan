import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import { COLORS } from "../../constants/color";
import type { RolNombre } from "../../types";

interface RequireRoleProps {
  roles: RolNombre[];
  children: ReactNode;
}

function RequireRole({ roles, children }: RequireRoleProps) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: COLORS.textSecondary, fontSize: 14 }}>
        Cargando...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!usuario.rol_nombre || !roles.includes(usuario.rol_nombre)) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <p style={{ fontSize: 36, margin: "0 0 12px 0" }}>🚫</p>
        <p style={{ fontWeight: 700, color: COLORS.textPrimary, margin: "0 0 6px 0" }}>Acceso no autorizado</p>
        <p style={{ color: COLORS.textSecondary, fontSize: 14, margin: 0 }}>
          Tu rol no tiene permiso para ver esta página.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireRole;
