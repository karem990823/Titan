# Planificación de Sprints – TITAN

**Proyecto:** TITAN – Seguridad en Alturas SAS  
**Versión:** 1.0

## Objetivo

Organizar el desarrollo del proyecto en cuatro Sprints, agrupando las historias de usuario según sus funcionalidades y dependencias.

Se propone trabajar con siete historias por Sprint. La duración de cada Sprint debe ser acordada por el equipo.

## Sprint 1 – Gestión de personas y acceso

**Objetivo:** desarrollar las funcionalidades iniciales para administrar personas, usuarios y acceso al sistema.

| Historia | Descripción | Prioridad |
|---|---|---|
| HU01 | Registro de participantes | Alta |
| HU02 | Registro de instructores | Alta |
| HU03 | Búsqueda de personas | Alta |
| HU04 | Actualización de datos de personas | Alta |
| HU21 | Componente de mensajes de confirmación y error | Alta |
| HU23 | Inicio de sesión por rol | Alta |
| HU24 | Gestión de cuentas de usuario | Alta |

**Resultado esperado:** contar con el registro y administración de personas, inicio de sesión por roles y mensajes de respuesta del sistema.

## Sprint 2 – Gestión académica

**Objetivo:** desarrollar las funcionalidades relacionadas con cursos, inscripciones y seguimiento académico.

| Historia | Descripción | Prioridad |
|---|---|---|
| HU11 | Consulta de certificados por participante | Alta |
| HU12 | Descarga de certificado en PDF | Alta |
| HU13 | Programación de cursos | Alta |
| HU14 | Inscripción de participantes a cursos | Alta |
| HU15 | Validación de requisitos para inscripción | Alta |
| HU16 | Registro de asistencia | Alta |
| HU17 | Registro de calificaciones | Alta |

**Resultado esperado:** permitir la programación de cursos, inscripción validada, registro de asistencia y calificaciones, además de consultar y descargar certificados.

## Sprint 3 – Incidentes, reportes y facturación

**Objetivo:** implementar el control de incidentes y la generación de información administrativa.

| Historia | Descripción | Prioridad |
|---|---|---|
| HU05 | Registro de incidentes | Alta |
| HU06 | Adjuntar evidencia a incidente | Alta |
| HU07 | Cambio de estado de incidente | Alta |
| HU08 | Generación de reporte diario | Alta |
| HU09 | Consolidación de cierre mensual | Alta |
| HU10 | Generación automática de certificados | Alta |
| HU27 | Registro de facturación y pagos | Media |

**Resultado esperado:** gestionar incidentes, generar reportes y certificados, realizar cierres mensuales y registrar facturación y pagos.

## Sprint 4 – Seguridad operacional y empresas

**Objetivo:** desarrollar las funcionalidades relacionadas con equipos de seguridad, empresas, documentos y alertas.

| Historia | Descripción | Prioridad |
|---|---|---|
| HU18 | Registro de equipos de seguridad | Alta |
| HU19 | Registro de inspección de equipos | Alta |
| HU20 | Generación de certificado de aptitud de equipo | Alta |
| HU22 | Componente de modal de confirmación | Media |
| HU25 | Registro de trabajadores por empresa | Alta |
| HU26 | Carga y consulta de documentos de trabajadores | Alta |
| HU28 | Aviso a la empresa por certificados por vencer | Media |

**Resultado esperado:** administrar equipos e inspecciones, gestionar trabajadores y documentos de empresas, y generar alertas por vencimiento de certificados.

## Dependencias entre historias

- HU14 y HU15 necesitan la programación de cursos de HU13.
- HU16 y HU17 dependen del proceso de inscripción de participantes.
- HU10 requiere información de aprobación y cierre mensual.
- HU26 y HU28 necesitan la información de trabajadores y empresas de HU25.
- HU19 depende del registro de equipos de HU18.
- HU20 depende de una inspección válida con resultado Apto en HU19.
- HU21 y HU22 son componentes transversales que pueden utilizarse en diferentes módulos.

## Seguimiento de los Sprints

Al iniciar cada Sprint se confirma el objetivo y las historias que se van a trabajar. Durante el desarrollo se revisan los avances y posibles bloqueos.

Al finalizar, el equipo verifica que las historias cumplan sus criterios de aceptación antes de considerarlas terminadas.