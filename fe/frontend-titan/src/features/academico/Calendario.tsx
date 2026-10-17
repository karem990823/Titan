import { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import { API_PROGRAMACIONES } from "../../constants/color";
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

  const colorCupos = (cupos: number) =>
    cupos === 0 ? "text-error" : cupos <= 3 ? "text-tertiary" : "text-primary";

  return (
    <div>
      <PageHeader title="Calendario de cursos" subtitle="Sesiones programadas en el centro de entrenamiento. Haz clic en una sesión para ver quién está inscrito." />

      {loading ? (
        <div className="text-center py-gap-2xl text-on-surface-variant font-body-sm text-body-sm">Cargando cursos...</div>
      ) : cursos.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-gap-2xl text-center flex flex-col items-center gap-gap-2xs">
          <span className="material-symbols-outlined text-4xl text-secondary">calendar_month</span>
          <p className="font-headline-sm text-headline-sm text-on-surface m-0">No hay cursos programados</p>
          <p className="text-on-surface-variant font-body-sm text-body-sm m-0">Programa el primer curso desde el menú lateral.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-gap-xs">
          {cursos.map((c) => {
            const expandido = expandidoId === c.id_programacion;
            const inscritos = inscritosPorPrograma[c.id_programacion];

            return (
              <div key={c.id_programacion} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
                <div
                  onClick={() => alternarExpandido(c.id_programacion)}
                  className="p-gap-md flex items-center gap-gap-lg flex-wrap cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary text-xl">calendar_month</span>
                  </div>

                  <div className="flex-1 min-w-[180px]">
                    <p className="font-headline-sm text-headline-sm text-on-surface m-0 normal-case">{c.nombre_curso}</p>
                    <p className="text-on-surface-variant font-body-sm text-body-sm m-0">
                      {c.fecha} &nbsp;·&nbsp; {c.hora}
                    </p>
                  </div>

                  <div className="flex gap-gap-xs items-center flex-wrap">
                    <div className="bg-surface-container-low rounded-lg px-gap-sm py-1.5 text-center">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase m-0">Cupos</p>
                      <p className={`font-headline-sm text-headline-sm m-0 ${colorCupos(c.cupos)}`}>{c.cupos}</p>
                    </div>

                    <div className="bg-surface-container-low rounded-lg px-gap-sm py-1.5">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase m-0">Instructor</p>
                      <p className="font-label-lg text-label-lg text-secondary m-0 normal-case">{c.instructor_nombre}</p>
                    </div>

                    <span
                      className="material-symbols-outlined text-on-surface-variant transition-transform"
                      style={{ transform: expandido ? "rotate(180deg)" : "none" }}
                    >
                      expand_more
                    </span>
                  </div>
                </div>

                {expandido && (
                  <div className="border-t border-outline-variant/30 p-gap-md bg-surface-container-low">
                    {cargandoInscritos === c.id_programacion ? (
                      <p className="font-body-sm text-body-sm text-on-surface-variant m-0">Cargando inscritos...</p>
                    ) : !inscritos || inscritos.length === 0 ? (
                      <p className="font-body-sm text-body-sm text-on-surface-variant m-0">Aún no hay participantes inscritos en esta sesión.</p>
                    ) : (
                      <>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-gap-2xs">
                          Inscritos ({inscritos.length})
                        </p>
                        <div className="flex flex-col gap-1.5">
                          {inscritos.map((i) => (
                            <div key={i.id_usuario} className="bg-surface-container-lowest rounded-lg px-gap-sm py-2 flex justify-between gap-gap-sm font-body-sm text-body-sm">
                              <span className="font-semibold text-on-surface">{i.nombre}</span>
                              <span className="text-on-surface-variant">{i.tipo_documento} {i.numero_identificacion}</span>
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
