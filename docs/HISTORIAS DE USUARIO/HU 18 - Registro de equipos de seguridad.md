# HU 18 - Registro de equipos de seguridad

| Campo | Valor |
|-------|-------|
| ID | HU 18 |
| Épica | Seguridad Operacional |
| RF cubierto | RF-003.5 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero registrar un equipo de seguridad con su código único para tener un inventario actualizado de los elementos del centro.

## Criterios de aceptación

- **CA-01:** Cada equipo tiene un código único asignado al momento del registro.
- **CA-02:** El sistema permite registrar tipo, marca, fecha de adquisición y estado inicial.
- **CA-03:** El sistema rechaza registros con código duplicado.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/equipos |
| Backend | Validar unicidad del código de equipo |
| Backend | Retornar equipo creado con su ID |
| Base de datos | Crear tabla equipo: id, codigo (UNIQUE), tipo, marca, fecha_adquisicion, estado |
| Frontend | Formulario de registro de equipo |
| Frontend | Tabla de inventario con equipos registrados |
| Frontend | Mensaje de error en caso de código duplicado |
| QA | CP-37: Registrar equipo con código nuevo |
| QA | CP-38: Intentar registrar con código ya existente |

## Notas técnicas

- El código puede ser generado automáticamente o ingresado manualmente según la política del centro.
- Debe mantenerse la unicidad del código mediante restricciones en la base de datos.
