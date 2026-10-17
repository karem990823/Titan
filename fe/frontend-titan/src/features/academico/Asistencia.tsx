import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_ASISTENCIAS, API_PROGRAMACIONES, inputStyle } from "../../constants/color";
import type { ApiResponse, AsistenciaInscrito, CursoCalendario, ToastType } from "../../types";

interface AsistenciaProps {
  onToast: (message: string, type: ToastType) => void;
}

function Asistencia({ onToast }: AsistenciaProps) {
  const [programaciones, setProgramaciones] = useState<CursoCalendario[]>([]);
  const [idProgramacion, setIdProgramacion] = useState("");
  const [inscritos, setInscritos] = useState<AsistenciaInscrito[]>([]);
  const [marcados, setMarcados] = useState<Record<number, boolean>>({});
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    apiFetch<ApiResponse<CursoCalendario[]>>(`${API_PROGRAMACIONES}/calendario`)
      .then((res) => setProgramaciones(res.data))
      .catch(() => onToast("No se pudo cargar el calendario.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!idProgramacion) return;
    let ignore = false;
    apiFetch<ApiResponse<AsistenciaInscrito[]>>(`${API_ASISTENCIAS}/programacion/${idProgramacion}`)
      .then((res) => {
        if (ignore) return;
        setInscritos(res.data);
        setMarcados(
          Object.fromEntries(res.data.map((i) => [i.id_inscripcion, i.asistio ?? false]))
        );
      })
      .catch(() => onToast("No se pudo cargar la lista de inscritos.", "error"))
      .finally(() => { if (!ignore) setCargando(false); });
    return () => { ignore = true; };
  }, [idProgramacion, onToast]);

  const guardarAsistencia = async () => {
    setGuardando(true);
    try {
      const data = await apiFetch<ApiResponse<{ registros: number }>>(
        `${API_ASISTENCIAS}/programacion/${idProgramacion}`,
        {
          method: "POST",
          body: JSON.stringify({
            asistencias: inscritos.map((i) => ({
              id_inscripcion: i.id_inscripcion,
              asistio: marcados[i.id_inscripcion] ?? false,
            })),
          }),
        }
      );
      onToast(data.message || "Asistencia guardada correctamente.", "success");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <PageHeader title="Control de asistencia" subtitle="Marca la asistencia de los participantes por sesión programada." />

      <div className="bg-surface-container-lowest rounded-xl p-gap-lg max-w-2xl mb-gap-lg">
        <Field label="Sesión programada" required>
          <select
            value={idProgramacion}
            onChange={(e) => {
              setIdProgramacion(e.target.value);
              setInscritos([]);
              setMarcados({});
              setCargando(!!e.target.value);
            }}
            style={{ ...inputStyle, appearance: "none" }}
          >
            <option value="">Seleccionar sesión...</option>
            {programaciones.map((p) => (
              <option key={p.id_programacion} value={p.id_programacion}>
                {p.nombre_curso} · {p.fecha} · {p.hora} · {p.instructor_nombre}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {cargando ? (
        <div className="text-center py-gap-2xl text-on-surface-variant font-body-sm text-body-sm">Cargando...</div>
      ) : idProgramacion && inscritos.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-gap-2xl text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant m-0">Esta sesión no tiene participantes inscritos.</p>
        </div>
      ) : inscritos.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Participante</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant text-center">Asistió</th>
                </tr>
              </thead>
              <tbody>
                {inscritos.map((i) => (
                  <tr key={i.id_inscripcion} className="border-t border-outline-variant/20">
                    <td className="px-gap-sm py-gap-xs">{i.nombre ?? `#${i.id_usuario}`}</td>
                    <td className="px-gap-sm py-gap-xs text-center">
                      <input
                        type="checkbox"
                        checked={marcados[i.id_inscripcion] ?? false}
                        onChange={(e) => setMarcados({ ...marcados, [i.id_inscripcion]: e.target.checked })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-gap-md py-gap-sm border-t border-outline-variant/30">
            <button
              onClick={guardarAsistencia}
              disabled={guardando}
              className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
                guardando ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
              }`}
            >
              {guardando ? "Guardando..." : "Guardar asistencia"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Asistencia;
