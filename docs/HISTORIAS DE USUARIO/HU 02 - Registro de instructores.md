# HU 02 - Registro de instructores

| Campo | Valor |
|-------|-------|
| ID | HU 02 |
| Épica | Gestión de Personas |
| RF cubierto | RF-001.1 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero registrar un instructor con sus datos y certificaciones para asignarlo a cursos del centro.

## Criterios de aceptación

- **CA-01:** El sistema permite ingresar datos personales y al menos una certificación vigente.
- **CA-02:** El sistema guarda el registro y muestra confirmación.
- **CA-03:** El sistema rechaza el registro si no se ingresa ninguna certificación.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/instructores |
| Backend | Validar existencia de certificación vigente |
| Backend | Retornar respuesta de éxito o error |
| Base de datos | Crear tabla instructor |
| Base de datos | Crear tabla certificacion con relación a instructor |
| Base de datos | Índice único sobre documento del instructor |
| Frontend | Formulario de registro con sección de certificaciones |
| Frontend | Validación de campos obligatorios |
| Frontend | Mensaje de confirmación o error |
| QA | CP-03: Registrar instructor con certificación |
| QA | CP-04: Intentar registrar instructor sin certificación |

## Notas técnicas

- Si se usa ORM, crear modelos Instructor y Certificacion.
