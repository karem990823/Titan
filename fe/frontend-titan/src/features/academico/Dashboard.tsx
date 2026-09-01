import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { API_DASHBOARD, COLORS } from "../../constants/color";
import type { ApiResponse, ResumenDashboard } from "../../types";

interface CardProps {
  titulo: string;
  valor: number | string;
}

function Card({ titulo, valor }: CardProps) {
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
      <h3 style={{ margin: 0, fontSize: 14, color: COLORS.textSecondary }}>{titulo}</h3>
      <p style={{ fontSize: 30, fontWeight: 700, color: COLORS.blue, margin: "10px 0 0 0" }}>{valor}</p>
    </div>
  );
}

function Dashboard() {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);

  useEffect(() => {
    apiFetch<ApiResponse<ResumenDashboard>>(`${API_DASHBOARD}/resumen`)
      .then((res) => setResumen(res.data))
      .catch(() => setResumen(null));
  }, []);

  return (
    <div>
      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: 30, marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: COLORS.red, fontSize: 28 }}>TITAN-ES</h1>
        <p style={{ marginTop: 8, color: COLORS.textSecondary }}>
          Centro de Entrenamiento en Trabajo Seguro en Alturas
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Card titulo="Cursos Programados" valor={resumen?.cursos_programados ?? "—"} />
        <Card titulo="Participantes" valor={resumen?.participantes ?? "—"} />
        <Card titulo="Cursos Hoy" valor={resumen?.cursos_hoy ?? "—"} />
        <Card titulo="Inscripciones" valor={resumen?.inscripciones ?? "—"} />
      </div>
    </div>
  );
}

export default Dashboard;
