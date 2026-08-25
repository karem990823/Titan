import { useEffect, useState } from "react";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_CERTIFICADOS, COLORS } from "../../constants/color";
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
        <div style={{ textAlign: "center", padding: 48, color: COLORS.textSecondary, fontSize: 14 }}>Cargando...</div>
      ) : certificados.length === 0 ? (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 36, margin: "0 0 12px 0" }}>🎓</p>
          <p style={{ fontWeight: 600, color: COLORS.textPrimary, margin: "0 0 6px 0" }}>Aún no hay certificados</p>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, margin: 0 }}>
            Aparecerán aquí cuando tus trabajadores completen y aprueben un curso.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {certificados.map((cert) => (
            <div key={cert.id_certificado} style={{
              background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12,
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary, margin: "0 0 3px 0" }}>{cert.curso_nombre}</p>
                <p style={{ color: COLORS.textSecondary, fontSize: 13, margin: 0 }}>
                  {cert.codigo} · Emitido {cert.fecha_emision} · Vence {cert.fecha_vencimiento}
                </p>
              </div>
              <button
                onClick={() => descargar(cert)}
                disabled={descargandoId === cert.id_certificado}
                style={{
                  background: COLORS.red, color: COLORS.white, border: "none", borderRadius: 8,
                  padding: "8px 18px", fontSize: 13, fontWeight: 600,
                  cursor: descargandoId === cert.id_certificado ? "not-allowed" : "pointer",
                }}
              >
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
