// Tipos compartidos por todas las vistas del módulo académico.
// A medida que se agreguen los módulos de usuarios, certificados, equipos y pagos,
// sus tipos propios deben vivir en archivos separados aquí mismo (p. ej. usuarios.ts),
// re-exportados desde este index.ts.

export type ToastType = "success" | "error" | "warning";

export interface ToastState {
  message: string;
  type: ToastType;
}

export interface TipoDocumento {
  id_tipo: number;
  nombre: string;
}

export interface Curso {
  id_curso: number;
  nombre_curso: string;
}

export interface Instructor {
  id_usuario: number;
  nombre: string;
  tipo_documento: string;
  numero_identificacion: string;
}

export interface Programacion {
  id_programacion: number;
  fecha: string;
  hora: string;
  cupos: number;
}

export interface CursoCalendario {
  id_programacion: number;
  nombre_curso: string;
  fecha: string;
  hora: string;
  cupos: number;
  instructor_nombre: string;
}

export interface Participante {
  id_usuario: number;
  nombre: string;
  tipo_documento: string;
  numero_identificacion: string;
}

export interface ResultadoInscripcion {
  estado: string;
  cupos_restantes: number;
}

// Formato estándar de respuesta que devuelve utils/response.py (api_response) en el backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// Formato de error de FastAPI cuando el detail es un objeto (no un string simple)
export interface ApiErrorDetail {
  error?: string;
  message?: string;
}

// --- Autenticación y roles ---

export type RolNombre = "Administrador" | "Instructor" | "Empresa";

export interface UsuarioAutenticado {
  id_usuario: number;
  nombre: string;
  apellido: string | null;
  correo: string | null;
  tipo_registro: "empresa" | "trabajador" | "usuario";
  id_rol: number | null;
  rol_nombre: RolNombre | null;
  id_empresa: number | null;
}

export interface Rol {
  id_rol: number;
  nombre_rol: string;
}

// --- Trabajadores (empresa) y documentos ---

export interface Trabajador {
  id_usuario: number;
  nombre: string;
  apellido: string | null;
  numero_identificacion: number | null;
  tipo_documento: string | null;
}

export interface Documento {
  id_documento: number;
  nombre: string;
  descripcion: string | null;
  id_usuario: number | null;
  fecha_subida: string | null;
}

// --- Certificados ---

export interface CertificadoPublico {
  id_certificado: number;
  nombre_completo: string | null;
  curso_nombre: string | null;
  codigo: string | null;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  vigente: boolean;
}

export interface Certificado {
  id_certificado: number;
  codigo: string | null;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  id_usuario: number;
  id_curso: number;
  curso_nombre: string | null;
}

// --- Evaluaciones (instructor) ---

export interface EvaluacionResumen {
  id_evaluacion: number;
  nombre: string;
  id_curso: number;
  curso_nombre: string | null;
  total_preguntas: number;
}

export interface ResultadoPresentacion {
  id_presentada: number;
  id_usuario: number;
  id_evaluacion: number;
  fecha: string;
  resultado: { id_resultado: number; id_presentada: number; puntaje: number } | null;
  certificado_emitido: boolean;
  certificado: string | null;
}

export interface RespuestaItem {
  id_respuesta: number;
  id_pregunta: number;
  respuesta: string;
  es_correcta: boolean;
}

export interface PreguntaDetalle {
  id_pregunta: number;
  id_evaluacion: number;
  pregunta: string;
  respuestas: RespuestaItem[];
}

export interface EvaluacionDetalle {
  id_evaluacion: number;
  nombre: string;
  preguntas: PreguntaDetalle[];
}

export interface ResultadoItem {
  id_resultado: number;
  id_presentada: number;
  puntaje: number;
  id_usuario: number | null;
  id_evaluacion: number | null;
  fecha: string | null;
}

// --- Facturación (admin) ---

export interface FacturaResumen {
  id_factura: number;
  fecha: string;
  id_empresa: number;
  empresa: string | null;
  total: number;
}

export interface MetodoPago {
  id_metodo: number;
  nombre: string;
}

export interface Pago {
  id_pago: number;
  fecha: string;
  monto: number;
  id_factura: number;
  id_metodo: number;
}

// --- Inventario de indumentaria (admin) ---

export interface Indumentaria {
  id_indumentaria: number;
  nombre: string;
  descripcion: string | null;
}

export interface InspeccionIndumentaria {
  id_inspeccion: number;
  fecha: string;
  id_indumentaria: number;
  id_usuario: number;
  observaciones: string | null;
  resultado: "apto" | "no_apto";
}

// --- Gestión de usuarios (admin) ---

export interface UsuarioAdmin {
  id_usuario: number;
  tipo_registro: "empresa" | "trabajador" | "usuario";
  nombre: string;
  apellido: string | null;
  correo: string | null;
  id_rol: number | null;
  rol_nombre: string | null;
  id_empresa: number | null;
  estado_activo: boolean;
}

// --- Salud ocupacional, asistencia e incidentes (instructor/admin) ---

export interface RegistroSalud {
  id_salud: number;
  apto: "SI" | "NO";
  restricciones: string | null;
  observaciones: string | null;
  fecha_examen: string;
  fecha_vencimiento: string;
  id_trabajador: number;
  trabajador: string | null;
}

export interface AsistenciaInscrito {
  id_inscripcion: number;
  id_usuario: number;
  nombre: string | null;
  asistio: boolean | null;
}

export interface TipoAccidente {
  id_tipo_accidente: number;
  nombre: string;
}

export type EstadoIncidente = "abierto" | "en_seguimiento" | "cerrado";

export interface Accidente {
  id_accidente: number;
  fecha: string;
  lugar: string;
  id_trabajador: number;
  trabajador: string | null;
  id_tipo_accidente: number;
  tipo_accidente: string | null;
  descripcion: string | null;
  estado: EstadoIncidente;
}

// --- Reportes y cierre mensual (admin/instructor) ---

export interface Reporte {
  id_reporte: number;
  tipo: string;
  fecha: string;
  contenido_json: string;
  generado_por: number;
  fecha_creacion: string;
}

export interface ConsolidadoParticipante {
  id_usuario: number;
  trabajador: string | null;
  id_curso: number;
  curso: string | null;
  incluido: boolean;
  motivo_exclusion: string | null;
}

export interface ResultadoCierreMes {
  id_consolidado: number;
  incluidos: ConsolidadoParticipante[];
  excluidos: ConsolidadoParticipante[];
}
