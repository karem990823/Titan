import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_CURSOS, API_INSCRIPCIONES, API_PROGRAMACIONES, API_USUARIOS, COLORS, inputStyle } from "../../constants/color";
import type { ApiResponse, Curso, Programacion, ResultadoInscripcion, ToastType, Trabajador } from "../../types";

interface InscribirTrabajadorProps {
  onToast: (message: string, type: ToastType) => void;
}

function InscribirTrabajador({ onToast }: InscribirTrabajadorProps) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);

  const [idTrabajador, setIdTrabajador] = useState("");
  const [idCurso, setIdCurso] = useState("");
  const [idProgramacion, setIdProgramacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoInscripcion | null>(null);

  useEffect(() => {
    apiFetch<ApiResponse<Trabajador[]>>(`${API_USUARIOS}/trabajadores`).then((res) => setTrabajadores(res.data)).catch(() => {});
    apiFetch<Curso[]>(`${API_CURSOS}/lista-cursos`).then(setCursos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!idCurso) return;
    let ignore = false;
    apiFetch<Programacion[]>(`${API_PROGRAMACIONES}/${idCurso}`)
      .then((data) => { if (!ignore) setProgramaciones(data); });
    return () => { ignore = true; };
  }, [idCurso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idTrabajador || !idProgramacion) {
      onToast("Selecciona un trabajador y una fecha de curso.", "error");
      return;
    }
    setLoading(true);
    setResultado(null);
    try {
      const res = await apiFetch<ApiResponse<ResultadoInscripcion>>(`${API_INSCRIPCIONES}/${idProgramacion}`, {
        method: "POST",
        body: JSON.stringify({ id_usuario: parseInt(idTrabajador) }),
      });
      setResultado(res.data);
      onToast(res.message || "Trabajador inscrito correctamente.", "success");
      setIdCurso("");
      setIdProgramacion("");
      setProgramaciones([]);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Inscribir trabajador" subtitle="Programa a uno de tus trabajadores en un curso disponible." />
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "28px 32px", flex: "1 1 340px", maxWidth: 480 }}>
          <form onSubmit={handleSubmit}>
            <Field label="Trabajador" required>
              <select value={idTrabajador} onChange={(e) => setIdTrabajador(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                <option value="">Seleccionar trabajador...</option>
                {trabajadores.map((t) => (
                  <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
                ))}
              </select>
            </Field>

            <Field label="Tipo de curso" required>
              <select
                value={idCurso}
                onChange={(e) => { setIdCurso(e.target.value); setIdProgramacion(""); setProgramaciones([]); }}
                style={{ ...inputStyle, appearance: "none" }}
                required
              >
                <option value="">Seleccionar curso...</option>
                {cursos.map((c) => (
                  <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>
                ))}
              </select>
            </Field>

            {idCurso && programaciones.length > 0 && (
              <Field label="Fecha y horario disponible" required>
                <select value={idProgramacion} onChange={(e) => setIdProgramacion(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                  <option value="">Seleccionar fecha...</option>
                  {programaciones.map((p) => (
                    <option key={p.id_programacion} value={p.id_programacion}>
                      {p.fecha} · {p.hora} · {p.cupos} cupos disponibles
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {idCurso && programaciones.length === 0 && (
              <p style={{ fontSize: 13, color: COLORS.warningText, background: COLORS.warningBg, padding: "10px 14px", borderRadius: 8, margin: "0 0 16px 0" }}>
                ⚠ No hay fechas con cupos disponibles para este curso.
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Inscribiendo..." : "Inscribir trabajador"}
            </button>
          </form>
        </div>

        {resultado && (
          <div style={{ background: COLORS.successBg, border: "1px solid #C0DD97", borderRadius: 12, padding: "24px 28px", flex: "0 0 200px" }}>
            <p style={{ fontWeight: 700, color: COLORS.successText, margin: "0 0 16px 0", fontSize: 15 }}>✔ Inscripción exitosa</p>
            <p style={{ fontSize: 11, color: "#639922", margin: "0 0 2px 0", fontWeight: 600, textTransform: "uppercase" }}>Cupos restantes</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: COLORS.successText, margin: 0 }}>{resultado.cupos_restantes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InscribirTrabajador;
