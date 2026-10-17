# HU 05 - Registro de incidentes

| Campo | Valor |
|-------|-------|
| ID | HU 05 |
| Épica | Seguridad y Control |
| RF cubierto | RF-001.4 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero registrar un incidente ocurrido en el centro para mantener un control formal y rastreable del evento.

## Criterios de aceptación

- **CA-01:** El sistema permite ingresar fecha, descripción, responsable y nivel de gravedad.
- **CA-02:** El sistema asigna estado inicial "Abierto" al crear el incidente.
- **CA-03:** El sistema guarda el registro y muestra confirmación.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/incidentes |
| Backend | Asignar estado inicial automáticamente |
| Backend | Validar campos obligatorios |
| Base de datos | Crear tabla incidente: id, fecha, descripcion, gravedad, estado, responsable, usuario_registro |
| Frontend | Formulario de registro de incidente |
| Frontend | Selector de gravedad y responsable |
| Frontend | Mensaje de confirmación |
| QA | CP-09: Registrar incidente con todos los datos |
| QA | CP-10: Intentar guardar sin campos obligatorios |

## Notas técnicas

- Incidentes de gravedad alta deben generar notificación (ver HU 21 — Componente de mensajes de confirmación y error).
