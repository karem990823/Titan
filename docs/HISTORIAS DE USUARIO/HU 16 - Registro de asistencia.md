# HU 16 - Registro de asistencia

| Campo | Valor |
|-------|-------|
| ID | HU 16 |
| Épica | Ejecución Académica |
| RF cubierto | RF-003.3 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como instructor quiero registrar la asistencia de los participantes por sesión para llevar el control de presencia en el curso.

## Criterios de aceptación

- **CA-01:** Solo aparecen participantes inscritos en el curso.
- **CA-02:** El sistema permite marcar asistencia o ausencia por participante.
- **CA-03:** El registro queda guardado y solo puede corregirse con permiso especial.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/cursos/:id/sesiones/:sesion/asistencia |
| Backend | Validar que el participante esté inscrito en el curso |
| Backend | Registrar en auditoría cualquier corrección posterior |
| Base de datos | Crear tabla asistencia: id, inscripcion_id, sesion, presente (bool), fecha |
| Frontend | Lista de participantes con casilla de asistencia |
| Frontend | Botón de guardar por sesión |
| Frontend | Indicador de sesión actual |
| QA | CP-32: Registrar asistencia completa de una sesión |
| QA | CP-33: Verificar que participante no inscrito no aparece en lista |

## Notas técnicas

- Si se utiliza ORM, crear los modelos Asistencia y Sesion.
- Las correcciones posteriores deben quedar registradas en auditoría para trazabilidad.
