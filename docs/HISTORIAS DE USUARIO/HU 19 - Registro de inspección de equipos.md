# HU 19 - Registro de inspección de equipos

| Campo | Valor |
|-------|-------|
| ID | HU 19 |
| Épica | Seguridad Operacional |
| RF cubierto | RF-005.3 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como inspector quiero registrar el resultado de una inspección de un equipo para mantener el historial de su estado operativo.

## Criterios de aceptación

- **CA-01:** El sistema permite registrar resultado (Apto / No apto), observaciones e inspector responsable.
- **CA-02:** El estado del equipo se actualiza automáticamente según el resultado.
- **CA-03:** Cada inspección queda registrada en el historial del equipo.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/equipos/:id/inspecciones |
| Backend | Actualizar estado del equipo según resultado de inspección |
| Backend | Registrar inspector responsable obligatoriamente |
| Base de datos | Crear tabla inspeccion: id, equipo_id, resultado, observaciones, inspector_id, fecha |
| Frontend | Formulario de inspección en vista de detalle del equipo |
| Frontend | Historial de inspecciones con fecha y resultado |
| Frontend | Indicador de estado actual del equipo |
| QA | CP-39: Registrar inspección con resultado Apto |
| QA | CP-40: Registrar inspección con resultado No apto y verificar cambio de estado |

## Notas técnicas

- Toda inspección debe estar asociada a un inspector responsable identificado.
- El historial de inspecciones debe mantenerse para fines de auditoría y trazabilidad.
