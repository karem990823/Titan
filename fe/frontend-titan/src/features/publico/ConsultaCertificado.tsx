import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import Field from "../../components/UI/Field";
import { API_CERTIFICADOS, API_TIPOS_IDENTIFICACION, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, CertificadoPublico, TipoDocumento } from "../../types";
import logo from "../../assets/logo.jpeg";

function ConsultaCertificado() {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [idTipo, setIdTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [resultados, setResultados] = useState<CertificadoPublico[] | null>(null);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
  }, []);

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultados(null);
    setBuscando(true);
    try {
      const res = await apiFetch<ApiResponse<CertificadoPublico[]>>(
        `${API_CERTIFICADOS}/publico/buscar?id_tipo=${idTipo}&numero_identificacion=${numero}`
      );
      setResultados(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo realizar la consulta");
    } finally {
      setBuscando(false);
    }
  };

  const descargar = async (idCertificado: number) => {
    setDescargandoId(idCertificado);
    try {
      const blob = await apiFetchBlob(
        `${API_CERTIFICADOS}/publico/${idCertificado}/descargar?id_tipo=${idTipo}&numero_identificacion=${numero}`
      );
      descargarBlob(blob, `certificado-${idCertificado}.pdf`);
    } catch {
      setError("No se pudo descargar el certificado. Intenta nuevamente.");
    } finally {
      setDescargandoId(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.lightGray, display: "flex", justifyContent: "center", padding: "48px 20px" }}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={logo} alt="Titan ES" style={{ width: "100%", maxWidth: 200 }} />
          <p style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 8 }}>
            Centro de Entrenamiento en Trabajo Seguro en Alturas
          </p>
        </div>

        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "28px 32px" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.textPrimary, margin: "0 0 4px 0" }}>
            Descarga tu certificado
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: 13, margin: "0 0 20px 0" }}>
            Ingresa tu tipo y número de documento para buscar tus certificados de formación.
          </p>

          <form onSubmit={buscar}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "0 16px" }}>
              <Field label="Tipo de documento" required>
                <select
                  value={idTipo}
                  onChange={(e) => setIdTipo(e.target.value)}
                  style={{ ...inputStyle, appearance: "none" }}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {tiposDoc.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Número de documento" required>
                <input
                  type="number"
                  placeholder="Ej: 1234567890"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  style={inputStyle}
                  required
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={buscando}
              style={{
                background: buscando ? "#ccc" : COLORS.blue,
                color: COLORS.white,
                border: "none",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: buscando ? "not-allowed" : "pointer",
              }}
            >
              {buscando ? "Buscando..." : "Buscar certificados"}
            </button>
          </form>

          {error && (
            <p style={{ color: COLORS.errorText, background: COLORS.errorBg, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 16 }}>
              {error}
            </p>
          )}

          {resultados && resultados.length === 0 && (
            <p style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 20, textAlign: "center" }}>
              No se encontraron certificados para ese documento.
            </p>
          )}

          {resultados && resultados.length > 0 && (
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {resultados.map((cert) => (
                <div
                  key={cert.id_certificado}
                  style={{
                    border: `1px solid ${COLORS.borderGray}`,
                    borderRadius: 8,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 2px 0" }}>
                      {cert.curso_nombre}
                    </p>
                    <p style={{ color: COLORS.textSecondary, fontSize: 12, margin: 0 }}>
                      {cert.codigo} · Emitido {cert.fecha_emision} · Vence {cert.fecha_vencimiento}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: cert.vigente ? COLORS.successBg : COLORS.warningBg,
                      color: cert.vigente ? COLORS.successText : COLORS.warningText,
                    }}
                  >
                    {cert.vigente ? "Vigente" : "Vencido"}
                  </span>
                  <button
                    onClick={() => descargar(cert.id_certificado)}
                    disabled={descargandoId === cert.id_certificado}
                    style={{
                      background: COLORS.red,
                      color: COLORS.white,
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 600,
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

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: COLORS.textSecondary }}>
          ¿Eres empresa, instructor o administrador?{" "}
          <Link to="/login" style={{ color: COLORS.blue }}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ConsultaCertificado;
