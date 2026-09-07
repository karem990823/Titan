import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_RESULTADOS } from "../../constants/color";
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
        <div className="text-center py-gap-2xl text-on-surface-variant font-body-sm text-body-sm">Cargando...</div>
      ) : resultados.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-gap-2xl text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant m-0">Aún no hay evaluaciones calificadas.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse font-body-sm text-body-sm">
            <thead>
              <tr className="bg-surface-container-low text-left">
                <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Participante (ID)</th>
                <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Evaluación (ID)</th>
                <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Fecha</th>
                <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Puntaje</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((r) => (
                <tr key={r.id_resultado} className="border-t border-outline-variant/20">
                  <td className="px-gap-sm py-gap-xs">#{r.id_usuario}</td>
                  <td className="px-gap-sm py-gap-xs">#{r.id_evaluacion}</td>
                  <td className="px-gap-sm py-gap-xs">{r.fecha}</td>
                  <td className="px-gap-sm py-gap-xs font-bold text-secondary">{r.puntaje}</td>
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
