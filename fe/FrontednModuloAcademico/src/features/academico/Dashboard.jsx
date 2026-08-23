import { COLORS } from "../../constants/color";

function Card({ titulo, valor }) {
  return (
    <div
      style={{
        background: COLORS.white,
        border: `1px solid ${COLORS.borderGray}`,
        borderRadius: 12,
        padding: 24,
        minWidth: 220,
        flex: 1,
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px)";
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 14,
          color: COLORS.textSecondary,
        }}
      >
        {titulo}
      </h3>

      <p
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: COLORS.blue,
          margin: "10px 0 0 0",
        }}
      >
        {valor}
      </p>
    </div>
  );
}

function Dashboard() {
  return (
    <div>
      <div
        style={{
          background: COLORS.white,
          border: `1px solid ${COLORS.borderGray}`,
          borderRadius: 12,
          padding: 30,
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: 0,
            color: COLORS.red,
            fontSize: 28,
          }}
        >
          TITAN-ES
        </h1>

        <p
          style={{
            marginTop: 8,
            color: COLORS.textSecondary,
          }}
        >
          Centro de Entrenamiento en Trabajo Seguro en Alturas
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <Card titulo="Cursos Programados" valor="12" />
        <Card titulo="Participantes" valor="84" />
        <Card titulo="Cursos Hoy" valor="3" />
        <Card titulo="Inscripciones" valor="52" />
      </div>
    </div>
  );
}

export default Dashboard;