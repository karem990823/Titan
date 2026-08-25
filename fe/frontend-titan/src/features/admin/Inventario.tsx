import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_INDUMENTARIA, API_INSPECCIONES_INDUMENTARIA, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, Indumentaria, InspeccionIndumentaria, ToastType } from "../../types";

interface InventarioProps {
  onToast: (message: string, type: ToastType) => void;
}

function Inventario({ onToast }: InventarioProps) {
  const [indumentaria, setIndumentaria] = useState<Indumentaria[]>([]);
  const [inspecciones, setInspecciones] = useState<InspeccionIndumentaria[]>([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardandoItem, setGuardandoItem] = useState(false);

  const [idIndumentaria, setIdIndumentaria] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardandoInspeccion, setGuardandoInspeccion] = useState(false);

  const cargarIndumentaria = () => {
    apiFetch<ApiResponse<Indumentaria[]>>(`${API_INDUMENTARIA}/`)
      .then((res) => setIndumentaria(res.data))
      .catch(() => onToast("No se pudo cargar el inventario.", "error"));
  };

  const cargarInspecciones = () => {
    apiFetch<ApiResponse<InspeccionIndumentaria[]>>(`${API_INSPECCIONES_INDUMENTARIA}/`)
      .then((res) => setInspecciones(res.data))
      .catch(() => onToast("No se pudieron cargar las inspecciones.", "error"));
  };

  useEffect(() => {
    cargarIndumentaria();
    cargarInspecciones();
  }, []);

  const crearItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoItem(true);
    try {
      await apiFetch(`${API_INDUMENTARIA}/`, {
        method: "POST",
        body: JSON.stringify({ nombre, descripcion: descripcion || null }),
      });
      onToast("Elemento agregado al inventario.", "success");
      setNombre("");
      setDescripcion("");
      cargarIndumentaria();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoItem(false);
    }
  };

  const crearInspeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoInspeccion(true);
    try {
      await apiFetch(`${API_INSPECCIONES_INDUMENTARIA}/`, {
        method: "POST",
        body: JSON.stringify({
          fecha,
          id_indumentaria: parseInt(idIndumentaria),
          id_usuario: parseInt(idUsuario),
          observaciones: observaciones || null,
        }),
      });
      onToast("Inspección registrada correctamente.", "success");
      setIdIndumentaria("");
      setIdUsuario("");
      setFecha("");
      setObservaciones("");
      cargarInspecciones();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoInspeccion(false);
    }
  };

  return (
    <div>
      <PageHeader title="Inventario" subtitle="Administra el equipo de protección y sus inspecciones periódicas." />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: "1 1 360px", maxWidth: 440 }}>
          <form onSubmit={crearItem} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Nuevo elemento</p>
            <Field label="Nombre" required>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Arnés de cuerpo completo" style={inputStyle} required />
            </Field>
            <Field label="Descripción">
              <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />
            </Field>
            <button type="submit" disabled={guardandoItem} style={{
              background: guardandoItem ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
              cursor: guardandoItem ? "not-allowed" : "pointer",
            }}>
              {guardandoItem ? "Guardando..." : "Agregar al inventario"}
            </button>
          </form>

          <form onSubmit={crearInspeccion} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Registrar inspección</p>
            <Field label="Elemento" required>
              <select value={idIndumentaria} onChange={(e) => setIdIndumentaria(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                <option value="">Seleccionar...</option>
                {indumentaria.map((i) => (
                  <option key={i.id_indumentaria} value={i.id_indumentaria}>{i.nombre}</option>
                ))}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="ID del usuario" required>
                <input type="number" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)} style={inputStyle} required />
              </Field>
              <Field label="Fecha" required>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} required />
              </Field>
            </div>
            <Field label="Observaciones">
              <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={inputStyle} />
            </Field>
            <button type="submit" disabled={guardandoInspeccion} style={{
              background: guardandoInspeccion ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
              cursor: guardandoInspeccion ? "not-allowed" : "pointer",
            }}>
              {guardandoInspeccion ? "Guardando..." : "Registrar inspección"}
            </button>
          </form>
        </div>

        <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 12px 0" }}>Elementos ({indumentaria.length})</p>
            {indumentaria.map((i) => (
              <div key={i.id_indumentaria} style={{ padding: "8px 0", borderTop: `1px solid ${COLORS.borderGray}`, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{i.nombre}</span>
                {i.descripcion && <span style={{ color: COLORS.textSecondary }}> — {i.descripcion}</span>}
              </div>
            ))}
          </div>

          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "20px 24px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 12px 0" }}>Inspecciones recientes ({inspecciones.length})</p>
            {inspecciones.map((insp) => (
              <div key={insp.id_inspeccion} style={{ padding: "8px 0", borderTop: `1px solid ${COLORS.borderGray}`, fontSize: 13 }}>
                <span style={{ color: COLORS.textSecondary }}>{insp.fecha}</span> — {insp.observaciones || "Sin observaciones"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventario;
