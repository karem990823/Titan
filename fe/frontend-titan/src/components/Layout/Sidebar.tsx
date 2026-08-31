import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.webp";
import { COLORS } from "../../constants/color";
import { useAuth } from "../../features/auth/useAuth";
import type { RolNombre } from "../../types";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles: RolNombre[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: "🏠", roles: ["Administrador", "Instructor"] },
  { to: "/calendario", label: "Calendario", icon: "📅", roles: ["Administrador", "Instructor", "Empresa"] },
  { to: "/programar", label: "Programar curso", icon: "➕", roles: ["Administrador", "Instructor"] },
  { to: "/inscribir", label: "Inscribir participante", icon: "📋", roles: ["Administrador", "Instructor"] },
  { to: "/academico/evaluaciones", label: "Evaluaciones", icon: "📝", roles: ["Administrador", "Instructor"] },
  { to: "/academico/resultados", label: "Resultados", icon: "📊", roles: ["Administrador", "Instructor"] },
  { to: "/academico/salud", label: "Salud ocupacional", icon: "🩺", roles: ["Administrador", "Instructor"] },
  { to: "/academico/asistencia", label: "Asistencia", icon: "✅", roles: ["Administrador", "Instructor"] },
  { to: "/academico/incidentes", label: "Incidentes", icon: "⚠️", roles: ["Administrador", "Instructor"] },
  { to: "/empresa/trabajadores", label: "Mis trabajadores", icon: "👷", roles: ["Empresa"] },
  { to: "/empresa/documentos", label: "Documentos", icon: "📁", roles: ["Empresa"] },
  { to: "/empresa/inscribir", label: "Inscribir trabajador", icon: "📋", roles: ["Empresa"] },
  { to: "/empresa/certificados", label: "Mis certificados", icon: "🎓", roles: ["Empresa"] },
  { to: "/admin/usuarios", label: "Usuarios", icon: "🔑", roles: ["Administrador"] },
  { to: "/admin/facturacion", label: "Facturación", icon: "💵", roles: ["Administrador"] },
  { to: "/admin/inventario", label: "Inventario", icon: "🧰", roles: ["Administrador"] },
  { to: "/admin/reportes", label: "Reportes", icon: "📈", roles: ["Administrador", "Instructor"] },
];

function Sidebar() {
  const { usuario } = useAuth();
  const items = NAV_ITEMS.filter((item) => usuario?.rol_nombre && item.roles.includes(usuario.rol_nombre));

  return (
    <aside
      style={{
        width: 250,
        minHeight: "100vh",
        background: "linear-gradient(180deg,#1B3A6B 0%,#10264A 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 20, textAlign: "center" }}>
        <img src={logo} alt="Titan ES" style={{ width: "100%", maxWidth: 180 }} />
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, lineHeight: 1.5 }}>
          Centro de Entrenamiento
          <br />
          Trabajo Seguro en Alturas
        </p>
      </div>

      <nav style={{ padding: 12 }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              marginBottom: 8,
              borderRadius: 8,
              textDecoration: "none",
              color: "#fff",
              background: isActive ? COLORS.red : "transparent",
            })}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: 20, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
        TITAN-ES v1.0
        <br />
        2026
      </div>
    </aside>
  );
}

export default Sidebar;
