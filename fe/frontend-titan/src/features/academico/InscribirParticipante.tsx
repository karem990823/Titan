import { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";
import PageHeader from "../../components/UI/PageHeader";
import Field from "../../components/UI/Field";
import {
  API_CURSOS,
  API_INSCRIPCIONES,
  API_PROGRAMACIONES,
  API_TIPOS_IDENTIFICACION,
  inputStyle,
} from "../../constants/color";
import type {
  ApiResponse,
  Curso,
  Participante,
  Programacion,
  ResultadoInscripcion,
  TipoDocumento,
  ToastType,
} from "../../types";

interface InscribirParticipanteProps {
  onToast: (message: string, type: ToastType) => void;
}

interface FormState {
  id_tipo: string;
  numero_identificacion: string;
  id_curso: string;
  id_programacion: string;
}

function InscribirParticipante({ onToast }: InscribirParticipanteProps) {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [participante, setParticipante] = useState<Participante | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [form, setForm] = useState<FormState>({
    id_tipo: "", numero_identificacion: "",
    id_curso: "", id_programacion: "",
  });
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoInscripcion | null>(null);

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => {});
    apiFetch<Curso[]>(`${API_CURSOS}/lista-cursos`).then(setCursos).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.id_curso) return;
    let ignore = false;
    apiFetch<Programacion[]>(`${API_PROGRAMACIONES}/${form.id_curso}`)
      .then((data) => { if (!ignore) setProgramaciones(data); });
    return () => { ignore = true; };
  }, [form.id_curso]);

  const buscarParticipante = async () => {
    if (!form.id_tipo || !form.numero_identificacion) {
      onToast("Selecciona el tipo y número de documento.", "error");
      return;
    }
    setBuscando(true);
    setParticipante(null);
    try {
      const data = await apiFetch<Participante>(
        `${API_INSCRIPCIONES}/participantes/buscar?id_tipo=${form.id_tipo}&numero=${form.numero_identificacion}`
      );
      setParticipante(data);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Participante no encontrado.", "error");
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async () => {
    if (!participante) { onToast("Primero busca al participante.", "error"); return; }
    if (!form.id_programacion) { onToast("Selecciona una fecha de curso.", "error"); return; }
    setLoading(true);
    setResultado(null);
    try {
      const data = await apiFetch<ApiResponse<ResultadoInscripcion>>(`${API_INSCRIPCIONES}/${form.id_programacion}`, {
        method: "POST",
        body: JSON.stringify({ id_usuario: participante.id_usuario }),
      });
      setResultado(data.data);
      onToast(data.message || "Participante inscrito correctamente.", "success");
      setForm({ id_tipo: "", numero_identificacion: "", id_curso: "", id_programacion: "" });
      setParticipante(null);
      setProgramaciones([]);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  const botonBuscarDeshabilitado = buscando || !form.id_tipo || !form.numero_identificacion;
  const botonInscribirDeshabilitado = loading || !participante || !form.id_programacion;

  return (
    <div>
      <PageHeader title="Inscribir participante" subtitle="Formaliza la matrícula de un participante en un curso programado." />
      <div className="flex gap-gap-lg flex-wrap items-start">
        <div className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[340px] max-w-xl">

          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm pb-gap-xs border-b border-outline-variant/30">
            1. Buscar participante
          </p>
          <div className="grid grid-cols-2 gap-x-gap-md">
            <Field label="Tipo de documento" required>
              <select value={form.id_tipo}
                onChange={(e) => setForm({ ...form, id_tipo: e.target.value })}
                style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Seleccionar...</option>
                {tiposDoc.map((t) => (
                  <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de documento" required>
              <input type="number" placeholder="Ej: 1234567890"
                value={form.numero_identificacion}
                onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })}
                style={inputStyle} />
            </Field>
          </div>

          <button
            onClick={buscarParticipante}
            disabled={botonBuscarDeshabilitado}
            className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider mb-gap-md transition-colors ${
              botonBuscarDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
            }`}
          >
            {buscando ? "Buscando..." : "Buscar participante"}
          </button>

          {participante && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-gap-sm py-gap-xs mb-gap-lg flex items-center gap-gap-xs">
              <span className="material-symbols-outlined text-green-700 text-xl">check_circle</span>
              <div>
                <p className="font-headline-sm text-headline-sm text-green-800 m-0 normal-case">{participante.nombre}</p>
                <p className="font-body-sm text-body-sm text-green-700 m-0">
                  {participante.tipo_documento} · {participante.numero_identificacion}
                </p>
              </div>
            </div>
          )}

          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm pb-gap-xs border-b border-outline-variant/30">
            2. Seleccionar curso y fecha
          </p>

          <Field label="Tipo de curso" required>
            <select value={form.id_curso}
              onChange={(e) => {
                setForm({ ...form, id_curso: e.target.value, id_programacion: "" });
                setProgramaciones([]);
              }}
              style={{ ...inputStyle, appearance: "none" }}>
              <option value="">Seleccionar curso...</option>
              {cursos.map((c) => (
                <option key={c.id_curso} value={c.id_curso}>{c.nombre_curso}</option>
              ))}
            </select>
          </Field>

          {programaciones.length > 0 && (
            <Field label="Fecha y horario disponible" required>
              <select value={form.id_programacion}
                onChange={(e) => setForm({ ...form, id_programacion: e.target.value })}
                style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Seleccionar fecha...</option>
                {programaciones.map((p) => (
                  <option key={p.id_programacion} value={p.id_programacion}>
                    {p.fecha} · {p.hora} · {p.cupos} cupos disponibles
                  </option>
                ))}
              </select>
            </Field>
          )}

          {form.id_curso && programaciones.length === 0 && (
            <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant bg-tertiary-fixed px-gap-sm py-2.5 rounded-lg mb-gap-sm">
              No hay fechas con cupos disponibles para este curso.
            </p>
          )}

          <div className="border-t border-outline-variant/30 pt-gap-md mt-gap-xs">
            <button
              onClick={handleSubmit}
              disabled={botonInscribirDeshabilitado}
              className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
                botonInscribirDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
              }`}
            >
              {loading ? "Inscribiendo..." : "Inscribir participante"}
            </button>
          </div>
        </div>

        {resultado && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-gap-lg flex-none w-[220px]">
            <p className="font-headline-sm text-headline-sm text-green-800 mb-gap-sm flex items-center gap-gap-2xs">
              <span className="material-symbols-outlined text-xl">check_circle</span>
              Inscripción exitosa
            </p>
            <div className="flex flex-col gap-gap-sm">
              <div>
                <p className="font-label-sm text-label-sm text-green-700 uppercase m-0">Estado</p>
                <p className="font-headline-sm text-headline-sm text-green-800 m-0 capitalize">{resultado.estado}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-green-700 uppercase m-0">Cupos restantes</p>
                <p className="font-headline-lg text-headline-lg text-green-800 m-0">{resultado.cupos_restantes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InscribirParticipante;
