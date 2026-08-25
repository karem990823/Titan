# HU 07 - Cambio de estado de incidente

| Campo | Valor |
|-------|-------|
| ID | HU 07 |
| Épica | Seguridad y Control |
| RF cubierto | RF-001.4 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero cambiar el estado de un incidente para reflejar su avance dentro del proceso de seguimiento.

## Criterios de aceptación

- **CA-01:** El sistema permite cambiar el estado entre: Abierto, En seguimiento, Cerrado.
- **CA-02:** Solo usuarios autorizados pueden cerrar un incidente.
- **CA-03:** El sistema registra cada cambio de estado con fecha y usuario.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint PATCH /api/incidentes/:id/estado |
| Backend | Validar permisos según rol para cierre |
| Backend | Registrar cambio en log de auditoría |
| Base de datos | Crear tabla historial_incidente: id, id_incidente, estado_anterior, estado_nuevo, usuario, fecha |
| Frontend | Selector de estado en vista de detalle del incidente |
| Frontend | Confirmación antes de cerrar |
| Frontend | Mostrar historial de estados |
| QA | CP-13: Cambiar estado a En seguimiento |
| QA | CP-14: Intentar cerrar incidente sin permisos |

## Notas técnicas

- Flujo de estados permitido: Abierto → En seguimiento → Cerrado únicamente.
