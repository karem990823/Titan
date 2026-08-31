import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import {
  API_EVALUACIONES,
  API_INSCRIPCIONES,
  API_PREGUNTAS,
  API_TIPOS_IDENTIFICACION,
  COLORS,
  inputStyle,
} from "../../constants/color";
import type { ApiResponse, EvaluacionDetalle, Participante, ResultadoPresentacion, TipoDocumento, ToastType } from "../../types";

interface EditarEvaluacionProps {
  onToast: (message: string, type: ToastType) => void;
}

const RESPUESTAS_VACIAS = ["", "", "", ""];

function EditarEvaluacion({ onToast }: EditarEvaluacionProps) {
  const { idEvaluacion } = useParams<{ idEvaluacion: string }>();

  const [evaluacion, setEvaluacion] = useState<EvaluacionDetalle | null>(null);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);

  // Formulario: nueva pregunta
  const [pregunta, setPregunta] = useState("");
  const [respuestas, setRespuestas] = useState<string[]>(RESPUESTAS_VACIAS);
  const [correctaIdx, setCorrectaIdx] = useState(0);
  const [guardandoPregunta, setGuardandoPregunta] = useState(false);

  // Formulario: presentar evaluación
  const [idTipo, setIdTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});
  const [presentando, setPresentando] = useState(false);
  const [preguntaAEliminar, setPreguntaAEliminar] = useState<number | null>(null);

  const cargarEvaluacion = () => {
    if (!idEvaluacion) return;
    apiFetch<ApiResponse<EvaluacionDetalle>>(`${API_EVALUACIONES}/${idEvaluacion}`)
      .then((res) => setEvaluacion(res.data))
      .catch(() => onToast("No se pudo cargar la evaluación.", "error"));
  };

  useEffect(() => {
    cargarEvaluacion();
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEvaluacion]);

  const agregarPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    const respuestasCompletas = respuestas.filter((r) => r.trim() !== "");
    if (respuestasCompletas.length < 2) {
      onToast("Agrega al menos dos opciones de respuesta.", "error");
      return;
    }

    setGuardandoPregunta(true);
    try {
      await apiFetch(`${API_EVALUACIONES}/${idEvaluacion}/preguntas`, {
        method: "POST",
        body: JSON.stringify({
          pregunta,
          respuestas: respuestas.map((texto, idx) => ({
            respuesta: texto,
            es_correcta: idx === correctaIdx,
          })).filter((r) => r.respuesta.trim() !== ""),
        }),
      });
      onToast("Pregunta agregada correctamente.", "success");
      setPregunta("");
      setRespuestas(RESPUESTAS_VACIAS);
      setCorrectaIdx(0);
      cargarEvaluacion();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoPregunta(false);
    }
  };

  const eliminarPregunta = async (idPregunta: number) => {
    try {
      await apiFetch(`${API_PREGUNTAS}/${idPregunta}`, { method: "DELETE" });
      onToast("Pregunta eliminada.", "success");
      cargarEvaluacion();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setPreguntaAEliminar(null);
    }
  };

  const buscarParticipante = async () => {
    if (!idTipo || !numero) {
      onToast("Selecciona el tipo y número de documento.", "error");
      return;
    }
    setBuscando(true);
    setParticipante(null);
    try {
      const res = await apiFetch<Participante>(`${API_INSCRIPCIONES}/participantes/buscar?id_tipo=${idTipo}&numero=${numero}`);
      setParticipante(res);
      setSeleccion({});
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Participante no encontrado", "error");
    } finally {
      setBuscando(false);
    }
  };

  const presentar = async () => {
    if (!participante || !evaluacion) return;
    if (Object.keys(seleccion).length !== evaluacion.preguntas.length) {
      onToast("Responde todas las preguntas antes de calificar.", "error");
      return;
    }
    setPresentando(true);
    try {
      const res = await apiFetch<ApiResponse<ResultadoPresentacion>>(`${API_EVALUACIONES}/${idEvaluacion}/presentar`, {
        method: "POST",
        body: JSON.stringify({
          id_usuario: participante.id_usuario,
          respuestas: Object.entries(seleccion).map(([idPregunta, idRespuesta]) => ({
            id_pregunta: Number(idPregunta),
            id_respuesta: idRespuesta,
          })),
        }),
      });
      onToast(
        res.message || "Evaluación calificada correctamente.",
        res.data.certificado_emitido ? "success" : "warning"
      );
      setParticipante(null);
      setSeleccion({});
      setNumero("");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setPresentando(false);
    }
  };

  if (!evaluacion) {
    return <div style={{ padding: 24, color: COLORS.textSecondary }}>Cargando...</div>;
  }

  return (
    <div>
      <PageHeader title={evaluacion.nombre} subtitle="Gestiona las preguntas de esta evaluación y registra calificaciones." />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", flex: "1 1 380px" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>
            Preguntas ({evaluacion.preguntas.length})
          </p>
          {evaluacion.preguntas.map((p) => (
            <div key={p.id_pregunta} style={{ border: `1px solid ${COLORS.borderGray}`, borderRadius: 8, padding: "12px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 8px 0" }}>{p.pregunta}</p>
                <button onClick={() => setPreguntaAEliminar(p.id_pregunta)} style={{ background: "none", border: "none", color: COLORS.errorText, cursor: "pointer", fontSize: 12 }}>
                  Eliminar
                </button>
              </div>
              {p.respuestas.map((r) => (
                <p key={r.id_respuesta} style={{ margin: "2px 0", fontSize: 12, color: r.es_correcta ? COLORS.successText : COLORS.textSecondary }}>
                  {r.es_correcta ? "✔" : "○"} {r.respuesta}
                </p>
              ))}
            </div>
          ))}

          <form onSubmit={agregarPregunta} style={{ borderTop: `1px solid ${COLORS.borderGray}`, paddingTop: 16, marginTop: 8 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: COLORS.textPrimary, margin: "0 0 12px 0" }}>Agregar pregunta</p>
            <Field label="Pregunta" required>
              <input value={pregunta} onChange={(e) => setPregunta(e.target.value)} style={inputStyle} required />
            </Field>
            {respuestas.map((r, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input
                  type="radio"
                  name="correcta"
                  checked={correctaIdx === idx}
                  onChange={() => setCorrectaIdx(idx)}
                  title="Marcar como respuesta correcta"
                />
                <input
                  value={r}
                  onChange={(e) => {
                    const copia = [...respuestas];
                    copia[idx] = e.target.value;
                    setRespuestas(copia);
                  }}
                  placeholder={`Opción ${idx + 1}`}
                  style={inputStyle}
                />
              </div>
            ))}
            <button type="submit" disabled={guardandoPregunta} style={{
              background: guardandoPregunta ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
              borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, marginTop: 4,
              cursor: guardandoPregunta ? "not-allowed" : "pointer",
            }}>
              {guardandoPregunta ? "Guardando..." : "Agregar pregunta"}
            </button>
          </form>
        </div>

        <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", flex: "1 1 320px" }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Registrar presentación</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <Field label="Tipo documento">
              <select value={idTipo} onChange={(e) => setIdTipo(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Seleccionar...</option>
                {tiposDoc.map((t) => (
                  <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Número">
              <input value={numero} onChange={(e) => setNumero(e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <button onClick={buscarParticipante} disabled={buscando} style={{
            background: COLORS.lightGray, border: `1px solid ${COLORS.borderGray}`, borderRadius: 8,
            padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16,
          }}>
            {buscando ? "Buscando..." : "Buscar participante"}
          </button>

          {participante && (
            <>
              <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 12px 0" }}>{participante.nombre}</p>
              {evaluacion.preguntas.map((p) => (
                <div key={p.id_pregunta} style={{ marginBottom: 12 }}>
                  <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 6px 0" }}>{p.pregunta}</p>
                  {p.respuestas.map((r) => (
                    <label key={r.id_respuesta} style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
                      <input
                        type="radio"
                        name={`pregunta-${p.id_pregunta}`}
                        checked={seleccion[p.id_pregunta] === r.id_respuesta}
                        onChange={() => setSeleccion({ ...seleccion, [p.id_pregunta]: r.id_respuesta })}
                        style={{ marginRight: 6 }}
                      />
                      {r.respuesta}
                    </label>
                  ))}
                </div>
              ))}
              <button onClick={presentar} disabled={presentando} style={{
                background: presentando ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
                borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600,
                cursor: presentando ? "not-allowed" : "pointer",
              }}>
                {presentando ? "Calificando..." : "Calificar evaluación"}
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={preguntaAEliminar !== null}
        title="Eliminar pregunta"
        message="Esta acción no se puede deshacer. ¿Eliminar esta pregunta y sus respuestas?"
        confirmLabel="Eliminar"
        onCancel={() => setPreguntaAEliminar(null)}
        onConfirm={() => preguntaAEliminar !== null && eliminarPregunta(preguntaAEliminar)}
      />
    </div>
  );
}

export default EditarEvaluacion;
