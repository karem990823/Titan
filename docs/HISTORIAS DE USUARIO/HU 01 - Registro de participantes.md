# HU 01 - Registro de participantes

| Campo | Valor |
|-------|-------|
| ID | HU 01 |
| Épica | Gestión de Personas |
| RF cubierto | RF-001.1 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero registrar un nuevo participante en el sistema para tener su información almacenada y disponible.

## Criterios de aceptación

- **CA-01:** El sistema permite ingresar nombre, documento, contacto y rol.
- **CA-02:** El sistema guarda el registro y muestra confirmación.
- **CA-03:** El sistema impide registrar un participante con documento ya existente.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/participantes |
| Backend | Validar campos obligatorios en el servidor |
| Backend | Retornar respuesta de éxito o error |
| Base de datos | Crear tabla participante con sus columnas y restricciones |
| Base de datos | Definir índice único sobre número de documento |
| Frontend | Crear formulario de registro con validaciones |
| Frontend | Mostrar mensaje de confirmación o error según respuesta |
| QA | CP-01: Registrar participante con datos completos |
| QA | CP-02: Intentar duplicar documento |

## Notas técnicas

- Si se usa ORM, crear el modelo Participante y modificar el controlador.
- Validar formato del teléfono en frontend y backend.
