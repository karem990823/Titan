import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_INSCRIPCIONES, API_SALUD, API_TIPOS_IDENTIFICACION, inputStyle } from "../../constants/color";
import type { ApiResponse, Participante, RegistroSalud, TipoDocumento, ToastType } from "../../types";

interface SaludProps {
  onToast: (message: string, type: ToastType) => void;
}

function Salud({ onToast }: SaludProps) {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [registros, setRegistros] = useState<RegistroSalud[]>([]);

  const [idTipo, setIdTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [trabajador, setTrabajador] = useState<Participante | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [apto, setApto] = useState<"SI" | "NO">("SI");
  const [restricciones, setRestricciones] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fechaExamen, setFechaExamen] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarRegistros = () => {
    apiFetch<ApiResponse<RegistroSalud[]>>(`${API_SALUD}/`)
      .then((res) => setRegistros(res.data))
      .catch(() => onToast("No se pudieron cargar los registros de salud.", "error"));
  };

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => {});
    cargarRegistros();
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

  const registrarExamen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trabajador) {
      onToast("Primero busca al trabajador.", "error");
      return;
    }
    setGuardando(true);
    try {
      await apiFetch(`${API_SALUD}/`, {
        method: "POST",
        body: JSON.stringify({
          apto,
          restricciones: restricciones || null,
          observaciones: observaciones || null,
          fecha_examen: fechaExamen,
          fecha_vencimiento: fechaVencimiento,
          id_trabajador: trabajador.id_usuario,
        }),
      });
      onToast("Examen médico registrado correctamente.", "success");
      setTrabajador(null);
      setIdTipo("");
      setNumero("");
      setApto("SI");
      setRestricciones("");
      setObservaciones("");
      setFechaExamen("");
      setFechaVencimiento("");
      cargarRegistros();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardando(false);
    }
  };

  const botonBuscarDeshabilitado = buscando || !idTipo || !numero;
  const botonRegistrarDeshabilitado = guardando || !trabajador || !fechaExamen || !fechaVencimiento;

  return (
    <div>
      <PageHeader title="Salud ocupacional" subtitle="Registra y consulta la aptitud médica de los trabajadores." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <form onSubmit={registrarExamen} className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[360px] max-w-xl">
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
            2. Resultado del examen
          </p>
          <Field label="Apto para trabajo en alturas" required>
            <select value={apto} onChange={(e) => setApto(e.target.value as "SI" | "NO")} style={{ ...inputStyle, appearance: "none" }}>
              <option value="SI">Sí</option>
              <option value="NO">No</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-x-gap-md">
            <Field label="Fecha del examen" required>
              <input type="date" value={fechaExamen} onChange={(e) => setFechaExamen(e.target.value)} style={inputStyle} required />
            </Field>
            <Field label="Fecha de vencimiento" required>
              <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} style={inputStyle} required />
            </Field>
          </div>
          <Field label="Restricciones">
            <input value={restricciones} onChange={(e) => setRestricciones(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Observaciones">
            <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={inputStyle} />
          </Field>

          <button
            type="submit"
            disabled={botonRegistrarDeshabilitado}
            className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
              botonRegistrarDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
            }`}
          >
            {guardando ? "Guardando..." : "Registrar examen"}
          </button>
        </form>

        <div className="flex-1 min-w-[400px] bg-surface-container-lowest rounded-xl overflow-hidden">
          <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
            Registros ({registros.length})
          </p>
          {registros.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Aún no hay exámenes registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-left">
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Trabajador</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Apto</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Vence</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r) => (
                    <tr key={r.id_salud} className="border-t border-outline-variant/20">
                      <td className="px-gap-sm py-gap-xs">{r.trabajador ?? `#${r.id_trabajador}`}</td>
                      <td className={`px-gap-sm py-gap-xs font-bold ${r.apto === "SI" ? "text-green-700" : "text-error"}`}>
                        {r.apto === "SI" ? "Sí" : "No"}
                      </td>
                      <td className="px-gap-sm py-gap-xs">{r.fecha_vencimiento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Salud;
