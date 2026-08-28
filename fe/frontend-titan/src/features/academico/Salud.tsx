import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_INSCRIPCIONES, API_SALUD, API_TIPOS_IDENTIFICACION, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, Participante, RegistroSalud, TipoDocumento, ToastType } from "../../types";

interface SaludProps {
  onToast: (message: string, type: ToastType) => void;
}

function Salud({ onToast }: SaludProps) {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [registros, setRegistros] = useState<RegistroSalud[]>([]);

  const [idTipo, setIdTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [trabajador, setTrabajador] = useState<Participante | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [apto, setApto] = useState<"SI" | "NO">("SI");
  const [restricciones, setRestricciones] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fechaExamen, setFechaExamen] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarRegistros = () => {
    apiFetch<ApiResponse<RegistroSalud[]>>(`${API_SALUD}/`)
      .then((res) => setRegistros(res.data))
      .catch(() => onToast("No se pudieron cargar los registros de salud.", "error"));
  };

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => {});
    cargarRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarTrabajador = async () => {
    if (!idTipo || !numero) {
      onToast("Selecciona el tipo y número de documento.", "error");
      return;
    }
    setBuscando(true);
    setTrabajador(null);
    try {
      const data = await apiFetch<Participante>(
        `${API_INSCRIPCIONES}/participantes/buscar?id_tipo=${idTipo}&numero=${numero}`
      );
      setTrabajador(data);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Trabajador no encontrado.", "error");
    } finally {
      setBuscando(false);
    }
  };

  const registrarExamen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabajador) {
      onToast("Primero busca al trabajador.", "error");
      return;
    }
    setGuardando(true);
    try {
      await apiFetch(`${API_SALUD}/`, {
        method: "POST",
        body: JSON.stringify({
          apto,
          restricciones: restricciones || null,
          observaciones: observaciones || null,
          fecha_examen: fechaExamen,
          fecha_vencimiento: fechaVencimiento,
          id_trabajador: trabajador.id_usuario,
        }),
      });
      onToast("Examen médico registrado correctamente.", "success");
      setTrabajador(null);
      setIdTipo("");
      setNumero("");
      setApto("SI");
      setRestricciones("");
      setObservaciones("");
      setFechaExamen("");
      setFechaVencimiento("");
      cargarRegistros();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <PageHeader title="Salud ocupacional" subtitle="Registra y consulta la aptitud médica de los trabajadores." />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <form onSubmit={registrarExamen} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", flex: "1 1 360px", maxWidth: 440 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0", borderBottom: `1px solid ${COLORS.borderGray}`, paddingBottom: 10 }}>
            1. Buscar trabajador
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Tipo de documento" required>
              <select value={idTipo} onChange={(e) => setIdTipo(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Seleccionar...</option>
                {tiposDoc.map((t) => (
                  <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de documento" required>
              <input type="number" value={numero} onChange={(e) => setNumero(e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <button type="button" onClick={buscarTrabajador} disabled={buscando} style={{
            background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 8,
            padding: "8px 20px", fontSize: 13, fontWeight: 600,
            cursor: buscando ? "not-allowed" : "pointer", marginBottom: 16,
          }}>
            {buscando ? "Buscando..." : "Buscar trabajador"}
          </button>

          {trabajador && (
            <div style={{ background: COLORS.successBg, border: "1px solid #C0DD97", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ fontWeight: 700, color: COLORS.successText, margin: 0, fontSize: 14 }}>{trabajador.nombre}</p>
              <p style={{ color: "#3B6D11", margin: 0, fontSize: 12 }}>{trabajador.tipo_documento} · {trabajador.numero_identificacion}</p>
            </div>
          )}

          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0", borderBottom: `1px solid ${COLORS.borderGray}`, paddingBottom: 10 }}>
            2. Resultado del examen
          </p>
          <Field label="Apto para trabajo en alturas" required>
            <select value={apto} onChange={(e) => setApto(e.target.value as "SI" | "NO")} style={{ ...inputStyle, appearance: "none" }}>
              <option value="SI">Sí</option>
              <option value="NO">No</option>
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Fecha del examen" required>
              <input type="date" value={fechaExamen} onChange={(e) => setFechaExamen(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="Fecha de vencimiento" required>
              <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} style={inputStyle} required />
            </Field>
          </div>
          <Field label="Restricciones">
            <input value={restricciones} onChange={(e) => setRestricciones(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Observaciones">
            <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={inputStyle} />
          </Field>

          <button type="submit" disabled={guardando || !trabajador} style={{
            background: guardando || !trabajador ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
            borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600,
            cursor: guardando || !trabajador ? "not-allowed" : "pointer",
          }}>
            {guardando ? "Guardando..." : "Registrar examen"}
          </button>
        </form>

        <div style={{ flex: "1 1 400px", background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: 0, padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderGray}` }}>
            Registros ({registros.length})
          </p>
          {registros.length === 0 ? (
            <p style={{ color: COLORS.textSecondary, fontSize: 14, padding: 24, margin: 0 }}>Aún no hay exámenes registrados.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.lightGray, textAlign: "left" }}>
                  <th style={{ padding: "10px 16px" }}>Trabajador</th>
                  <th style={{ padding: "10px 16px" }}>Apto</th>
                  <th style={{ padding: "10px 16px" }}>Vence</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id_salud} style={{ borderTop: `1px solid ${COLORS.borderGray}` }}>
                    <td style={{ padding: "10px 16px" }}>{r.trabajador ?? `#${r.id_trabajador}`}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: r.apto === "SI" ? COLORS.successText : COLORS.errorText }}>
                      {r.apto === "SI" ? "Sí" : "No"}
                    </td>
                    <td style={{ padding: "10px 16px" }}>{r.fecha_vencimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Salud;
