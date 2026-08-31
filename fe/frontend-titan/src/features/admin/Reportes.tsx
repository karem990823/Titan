import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_REPORTES, COLORS, inputStyle } from "../../constants/color";
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

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: "1 1 340px", maxWidth: 420 }}>
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 6px 0" }}>Reporte diario</p>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "0 0 16px 0" }}>
              Resume los cursos programados, asistencias marcadas, incidentes registrados y certificados emitidos hoy. Una vez generado, no se puede editar.
            </p>
            <button onClick={generarDiario} disabled={generandoDiario} style={{
              background: generandoDiario ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
              cursor: generandoDiario ? "not-allowed" : "pointer",
            }}>
              {generandoDiario ? "Generando..." : "Generar reporte diario"}
            </button>
          </div>

          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 6px 0" }}>Cierre de mes</p>
            <p style={{ fontSize: 13, color: COLORS.textSecondary, margin: "0 0 16px 0" }}>
              Consolida a los participantes aprobados del mes elegido. Los aprobados sin certificado emitido aparecen como excluidos, con el motivo.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
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
            <button onClick={() => setConfirmandoCierre(true)} disabled={ejecutandoCierre} style={{
              background: ejecutandoCierre ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600,
              cursor: ejecutandoCierre ? "not-allowed" : "pointer",
            }}>
              {ejecutandoCierre ? "Ejecutando..." : "Ejecutar cierre de mes"}
            </button>
          </div>

          {resultadoCierre && (
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "20px 24px" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: COLORS.successText, margin: "0 0 8px 0" }}>
                Incluidos ({resultadoCierre.incluidos.length})
              </p>
              {resultadoCierre.incluidos.length === 0 && <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: "0 0 12px 0" }}>Ninguno.</p>}
              {resultadoCierre.incluidos.map((p, i) => (
                <p key={i} style={{ fontSize: 12, margin: "2px 0" }}>{p.trabajador} — {p.curso}</p>
              ))}
              <p style={{ fontWeight: 700, fontSize: 13, color: COLORS.errorText, margin: "16px 0 8px 0" }}>
                Excluidos ({resultadoCierre.excluidos.length})
              </p>
              {resultadoCierre.excluidos.length === 0 && <p style={{ fontSize: 12, color: COLORS.textSecondary, margin: 0 }}>Ninguno.</p>}
              {resultadoCierre.excluidos.map((p, i) => (
                <p key={i} style={{ fontSize: 12, margin: "2px 0" }}>{p.trabajador} — {p.curso} · <span style={{ color: COLORS.textSecondary }}>{p.motivo_exclusion}</span></p>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: "1 1 360px", background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: 0, padding: "16px 20px", borderBottom: `1px solid ${COLORS.borderGray}` }}>
            Reportes diarios generados ({reportes.length})
          </p>
          {reportes.length === 0 ? (
            <p style={{ color: COLORS.textSecondary, fontSize: 14, padding: 24, margin: 0 }}>Aún no se ha generado ningún reporte.</p>
          ) : (
            reportes.map((r) => (
              <div
                key={r.id_reporte}
                onClick={() => setReporteAbierto(r)}
                style={{ padding: "12px 20px", borderTop: `1px solid ${COLORS.borderGray}`, fontSize: 13, cursor: "pointer" }}
              >
                <span style={{ fontWeight: 600 }}>{r.fecha}</span>
                <span style={{ color: COLORS.textSecondary }}> — generado {r.fecha_creacion}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {reporteAbierto && (
        <div
          onClick={() => setReporteAbierto(null)}
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: COLORS.white, borderRadius: 12, padding: "24px 28px", maxWidth: 560, maxHeight: "70vh", overflow: "auto" }}>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 12px 0" }}>Reporte del {reporteAbierto.fecha}</p>
            <pre style={{ fontSize: 12, background: COLORS.lightGray, padding: 16, borderRadius: 8, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(JSON.parse(reporteAbierto.contenido_json), null, 2)}
            </pre>
            <button onClick={() => setReporteAbierto(null)} style={{
              background: COLORS.blue, color: COLORS.white, border: "none", borderRadius: 8,
              padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8,
            }}>
              Cerrar
            </button>
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
