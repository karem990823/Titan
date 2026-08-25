# HU 14 - Inscripción de participantes a cursos

| Campo | Valor |
|-------|-------|
| ID | HU 14 |
| Épica | Gestión Académica |
| RF cubierto | RF-003.2 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero inscribir un participante a un curso para registrar su vinculación al proceso de capacitación.

## Criterios de aceptación

- **CA-01:** El sistema permite inscribir a un participante si el curso tiene cupos disponibles.
- **CA-02:** El sistema descuenta un cupo al realizar la inscripción.
- **CA-03:** El sistema rechaza la inscripción si el curso está lleno.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/cursos/:id/inscripciones |
| Backend | Verificar cupos disponibles antes de inscribir |
| Backend | Descontar cupo en tabla curso con control de concurrencia |
| Base de datos | Crear tabla inscripcion: id, curso_id, participante_id, fecha_inscripcion, estado |
| Frontend | Panel lateral de inscritos en vista de curso |
| Frontend | Botón "Inscribir participante" |
| Frontend | Indicador de cupos disponibles actualizado |
| QA | CP-28: Inscribir participante en curso con cupos |
| QA | CP-29: Intentar inscribir en curso sin cupos |

## Notas técnicas

- Utilizar transacciones en base de datos para evitar sobreinscripciones por concurrencia.
- Mantener sincronizado el número de cupos disponibles.
