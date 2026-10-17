import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import {
  API_ACCIDENTES,
  API_INSCRIPCIONES,
  API_TIPOS_ACCIDENTE,
  API_TIPOS_IDENTIFICACION,
  inputStyle,
} from "../../constants/color";
import type { Accidente, ApiResponse, Participante, TipoDocumento, TipoAccidente, ToastType } from "../../types";

interface IncidentesProps {
  onToast: (message: string, type: ToastType) => void;
}

function Incidentes({ onToast }: IncidentesProps) {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [tiposAccidente, setTiposAccidente] = useState<TipoAccidente[]>([]);
  const [incidentes, setIncidentes] = useState<Accidente[]>([]);

  const [idTipo, setIdTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [trabajador, setTrabajador] = useState<Participante | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [idTipoAccidente, setIdTipoAccidente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [incidenteACerrar, setIncidenteACerrar] = useState<Accidente | null>(null);
  const [conEvidencia, setConEvidencia] = useState<Set<number>>(new Set());

  const cargarIncidentes = () => {
    apiFetch<ApiResponse<Accidente[]>>(`${API_ACCIDENTES}/`)
      .then((res) => setIncidentes(res.data))
      .catch(() => onToast("No se pudieron cargar los incidentes.", "error"));
  };

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => {});
    apiFetch<TipoAccidente[]>(`${API_TIPOS_ACCIDENTE}/`).then(setTiposAccidente).catch(() => {});
    cargarIncidentes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarTrabajador = async () => {
    if (!idTipo || !numero) {
      onToast("Selecciona el tipo y número de documento.", "error");
      return;
    }
    setBuscando(true);
    setTrabajador(null);
    try {
      const data = await apiFetch<Participante>(
        `${API_INSCRIPCIONES}/participantes/buscar?id_tipo=${idTipo}&numero=${numero}`
      );
      setTrabajador(data);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Trabajador no encontrado.", "error");
    } finally {
      setBuscando(false);
    }
  };

  const registrarIncidente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabajador) {
      onToast("Primero busca al trabajador.", "error");
      return;
    }
    setGuardando(true);
    try {
      await apiFetch(`${API_ACCIDENTES}/`, {
        method: "POST",
        body: JSON.stringify({
          fecha,
          lugar,
          id_trabajador: trabajador.id_usuario,
          id_tipo_accidente: parseInt(idTipoAccidente),
          descripcion: descripcion || null,
        }),
      });
      onToast("Incidente registrado correctamente.", "success");
      setTrabajador(null);
      setIdTipo("");
      setNumero("");
      setFecha("");
      setLugar("");
      setIdTipoAccidente("");
      setDescripcion("");
      cargarIncidentes();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (idAccidente: number, nuevoEstado: string) => {
    try {
      await apiFetch(`${API_ACCIDENTES}/${idAccidente}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ nuevo_estado: nuevoEstado }),
      });
      onToast("Estado actualizado.", "success");
      cargarIncidentes();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setIncidenteACerrar(null);
    }
  };

  const avanzarEstado = (a: Accidente) => {
    if (a.estado === "abierto") {
      cambiarEstado(a.id_accidente, "en_seguimiento");
    } else if (a.estado === "en_seguimiento") {
      setIncidenteACerrar(a);
    }
  };

  const subirEvidencia = async (idAccidente: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("nombre", file.name);
    try {
      await apiFetch(`${API_ACCIDENTES}/${idAccidente}/evidencia`, { method: "POST", body: formData });
      onToast("Evidencia adjuntada correctamente.", "success");
      setConEvidencia((prev) => new Set(prev).add(idAccidente));
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    }
  };

  const ESTADO_LABEL: Record<string, string> = {
    abierto: "Abierto",
    en_seguimiento: "En seguimiento",
    cerrado: "Cerrado",
  };
  const ESTADO_COLOR: Record<string, string> = {
    abierto: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    en_seguimiento: "bg-secondary-container text-on-secondary-container",
    cerrado: "bg-green-50 text-green-700",
  };

  const botonBuscarDeshabilitado = buscando || !idTipo || !numero;
  const botonRegistrarDeshabilitado = guardando || !trabajador || !fecha || !lugar.trim() || !idTipoAccidente;

  return (
    <div>
      <PageHeader title="Incidentes de seguridad" subtitle="Registra y consulta la bitácora de accidentes de los trabajadores." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <form onSubmit={registrarIncidente} className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[360px] max-w-xl">
          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm pb-gap-xs border-b border-outline-variant/30">
            1. Buscar trabajador
          </p>
          <div className="grid grid-cols-2 gap-x-gap-md">
            <Field label="Tipo de documento" required>
              <select value={idTipo} onChange={(e) => setIdTipo(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Seleccionar...</option>
                {tiposDoc.map((t) => (
                  <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de documento" required>
              <input type="number" value={numero} onChange={(e) => setNumero(e.target.value)} style={inputStyle} />
            </Field>
          </div>
          <button
            type="button"
            onClick={buscarTrabajador}
            disabled={botonBuscarDeshabilitado}
            className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider mb-gap-md transition-colors ${
              botonBuscarDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
            }`}
          >
            {buscando ? "Buscando..." : "Buscar trabajador"}
          </button>

          {trabajador && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-gap-sm py-gap-xs mb-gap-lg">
              <p className="font-headline-sm text-headline-sm text-green-800 m-0 normal-case">{trabajador.nombre}</p>
              <p className="font-body-sm text-body-sm text-green-700 m-0">{trabajador.tipo_documento} · {trabajador.numero_identificacion}</p>
            </div>
          )}

          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm pb-gap-xs border-b border-outline-variant/30">
            2. Detalle del incidente
          </p>
          <div className="grid grid-cols-2 gap-x-gap-md">
            <Field label="Fecha" required>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="Tipo de incidente" required>
              <select value={idTipoAccidente} onChange={(e) => setIdTipoAccidente(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Seleccionar...</option>
                {tiposAccidente.map((t) => (
                  <option key={t.id_tipo_accidente} value={t.id_tipo_accidente}>{t.nombre}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Lugar" required>
            <input value={lugar} onChange={(e) => setLugar(e.target.value)} style={inputStyle} required />
          </Field>
          <Field label="Descripción">
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />
          </Field>

          <button
            type="submit"
            disabled={botonRegistrarDeshabilitado}
            className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
              botonRegistrarDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
            }`}
          >
            {guardando ? "Guardando..." : "Registrar incidente"}
          </button>
        </form>

        <div className="flex-1 min-w-[400px] bg-surface-container-lowest rounded-xl overflow-hidden">
          <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
            Incidentes recientes ({incidentes.length})
          </p>
          {incidentes.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Aún no hay incidentes registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-left">
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Trabajador</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Tipo</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Fecha</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Estado</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Evidencia</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentes.map((a) => (
                    <tr key={a.id_accidente} className="border-t border-outline-variant/20">
                      <td className="px-gap-sm py-gap-xs">{a.trabajador ?? `#${a.id_trabajador}`}</td>
                      <td className="px-gap-sm py-gap-xs">{a.tipo_accidente ?? `#${a.id_tipo_accidente}`}</td>
                      <td className="px-gap-sm py-gap-xs">{a.fecha}</td>
                      <td className="px-gap-sm py-gap-xs">
                        <div className="flex items-center gap-gap-2xs">
                          <span className={`font-label-sm text-label-sm font-bold px-gap-xs py-0.5 rounded-full ${ESTADO_COLOR[a.estado] ?? ESTADO_COLOR.abierto}`}>
                            {ESTADO_LABEL[a.estado] ?? a.estado}
                          </span>
                          {a.estado !== "cerrado" && (
                            <button onClick={() => avanzarEstado(a)} className="bg-transparent border-none text-secondary cursor-pointer font-body-sm text-body-sm">
                              {a.estado === "abierto" ? "Iniciar seguimiento" : "Cerrar"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-gap-sm py-gap-xs">
                        <label className="font-body-sm text-body-sm text-secondary cursor-pointer">
                          {conEvidencia.has(a.id_accidente) ? "✔ adjuntada" : "Adjuntar"}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) subirEvidencia(a.id_accidente, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={incidenteACerrar !== null}
        title="Cerrar incidente"
        message="Un incidente cerrado no puede reabrirse. ¿Confirmas el cierre?"
        confirmLabel="Cerrar incidente"
        onCancel={() => setIncidenteACerrar(null)}
        onConfirm={() => incidenteACerrar && cambiarEstado(incidenteACerrar.id_accidente, "cerrado")}
      />
    </div>
  );
}

export default Incidentes;
