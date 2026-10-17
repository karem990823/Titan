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
    return <div className="p-gap-lg text-on-surface-variant font-body-sm text-body-sm">Cargando...</div>;
  }

  const botonAgregarDeshabilitado = guardandoPregunta || !pregunta.trim();
  const botonBuscarDeshabilitado = buscando || !idTipo || !numero;
  const botonPresentarDeshabilitado = presentando || Object.keys(seleccion).length !== evaluacion.preguntas.length;

  return (
    <div>
      <PageHeader title={evaluacion.nombre} subtitle="Gestiona las preguntas de esta evaluación y registra calificaciones." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <div className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[380px]">
          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">
            Preguntas ({evaluacion.preguntas.length})
          </p>
          {evaluacion.preguntas.map((p) => (
            <div key={p.id_pregunta} className="bg-surface-container-low rounded-lg px-gap-sm py-gap-xs mb-gap-xs">
              <div className="flex justify-between items-start gap-gap-2xs">
                <p className="font-label-lg text-label-lg text-on-surface normal-case mb-gap-2xs">{p.pregunta}</p>
                <button onClick={() => setPreguntaAEliminar(p.id_pregunta)} className="bg-transparent border-none text-error cursor-pointer font-body-sm text-body-sm">
                  Eliminar
                </button>
              </div>
              {p.respuestas.map((r) => (
                <p key={r.id_respuesta} className={`m-0.5 font-body-sm text-body-sm ${r.es_correcta ? "text-green-700" : "text-on-surface-variant"}`}>
                  {r.es_correcta ? "✔" : "○"} {r.respuesta}
                </p>
              ))}
            </div>
          ))}

          <form onSubmit={agregarPregunta} className="border-t border-outline-variant/30 pt-gap-md mt-gap-xs">
            <p className="font-label-lg text-label-lg uppercase text-on-surface mb-gap-sm">Agregar pregunta</p>
            <Field label="Pregunta" required>
              <input value={pregunta} onChange={(e) => setPregunta(e.target.value)} style={inputStyle} required />
            </Field>
            {respuestas.map((r, idx) => (
              <div key={idx} className="flex items-center gap-gap-xs mb-gap-2xs">
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
            <button
              type="submit"
              disabled={botonAgregarDeshabilitado}
              className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider mt-1 transition-colors ${
                botonAgregarDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
              }`}
            >
              {guardandoPregunta ? "Guardando..." : "Agregar pregunta"}
            </button>
          </form>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[320px]">
          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Registrar presentación</p>

          <div className="grid grid-cols-2 gap-x-gap-sm">
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
          <button
            onClick={buscarParticipante}
            disabled={botonBuscarDeshabilitado}
            className={`px-gap-md py-2 rounded-lg font-label-lg text-label-lg uppercase tracking-wider mb-gap-md transition-colors ${
              botonBuscarDeshabilitado ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            {buscando ? "Buscando..." : "Buscar participante"}
          </button>

          {participante && (
            <>
              <p className="font-label-lg text-label-lg text-on-surface normal-case mb-gap-sm">{participante.nombre}</p>
              {evaluacion.preguntas.map((p) => (
                <div key={p.id_pregunta} className="mb-gap-xs">
                  <p className="font-label-lg text-label-lg text-on-surface normal-case mb-gap-2xs">{p.pregunta}</p>
                  {p.respuestas.map((r) => (
                    <label key={r.id_respuesta} className="block font-body-sm text-body-sm mb-1">
                      <input
                        type="radio"
                        name={`pregunta-${p.id_pregunta}`}
                        checked={seleccion[p.id_pregunta] === r.id_respuesta}
                        onChange={() => setSeleccion({ ...seleccion, [p.id_pregunta]: r.id_respuesta })}
                        className="mr-gap-2xs"
                      />
                      {r.respuesta}
                    </label>
                  ))}
                </div>
              ))}
              <button
                onClick={presentar}
                disabled={botonPresentarDeshabilitado}
                className={`px-gap-md py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
                  botonPresentarDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
                }`}
              >
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
