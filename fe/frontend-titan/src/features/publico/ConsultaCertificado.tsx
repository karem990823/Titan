import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import { API_CERTIFICADOS, API_TIPOS_IDENTIFICACION, COLORS } from "../../constants/color";
import type { ApiResponse, CertificadoPublico, TipoDocumento } from "../../types";
import logo from "../../assets/logo.webp";

const IMAGEN_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzy-LeGfWrbQaEjQIIiXU5dW7Av-RZxjzawthR8p9HbMMZeC-Ak3ggQ6uwzKMzgAMK73WmDLjA1zZ9oS6CUjTcj4gt7wBUxwfaSC2DwiGOyAq2FkOeRDpwqRsl5o0JNRrmf1ZsfNpUpsfd8jagvaPlgMpjJvEa5maIkRUWlxOkmHCbTVMk9JVBXhXMuHbG6oacRy3gGfsy3Ea66ObUXGqCbik-YdXWwJuZjHl7_-20BWgU5Oc1e3Ax";

const inputStyleConIcono: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px 11px 42px",
  fontSize: 14,
  border: `1px solid ${COLORS.borderGray}`,
  borderRadius: 8,
  background: COLORS.lightGray,
  color: COLORS.textPrimary,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  appearance: "none",
};

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

  const buscarDeshabilitado = buscando || !idTipo || !numero;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.lightGray, display: "flex", flexDirection: "column" }}>
      {/* Encabezado */}
      <header
        style={{
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.borderGray}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <img src={logo} alt="Titan ES" style={{ height: 40, width: "auto", objectFit: "contain" }} />
        <Link
          to="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            borderRadius: 8,
            background: COLORS.blue,
            color: COLORS.white,
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            textDecoration: "none",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            login
          </span>
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#10264A",
          color: COLORS.white,
          padding: "56px 24px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${IMAGEN_HERO}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.22,
            mixBlendMode: "luminosity",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #10264A 0%, rgba(16,38,74,0.85) 55%, transparent 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.12)",
              color: COLORS.white,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              padding: "5px 12px",
              borderRadius: 999,
              marginBottom: 16,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.red }} />
            Normativa Nacional Res. 4272 de 2021
          </span>
          <h1
            style={{
              fontFamily: "'Oswald', 'Segoe UI', sans-serif",
              textTransform: "uppercase",
              fontSize: 34,
              lineHeight: 1.25,
              margin: "0 0 12px 0",
            }}
          >
            TITAN-ES Seguridad en Alturas
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", maxWidth: 640, margin: "0 auto" }}>
            Centro de entrenamiento en trabajo seguro en alturas. Consulta y descarga aquí el certificado de tu
            formación con tu tipo y número de documento.
          </p>
        </div>
      </section>

      {/* Contenido: consulta de certificado */}
      <main style={{ flex: 1, display: "flex", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 620 }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: COLORS.white,
              borderRadius: 12,
              padding: "32px 36px",
              boxShadow: "0 10px 30px rgba(13,28,47,0.10)",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: COLORS.red }} />

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: COLORS.blue,
                color: COLORS.white,
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                padding: "3px 8px",
                borderRadius: 4,
                marginBottom: 12,
              }}
            >
              Consulta Pública
            </span>

            <h2
              style={{
                fontFamily: "'Oswald', 'Segoe UI', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: COLORS.textPrimary,
                fontSize: 24,
                margin: "0 0 8px 0",
              }}
            >
              Descarga tu certificado
            </h2>
            <p style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px 0" }}>
              Ingresa tu tipo y número de documento para buscar tus certificados de formación.
            </p>

            <form onSubmit={buscar} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      marginBottom: 6,
                    }}
                  >
                    Tipo de documento
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ position: "absolute", left: 12, color: COLORS.blue, fontSize: 20, pointerEvents: "none" }}
                    >
                      badge
                    </span>
                    <select
                      value={idTipo}
                      onChange={(e) => setIdTipo(e.target.value)}
                      required
                      style={inputStyleConIcono}
                    >
                      <option value="">Seleccionar...</option>
                      {tiposDoc.map((t) => (
                        <option key={t.id_tipo} value={t.id_tipo}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      marginBottom: 6,
                    }}
                  >
                    Número de documento
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ position: "absolute", left: 12, color: COLORS.blue, fontSize: 20, pointerEvents: "none" }}
                    >
                      pin
                    </span>
                    <input
                      type="number"
                      placeholder="Ej: 1234567890"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      required
                      style={inputStyleConIcono}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={buscarDeshabilitado}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: buscarDeshabilitado ? "#ccc" : COLORS.blue,
                  color: COLORS.white,
                  border: "none",
                  borderRadius: 8,
                  padding: "13px 0",
                  fontFamily: "'Oswald', 'Segoe UI', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  cursor: buscarDeshabilitado ? "not-allowed" : "pointer",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  search
                </span>
                {buscando ? "Buscando..." : "Buscar certificados"}
              </button>
            </form>

            {error && (
              <p
                style={{
                  color: COLORS.errorText,
                  background: COLORS.errorBg,
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  marginTop: 16,
                }}
              >
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
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
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
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        download
                      </span>
                      {descargandoId === cert.id_certificado ? "Descargando..." : "Descargar PDF"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: COLORS.textSecondary }}>
            ¿Eres empresa, instructor o administrador?{" "}
            <Link to="/login" style={{ color: COLORS.blue, fontWeight: 600 }}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </main>

      <footer
        style={{
          borderTop: `1px solid ${COLORS.borderGray}`,
          padding: "20px 24px",
          textAlign: "center",
          color: COLORS.textSecondary,
          fontSize: 12,
        }}
      >
        © {new Date().getFullYear()} TITAN-ES Seguridad en Alturas
      </footer>
    </div>
  );
}

export default ConsultaCertificado;