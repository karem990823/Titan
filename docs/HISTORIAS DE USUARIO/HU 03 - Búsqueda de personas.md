# HU 03 - Búsqueda de personas

| Campo | Valor |
|-------|-------|
| ID | HU 03 |
| Épica | Gestión de Personas |
| RF cubierto | RF-001.2 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero buscar participantes o instructores por múltiples criterios para localizar rápidamente su información.

## Criterios de aceptación

- **CA-01:** El sistema permite buscar por nombre, documento y rol.
- **CA-02:** Los resultados se muestran en menos de 3 segundos.
- **CA-03:** Si no hay coincidencias, muestra mensaje informativo.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint GET /api/personas con parámetros de búsqueda |
| Backend | Implementar consulta con filtros dinámicos |
| Backend | Paginar resultados |
| Base de datos | Agregar índices en campos de búsqueda frecuente (nombre, documento) |
| Frontend | Barra de búsqueda con filtros por criterio |
| Frontend | Tabla de resultados paginada |
| Frontend | Mensaje cuando no hay resultados |
| QA | CP-05: Buscar por nombre existente |
| QA | CP-06: Buscar con criterio sin resultados |

## Notas técnicas

- Evaluar uso de búsqueda full-text según motor de base de datos.
