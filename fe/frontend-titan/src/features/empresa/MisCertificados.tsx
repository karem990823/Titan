import { useEffect, useState } from "react";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_CERTIFICADOS } from "../../constants/color";
import type { ApiResponse, Certificado, ToastType } from "../../types";

interface MisCertificadosProps {
  onToast: (message: string, type: ToastType) => void;
}

function MisCertificados({ onToast }: MisCertificadosProps) {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<ApiResponse<Certificado[]>>(`${API_CERTIFICADOS}/mis-trabajadores`)
      .then((res) => setCertificados(res.data))
      .catch(() => onToast("No se pudieron cargar los certificados.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const descargar = async (cert: Certificado) => {
    setDescargandoId(cert.id_certificado);
    try {
      const blob = await apiFetchBlob(`${API_CERTIFICADOS}/${cert.id_certificado}/descargar`);
      descargarBlob(blob, `certificado-${cert.codigo || cert.id_certificado}.pdf`);
    } catch {
      onToast("No se pudo descargar el certificado.", "error");
    } finally {
      setDescargandoId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Mis certificados" subtitle="Certificados de formación obtenidos por los trabajadores de tu empresa." />

      {loading ? (
        <div className="text-center py-gap-2xl text-on-surface-variant font-body-sm text-body-sm">Cargando...</div>
      ) : certificados.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-gap-2xl text-center flex flex-col items-center gap-gap-2xs">
          <span className="material-symbols-outlined text-4xl text-secondary">workspace_premium</span>
          <p className="font-headline-sm text-headline-sm text-on-surface m-0">Aún no hay certificados</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
            Aparecerán aquí cuando tus trabajadores completen y aprueben un curso.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-gap-xs">
          {certificados.map((cert) => (
            <div key={cert.id_certificado} className="bg-surface-container-lowest rounded-xl px-gap-md py-gap-sm flex items-center gap-gap-lg flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <p className="font-headline-sm text-headline-sm text-on-surface m-0 normal-case">{cert.curso_nombre}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
                  {cert.codigo} · Emitido {cert.fecha_emision} · Vence {cert.fecha_vencimiento}
                </p>
              </div>
              <button
                onClick={() => descargar(cert)}
                disabled={descargandoId === cert.id_certificado}
                className={`inline-flex items-center gap-gap-2xs px-gap-md py-2 rounded-lg text-on-primary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                  descargandoId === cert.id_certificado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
                }`}
              >
                <span className="material-symbols-outlined text-base">file_download</span>
                {descargandoId === cert.id_certificado ? "Descargando..." : "Descargar PDF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisCertificados;
