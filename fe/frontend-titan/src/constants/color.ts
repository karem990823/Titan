import type { CSSProperties } from "react";

// El backend expone cada recurso bajo su propio router (ver be/main.py), no un
// único prefijo compartido, así que cada dominio necesita su propia base.
export const API_AUTH = "/api/auth";
export const API_CURSOS = "/api/cursos";
export const API_PROGRAMACIONES = "/api/programaciones";
export const API_INSCRIPCIONES = "/api/inscripciones";
export const API_USUARIOS = "/api/usuarios";
export const API_TIPOS_IDENTIFICACION = "/api/tipos-identificacion";
export const API_DOCUMENTOS = "/api/documentos";
export const API_CERTIFICADOS = "/api/certificados";
export const API_ROLES = "/api/roles";
export const API_EVALUACIONES = "/api/evaluaciones";
export const API_PREGUNTAS = "/api/preguntas";
export const API_RESPUESTAS = "/api/respuestas";
export const API_RESULTADOS = "/api/resultados";
export const API_FACTURAS = "/api/facturas";
export const API_METODOS_PAGO = "/api/metodos-pago";
export const API_PAGOS = "/api/pagos";
export const API_INDUMENTARIA = "/api/indumentaria";
export const API_INSPECCIONES_INDUMENTARIA = "/api/inspecciones-indumentaria";
export const API_SALUD = "/api/salud";
export const API_ASISTENCIAS = "/api/asistencias";
export const API_ACCIDENTES = "/api/accidentes";
export const API_TIPOS_ACCIDENTE = "/api/tipos-accidente";

export const COLORS = {
  red: "#C0161C",
  blue: "#1B3A6B",
  lightGray: "#F5F5F5",
  borderGray: "#E0E0E0",
  textPrimary: "#1A1A1A",
  textSecondary: "#5F5F5F",
  white: "#FFFFFF",
  successBg: "#EAF3DE",
  successText: "#3B6D11",
  errorBg: "#FCEBEB",
  errorText: "#A32D2D",
  warningBg: "#FAEEDA",
  warningText: "#854F0B",
} as const;

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 14,
  border: `1px solid ${COLORS.borderGray}`,
  borderRadius: 8,
  background: COLORS.white,
  color: COLORS.textPrimary,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
