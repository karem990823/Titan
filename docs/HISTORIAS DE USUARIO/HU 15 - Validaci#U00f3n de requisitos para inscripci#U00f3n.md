# HU 15 - Validación de requisitos para inscripción

| Campo | Valor |
|-------|-------|
| ID | HU 15 |
| Épica | Gestión Académica |
| RF cubierto | RF-005.1 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero que el sistema valide los requisitos del participante antes de inscribirlo para garantizar que cumple las condiciones del curso.

## Criterios de aceptación

- **CA-01:** El sistema verifica si el tipo de curso exige certificado previo.
- **CA-02:** Si el participante no cumple el requisito, la inscripción es bloqueada con un mensaje explicativo.
- **CA-03:** Si cumple los requisitos, la inscripción procede normalmente.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Implementar lógica de validación de requisitos según tipo de curso |
| Backend | Retornar error descriptivo si no cumple requisito |
| Base de datos | Crear tabla tipo_curso_requisito: tipo_curso_id, requisito (ej. certificado_previo) |
| Frontend | Mostrar mensaje de bloqueo con motivo específico |
| Frontend | Mostrar requisitos del curso antes de intentar inscribir |
| QA | CP-30: Inscribir en reentrenamiento con certificado previo vigente |
| QA | CP-31: Intentar inscribir sin certificado previo requerido |

## Notas técnicas

- Los cursos de reentrenamiento exigen un certificado previo vigente del mismo tipo de formación.
- La validación debe ejecutarse antes de confirmar la inscripción.
