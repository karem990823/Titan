import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_TIPOS_IDENTIFICACION, API_USUARIOS, inputStyle } from "../../constants/color";
import type { ApiResponse, TipoDocumento, ToastType, Trabajador } from "../../types";

interface RegistrarTrabajadorProps {
  onToast: (message: string, type: ToastType) => void;
}

interface FormState {
  nombre: string;
  apellido: string;
  id_tipo: string;
  numero_identificacion: string;
  direccion: string;
  telefono: string;
}

const FORM_VACIO: FormState = {
  nombre: "",
  apellido: "",
  id_tipo: "",
  numero_identificacion: "",
  direccion: "",
  telefono: "",
};

function RegistrarTrabajador({ onToast }: RegistrarTrabajadorProps) {
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [loading, setLoading] = useState(false);

  const cargarTrabajadores = () => {
    apiFetch<ApiResponse<Trabajador[]>>(`${API_USUARIOS}/trabajadores`)
      .then((res) => setTrabajadores(res.data))
      .catch(() => onToast("No se pudieron cargar los trabajadores.", "error"));
  };

  useEffect(() => {
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
    cargarTrabajadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<ApiResponse<Trabajador>>(`${API_USUARIOS}/trabajadores`, {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          id_tipo: parseInt(form.id_tipo),
          numero_identificacion: parseInt(form.numero_identificacion),
          direccion: form.direccion || null,
          telefono: form.telefono ? parseInt(form.telefono) : null,
        }),
      });
      onToast(`Trabajador ${res.data.nombre} registrado correctamente.`, "success");
      setForm(FORM_VACIO);
      cargarTrabajadores();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  const botonDeshabilitado =
    loading || !form.nombre.trim() || !form.apellido.trim() || !form.id_tipo || !form.numero_identificacion.trim();

  return (
    <div>
      <PageHeader title="Mis trabajadores" subtitle="Registra a los trabajadores de tu empresa para inscribirlos en cursos y gestionar sus documentos." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <div className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[340px] max-w-lg">
          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm pb-gap-xs border-b border-outline-variant/30">
            Registrar nuevo trabajador
          </p>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="Nombre" required>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} required />
              </Field>
              <Field label="Apellido" required>
                <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} style={inputStyle} required />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="Tipo de documento" required>
                <select value={form.id_tipo} onChange={(e) => setForm({ ...form, id_tipo: e.target.value })} style={{ ...inputStyle, appearance: "none" }} required>
                  <option value="">Seleccionar...</option>
                  {tiposDoc.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Número de documento" required>
                <input type="number" value={form.numero_identificacion} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} style={inputStyle} required />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="Dirección">
                <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Teléfono">
                <input type="number" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
              </Field>
            </div>

            <button
              type="submit"
              disabled={botonDeshabilitado}
              className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider mt-gap-xs transition-colors ${
                botonDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
              }`}
            >
              {loading ? "Guardando..." : "Registrar trabajador"}
            </button>
          </form>
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden flex-1 min-w-[320px]">
          <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
            Trabajadores registrados ({trabajadores.length})
          </p>
          {trabajadores.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Aún no has registrado trabajadores.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-body-sm text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low text-left">
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Nombre</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Documento</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Dirección</th>
                    <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajadores.map((t) => (
                    <tr key={t.id_usuario} className="border-t border-outline-variant/20">
                      <td className="px-gap-sm py-gap-xs font-semibold text-on-surface normal-case">{t.nombre} {t.apellido}</td>
                      <td className="px-gap-sm py-gap-xs">{t.tipo_documento} {t.numero_identificacion}</td>
                      <td className="px-gap-sm py-gap-xs normal-case">{t.direccion || "—"}</td>
                      <td className="px-gap-sm py-gap-xs">{t.telefono || "—"}</td>
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

export default RegistrarTrabajador;
