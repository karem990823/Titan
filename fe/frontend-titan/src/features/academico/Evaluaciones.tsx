import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_CURSOS, API_EVALUACIONES, COLORS, inputStyle } from "../../constants/color";
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

  return (
    <div>
      <PageHeader title="Evaluaciones" subtitle="Crea evaluaciones teóricas y gestiona sus preguntas y respuestas." />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <form onSubmit={crear} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", flex: "0 0 320px" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Nueva evaluación</p>
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
          <button type="submit" disabled={loading} style={{
            background: loading ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
            borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Creando..." : "Crear evaluación"}
          </button>
        </form>

        <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 10 }}>
          {evaluaciones.length === 0 && (
            <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Aún no hay evaluaciones creadas.</p>
          )}
          {evaluaciones.map((ev) => (
            <Link
              key={ev.id_evaluacion}
              to={`/academico/evaluaciones/${ev.id_evaluacion}`}
              style={{
                background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 10,
                padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
                textDecoration: "none", color: COLORS.textPrimary,
              }}
            >
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{ev.nombre}</span>
                <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{ev.curso_nombre ?? "Curso no asignado"}</span>
              </span>
              <span style={{ fontSize: 12, color: COLORS.textSecondary }}>{ev.total_preguntas} preguntas</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Evaluaciones;
