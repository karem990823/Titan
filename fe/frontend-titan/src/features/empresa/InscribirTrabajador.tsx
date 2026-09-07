import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_CURSOS, API_INSCRIPCIONES, API_PROGRAMACIONES, API_USUARIOS, inputStyle } from "../../constants/color";
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

  const botonDeshabilitado = loading || !idTrabajador || !idProgramacion;

  return (
    <div>
      <PageHeader title="Inscribir trabajador" subtitle="Programa a uno de tus trabajadores en un curso disponible." />
      <div className="flex gap-gap-lg flex-wrap items-start">
        <div className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[340px] max-w-lg">
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
              <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant bg-tertiary-fixed px-gap-sm py-2.5 rounded-lg mb-gap-sm">
                No hay fechas con cupos disponibles para este curso.
              </p>
            )}

            <button
              type="submit"
              disabled={botonDeshabilitado}
              className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
                botonDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
              }`}
            >
              {loading ? "Inscribiendo..." : "Inscribir trabajador"}
            </button>
          </form>
        </div>

        {resultado && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-gap-lg flex-none w-[220px]">
            <p className="font-headline-sm text-headline-sm text-green-800 mb-gap-sm flex items-center gap-gap-2xs">
              <span className="material-symbols-outlined text-xl">check_circle</span>
              Inscripción exitosa
            </p>
            <p className="font-label-sm text-label-sm text-green-700 uppercase m-0">Cupos restantes</p>
            <p className="font-headline-lg text-headline-lg text-green-800 m-0">{resultado.cupos_restantes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InscribirTrabajador;
