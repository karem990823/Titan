# Estimación de historias de usuario – TITAN

**Proyecto:** TITAN – Seguridad en Alturas SAS  
**Versión:** 1.0

## Técnica de estimación

Se propone utilizar Planning Poker con la escala Fibonacci para estimar la complejidad de las historias de usuario.

| Puntos | Complejidad |
|---:|---|
| 1 | Muy sencilla |
| 2 | Sencilla |
| 3 | Baja |
| 5 | Media |
| 8 | Alta |
| 13 | Muy alta |

Los puntos representan esfuerzo relativo, complejidad y riesgo. No representan horas ni días de trabajo.

## Estimaciones propuestas

| ID | Historia de usuario | Puntos |
|---|---|---:|
| HU01 | Registro de participantes | 3 |
| HU02 | Registro de instructores | 3 |
| HU03 | Búsqueda de personas | 5 |
| HU04 | Actualización de datos de personas | 5 |
| HU05 | Registro de incidentes | 3 |
| HU06 | Adjuntar evidencia a incidente | 3 |
| HU07 | Cambio de estado de incidente | 3 |
| HU08 | Generación de reporte diario | 5 |
| HU09 | Consolidación de cierre mensual | 5 |
| HU10 | Generación automática de certificados | 8 |
| HU11 | Consulta de certificados por participante | 3 |
| HU12 | Descarga de certificado en PDF | 3 |
| HU13 | Programación de cursos | 5 |
| HU14 | Inscripción de participantes a cursos | 5 |
| HU15 | Validación de requisitos para inscripción | 5 |
| HU16 | Registro de asistencia | 5 |
| HU17 | Registro de calificaciones | 5 |
| HU18 | Registro de equipos de seguridad | 3 |
| HU19 | Registro de inspección de equipos | 5 |
| HU20 | Generación de certificado de aptitud de equipo | 5 |
| HU21 | Componente de mensajes de confirmación y error | 2 |
| HU22 | Componente de modal de confirmación | 2 |
| HU23 | Inicio de sesión por rol | 8 |
| HU24 | Gestión de cuentas de usuario | 5 |
| HU25 | Registro de trabajadores por empresa | 8 |
| HU26 | Carga y consulta de documentos de trabajadores | 5 |
| HU27 | Registro de facturación y pagos | 5 |
| HU28 | Aviso a la empresa por certificados por vencer | 5 |

## Criterios utilizados

- Las operaciones sencillas de registro y consulta tienen una estimación menor.
- Las funcionalidades con varias validaciones tienen una estimación media.
- Las historias que involucran permisos, seguridad, generación de documentos o notificaciones tienen mayor complejidad.
- Las funcionalidades que dependen de otros módulos también pueden presentar mayor esfuerzo.

