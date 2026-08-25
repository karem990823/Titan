import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_RESULTADOS, COLORS } from "../../constants/color";
import type { ApiResponse, ResultadoItem, ToastType } from "../../types";

interface ResultadosProps {
  onToast: (message: string, type: ToastType) => void;
}

function Resultados({ onToast }: ResultadosProps) {
  const [resultados, setResultados] = useState<ResultadoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ApiResponse<ResultadoItem[]>>(`${API_RESULTADOS}/`)
      .then((res) => setResultados(res.data))
      .catch(() => onToast("No se pudieron cargar los resultados.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader title="Resultados" subtitle="Calificaciones de las evaluaciones presentadas por los participantes." />

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: COLORS.textSecondary, fontSize: 14 }}>Cargando...</div>
      ) : resultados.length === 0 ? (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, margin: 0 }}>Aún no hay evaluaciones calificadas.</p>
        </div>
      ) : (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: COLORS.lightGray, textAlign: "left" }}>
                <th style={{ padding: "10px 16px" }}>Participante (ID)</th>
                <th style={{ padding: "10px 16px" }}>Evaluación (ID)</th>
                <th style={{ padding: "10px 16px" }}>Fecha</th>
                <th style={{ padding: "10px 16px" }}>Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.id_resultado} style={{ borderTop: `1px solid ${COLORS.borderGray}` }}>
                  <td style={{ padding: "10px 16px" }}>#{r.id_usuario}</td>
                  <td style={{ padding: "10px 16px" }}>#{r.id_evaluacion}</td>
                  <td style={{ padding: "10px 16px" }}>{r.fecha}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: COLORS.blue }}>{r.puntaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Resultados;
