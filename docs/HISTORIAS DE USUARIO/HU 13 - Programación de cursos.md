# HU 13 - Programación de cursos

| Campo | Valor |
|-------|-------|
| ID | HU 13 |
| Épica | Gestión Académica |
| RF cubierto | RF-003.1 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero programar un curso en el calendario asignando instructor, fecha, horario y cupos para organizar las capacitaciones del centro.

## Criterios de aceptación

- **CA-01:** El sistema permite crear un curso con tipo, fecha, horario, instructor y cupos máximos.
- **CA-02:** El sistema valida que el instructor no tenga otro curso en el mismo horario.
- **CA-03:** El curso queda visible en el calendario con la información registrada.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/cursos |
| Backend | Validar disponibilidad del instructor (no solapamiento de horario) |
| Backend | Asociar tipo de curso al registro |
| Base de datos | Crear tabla curso: id, tipo, fecha, hora_inicio, hora_fin, instructor_id, cupos_max, cupos_disponibles |
| Frontend | Formulario de programación de curso |
| Frontend | Selector de instructor con validación de disponibilidad |
| Frontend | Vista en calendario al guardar |
| QA | CP-26: Programar curso con instructor disponible |
| QA | CP-27: Intentar asignar instructor con conflicto de horario |

## Notas técnicas

- El calendario puede implementarse con una librería interactiva (p. ej. FullCalendar).
- Todo curso debe tener un tipo asignado según las reglas de negocio.
