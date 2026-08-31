import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_ROLES, API_TIPOS_IDENTIFICACION, API_USUARIOS, COLORS, inputStyle } from "../../constants/color";
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
  password: string;
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
  password: "",
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
      await apiFetch<ApiResponse<UsuarioAdminType>>(`${API_USUARIOS}/`, {
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
          password: form.password,
          id_rol: parseInt(form.id_rol),
          id_empresa: form.id_empresa ? parseInt(form.id_empresa) : null,
        }),
      });
      onToast("Cuenta creada correctamente.", "success");
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

  return (
    <div>
      <PageHeader title="Usuarios" subtitle="Crea y administra las cuentas de administradores, instructores y empresas." />

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <form onSubmit={handleSubmit} style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "24px 28px", flex: "1 1 380px", maxWidth: 480 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Nueva cuenta</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Nombre / Razón social" required>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} required />
            </Field>
            <Field label="Apellido">
              <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Correo" required>
              <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} style={inputStyle} required />
            </Field>
            <Field label="Contraseña" required>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} required />
            </Field>
          </div>

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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="NIT">
                <input type="number" value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Teléfono">
                <input type="number" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
              </Field>
            </div>
          )}

          {form.tipo_registro === "usuario" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
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

          <button type="submit" disabled={loading} style={{
            background: loading ? "#ccc" : COLORS.red, color: COLORS.white, border: "none",
            borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, marginTop: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>

        <div style={{ flex: "1 1 340px" }}>
          <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: COLORS.lightGray, textAlign: "left" }}>
                  <th style={{ padding: "10px 14px" }}>Nombre</th>
                  <th style={{ padding: "10px 14px" }}>Rol</th>
                  <th style={{ padding: "10px 14px" }}>Estado</th>
                  <th style={{ padding: "10px 14px" }}></th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario} style={{ borderTop: `1px solid ${COLORS.borderGray}` }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontWeight: 600 }}>{u.nombre} {u.apellido || ""}</div>
                      <div style={{ color: COLORS.textSecondary, fontSize: 11 }}>{u.correo}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>{u.rol_nombre}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                        background: u.estado_activo ? COLORS.successBg : COLORS.errorBg,
                        color: u.estado_activo ? COLORS.successText : COLORS.errorText,
                      }}>
                        {u.estado_activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {u.estado_activo && (
                        <button onClick={() => setUsuarioADesactivar(u)} style={{ background: "none", border: "none", color: COLORS.errorText, cursor: "pointer", fontSize: 12 }}>
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
