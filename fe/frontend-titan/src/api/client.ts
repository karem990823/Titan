const TOKEN_KEY = "titan_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function extractErrorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    const d = detail as { error?: string; message?: string };
    return d.error || d.message || fallback;
  }
  return fallback;
}

function buildHeaders(options: RequestInit): HeadersInit {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
}

function manejarSesionExpirada() {
  clearToken();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

/**
 * Cliente único para llamadas JSON a la API. Inyecta el token de sesión,
 * deja pasar FormData sin forzar Content-Type, y traduce respuestas de
 * error (incluyendo el envelope {success,message,data,error} y el detail
 * de FastAPI) en un ApiError con mensaje legible.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { ...options, headers: buildHeaders(options) });

  if (res.status === 401) {
    manejarSesionExpirada();
    throw new ApiError("Sesión expirada. Inicia sesión nuevamente.", 401);
  }

  const contentType = res.headers.get("content-type") || "";
  const esJson = contentType.includes("application/json");

  if (!res.ok) {
    const cuerpo = esJson ? await res.json().catch(() => null) : null;
    const mensaje = extractErrorMessage(
      cuerpo?.detail,
      cuerpo?.message || cuerpo?.error || `Error ${res.status}`
    );
    throw new ApiError(mensaje, res.status);
  }

  if (esJson) {
    return res.json() as Promise<T>;
  }
  return undefined as unknown as T;
}

/** Variante para descargas binarias (PDFs, etc.) — devuelve el Blob crudo. */
export async function apiFetchBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const res = await fetch(path, { ...options, headers: buildHeaders(options) });

  if (res.status === 401) {
    manejarSesionExpirada();
    throw new ApiError("Sesión expirada. Inicia sesión nuevamente.", 401);
  }

  if (!res.ok) {
    throw new ApiError(`Error ${res.status}`, res.status);
  }

  return res.blob();
}

/** Dispara la descarga de un Blob en el navegador con el nombre de archivo dado. */
export function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
