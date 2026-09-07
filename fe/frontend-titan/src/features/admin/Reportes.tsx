import { useEffect, useState } from "react";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_REPORTES, inputStyle } from "../../constants/color";
import type { ApiResponse, Reporte, ResultadoCierreMes, ToastType } from "../../types";

interface ReportesProps {
  onToast: (message: string, type: ToastType) => void;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function Reportes({ onToast }: ReportesProps) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reporteAbierto, setReporteAbierto] = useState<Reporte | null>(null);
  const [generandoDiario, setGenerandoDiario] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [confirmandoCierre, setConfirmandoCierre] = useState(false);
  const [ejecutandoCierre, setEjecutandoCierre] = useState(false);
  const [resultadoCierre, setResultadoCierre] = useState<ResultadoCierreMes | null>(null);

  const cargarReportes = () => {
    apiFetch<ApiResponse<Reporte[]>>(`${API_REPORTES}/?tipo=diario`)
      .then((res) => setReportes(res.data))
      .catch(() => onToast("No se pudieron cargar los reportes.", "error"));
  };

  useEffect(() => {
    cargarReportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generarDiario = async () => {
    setGenerandoDiario(true);
    try {
      await apiFetch(`${API_REPORTES}/diario`, { method: "POST" });
      onToast("Reporte diario generado correctamente.", "success");
      cargarReportes();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGenerandoDiario(false);
    }
  };

  const descargarPdf = async (reporte: Reporte) => {
    setDescargandoId(reporte.id_reporte);
    try {
      const blob = await apiFetchBlob(`${API_REPORTES}/${reporte.id_reporte}/pdf`);
      descargarBlob(blob, `reporte-diario-${reporte.fecha}.pdf`);
    } catch {
      onToast("No se pudo descargar el PDF del reporte.", "error");
    } finally {
      setDescargandoId(null);
    }
  };

  const ejecutarCierre = async () => {
    setEjecutandoCierre(true);
    try {
      const res = await apiFetch<ApiResponse<ResultadoCierreMes>>(`${API_REPORTES}/cierre-mes`, {
        method: "POST",
        body: JSON.stringify({ mes, anio }),
      });
      onToast(res.message || "Cierre de mes ejecutado correctamente.", "success");
      setResultadoCierre(res.data);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setEjecutandoCierre(false);
      setConfirmandoCierre(false);
    }
  };

  return (
    <div>
      <PageHeader title="Reportes" subtitle="Genera el reporte diario de actividad y ejecuta el cierre mensual de participantes aprobados." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <div className="flex flex-col gap-gap-lg flex-1 min-w-[340px] max-w-md">
          <div className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-2xs">Reporte diario</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-md">
              Resume los cursos programados, asistencias marcadas, incidentes registrados y certificados emitidos hoy. Una vez generado, no se puede editar.
            </p>
            <button
              onClick={generarDiario}
              disabled={generandoDiario}
              className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                generandoDiario ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
              }`}
            >
              {generandoDiario ? "Generando..." : "Generar reporte diario"}
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-2xs">Cierre de mes</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-md">
              Consolida a los participantes aprobados del mes elegido. Los aprobados sin certificado emitido aparecen como excluidos, con el motivo.
            </p>
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="Mes">
                <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))} style={{ ...inputStyle, appearance: "none" }}>
                  {MESES.map((nombre, idx) => (
                    <option key={idx} value={idx + 1}>{nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Año">
                <input type="number" value={anio} onChange={(e) => setAnio(parseInt(e.target.value))} style={inputStyle} />
              </Field>
            </div>
            <button
              onClick={() => setConfirmandoCierre(true)}
              disabled={ejecutandoCierre}
              className={`px-gap-md py-2 rounded-lg text-on-primary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                ejecutandoCierre ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
              }`}
            >
              {ejecutandoCierre ? "Ejecutando..." : "Ejecutar cierre de mes"}
            </button>
          </div>

          {resultadoCierre && (
            <div className="bg-surface-container-lowest rounded-xl p-gap-lg">
              <p className="font-label-lg text-label-lg text-green-700 uppercase mb-gap-2xs">
                Incluidos ({resultadoCierre.incluidos.length})
              </p>
              {resultadoCierre.incluidos.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-sm">Ninguno.</p>}
              {resultadoCierre.incluidos.map((p, i) => (
                <p key={i} className="font-body-sm text-body-sm m-0.5">{p.trabajador} — {p.curso}</p>
              ))}
              <p className="font-label-lg text-label-lg text-error uppercase mt-gap-md mb-gap-2xs">
                Excluidos ({resultadoCierre.excluidos.length})
              </p>
              {resultadoCierre.excluidos.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant m-0">Ninguno.</p>}
              {resultadoCierre.excluidos.map((p, i) => (
                <p key={i} className="font-body-sm text-body-sm m-0.5">{p.trabajador} — {p.curso} · <span className="text-on-surface-variant">{p.motivo_exclusion}</span></p>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[360px] bg-surface-container-lowest rounded-xl overflow-hidden">
          <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
            Reportes diarios generados ({reportes.length})
          </p>
          {reportes.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Aún no se ha generado ningún reporte.</p>
          ) : (
            reportes.map((r) => (
              <div
                key={r.id_reporte}
                onClick={() => setReporteAbierto(r)}
                className="px-gap-md py-gap-sm border-t border-outline-variant/20 font-body-sm text-body-sm cursor-pointer flex items-center justify-between gap-gap-sm"
              >
                <span>
                  <span className="font-semibold text-on-surface">{r.fecha}</span>
                  <span className="text-on-surface-variant"> — generado {r.fecha_creacion}</span>
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); descargarPdf(r); }}
                  disabled={descargandoId === r.id_reporte}
                  className={`px-gap-sm py-1.5 rounded-md border font-label-sm text-label-sm font-bold whitespace-nowrap transition-colors ${
                    descargandoId === r.id_reporte
                      ? "border-outline-variant text-on-surface-variant cursor-not-allowed"
                      : "border-secondary text-secondary hover:bg-secondary-container/40"
                  }`}
                >
                  {descargandoId === r.id_reporte ? "Descargando..." : "Descargar PDF"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {reporteAbierto && (
        <div
          onClick={() => setReporteAbierto(null)}
          className="fixed inset-0 z-[1100] bg-on-background/50 flex items-center justify-center p-margin-mobile"
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest rounded-xl p-gap-lg max-w-xl max-h-[70vh] overflow-auto">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Reporte del {reporteAbierto.fecha}</p>
            <pre className="font-body-sm text-body-sm bg-surface-container-low p-gap-sm rounded-lg whitespace-pre-wrap">
              {JSON.stringify(JSON.parse(reporteAbierto.contenido_json), null, 2)}
            </pre>
            <div className="flex gap-gap-xs mt-gap-xs">
              <button
                onClick={() => descargarPdf(reporteAbierto)}
                disabled={descargandoId === reporteAbierto.id_reporte}
                className={`px-gap-md py-2 rounded-lg text-on-primary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                  descargandoId === reporteAbierto.id_reporte ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
                }`}
              >
                {descargandoId === reporteAbierto.id_reporte ? "Descargando..." : "Descargar PDF"}
              </button>
              <button
                onClick={() => setReporteAbierto(null)}
                className="px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider bg-secondary hover:bg-on-secondary-fixed"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmandoCierre}
        title="Ejecutar cierre de mes"
        message={`Se consolidarán los participantes aprobados de ${MESES[mes - 1]} ${anio}. Esta acción queda registrada.`}
        confirmLabel="Ejecutar cierre"
        onCancel={() => setConfirmandoCierre(false)}
        onConfirm={ejecutarCierre}
      />
    </div>
  );
}

export default Reportes;
