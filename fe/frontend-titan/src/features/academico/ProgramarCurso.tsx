import { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import Field from "../../components/UI/Field";
import { API_CURSOS, API_PROGRAMACIONES, API_USUARIOS, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, Curso, Instructor, Programacion, ToastType } from "../../types";

interface ProgramarCursoProps {
  onToast: (message: string, type: ToastType) => void;
}

interface FormState {
  id_curso: string;
  id_usuario: string;
  fecha: string;
  hora: string;
  cupos: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function ProgramarCurso({ onToast }: ProgramarCursoProps) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [form, setForm] = useState<FormState>({ id_curso: "", id_usuario: "", fecha: "", hora: "", cupos: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    apiFetch<Curso[]>(`${API_CURSOS}/lista-cursos`).then(setCursos).catch(() => {});
    apiFetch<Instructor[]>(`${API_USUARIOS}/instructores`).then(setInstructores).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.id_curso) return;
    let ignore = false;
    apiFetch<Programacion[]>(`${API_PROGRAMACIONES}/${form.id_curso}`)
      .then((data) => { if (!ignore) setProgramaciones(data); });
    return () => { ignore = true; };
  }, [form.id_curso]);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.id_curso) e.id_curso = "Selecciona un tipo de curso.";
    if (!form.id_usuario) e.id_usuario = "Selecciona un instructor.";
    if (!form.fecha) e.fecha = "Selecciona una fecha.";
    if (!form.hora) e.hora = "Selecciona una hora.";
    if (!form.cupos || parseInt(form.cupos) < 1) e.cupos = "El cupo debe ser mayor a 0.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await apiFetch<ApiResponse<{ estado: string }>>(`${API_PROGRAMACIONES}/`, {
        method: "POST",
        body: JSON.stringify({
          id_curso: parseInt(form.id_curso),
          id_usuario: parseInt(form.id_usuario),
          fecha: form.fecha,
          hora: form.hora,
          cupos: parseInt(form.cupos),
        }),
      });
      onToast(data.message || "Curso programado correctamente", "success");
      setForm({ id_curso: "", id_usuario: "", fecha: "", hora: "", cupos: "" });
      setProgramaciones([]);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Programar curso" subtitle="Crea una nueva sesión de formación asignando instructor, fecha, horario y cupos." />
      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "28px 32px", maxWidth: 580 }}>

        <Field label="Tipo de curso" required error={errors.id_curso}>
          <select value={form.id_curso}
            onChange={(e) => {
              setForm({ ...form, id_curso: e.target.value, fecha: "", hora: "" });
              setProgramaciones([]);
            }}
            style={{ ...inputStyle, appearance: "none" }}>
            <option value="">Seleccionar curso...</option>
            {cursos.map((c) => (
              <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>
            ))}
          </select>
        </Field>

        {form.id_curso && programaciones.length > 0 && (
          <Field label="Fechas ya programadas para este curso">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {programaciones.map((p) => (
                <div key={p.id_programacion} style={{
                  padding: "10px 14px", border: `1px solid ${COLORS.borderGray}`,
                  borderRadius: 8, fontSize: 13, color: COLORS.textPrimary,
                  background: COLORS.lightGray, display: "flex", gap: 12, alignItems: "center",
                }}>
                  <span>📅 {p.fecha}</span>
                  <span>🕐 {p.hora}</span>
                  <span style={{
                    fontWeight: 600, marginLeft: "auto",
                    color: p.cupos <= 3 ? COLORS.warningText : COLORS.blue,
                  }}>
                    {p.cupos} cupos
                  </span>
                </div>
              ))}
            </div>
          </Field>
        )}

        {form.id_curso && programaciones.length === 0 && (
          <p style={{ fontSize: 13, color: COLORS.textSecondary, background: COLORS.lightGray, padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>
            Sin programaciones previas para este curso.
          </p>
        )}

        <Field label="Instructor" required error={errors.id_usuario}>
          <select value={form.id_usuario}
            onChange={(e) => setForm({ ...form, id_usuario: e.target.value })}
            style={{ ...inputStyle, appearance: "none" }}>
            <option value="">Seleccionar instructor...</option>
            {instructores.map((i) => (
              <option key={i.id_usuario} value={i.id_usuario}>
                {i.nombre} — {i.tipo_documento} {i.numero_identificacion}
              </option>
            ))}
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <Field label="Fecha" required error={errors.fecha}>
            <input type="date" value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              style={inputStyle} />
          </Field>
          <Field label="Hora de inicio" required error={errors.hora}>
            <input type="time" value={form.hora}
              onChange={(e) => setForm({ ...form, hora: e.target.value })}
              style={inputStyle} />
          </Field>
        </div>

        <Field label="Cupo máximo" required error={errors.cupos}>
          <input type="number" min="1" placeholder="Ej: 15" value={form.cupos}
            onChange={(e) => setForm({ ...form, cupos: e.target.value })}
            style={inputStyle} />
        </Field>

        <div style={{ borderTop: `1px solid ${COLORS.borderGray}`, paddingTop: 20, marginTop: 8 }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: loading ? "#ccc" : COLORS.red, color: COLORS.white,
            border: "none", borderRadius: 8, padding: "10px 28px",
            fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Guardando..." : "Programar curso"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgramarCurso;
