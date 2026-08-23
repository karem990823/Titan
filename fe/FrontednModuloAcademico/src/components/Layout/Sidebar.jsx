import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.jpeg'
import { COLORS } from '../../constants/color'



const items = [
  {
    to: "/",
    label: "Inicio",
    icon: "🏠",
  },
  {
    to: "/calendario",
    label: "Calendario",
    icon: "📅",
  },
  {
    to: "/programar",
    label: "Programar curso",
    icon: "➕",
  },
  {
    to: "/inscribir",
    label: "Inscribir participante",
    icon: "📋",
  },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: 250,
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#1B3A6B 0%,#10264A 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: 20,
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="Titan ES"
          style={{
            width: "100%",
            maxWidth: 180,
          }}
        />

        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            lineHeight: 1.5,
          }}
        >
          Centro de Entrenamiento
          <br />
          Trabajo Seguro en Alturas
        </p>
      </div>

      <nav
        style={{
          padding: 12,
        }}
      >
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
              background: isActive
                ? COLORS.red
                : "transparent",
            })}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          padding: 20,
          textAlign: "center",
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
        }}
      >
        TITAN-ES v1.0
        <br />
        2026
      </div>
    </aside>
  );
}

export default Sidebar;