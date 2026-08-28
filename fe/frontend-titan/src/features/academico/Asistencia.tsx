import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_ASISTENCIAS, API_PROGRAMACIONES, COLORS, inputStyle } from "../../constants/color";
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

      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", maxWidth: 640, marginBottom: 24 }}>
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
        <div style={{ textAlign: "center", padding: 48, color: COLORS.textSecondary, fontSize: 14 }}>Cargando...</div>
      ) : idProgramacion && inscritos.length === 0 ? (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, margin: 0 }}>Esta sesión no tiene participantes inscritos.</p>
        </div>
      ) : inscritos.length > 0 ? (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: COLORS.lightGray, textAlign: "left" }}>
                <th style={{ padding: "10px 16px" }}>Participante</th>
                <th style={{ padding: "10px 16px", textAlign: "center" }}>Asistió</th>
              </tr>
            </thead>
            <tbody>
              {inscritos.map((i) => (
                <tr key={i.id_inscripcion} style={{ borderTop: `1px solid ${COLORS.borderGray}` }}>
                  <td style={{ padding: "10px 16px" }}>{i.nombre ?? `#${i.id_usuario}`}</td>
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
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
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${COLORS.borderGray}` }}>
            <button onClick={guardarAsistencia} disabled={guardando} style={{
              background: guardando ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 24px", fontSize: 13, fontWeight: 600,
              cursor: guardando ? "not-allowed" : "pointer",
            }}>
              {guardando ? "Guardando..." : "Guardar asistencia"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Asistencia;
