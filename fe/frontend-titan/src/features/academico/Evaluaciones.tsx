import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_CURSOS, API_EVALUACIONES, inputStyle } from "../../constants/color";
import type { ApiResponse, Curso, EvaluacionResumen, ToastType } from "../../types";

interface EvaluacionesProps {
  onToast: (message: string, type: ToastType) => void;
}

function Evaluaciones({ onToast }: EvaluacionesProps) {
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionResumen[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nombre, setNombre] = useState("");
  const [idCurso, setIdCurso] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = () => {
    apiFetch<ApiResponse<EvaluacionResumen[]>>(`${API_EVALUACIONES}/`)
      .then((res) => setEvaluaciones(res.data))
      .catch(() => onToast("No se pudieron cargar las evaluaciones.", "error"));
  };

  useEffect(() => {
    cargar();
    apiFetch<Curso[]>(`${API_CURSOS}/lista-cursos`).then(setCursos).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCurso) {
      onToast("Selecciona a qué curso pertenece la evaluación.", "error");
      return;
    }
    setLoading(true);
    try {
      await apiFetch<ApiResponse<EvaluacionResumen>>(`${API_EVALUACIONES}/`, {
        method: "POST",
        body: JSON.stringify({ nombre, id_curso: parseInt(idCurso) }),
      });
      onToast("Evaluación creada correctamente.", "success");
      setNombre("");
      setIdCurso("");
      cargar();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  const botonDeshabilitado = loading || !nombre.trim() || !idCurso;

  return (
    <div>
      <PageHeader title="Evaluaciones" subtitle="Crea evaluaciones teóricas y gestiona sus preguntas y respuestas." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <form onSubmit={crear} className="bg-surface-container-lowest rounded-xl p-gap-lg flex-none w-[320px]">
          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Nueva evaluación</p>
          <Field label="Nombre" required>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} required />
          </Field>
          <Field label="Curso" required>
            <select value={idCurso} onChange={(e) => setIdCurso(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
              <option value="">Seleccionar...</option>
              {cursos.map((c) => (
                <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>
              ))}
            </select>
          </Field>
          <button
            type="submit"
            disabled={botonDeshabilitado}
            className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
              botonDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
            }`}
          >
            {loading ? "Creando..." : "Crear evaluación"}
          </button>
        </form>

        <div className="flex-1 min-w-[340px] flex flex-col gap-gap-xs">
          {evaluaciones.length === 0 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">Aún no hay evaluaciones creadas.</p>
          )}
          {evaluaciones.map((ev) => (
            <Link
              key={ev.id_evaluacion}
              to={`/academico/evaluaciones/${ev.id_evaluacion}`}
              className="bg-surface-container-lowest rounded-lg px-gap-md py-gap-sm flex justify-between items-center no-underline text-on-surface hover:shadow-md transition-shadow"
            >
              <span className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface normal-case">{ev.nombre}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{ev.curso_nombre ?? "Curso no asignado"}</span>
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{ev.total_preguntas} preguntas</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Evaluaciones;
