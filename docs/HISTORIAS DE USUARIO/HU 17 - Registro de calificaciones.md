# HU 17 - Registro de calificaciones

| Campo | Valor |
|-------|-------|
| ID | HU 17 |
| Épica | Ejecución Académica |
| RF cubierto | RF-003.4 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como instructor quiero ingresar la calificación de un participante para determinar si aprobó o reprobó el curso.

## Criterios de aceptación

- **CA-01:** Solo se puede calificar a participantes que registraron asistencia en la sesión.
- **CA-02:** El sistema valida que la nota esté dentro del rango permitido.
- **CA-03:** El sistema determina automáticamente el estado aprobado o reprobado según la nota.
- **CA-04:** Las notas requieren permiso especial para modificarse y dejan trazabilidad.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/inscripciones/:id/calificacion |
| Backend | Validar que el participante asistió antes de permitir la nota |
| Backend | Calcular y asignar estado aprobado/reprobado automáticamente |
| Base de datos | Agregar columnas calificacion y estado_aprobacion en tabla inscripcion |
| Frontend | Campo de nota junto a cada participante con asistencia marcada |
| Frontend | Estado aprobado/reprobado visible en tiempo real |
| Frontend | Botón de guardar calificaciones |
| QA | CP-34: Registrar nota válida a participante presente |
| QA | CP-35: Intentar calificar participante ausente |
| QA | CP-36: Ingresar nota fuera del rango permitido |

## Notas técnicas

- Las notas solo pueden modificarse mediante permisos especiales.
- Toda modificación debe quedar registrada en auditoría con usuario, fecha y valor anterior.
- El rango permitido de notas debe configurarse según las reglas académicas del sistema.
