import { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import Field from "../../components/UI/Field";
import { API_CURSOS, API_PROGRAMACIONES, API_USUARIOS, inputStyle } from "../../constants/color";
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
      <div className="bg-surface-container-lowest rounded-xl p-gap-lg max-w-xl">

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
            <div className="flex flex-col gap-gap-2xs mt-1">
              {programaciones.map((p) => (
                <div key={p.id_programacion} className="px-gap-sm py-2.5 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface flex gap-gap-sm items-center">
                  <span className="material-symbols-outlined text-base text-secondary">calendar_month</span>
                  <span>{p.fecha}</span>
                  <span className="material-symbols-outlined text-base text-secondary">schedule</span>
                  <span>{p.hora}</span>
                  <span className={`font-semibold ml-auto ${p.cupos <= 3 ? "text-tertiary" : "text-secondary"}`}>
                    {p.cupos} cupos
                  </span>
                </div>
              ))}
            </div>
          </Field>
        )}

        {form.id_curso && programaciones.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low px-gap-sm py-2.5 rounded-lg mb-gap-sm">
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

        <div className="grid grid-cols-2 gap-x-gap-lg">
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

        <div className="border-t border-outline-variant/30 pt-gap-md mt-gap-xs">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
              loading ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
            }`}
          >
            {loading ? "Guardando..." : "Programar curso"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgramarCurso;
