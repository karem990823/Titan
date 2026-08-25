import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_TIPOS_IDENTIFICACION, API_USUARIOS, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, TipoDocumento, ToastType, Trabajador } from "../../types";

interface RegistrarTrabajadorProps {
  onToast: (message: string, type: ToastType) => void;
}

interface FormState {
  nombre: string;
  apellido: string;
  id_tipo: string;
  numero_identificacion: string;
  direccion: string;
  telefono: string;
}

const FORM_VACIO: FormState = {
  nombre: "",
  apellido: "",
  id_tipo: "",
  numero_identificacion: "",
  direccion: "",
  telefono: "",
};

function RegistrarTrabajador({ onToast }: RegistrarTrabajadorProps) {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [loading, setLoading] = useState(false);

  const cargarTrabajadores = () => {
    apiFetch<ApiResponse<Trabajador[]>>(`${API_USUARIOS}/trabajadores`)
      .then((res) => setTrabajadores(res.data))
      .catch(() => onToast("No se pudieron cargar los trabajadores.", "error"));
  };

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
    cargarTrabajadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<ApiResponse<Trabajador>>(`${API_USUARIOS}/trabajadores`, {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          id_tipo: parseInt(form.id_tipo),
          numero_identificacion: parseInt(form.numero_identificacion),
          direccion: form.direccion || null,
          telefono: form.telefono ? parseInt(form.telefono) : null,
        }),
      });
      onToast(`Trabajador ${res.data.nombre} registrado correctamente.`, "success");
      setForm(FORM_VACIO);
      cargarTrabajadores();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Mis trabajadores" subtitle="Registra a los trabajadores de tu empresa para inscribirlos en cursos y gestionar sus documentos." />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "28px 32px", flex: "1 1 340px", maxWidth: 480 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0", borderBottom: `1px solid ${COLORS.borderGray}`, paddingBottom: 10 }}>
            Registrar nuevo trabajador
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="Nombre" required>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} required />
              </Field>
              <Field label="Apellido" required>
                <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} style={inputStyle} required />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="Tipo de documento" required>
                <select value={form.id_tipo} onChange={(e) => setForm({ ...form, id_tipo: e.target.value })} style={{ ...inputStyle, appearance: "none" }} required>
                  <option value="">Seleccionar...</option>
                  {tiposDoc.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Número de documento" required>
                <input type="number" value={form.numero_identificacion} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} style={inputStyle} required />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="Dirección">
                <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Teléfono">
                <input type="number" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
              </Field>
            </div>

            <button type="submit" disabled={loading} style={{
              background: loading ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", marginTop: 8,
            }}>
              {loading ? "Guardando..." : "Registrar trabajador"}
            </button>
          </form>
        </div>

        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", flex: "1 1 320px" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>
            Trabajadores registrados ({trabajadores.length})
          </p>
          {trabajadores.length === 0 ? (
            <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Aún no has registrado trabajadores.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {trabajadores.map((t) => (
                <div key={t.id_usuario} style={{ padding: "10px 14px", border: `1px solid ${COLORS.borderGray}`, borderRadius: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{t.nombre} {t.apellido}</span>
                  <span style={{ color: COLORS.textSecondary, marginLeft: 8 }}>
                    {t.tipo_documento} · {t.numero_identificacion}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrarTrabajador;
