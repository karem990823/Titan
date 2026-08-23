import { COLORS } from "../../constants/color";

function Header() {
  const fecha = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
        <h2
          style={{
            margin: 0,
            color: COLORS.textPrimary,
          }}
        >
          TITAN-ES
        </h2>

        <p
          style={{
            margin: 0,
            color: COLORS.textSecondary,
            fontSize: 13,
          }}
        >
          {fecha}
        </p>
      </div>

      <div
        style={{
          fontWeight: 600,
          color: COLORS.blue,
        }}
      >
         Administrador
      </div>
    </div>
  );
}

export default Header;