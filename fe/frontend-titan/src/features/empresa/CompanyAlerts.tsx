import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_ALERTAS } from "../../constants/color";
import type { Alerta, ApiResponse, ToastType } from "../../types";

interface CompanyAlertsProps {
  onToast: (message: string, type: ToastType) => void;
}

// "en-CA" devuelve la fecha local como YYYY-MM-DD, igual que el backend.
const todayLocal = () => new Date().toLocaleDateString("en-CA");

function CompanyAlerts({ onToast }: CompanyAlertsProps) {
  const [alerts, setAlerts] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<ApiResponse<Alerta[]>>(`${API_ALERTAS}/mis-alertas`)
      .then((res) => setAlerts(res.data))
      .catch(() => onToast("No se pudieron cargar las alertas.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = todayLocal();

  return (
    <div>
      <PageHeader
        title="Alertas"
        subtitle="Certificados de tus trabajadores que están por vencer. También te los enviamos por correo."
      />

      {loading ? (
        <div className="text-center py-gap-2xl text-on-surface-variant font-body-sm text-body-sm">Cargando...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-gap-2xl text-center flex flex-col items-center gap-gap-2xs">
          <span className="material-symbols-outlined text-4xl text-secondary">notifications</span>
          <p className="font-headline-sm text-headline-sm text-on-surface m-0">Sin alertas por ahora</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
            Ninguno de tus trabajadores tiene certificados próximos a vencer.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Detalle</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Vence</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Estado</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => {
                  const expired = a.fecha_vencimiento !== null && a.fecha_vencimiento < today;
                  return (
                    <tr key={a.id_alerta} className="border-t border-outline-variant/20">
                      <td className="px-gap-sm py-gap-xs normal-case">{a.mensaje}</td>
                      <td className="px-gap-sm py-gap-xs whitespace-nowrap">{a.fecha_vencimiento}</td>
                      <td className="px-gap-sm py-gap-xs">
                        <span
                          className={`font-label-sm text-label-sm font-bold px-gap-xs py-0.5 rounded-full whitespace-nowrap ${
                            expired
                              ? "bg-error-container text-on-error-container"
                              : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                          }`}
                        >
                          {expired ? "Vencido" : "Por vencer"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyAlerts;
