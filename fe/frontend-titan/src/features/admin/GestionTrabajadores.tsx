import { useEffect, useState } from "react";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import DocumentoViewerModal from "../../components/UI/DocumentoViewerModal";
import { API_DOCUMENTOS, API_TIPOS_IDENTIFICACION, API_USUARIOS, inputStyle } from "../../constants/color";
import type { ApiResponse, Documento, TipoDocumento, ToastType, Trabajador, TrabajadorConEmpresa, UsuarioAdmin } from "../../types";

interface GestionTrabajadoresProps {
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

function GestionTrabajadores({ onToast }: GestionTrabajadoresProps) {
  const [empresas, setEmpresas] = useState<UsuarioAdmin[]>([]);
  const [idEmpresa, setIdEmpresa] = useState("");
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [todosLosTrabajadores, setTodosLosTrabajadores] = useState<TrabajadorConEmpresa[]>([]);
  const [cargandoTodos, setCargandoTodos] = useState(true);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const [idTrabajadorDocs, setIdTrabajadorDocs] = useState("");
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [nombreDoc, setNombreDoc] = useState("");
  const [descripcionDoc, setDescripcionDoc] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [documentoAVer, setDocumentoAVer] = useState<Documento | null>(null);

  const cargarTodosLosTrabajadores = () => {
    setCargandoTodos(true);
    apiFetch<ApiResponse<TrabajadorConEmpresa[]>>(`${API_USUARIOS}/trabajadores/todos`)
      .then((res) => setTodosLosTrabajadores(res.data))
      .catch(() => onToast("No se pudo cargar el listado general de trabajadores.", "error"))
      .finally(() => setCargandoTodos(false));
  };

  useEffect(() => {
    apiFetch<ApiResponse<UsuarioAdmin[]>>(`${API_USUARIOS}/?tipo_registro=empresa`)
      .then((res) => setEmpresas(res.data))
      .catch(() => onToast("No se pudieron cargar las empresas.", "error"));
    apiFetch<TipoDocumento[]>(`${API_TIPOS_IDENTIFICACION}/`).then(setTiposDoc).catch(() => setTiposDoc([]));
    cargarTodosLosTrabajadores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarTrabajadores = (id: string) => {
    if (!id) {
      setTrabajadores([]);
      return;
    }
    apiFetch<ApiResponse<Trabajador[]>>(`${API_USUARIOS}/empresas/${id}/trabajadores`)
      .then((res) => setTrabajadores(res.data))
      .catch(() => onToast("No se pudieron cargar los trabajadores de esta empresa.", "error"));
  };

  const seleccionarEmpresa = (id: string) => {
    setIdEmpresa(id);
    setIdTrabajadorDocs("");
    setDocumentos([]);
    cargarTrabajadores(id);
  };

  const registrarTrabajador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEmpresa) {
      onToast("Selecciona primero una empresa.", "error");
      return;
    }
    setGuardando(true);
    try {
      await apiFetch<ApiResponse<Trabajador>>(`${API_USUARIOS}/empresas/${idEmpresa}/trabajadores`, {
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
      onToast("Trabajador registrado correctamente.", "success");
      setForm(FORM_VACIO);
      cargarTrabajadores(idEmpresa);
      cargarTodosLosTrabajadores();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setGuardando(false);
    }
  };

  const cargarDocumentos = (idTrabajador: string) => {
    if (!idTrabajador) {
      setDocumentos([]);
      return;
    }
    apiFetch<ApiResponse<Documento[]>>(`${API_DOCUMENTOS}/usuario/${idTrabajador}`)
      .then((res) => setDocumentos(res.data))
      .catch(() => onToast("No se pudieron cargar los documentos.", "error"));
  };

  const subirDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idTrabajadorDocs || !archivo) {
      onToast("Selecciona un trabajador y un archivo.", "error");
      return;
    }
    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("nombre", nombreDoc);
    if (descripcionDoc) formData.append("descripcion", descripcionDoc);

    setSubiendo(true);
    try {
      await apiFetch<ApiResponse<Documento>>(`${API_DOCUMENTOS}/${idTrabajadorDocs}`, {
        method: "POST",
        body: formData,
      });
      onToast("Documento subido correctamente.", "success");
      setNombreDoc("");
      setDescripcionDoc("");
      setArchivo(null);
      cargarDocumentos(idTrabajadorDocs);
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Error inesperado", "error");
    } finally {
      setSubiendo(false);
    }
  };

  const descargar = async (doc: Documento) => {
    setDescargandoId(doc.id_documento);
    try {
      const blob = await apiFetchBlob(`${API_DOCUMENTOS}/${doc.id_documento}/descargar`);
      descargarBlob(blob, doc.nombre);
    } catch {
      onToast("No se pudo descargar el documento.", "error");
    } finally {
      setDescargandoId(null);
    }
  };

  const botonRegistrarDeshabilitado =
    guardando || !idEmpresa || !form.nombre.trim() || !form.apellido.trim() || !form.id_tipo || !form.numero_identificacion.trim();
  const botonSubirDeshabilitado = subiendo || !idTrabajadorDocs || !nombreDoc.trim() || !archivo;

  return (
    <div>
      <PageHeader
        title="Trabajadores"
        subtitle="Consulta todos los trabajadores registrados, y registra o gestiona los de cualquier empresa sin necesidad de que ella lo haga."
      />

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden mb-gap-lg">
        <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
          Todos los trabajadores registrados ({todosLosTrabajadores.length})
        </p>
        {cargandoTodos ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Cargando...</p>
        ) : todosLosTrabajadores.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Aún no hay trabajadores registrados en ninguna empresa.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body-sm text-body-sm">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Nombre</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Documento</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Empresa</th>
                  <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Teléfono</th>
                  <th className="px-gap-sm py-gap-xs"></th>
                </tr>
              </thead>
              <tbody>
                {todosLosTrabajadores.map((t) => (
                  <tr key={t.id_usuario} className="border-t border-outline-variant/20">
                    <td className="px-gap-sm py-gap-xs font-semibold text-on-surface normal-case">{t.nombre} {t.apellido}</td>
                    <td className="px-gap-sm py-gap-xs">{t.tipo_documento} {t.numero_identificacion}</td>
                    <td className="px-gap-sm py-gap-xs normal-case">{t.empresa || "—"}</td>
                    <td className="px-gap-sm py-gap-xs">{t.telefono || "—"}</td>
                    <td className="px-gap-sm py-gap-xs">
                      {t.id_empresa && (
                        <button
                          onClick={() => seleccionarEmpresa(String(t.id_empresa))}
                          className="bg-transparent border-none text-secondary cursor-pointer font-label-sm text-label-sm uppercase font-bold"
                        >
                          Gestionar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-gap-lg max-w-md mb-gap-lg">
        <Field label="Empresa" required>
          <select value={idEmpresa} onChange={(e) => seleccionarEmpresa(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
            <option value="">Seleccionar empresa...</option>
            {empresas.map((emp) => (
              <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre}</option>
            ))}
          </select>
        </Field>
      </div>

      {idEmpresa && (
        <div className="flex gap-gap-lg flex-wrap items-start">
          <div className="flex flex-col gap-gap-lg flex-1 min-w-[360px] max-w-lg">
            <form onSubmit={registrarTrabajador} className="bg-surface-container-lowest rounded-xl p-gap-lg">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Registrar trabajador</p>
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
                disabled={botonRegistrarDeshabilitado}
                className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
                  botonRegistrarDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
                }`}
              >
                {guardando ? "Guardando..." : "Registrar trabajador"}
              </button>
            </form>

            <div className="bg-surface-container-lowest rounded-xl p-gap-lg">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">
                Documentos del trabajador
              </p>
              <Field label="Trabajador" required>
                <select
                  value={idTrabajadorDocs}
                  onChange={(e) => { setIdTrabajadorDocs(e.target.value); cargarDocumentos(e.target.value); }}
                  style={{ ...inputStyle, appearance: "none" }}
                >
                  <option value="">Seleccionar trabajador...</option>
                  {trabajadores.map((t) => (
                    <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
                  ))}
                </select>
              </Field>

              {idTrabajadorDocs && (
                <>
                  <form onSubmit={subirDocumento} className="border-t border-outline-variant/30 pt-gap-md mt-gap-xs">
                    <div className="grid grid-cols-2 gap-x-gap-md">
                      <Field label="Nombre del documento" required>
                        <input value={nombreDoc} onChange={(e) => setNombreDoc(e.target.value)} placeholder="Ej: Cédula" style={inputStyle} required />
                      </Field>
                      <Field label="Descripción">
                        <input value={descripcionDoc} onChange={(e) => setDescripcionDoc(e.target.value)} style={inputStyle} />
                      </Field>
                    </div>
                    <Field label="Archivo (PDF, JPG o PNG, máx. 10MB)" required>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                        style={inputStyle}
                        required
                      />
                    </Field>
                    <button
                      type="submit"
                      disabled={botonSubirDeshabilitado}
                      className={`px-gap-md py-2 rounded-lg text-on-secondary font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                        botonSubirDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-secondary hover:bg-on-secondary-fixed"
                      }`}
                    >
                      {subiendo ? "Subiendo..." : "Subir documento"}
                    </button>
                  </form>

                  <div className="mt-gap-lg">
                    <p className="font-label-lg text-label-lg uppercase text-on-surface-variant mb-gap-sm">
                      Documentos ({documentos.length})
                    </p>
                    {documentos.length === 0 ? (
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Sin documentos subidos aún.</p>
                    ) : (
                      <div className="flex flex-col gap-gap-2xs">
                        {documentos.map((doc) => (
                          <div key={doc.id_documento} className="flex items-center gap-gap-sm px-gap-sm py-2.5 bg-surface-container-low rounded-lg">
                            <span
                              className="flex-1 font-label-lg text-label-lg text-secondary normal-case cursor-pointer hover:underline"
                              onClick={() => setDocumentoAVer(doc)}
                            >
                              {doc.nombre}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{doc.fecha_subida?.slice(0, 10)}</span>
                            <button
                              onClick={() => descargar(doc)}
                              disabled={descargandoId === doc.id_documento}
                              className={`px-gap-sm py-1.5 rounded-lg border font-label-sm text-label-sm uppercase font-bold transition-colors ${
                                descargandoId === doc.id_documento
                                  ? "border-outline-variant text-on-surface-variant cursor-not-allowed"
                                  : "border-secondary text-secondary hover:bg-secondary-container/40"
                              }`}
                            >
                              {descargandoId === doc.id_documento ? "..." : "Descargar"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[320px] bg-surface-container-lowest rounded-xl overflow-hidden">
            <p className="font-headline-sm text-headline-sm text-on-surface m-0 px-gap-md py-gap-sm border-b border-outline-variant/30">
              Trabajadores de esta empresa ({trabajadores.length})
            </p>
            {trabajadores.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg m-0">Aún no hay trabajadores registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-body-sm text-body-sm">
                  <thead>
                    <tr className="bg-surface-container-low text-left">
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Nombre</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Documento</th>
                      <th className="px-gap-sm py-gap-xs font-label-sm text-label-sm uppercase text-on-surface-variant">Teléfono</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trabajadores.map((t) => (
                      <tr key={t.id_usuario} className="border-t border-outline-variant/20">
                        <td className="px-gap-sm py-gap-xs font-semibold text-on-surface normal-case">{t.nombre} {t.apellido}</td>
                        <td className="px-gap-sm py-gap-xs">{t.tipo_documento} {t.numero_identificacion}</td>
                        <td className="px-gap-sm py-gap-xs">{t.telefono || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {documentoAVer && (
        <DocumentoViewerModal
          nombre={documentoAVer.nombre}
          urlDescarga={`${API_DOCUMENTOS}/${documentoAVer.id_documento}/descargar`}
          onClose={() => setDocumentoAVer(null)}
        />
      )}
    </div>
  );
}

export default GestionTrabajadores;
