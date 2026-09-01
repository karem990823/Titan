import { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_PROGRAMACIONES, COLORS } from "../../constants/color";
import type { ApiResponse, CursoCalendario, InscritoPrograma, ToastType } from "../../types";

interface CalendarioProps {
  onToast: (message: string, type: ToastType) => void;
}

function Calendario({ onToast }: CalendarioProps) {
  const [cursos, setCursos] = useState<CursoCalendario[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandidoId, setExpandidoId] = useState<number | null>(null);
  const [inscritosPorPrograma, setInscritosPorPrograma] = useState<Record<number, InscritoPrograma[]>>({});
  const [cargandoInscritos, setCargandoInscritos] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<ApiResponse<CursoCalendario[]>>(`${API_PROGRAMACIONES}/calendario`)
      .then((response) => {
        if (response.success) {
          setCursos(response.data);
        } else {
          onToast(response.message || "Error al cargar calendario", "error");
        }
      })
      .catch((err) => {
        onToast(err instanceof Error ? err.message : "No se pudo conectar con el servidor.", "error");
      })
      .finally(() => setLoading(false));
  }, [onToast]);

  const alternarExpandido = (idProgramacion: number) => {
    if (expandidoId === idProgramacion) {
      setExpandidoId(null);
      return;
    }
    setExpandidoId(idProgramacion);
    if (inscritosPorPrograma[idProgramacion]) return;

    setCargandoInscritos(idProgramacion);
    apiFetch<ApiResponse<InscritoPrograma[]>>(`${API_PROGRAMACIONES}/${idProgramacion}/inscritos`)
      .then((res) => setInscritosPorPrograma((prev) => ({ ...prev, [idProgramacion]: res.data })))
      .catch(() => onToast("No se pudieron cargar los inscritos.", "error"))
      .finally(() => setCargandoInscritos(null));
  };

  const tipoColor = (nombre: string = "") => {
    const n = nombre.toLowerCase();
    if (n.includes("reentrenamiento")) return { bg: COLORS.warningBg, text: COLORS.warningText };
    if (n.includes("coordinador")) return { bg: "#EEF2FF", text: "#3730A3" };
    return { bg: "#E6F1FB", text: "#185FA5" };
  };

  return (
    <div>
      <PageHeader title="Calendario de cursos" subtitle="Sesiones programadas en el centro de entrenamiento. Haz clic en una sesión para ver quién está inscrito." />

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: COLORS.textSecondary, fontSize: 14 }}>Cargando cursos...</div>
      ) : cursos.length === 0 ? (
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 36, margin: "0 0 12px 0" }}>📅</p>
          <p style={{ fontWeight: 600, color: COLORS.textPrimary, margin: "0 0 6px 0" }}>No hay cursos programados</p>
          <p style={{ color: COLORS.textSecondary, fontSize: 14, margin: 0 }}>Programa el primer curso desde el menú lateral.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cursos.map((c) => {
            // tipoColor() aún no se usa visualmente; se deja disponible para cuando
            // se agregue el badge de tipo de curso.
            tipoColor(c.nombre_curso || "");
            const expandido = expandidoId === c.id_programacion;
            const inscritos = inscritosPorPrograma[c.id_programacion];

            return (
              <div key={c.id_programacion} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
                <div
                  onClick={() => alternarExpandido(c.id_programacion)}
                  style={{
                    padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: COLORS.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: COLORS.white, fontSize: 18 }}>📅</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.textPrimary, margin: "0 0 3px 0" }}>
                      {c.nombre_curso}
                    </p>
                    <p style={{ color: COLORS.textSecondary, fontSize: 13, margin: 0 }}>
                      {c.fecha} &nbsp;·&nbsp; {c.hora}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ background: COLORS.lightGray, borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                      <p style={{ fontSize: 10, color: COLORS.textSecondary, margin: "0 0 1px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Cupos</p>
                      <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: c.cupos === 0 ? COLORS.errorText : c.cupos <= 3 ? COLORS.warningText : COLORS.blue }}>
                        {c.cupos}
                      </p>
                    </div>

                    <div style={{ background: COLORS.lightGray, borderRadius: 8, padding: "6px 14px", textAlign: "left" }}>
                      <p style={{ fontSize: 10, color: COLORS.textSecondary, margin: "0 0 1px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Instructor</p>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: COLORS.blue }}>
                        {c.instructor_nombre}
                      </p>
                    </div>

                    <span style={{ fontSize: 18, color: COLORS.textSecondary, transform: expandido ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                      ⌄
                    </span>
                  </div>
                </div>

                {expandido && (
                  <div style={{ borderTop: `1px solid ${COLORS.borderGray}`, padding: "14px 20px", background: COLORS.lightGray }}>
                    {cargandoInscritos === c.id_programacion ? (
                      <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0 }}>Cargando inscritos...</p>
                    ) : !inscritos || inscritos.length === 0 ? (
                      <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: 0 }}>Aún no hay participantes inscritos en esta sesión.</p>
                    ) : (
                      <>
                        <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Inscritos ({inscritos.length})
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {inscritos.map((i) => (
                            <div key={i.id_usuario} style={{
                              background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 8,
                              padding: "8px 12px", fontSize: 13, display: "flex", justifyContent: "space-between", gap: 12,
                            }}>
                              <span style={{ fontWeight: 600 }}>{i.nombre}</span>
                              <span style={{ color: COLORS.textSecondary }}>{i.tipo_documento} {i.numero_identificacion}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Calendario;
