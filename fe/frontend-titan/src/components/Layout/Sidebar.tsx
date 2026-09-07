import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.webp";
import { useAuth } from "../../features/auth/useAuth";
import type { RolNombre } from "../../types";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles: RolNombre[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: "home", roles: ["Administrador", "Instructor"] },
  { to: "/calendario", label: "Calendario", icon: "calendar_month", roles: ["Administrador", "Instructor", "Empresa"] },
  { to: "/programar", label: "Programar curso", icon: "post_add", roles: ["Administrador", "Instructor"] },
  { to: "/inscribir", label: "Inscribir participante", icon: "assignment_ind", roles: ["Administrador", "Instructor"] },
  { to: "/academico/evaluaciones", label: "Evaluaciones", icon: "quiz", roles: ["Administrador", "Instructor"] },
  { to: "/academico/resultados", label: "Resultados", icon: "bar_chart", roles: ["Administrador", "Instructor"] },
  { to: "/academico/salud", label: "Salud ocupacional", icon: "medical_services", roles: ["Administrador", "Instructor"] },
  { to: "/academico/asistencia", label: "Asistencia", icon: "fact_check", roles: ["Administrador", "Instructor"] },
  { to: "/academico/incidentes", label: "Incidentes", icon: "warning", roles: ["Administrador", "Instructor"] },
  { to: "/empresa/trabajadores", label: "Mis trabajadores", icon: "engineering", roles: ["Empresa"] },
  { to: "/empresa/documentos", label: "Documentos", icon: "folder", roles: ["Empresa"] },
  { to: "/empresa/inscribir", label: "Inscribir trabajador", icon: "assignment_ind", roles: ["Empresa"] },
  { to: "/empresa/certificados", label: "Mis certificados", icon: "workspace_premium", roles: ["Empresa"] },
  { to: "/admin/usuarios", label: "Usuarios", icon: "manage_accounts", roles: ["Administrador"] },
  { to: "/admin/facturacion", label: "Facturación", icon: "payments", roles: ["Administrador"] },
  { to: "/admin/inventario", label: "Inventario", icon: "inventory_2", roles: ["Administrador"] },
  { to: "/admin/reportes", label: "Reportes", icon: "monitoring", roles: ["Administrador", "Instructor"] },
];

function Sidebar() {
  const { usuario } = useAuth();
  const items = NAV_ITEMS.filter((item) => usuario?.rol_nombre && item.roles.includes(usuario.rol_nombre));

  return (
    <aside className="w-64 min-h-screen shrink-0 bg-on-secondary-fixed flex flex-col">
      <div className="p-gap-lg flex flex-col items-center gap-gap-2xs border-b border-surface-bright/10">
        <img src={logo} alt="TITAN-ES" className="w-full max-w-[160px] object-contain" />
        <p className="font-label-sm text-label-sm text-secondary-fixed text-center leading-relaxed">
          Centro de Entrenamiento
          <br />
          Trabajo Seguro en Alturas
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-gap-sm flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-gap-xs px-gap-sm py-2.5 rounded-lg font-body-md text-body-md transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary font-semibold"
                  : "text-surface-bright/80 hover:bg-surface-bright/10 hover:text-surface-bright"
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-gap-md text-center font-label-sm text-label-sm text-surface-bright/40 border-t border-surface-bright/10">
        TITAN-ES v1.0
        <br />
        2026
      </div>
    </aside>
  );
}

export default Sidebar;
