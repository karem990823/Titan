import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_ROLES, API_TIPOS_IDENTIFICACION, API_USUARIOS, inputStyle } from "../../constants/color";
import type { ApiResponse, Rol, TipoDocumento, ToastType, UsuarioAdmin as UsuarioAdminType } from "../../types";

interface UsuariosAdminProps {
  onToast: (message: string, type: ToastType) => void;
}

interface FormState {
  tipo_registro: "empresa" | "trabajador" | "usuario";
  nombre: string;
  apellido: string;
  id_tipo: string;
  numero_identificacion: string;
  nit: string;
  direccion: string;
  telefono: string;
  correo: string;
  id_rol: string;
  id_empresa: string;
}

const FORM_VACIO: FormState = {
  tipo_registro: "usuario",
  nombre: "",
  apellido: "",
  id_tipo: "",
  numero_identificacion: "",
  nit: "",
  direccion: "",
  telefono: "",
  correo: "",
  id_rol: "",
  id_empresa: "",
};

function UsuariosAdmin({ onToast }: UsuariosAdminProps) {
  const [usuarios, setUsuarios] = useState<UsuarioAdminType[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [loading, setLoading] = useState(false);
  const [usuarioADesactivar, setUsuarioADesactivar] = useState<UsuarioAdminType | null>(null);

  const empresas = usuarios.filter((u) => u.tipo_registro === "empresa");

  const cargarUsuarios = () => {
    apiFetch<ApiResponse<UsuarioAdminType[]>>(`${API_USUARIOS}/`)
      .then((res) => setUsuarios(res.data))
      .catch(() => onToast("No se pudieron cargar los usuarios.", "error"));
  };

  useEffect(() => {
    cargarUsuarios();
    apiFetch<Rol[]>(`${API_ROLES}/`).then(setRoles).catch(() => setRoles([]));
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<ApiResponse<UsuarioAdminType>>(`${API_USUARIOS}/`, {
        method: "POST",
        body: JSON.stringify({
          tipo_registro: form.tipo_registro,
          nombre: form.nombre,
          apellido: form.apellido || null,
          id_tipo: form.id_tipo ? parseInt(form.id_tipo) : null,
          numero_identificacion: form.numero_identificacion ? parseInt(form.numero_identificacion) : null,
          nit: form.nit ? parseInt(form.nit) : null,
          direccion: form.direccion || null,
          telefono: form.telefono ? parseInt(form.telefono) : null,
          correo: form.correo,
          id_rol: parseInt(form.id_rol),
          id_empresa: form.id_empresa ? parseInt(form.id_empresa) : null,
        }),
      });
      onToast(res.message || "Cuenta creada correctamente.", "success");
      setForm(FORM_VACIO);
      cargarUsuarios();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setLoading(false);
    }
  };

  const desactivar = async (id: number) => {
    try {
      await apiFetch(`${API_USUARIOS}/${id}/desactivar`, { method: "PATCH" });
      onToast("Cuenta desactivada.", "success");
      cargarUsuarios();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setUsuarioADesactivar(null);
    }
  };

  const botonDeshabilitado = loading || !form.nombre.trim() || !form.correo.trim() || !form.id_rol;

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Crea y administra las cuentas de administradores, instructores y empresas." />

      <div className="flex gap-gap-lg flex-wrap items-start">
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-gap-lg flex-1 min-w-[380px] max-w-lg">
          <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Nueva cuenta</p>

          <div className="grid grid-cols-2 gap-x-gap-md">
            <Field label="Tipo de cuenta" required>
              <select value={form.tipo_registro} onChange={(e) => setForm({ ...form, tipo_registro: e.target.value as FormState["tipo_registro"] })} style={{ ...inputStyle, appearance: "none" }}>
                <option value="usuario">Personal TITAN-ES (admin/instructor)</option>
                <option value="empresa">Empresa / Independiente</option>
              </select>
            </Field>
            <Field label="Rol" required>
              <select value={form.id_rol} onChange={(e) => setForm({ ...form, id_rol: e.target.value })} style={{ ...inputStyle, appearance: "none" }} required>
                <option value="">Seleccionar...</option>
                {roles.filter((r) => r.nombre_rol !== "Participante").map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-x-gap-md">
            <Field label="Nombre / Razón social" required>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} required />
            </Field>
            <Field label="Apellido">
              <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          <Field label="Correo" required>
            <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} required />
          </Field>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-gap-sm">
            Se le enviará un correo a esta dirección con un enlace para crear su propia contraseña.
          </p>

          {form.tipo_registro === "usuario" && (
            <Field label="Empresa a la que pertenece">
              <select value={form.id_empresa} onChange={(e) => setForm({ ...form, id_empresa: e.target.value })} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Sin asignar</option>
                {empresas.map((emp) => (
                  <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre}</option>
                ))}
              </select>
            </Field>
          )}

          {form.tipo_registro === "empresa" && (
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="NIT">
                <input type="number" value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Teléfono">
                <input type="number" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
              </Field>
            </div>
          )}

          {form.tipo_registro === "usuario" && (
            <div className="grid grid-cols-2 gap-x-gap-md">
              <Field label="Tipo de documento">
                <select value={form.id_tipo} onChange={(e) => setForm({ ...form, id_tipo: e.target.value })} style={{ ...inputStyle, appearance: "none" }}>
                  <option value="">Seleccionar...</option>
                  {tiposDoc.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Número de documento">
                <input type="number" value={form.numero_identificacion} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} style={inputStyle} />
              </Field>
            </div>
          )}

          <button
            type="submit"
            disabled={botonDeshabilitado}
            className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider mt-gap-xs transition-colors ${
              botonDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
            }`}
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="flex-1 min-w-[340px]">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full border-collapse font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Nombre</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Rol</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Estado</th>
                  <th className="px-gap-sm py-gap-xs"></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario} className="border-t border-outline-variant/20">
                    <td className="px-gap-sm py-gap-xs">
                      <div className="font-semibold text-on-surface">{u.nombre} {u.apellido || ""}</div>
                      <div className="text-on-surface-variant font-label-sm text-label-sm">{u.correo}</div>
                    </td>
                    <td className="px-gap-sm py-gap-xs">{u.rol_nombre}</td>
                    <td className="px-gap-sm py-gap-xs">
                      <span className={`font-label-sm text-label-sm font-bold px-gap-xs py-0.5 rounded-full ${u.estado_activo ? "bg-green-50 text-green-700" : "bg-error-container text-on-error-container"}`}>
                        {u.estado_activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-gap-sm py-gap-xs">
                      {u.estado_activo && (
                        <button onClick={() => setUsuarioADesactivar(u)} className="bg-transparent border-none text-error cursor-pointer font-body-sm text-body-sm">
                          Desactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={usuarioADesactivar !== null}
        title="Desactivar cuenta"
        message={`¿Desactivar la cuenta de ${usuarioADesactivar?.nombre ?? ""}? No podrá iniciar sesión hasta que se reactive.`}
        confirmLabel="Desactivar"
        onCancel={() => setUsuarioADesactivar(null)}
        onConfirm={() => usuarioADesactivar && desactivar(usuarioADesactivar.id_usuario)}
      />
    </div>
  );
}

export default UsuariosAdmin;
