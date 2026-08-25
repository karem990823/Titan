import { useEffect, useState } from "react";
import { apiFetch, apiFetchBlob, descargarBlob } from "../../api/client";
import Field from "../../components/UI/Field";
import PageHeader from "../../components/UI/PageHeader";
import { API_DOCUMENTOS, API_USUARIOS, COLORS, inputStyle } from "../../constants/color";
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

  return (
    <div>
      <PageHeader title="Documentos" subtitle="Sube y consulta los documentos de tus trabajadores (cédulas, exámenes médicos, etc.)." />

      <div style={{ background: COLORS.white, border: `1px solid ${COLORS.borderGray}`, borderRadius: 12, padding: "28px 32px", maxWidth: 620 }}>
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
            <form onSubmit={handleSubmit} style={{ borderTop: `1px solid ${COLORS.borderGray}`, paddingTop: 16, marginTop: 8 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>Subir documento</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
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
              <button type="submit" disabled={subiendo} style={{
                background: subiendo ? "#ccc" : COLORS.blue, color: COLORS.white, border: "none",
                borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600,
                cursor: subiendo ? "not-allowed" : "pointer",
              }}>
                {subiendo ? "Subiendo..." : "Subir documento"}
              </button>
            </form>

            <div style={{ marginTop: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: COLORS.textPrimary, margin: "0 0 14px 0" }}>
                Documentos ({documentos.length})
              </p>
              {documentos.length === 0 ? (
                <p style={{ color: COLORS.textSecondary, fontSize: 13 }}>Sin documentos subidos aún.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {documentos.map((doc) => (
                    <div key={doc.id_documento} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", border: `1px solid ${COLORS.borderGray}`, borderRadius: 8,
                    }}>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{doc.nombre}</span>
                      <span style={{ color: COLORS.textSecondary, fontSize: 12 }}>{doc.fecha_subida?.slice(0, 10)}</span>
                      <button
                        onClick={() => descargar(doc)}
                        disabled={descargandoId === doc.id_documento}
                        style={{
                          background: "none", border: `1px solid ${COLORS.blue}`, color: COLORS.blue,
                          borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600,
                          cursor: descargandoId === doc.id_documento ? "not-allowed" : "pointer",
                        }}
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
  );
}

export default DocumentosTrabajador;
