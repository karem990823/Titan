import { useEffect, useState } from "react";
import { apiFetchBlob } from "../../api/client";

interface DocumentoViewerModalProps {
  nombre: string;
  urlDescarga: string;
  onClose: () => void;
}

function DocumentoViewerModal({ nombre, urlDescarga, onClose }: DocumentoViewerModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string>("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let urlCreada: string | null = null;
    setCargando(true);
    setError(false);

    apiFetchBlob(urlDescarga)
      .then((blob) => {
        urlCreada = URL.createObjectURL(blob);
        setObjectUrl(urlCreada);
        setTipo(blob.type);
      })
      .catch(() => setError(true))
      .finally(() => setCargando(false));

    return () => {
      if (urlCreada) URL.revokeObjectURL(urlCreada);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlDescarga]);

  const esImagen = tipo.startsWith("image/");
  const esPdf = tipo === "application/pdf";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1200] bg-on-background/70 flex items-center justify-center p-margin-mobile"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-gap-md py-gap-sm border-b border-outline-variant/30">
          <p className="font-headline-sm text-headline-sm text-on-surface m-0 normal-case truncate">{nombre}</p>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface bg-transparent border-none cursor-pointer text-2xl leading-none"
            aria-label="Cerrar"
          >
            close
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-surface-container-low flex items-center justify-center min-h-[300px]">
          {cargando ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant p-gap-lg">Cargando documento...</p>
          ) : error || !objectUrl ? (
            <p className="font-body-sm text-body-sm text-on-error-container p-gap-lg">
              No se pudo cargar el documento para previsualizarlo.
            </p>
          ) : esPdf ? (
            <iframe src={objectUrl} title={nombre} className="w-full h-[75vh] border-none" />
          ) : esImagen ? (
            <img src={objectUrl} alt={nombre} className="max-w-full max-h-[75vh] object-contain" />
          ) : (
            <div className="text-center p-gap-lg">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">draft</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-gap-2xs">
                Este tipo de archivo no se puede previsualizar. Descárgalo para verlo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentoViewerModal;
