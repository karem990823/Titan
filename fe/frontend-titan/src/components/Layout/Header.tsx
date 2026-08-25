import { useNavigate } from "react-router-dom";
import { COLORS } from "../../constants/color";
import { useAuth } from "../../features/auth/AuthContext";

function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const fecha = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.borderGray}`,
        padding: "16px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: COLORS.textPrimary }}>TITAN-ES</h2>
        <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: 13 }}>{fecha}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontWeight: 600, color: COLORS.blue, fontSize: 14 }}>
            {usuario?.nombre} {usuario?.apellido || ""}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: COLORS.textSecondary }}>{usuario?.rol_nombre}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: `1px solid ${COLORS.borderGray}`,
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.textSecondary,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Header;
