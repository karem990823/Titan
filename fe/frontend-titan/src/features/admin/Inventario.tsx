import { useEffect, useState } from "react";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import {
  API_CERTIFICADOS_INDUMENTARIA,
  API_INDUMENTARIA,
  API_INSPECCIONES_INDUMENTARIA,
  inputStyle,
} from "../../constants/color";
import type { ApiResponse, Indumentaria, InspeccionIndumentaria, ToastType } from "../../types";

interface InventarioProps {
  onToast: (message: string, type: ToastType) => void;
}

function Inventario({ onToast }: InventarioProps) {
  const [indumentaria, setIndumentaria] = useState<Indumentaria[]>([]);
  const [inspecciones, setInspecciones] = useState<InspeccionIndumentaria[]>([]);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardandoItem, setGuardandoItem] = useState(false);

  const [idIndumentaria, setIdIndumentaria] = useState("");
  const [idUsuario, setIdUsuario] = useState("");
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [resultado, setResultado] = useState<"apto" | "no_apto">("apto");
  const [guardandoInspeccion, setGuardandoInspeccion] = useState(false);
  const [generandoId, setGenerandoId] = useState<number | null>(null);

  const cargarIndumentaria = () => {
    apiFetch<ApiResponse<Indumentaria[]>>(`${API_INDUMENTARIA}/`)
      .then((res) => setIndumentaria(res.data))
      .catch(() => onToast("No se pudo cargar el inventario.", "error"));
  };

  const cargarInspecciones = () => {
    apiFetch<ApiResponse<InspeccionIndumentaria[]>>(`${API_INSPECCIONES_INDUMENTARIA}/`)
      .then((res) => setInspecciones(res.data))
      .catch(() => onToast("No se pudieron cargar las inspecciones.", "error"));
  };

  useEffect(() => {
    cargarIndumentaria();
    cargarInspecciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crearItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoItem(true);
    try {
      await apiFetch(`${API_INDUMENTARIA}/`, {
        method: "POST",
        body: JSON.stringify({ nombre, descripcion: descripcion || null }),
      });
      onToast("Elemento agregado al inventario.", "success");
      setNombre("");
      setDescripcion("");
      cargarIndumentaria();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoItem(false);
    }
  };

  const crearInspeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoInspeccion(true);
    try {
      await apiFetch(`${API_INSPECCIONES_INDUMENTARIA}/`, {
        method: "POST",
        body: JSON.stringify({
          fecha,
          id_indumentaria: parseInt(idIndumentaria),
          id_usuario: parseInt(idUsuario),
          observaciones: observaciones || null,
          resultado,
        }),
      });
      onToast("Inspección registrada correctamente.", "success");
      setIdIndumentaria("");
      setIdUsuario("");
      setFecha("");
      setObservaciones("");
      setResultado("apto");
      cargarInspecciones();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardandoInspeccion(false);
    }
  };

  const ultimaInspeccion = (idIndumentaria: number): InspeccionIndumentaria | null => {
    const propias = inspecciones
      .filter((i) => i.id_indumentaria === idIndumentaria)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return propias[0] ?? null;
  };

  const generarCertificado = async (idIndumentaria: number) => {
    setGenerandoId(idIndumentaria);
    try {
      const res = await apiFetch<ApiResponse<{ id_certificado_equipo: number }>>(
        `${API_CERTIFICADOS_INDUMENTARIA}/generar/${idIndumentaria}`,
        { method: "POST" }
      );
      const blob = await apiFetchBlob(`${API_CERTIFICADOS_INDUMENTARIA}/${res.data.id_certificado_equipo}/descargar`);
      descargarBlob(blob, `certificado-equipo-${res.data.id_certificado_equipo}.pdf`);
      onToast(res.message || "Certificado generado correctamente.", "success");
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGenerandoId(null);
    }
  };

  const botonItemDeshabilitado = guardandoItem || !nombre.trim();
  const botonInspeccionDeshabilitado = guardandoInspeccion || !idIndumentaria || !idUsuario.trim() || !fecha;

  return (
    <div>
      <PageHeader title="Inventario" subtitle="Administra el equipo de protección y sus inspecciones periódicas." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <div className="flex flex-col gap-gap-lg flex-1 min-w-[360px] max-w-lg">
          <form onSubmit={crearItem} className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Nuevo elemento</p>
            <Field label="Nombre" required>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Arnés de cuerpo completo" style={inputStyle} required />
            </Field>
            <Field label="Descripción">
              <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />
            </Field>
            <button
              type="submit"
              disabled={botonItemDeshabilitado}
              className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                botonItemDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
              }`}
            >
              {guardandoItem ? "Guardando..." : "Agregar al inventario"}
            </button>
          </form>

          <form onSubmit={crearInspeccion} className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Registrar inspección</p>
            <Field label="Elemento" required>
              <select value={idIndumentaria} onChange={(e) => setIdIndumentaria(e.target.value)} style={{ ...inputStyle, appearance: "none" }} required>
                <option value="">Seleccionar...</option>
                {indumentaria.map((i) => (
                  <option key={i.id_indumentaria} value={i.id_indumentaria}>{i.nombre}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="ID del usuario" required>
                <input type="number" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)} style={inputStyle} required />
              </Field>
              <Field label="Fecha" required>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={inputStyle} required />
              </Field>
            </div>
            <Field label="Resultado" required>
              <select value={resultado} onChange={(e) => setResultado(e.target.value as "apto" | "no_apto")} style={{ ...inputStyle, appearance: "none" }}>
                <option value="apto">Apto</option>
                <option value="no_apto">No apto</option>
              </select>
            </Field>
            <Field label="Observaciones">
              <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={inputStyle} />
            </Field>
            <button
              type="submit"
              disabled={botonInspeccionDeshabilitado}
              className={`px-gap-md py-2 rounded-lg text-on-primary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                botonInspeccionDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
              }`}
            >
              {guardandoInspeccion ? "Guardando..." : "Registrar inspección"}
            </button>
          </form>
        </div>

        <div className="flex-1 min-w-[340px] flex flex-col gap-gap-lg">
          <div className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Elementos ({indumentaria.length})</p>
            {indumentaria.map((i) => {
              const ultima = ultimaInspeccion(i.id_indumentaria);
              const esApto = ultima?.resultado === "apto";
              return (
                <div key={i.id_indumentaria} className="py-gap-2xs border-t border-outline-variant/20 font-body-sm text-body-sm flex justify-between items-center gap-gap-2xs">
                  <div>
                    <span className="font-semibold text-on-surface">{i.nombre}</span>
                    {i.descripcion && <span className="text-on-surface-variant"> — {i.descripcion}</span>}
                    {ultima && (
                      <span className={`ml-gap-2xs font-label-sm text-label-sm font-bold px-gap-xs py-0.5 rounded-full ${esApto ? "bg-green-50 text-green-700" : "bg-error-container text-on-error-container"}`}>
                        {esApto ? "Apto" : "No apto"}
                      </span>
                    )}
                  </div>
                  {esApto && (
                    <button
                      onClick={() => generarCertificado(i.id_indumentaria)}
                      disabled={generandoId === i.id_indumentaria}
                      className={`px-gap-xs py-1 rounded-md border font-label-sm text-label-sm font-bold whitespace-nowrap transition-colors ${
                        generandoId === i.id_indumentaria
                          ? "border-outline-variant text-on-surface-variant cursor-not-allowed"
                          : "border-secondary text-secondary hover:bg-secondary-container/40"
                      }`}
                    >
                      {generandoId === i.id_indumentaria ? "Generando..." : "Generar certificado"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-gap-lg">
            <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Inspecciones recientes ({inspecciones.length})</p>
            {inspecciones.map((insp) => (
              <div key={insp.id_inspeccion} className="py-gap-2xs border-t border-outline-variant/20 font-body-sm text-body-sm">
                <span className="text-on-surface-variant">{insp.fecha}</span> — {insp.resultado === "apto" ? "Apto" : "No apto"} — {insp.observaciones || "Sin observaciones"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventario;
