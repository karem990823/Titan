import { useEffect, useState } from "react";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import DocumentoViewerModal from "../../components/UI/DocumentoViewerModal";
import { API_DOCUMENTOS, API_USUARIOS, inputStyle } from "../../constants/color";
import type { ApiResponse, Documento, ToastType, Trabajador } from "../../types";

interface DocumentosTrabajadorProps {
  onToast: (message: string, type: ToastType) => void;
}

function DocumentosTrabajador({ onToast }: DocumentosTrabajadorProps) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [idTrabajador, setIdTrabajador] = useState("");
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);
  const [documentoAVer, setDocumentoAVer] = useState<Documento | null>(null);

  useEffect(() => {
    apiFetch<ApiResponse<Trabajador[]>>(`${API_USUARIOS}/trabajadores`)
      .then((res) => setTrabajadores(res.data))
      .catch(() => onToast("No se pudieron cargar los trabajadores.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDocumentos = (id: string) => {
    if (!id) {
      setDocumentos([]);
      return;
    }
    apiFetch<ApiResponse<Documento[]>>(`${API_DOCUMENTOS}/usuario/${id}`)
      .then((res) => setDocumentos(res.data))
      .catch(() => onToast("No se pudieron cargar los documentos.", "error"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idTrabajador) {
      onToast("Selecciona un trabajador.", "error");
      return;
    }
    if (!archivo) {
      onToast("Selecciona un archivo (PDF, JPG o PNG).", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("nombre", nombre);
    if (descripcion) formData.append("descripcion", descripcion);

    setSubiendo(true);
    try {
      await apiFetch<ApiResponse<Documento>>(`${API_DOCUMENTOS}/${idTrabajador}`, {
        method: "POST",
        body: formData,
      });
      onToast("Documento subido correctamente.", "success");
      setNombre("");
      setDescripcion("");
      setArchivo(null);
      cargarDocumentos(idTrabajador);
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

  const botonSubirDeshabilitado = subiendo || !nombre.trim() || !archivo;

  return (
    <div>
      <PageHeader title="Documentos" subtitle="Sube y consulta los documentos de tus trabajadores (cédulas, exámenes médicos, etc.)." />

      <div className="bg-surface-container-lowest rounded-xl p-gap-lg max-w-2xl">
        <Field label="Trabajador" required>
          <select
            value={idTrabajador}
            onChange={(e) => {
              setIdTrabajador(e.target.value);
              cargarDocumentos(e.target.value);
            }}
            style={{ ...inputStyle, appearance: "none" }}
          >
            <option value="">Seleccionar trabajador...</option>
            {trabajadores.map((t) => (
              <option key={t.id_usuario} value={t.id_usuario}>{t.nombre} {t.apellido}</option>
            ))}
          </select>
        </Field>

        {idTrabajador && (
          <>
            <form onSubmit={handleSubmit} className="border-t border-outline-variant/30 pt-gap-md mt-gap-xs">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">Subir documento</p>
              <div className="grid grid-cols-2 gap-x-gap-md">
                <Field label="Nombre del documento" required>
                  <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Cédula" style={inputStyle} required />
                </Field>
                <Field label="Descripción">
                  <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={inputStyle} />
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
                className={`px-gap-lg py-2.5 rounded-lg text-on-primary font-headline-sm text-headline-sm uppercase tracking-wider transition-colors ${
                  botonSubirDeshabilitado ? "bg-outline-variant cursor-not-allowed" : "bg-primary-container hover:bg-primary"
                }`}
              >
                {subiendo ? "Subiendo..." : "Subir documento"}
              </button>
            </form>

            <div className="mt-gap-lg">
              <p className="font-headline-sm text-headline-sm text-on-surface mb-gap-sm">
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

export default DocumentosTrabajador;
