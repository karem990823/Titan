import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import type { RolNombre } from "../../types";

interface RequireRoleProps {
  roles: RolNombre[];
  children: ReactNode;
}

function RequireRole({ roles, children }: RequireRoleProps) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div className="p-gap-2xl text-center text-on-surface-variant font-body-sm text-body-sm">Cargando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!usuario.rol_nombre || !roles.includes(usuario.rol_nombre)) {
    return (
      <div className="p-gap-2xl text-center flex flex-col items-center gap-gap-2xs">
        <span className="material-symbols-outlined text-4xl text-error">block</span>
        <p className="font-headline-sm text-headline-sm text-on-surface m-0">Acceso no autorizado</p>
        <p className="text-on-surface-variant font-body-sm text-body-sm m-0">
          Tu rol no tiene permiso para ver esta página.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireRole;
