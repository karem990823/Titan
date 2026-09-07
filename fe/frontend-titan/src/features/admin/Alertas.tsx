import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_ALERTAS } from "../../constants/color";
import type { Alerta, ApiResponse, ResultadoGenerarAlertas, ToastType } from "../../types";

interface AlertasProps {
  onToast: (message: string, type: ToastType) => void;
}

const ESTADO_LABEL: Record<Alerta["estado"], string> = {
  pendiente: "Pendiente de enviar",
  enviada: "Enviada",
  vencida: "Vencida",
};

const ESTADO_COLOR: Record<Alerta["estado"], string> = {
  pendiente: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  enviada: "bg-green-50 text-green-700",
  vencida: "bg-error-container text-on-error-container",
};

function Alertas({ onToast }: AlertasProps) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  const cargarAlertas = () => {
    apiFetch<ApiResponse<Alerta[]>>(`${API_ALERTAS}/`)
      .then((res) => setAlertas(res.data))
      .catch(() => onToast("No se pudieron cargar las alertas.", "error"))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarAlertas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generarAhora = async () => {
    setGenerando(true);
    try {
      const res = await apiFetch<ApiResponse<ResultadoGenerarAlertas>>(`${API_ALERTAS}/generar`, { method: "POST" });
      onToast(res.message || "Alertas generadas correctamente.", "success");
      cargarAlertas();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Alertas"
        subtitle="Certificados próximos a vencer y facturas pendientes de pago. Se revisan automáticamente una vez al día y se avisan por correo a los administradores."
      />

      <div className="mb-gap-lg">
        <button
          onClick={generarAhora}
          disabled={generando}
          className={`inline-flex items-center gap-gap-2xs px-gap-md py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
            generando ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
          }`}
        >
          <span className="material-symbols-outlined text-xl">sync</span>
          {generando ? "Revisando..." : "Revisar y generar alertas ahora"}
        </button>
      </div>

      {cargando ? (
        <div className="text-center py-gap-2xl text-on-surface-variant font-body-sm text-body-sm">Cargando...</div>
      ) : alertas.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-gap-2xl text-center flex flex-col items-center gap-gap-2xs">
          <span className="material-symbols-outlined text-4xl text-secondary">notifications</span>
          <p className="font-headline-sm text-headline-sm text-on-surface m-0">Sin alertas por ahora</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
            Todo al día: no hay certificados por vencer ni facturas pendientes detectadas.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Tipo</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Detalle</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Estado</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Generada</th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((a) => (
                  <tr key={a.id_alerta} className="border-t border-outline-variant/20">
                    <td className="px-gap-sm py-gap-xs whitespace-nowrap">{a.tipo}</td>
                    <td className="px-gap-sm py-gap-xs normal-case">{a.mensaje}</td>
                    <td className="px-gap-sm py-gap-xs">
                      <span className={`font-label-sm text-label-sm font-bold px-gap-xs py-0.5 rounded-full whitespace-nowrap ${ESTADO_COLOR[a.estado]}`}>
                        {ESTADO_LABEL[a.estado]}
                      </span>
                    </td>
                    <td className="px-gap-sm py-gap-xs whitespace-nowrap">{a.fecha_creacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alertas;
