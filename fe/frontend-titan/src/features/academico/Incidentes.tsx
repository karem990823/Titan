import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import {
  API_ACCIDENTES,
  API_INSCRIPCIONES,
  API_TIPOS_ACCIDENTE,
  API_TIPOS_IDENTIFICACION,
  COLORS,
  inputStyle,
} from "../../constants/color";
import type { Accidente, ApiResponse, Participante, TipoDocumento, TipoAccidente, ToastType } from "../../types";

interface IncidentesProps {
  onToast: (message: string, type: ToastType) => void;
}

function Incidentes({ onToast }: IncidentesProps) {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [tiposAccidente, setTiposAccidente] = useState<TipoAccidente[]>([]);
  const [incidentes, setIncidentes] = useState<Accidente[]>([]);

  const [idTipo, setIdTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [trabajador, setTrabajador] = useState<Participante | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [idTipoAccidente, setIdTipoAccidente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [incidenteACerrar, setIncidenteACerrar] = useState<Accidente | null>(null);
  const [conEvidencia, setConEvidencia] = useState<Set<number>>(new Set());

  const cargarIncidentes = () => {
    apiFetch<ApiResponse<Accidente[]>>(`${API_ACCIDENTES}/`)
      .then((res) => setIncidentes(res.data))
      .catch(() => onToast("No se pudieron cargar los incidentes.", "error"));
  };

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => {});
    apiFetch<TipoAccidente[]>(`${API_TIPOS_ACCIDENTE}/`).then(setTiposAccidente).catch(() => {});
    cargarIncidentes();
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

  const registrarIncidente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabajador) {
      onToast("Primero busca al trabajador.", "error");
      return;
    }
    setGuardando(true);
    try {
      await apiFetch(`${API_ACCIDENTES}/`, {
        method: "POST",
        body: JSON.stringify({
          fecha,
          lugar,
          id_trabajador: trabajador.id_usuario,
          id_tipo_accidente: parseInt(idTipoAccidente),
          descripcion: descripcion || null,
        }),
      });
      onToast("Incidente registrado correctamente.", "success");
      setTrabajador(null);
      setIdTipo("");
      setNumero("");
      setFecha("");
      setLugar("");
      setIdTipoAccidente("");
      setDescripcion("");
      cargarIncidentes();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (idAccidente: number, nuevoEstado: string) => {
    try {
      await apiFetch(`${API_ACCIDENTES}/${idAccidente}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ nuevo_estado: nuevoEstado }),
      });
      onToast("Estado actualizado.", "success");
      cargarIncidentes();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setIncidenteACerrar(null);
    }
  };

  const avanzarEstado = (a: Accidente) => {
    if (a.estado === "abierto") {
      cambiarEstado(a.id_accidente, "en_seguimiento");
    } else if (a.estado === "en_seguimiento") {
      setIncidenteACerrar(a);
    }
  };

  const subirEvidencia = async (idAccidente: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("nombre", file.name);
    try {
      await apiFetch(`${API_ACCIDENTES}/${idAccidente}/evidencia`, { method: "POST", body: formData });
      onToast("Evidencia adjuntada correctamente.", "success");
      setConEvidencia((prev) => new Set(prev).add(idAccidente));
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    }
  };

  const ESTADO_LABEL: Record<string, string> = {
    abierto: "Abierto",
    en_seguimiento: "En seguimiento",
    cerrado: "Cerrado",
  };
  const ESTADO_COLOR: Record<string, { bg: string; text: string }> = {
    abierto: { bg: COLORS.warningBg, text: COLORS.warningText },
    en_seguimiento: { bg: "#E6F1FB", text: "#185FA5" },
    cerrado: { bg: COLORS.successBg, text: COLORS.successText },
  };

  return (
    <div>
      <PageHeader title="Incidentes de seguridad" subtitle="Registra y consulta la bitácora de accidentes de los trabajadores." />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <form onSubmit={registrarIncidente} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", flex: "1 1 360px", maxWidth: 440 }}>
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
            2. Detalle del incidente
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Fecha" required>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="Tipo de incidente" required>
              <select value={idTipoAccidente} onChange={(e) => setIdTipoAccidente(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Seleccionar...</option>
                {tiposAccidente.map((t) => (
                  <option key={t.id_tipo_accidente} value={t.id_tipo_accidente}>{t.nombre}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Lugar" required>
            <input value={lugar} onChange={(e) => setLugar(e.target.value)} style={inputStyle} required />
          </Field>
          <Field label="Descripción">
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />
          </Field>

          <button type="submit" disabled={guardando || !trabajador} style={{
            background: guardando || !trabajador ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
            borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600,
            cursor: guardando || !trabajador ? "not-allowed" : "pointer",
          }}>
            {guardando ? "Guardando..." : "Registrar incidente"}
          </button>
        </form>

        <div style={{ flex: "1 1 400px", background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: 0, padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderGray}` }}>
            Incidentes recientes ({incidentes.length})
          </p>
          {incidentes.length === 0 ? (
            <p style={{ color: COLORS.textSecondary, fontSize: 14, padding: 24, margin: 0 }}>Aún no hay incidentes registrados.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.lightGray, textAlign: "left" }}>
                  <th style={{ padding: "10px 16px" }}>Trabajador</th>
                  <th style={{ padding: "10px 16px" }}>Tipo</th>
                  <th style={{ padding: "10px 16px" }}>Fecha</th>
                  <th style={{ padding: "10px 16px" }}>Estado</th>
                  <th style={{ padding: "10px 16px" }}>Evidencia</th>
                </tr>
              </thead>
              <tbody>
                {incidentes.map((a) => {
                  const colores = ESTADO_COLOR[a.estado] ?? ESTADO_COLOR.abierto;
                  return (
                    <tr key={a.id_accidente} style={{ borderTop: `1px solid ${COLORS.borderGray}` }}>
                      <td style={{ padding: "10px 16px" }}>{a.trabajador ?? `#${a.id_trabajador}`}</td>
                      <td style={{ padding: "10px 16px" }}>{a.tipo_accidente ?? `#${a.id_tipo_accidente}`}</td>
                      <td style={{ padding: "10px 16px" }}>{a.fecha}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                            background: colores.bg, color: colores.text,
                          }}>
                            {ESTADO_LABEL[a.estado] ?? a.estado}
                          </span>
                          {a.estado !== "cerrado" && (
                            <button onClick={() => avanzarEstado(a)} style={{ background: "none", border: "none", color: COLORS.blue, cursor: "pointer", fontSize: 12 }}>
                              {a.estado === "abierto" ? "Iniciar seguimiento" : "Cerrar"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <label style={{ fontSize: 12, color: COLORS.blue, cursor: "pointer" }}>
                          {conEvidencia.has(a.id_accidente) ? "✔ adjuntada" : "Adjuntar"}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) subirEvidencia(a.id_accidente, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        open={incidenteACerrar !== null}
        title="Cerrar incidente"
        message="Un incidente cerrado no puede reabrirse. ¿Confirmas el cierre?"
        confirmLabel="Cerrar incidente"
        onCancel={() => setIncidenteACerrar(null)}
        onConfirm={() => incidenteACerrar && cambiarEstado(incidenteACerrar.id_accidente, "cerrado")}
      />
    </div>
  );
}

export default Incidentes;
