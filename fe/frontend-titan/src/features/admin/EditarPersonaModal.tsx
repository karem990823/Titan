import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import { API_TIPOS_IDENTIFICACION, API_USUARIOS, inputStyle } from "../../constants/color";
import type {
  ApiResponse,
  CambioPersona,
  PersonaActualizada,
  PersonaDetalle,
  TipoDocumento,
  ToastType,
} from "../../types";

interface EditarPersonaModalProps {
  idPersona: number;
  onClose: () => void;
  /** Se llama tras guardar, para que la pantalla que abrió el modal refresque su listado. */
  onSaved: () => void;
  onToast: (message: string, type: ToastType) => void;
}

interface FormState {
  nombre: string;
  apellido: string;
  correo: string;
  id_tipo: string;
  numero_identificacion: string;
  nit: string;
  direccion: string;
  telefono: string;
}

interface CambioPendiente {
  campo: string;
  etiqueta: string;
  antes: string;
  despues: string;
}

const ETIQUETAS: Record<string, string> = {
  nombre: "Nombre",
  apellido: "Apellido",
  correo: "Correo",
  id_tipo: "Tipo de documento",
  numero_identificacion: "Número de documento",
  nit: "NIT",
  direccion: "Dirección",
  telefono: "Teléfono",
  id_rol: "Rol",
  id_empresa: "Empresa",
  estado_activo: "Estado",
  password: "Contraseña",
};

const aForm = (p: PersonaDetalle): FormState => ({
  nombre: p.nombre ?? "",
  apellido: p.apellido ?? "",
  correo: p.correo ?? "",
  id_tipo: p.id_tipo != null ? String(p.id_tipo) : "",
  numero_identificacion: p.numero_identificacion != null ? String(p.numero_identificacion) : "",
  nit: p.nit != null ? String(p.nit) : "",
  direccion: p.direccion ?? "",
  telefono: p.telefono != null ? String(p.telefono) : "",
});

const thClass = "px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant";

function EditarPersonaModal({ idPersona, onClose, onSaved, onToast }: EditarPersonaModalProps) {
  const [persona, setPersona] = useState<PersonaDetalle | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [historial, setHistorial] = useState<CambioPersona[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const cargarHistorial = useCallback(() => {
    apiFetch<ApiResponse<CambioPersona[]>>(`${API_USUARIOS}/${idPersona}/historial`)
      .then((res) => setHistorial(res.data))
      .catch(() => onToast("No se pudo cargar el historial de cambios.", "error"));
  }, [idPersona, onToast]);

  const cargarPersona = useCallback(() => {
    return apiFetch<ApiResponse<PersonaDetalle>>(`${API_USUARIOS}/${idPersona}`)
      .then((res) => {
        setPersona(res.data);
        setForm(aForm(res.data));
      })
      .catch(() => {
        onToast("No se pudieron cargar los datos de la persona.", "error");
        onClose();
      });
  }, [idPersona, onToast, onClose]);

  useEffect(() => {
    cargarPersona();
    cargarHistorial();
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
    // Solo al abrir el modal para esta persona.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPersona]);

  // Qué campos se muestran depende del tipo de cuenta: una empresa con NIT no
  // tiene apellido ni documento personal; un trabajador no tiene correo.
  const esEmpresaConNit = persona?.tipo_registro === "empresa" && persona.nit != null;
  const muestraCorreo = persona?.tipo_registro !== "trabajador";
  const muestraNit = esEmpresaConNit;
  const muestraDocumento = !esEmpresaConNit;
  const muestraApellido = !esEmpresaConNit;
  const apellidoObligatorio = persona?.tipo_registro === "trabajador";
  const documentoObligatorio = persona?.tipo_registro === "trabajador";

  const nombreTipo = useCallback(
    (id: string) => tiposDoc.find((t) => String(t.id_tipo) === id)?.nombre ?? id,
    [tiposDoc],
  );

  // Solo se envía lo que cambió (HU 04: no hay que reingresar el formulario).
  const { cambios, payload } = useMemo(() => {
    const lista: CambioPendiente[] = [];
    const body: Record<string, string | number | null> = {};
    if (!persona || !form) return { cambios: lista, payload: body };

    const texto = (campo: "nombre" | "apellido" | "correo" | "direccion", original: string | null) => {
      const nuevo = form[campo].trim();
      if (nuevo !== (original ?? "")) {
        lista.push({ campo, etiqueta: ETIQUETAS[campo], antes: original ?? "—", despues: nuevo || "—" });
        body[campo] = nuevo === "" ? null : nuevo;
      }
    };
    const numero = (campo: "numero_identificacion" | "nit" | "telefono", original: number | null) => {
      const nuevo = form[campo].trim();
      if (nuevo !== (original != null ? String(original) : "")) {
        lista.push({ campo, etiqueta: ETIQUETAS[campo], antes: original != null ? String(original) : "—", despues: nuevo || "—" });
        body[campo] = nuevo === "" ? null : parseInt(nuevo, 10);
      }
    };

    texto("nombre", persona.nombre);
    if (muestraApellido) texto("apellido", persona.apellido);
    if (muestraCorreo) texto("correo", persona.correo);
    if (muestraDocumento && form.id_tipo !== (persona.id_tipo != null ? String(persona.id_tipo) : "")) {
      lista.push({
        campo: "id_tipo",
        etiqueta: ETIQUETAS.id_tipo,
        antes: persona.tipo_documento ?? "—",
        despues: form.id_tipo ? nombreTipo(form.id_tipo) : "—",
      });
      body.id_tipo = form.id_tipo ? parseInt(form.id_tipo, 10) : null;
    }
    if (muestraDocumento) numero("numero_identificacion", persona.numero_identificacion);
    if (muestraNit) numero("nit", persona.nit);
    texto("direccion", persona.direccion);
    numero("telefono", persona.telefono);

    return { cambios: lista, payload: body };
  }, [persona, form, muestraApellido, muestraCorreo, muestraDocumento, muestraNit, nombreTipo]);

  const camposObligatoriosCompletos =
    !!form &&
    form.nombre.trim() !== "" &&
    (!apellidoObligatorio || form.apellido.trim() !== "") &&
    (!muestraCorreo || form.correo.trim() !== "") &&
    (!documentoObligatorio || (form.id_tipo !== "" && form.numero_identificacion.trim() !== ""));

  const botonDeshabilitado = guardando || !camposObligatoriosCompletos || cambios.length === 0;

  const pedirConfirmacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (cambios.length === 0) {
      onToast("No hay cambios para guardar.", "warning");
      return;
    }
    setConfirmando(true);
  };

  const guardar = async () => {
    setConfirmando(false);
    setGuardando(true);
    try {
      const res = await apiFetch<ApiResponse<PersonaActualizada>>(`${API_USUARIOS}/${idPersona}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      onToast(res.message || "Datos actualizados correctamente.", "success");
      await cargarPersona();
      cargarHistorial();
      onSaved();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardando(false);
    }
  };

  const nombreCompleto = persona ? `${persona.nombre} ${persona.apellido ?? ""}`.trim() : "";

  return (
    <div className="fixed inset-0 z-[900] bg-on-background/50 flex items-center justify-center p-margin-mobile">
      <div className="bg-surface-container-lowest rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-start justify-between gap-gap-sm px-gap-lg pt-gap-lg pb-gap-sm border-b border-outline-variant/30">
          <div>
            <p className="font-headline-sm text-headline-sm text-on-surface m-0">Editar datos</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant m-0 normal-case">
              {nombreCompleto || "Cargando..."}
              {persona?.rol_nombre ? ` · ${persona.rol_nombre}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none text-on-surface-variant cursor-pointer font-label-lg text-label-lg uppercase"
          >
            Cerrar
          </button>
        </div>

        {!persona || !form ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Cargando...</p>
        ) : (
          <form onSubmit={pedirConfirmacion} className="p-gap-lg">
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label={persona.tipo_registro === "empresa" && esEmpresaConNit ? "Razón social" : "Nombre"} required>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} required />
              </Field>
              {muestraApellido && (
                <Field label="Apellido" required={apellidoObligatorio}>
                  <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} style={inputStyle} required={apellidoObligatorio} />
                </Field>
              )}
            </div>

            {muestraCorreo && (
              <Field label="Correo" required>
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} required />
              </Field>
            )}

            {muestraDocumento && (
              <div className="grid grid-cols-2 gap-x-gap-md">
                <Field label="Tipo de documento" required={documentoObligatorio}>
                  <select value={form.id_tipo} onChange={(e) => setForm({ ...form, id_tipo: e.target.value })} style={{ ...inputStyle, appearance: "none" }} required={documentoObligatorio}>
                    <option value="">Seleccionar...</option>
                    {tiposDoc.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Número de documento" required={documentoObligatorio}>
                  <input type="number" min={1} value={form.numero_identificacion} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} style={inputStyle} required={documentoObligatorio} />
                </Field>
              </div>
            )}

            {muestraNit && (
              <Field label="NIT">
                <input type="number" min={1} value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} style={inputStyle} />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="Dirección">
                <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Teléfono">
                <input type="number" min={1} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
              </Field>
            </div>

            <div className="flex items-center gap-gap-sm mt-gap-xs">
              <button
                type="submit"
                disabled={botonDeshabilitado}
                className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
                  botonDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
                }`}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {cambios.length === 0 ? "Sin cambios pendientes" : `${cambios.length} campo(s) modificado(s)`}
              </span>
            </div>
          </form>
        )}

        <div className="border-t border-outline-variant/30">
          <p className="font-label-lg text-label-lg uppercase text-on-surface-variant m-0 px-gap-lg pt-gap-md pb-gap-xs">
            Historial de cambios ({historial.length})
          </p>
          {historial.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant px-gap-lg pb-gap-lg m-0">
              Aún no se han modificado datos de esta persona.
            </p>
          ) : (
            <div className="overflow-x-auto pb-gap-md">
              <table className="w-full border-collapse font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-left">
                    <th className={thClass}>Fecha</th>
                    <th className={thClass}>Campo</th>
                    <th className={thClass}>Antes</th>
                    <th className={thClass}>Después</th>
                    <th className={thClass}>Modificado por</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id_auditoria} className="border-t border-outline-variant/20">
                      <td className="px-gap-sm py-gap-xs whitespace-nowrap">{h.fecha ? new Date(h.fecha).toLocaleString("es-CO") : "—"}</td>
                      <td className="px-gap-sm py-gap-xs font-semibold text-on-surface">{ETIQUETAS[h.campo] ?? h.campo}</td>
                      <td className="px-gap-sm py-gap-xs normal-case">{h.valor_anterior ?? "—"}</td>
                      <td className="px-gap-sm py-gap-xs normal-case">{h.valor_nuevo ?? "—"}</td>
                      <td className="px-gap-sm py-gap-xs normal-case">{h.usuario ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmando}
        title="Guardar cambios"
        message={`Se modificarán: ${cambios.map((c) => `${c.etiqueta} (${c.antes} → ${c.despues})`).join("; ")}. Quedará registrado en el historial. ¿Continuar?`}
        confirmLabel="Guardar"
        danger={false}
        onCancel={() => setConfirmando(false)}
        onConfirm={guardar}
      />
    </div>
  );
}

export default EditarPersonaModal;
