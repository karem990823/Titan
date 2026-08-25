# HU 08 - Generación de reporte diario

| Campo | Valor |
|-------|-------|
| ID | HU 08 |
| Épica | Reportes y Cumplimiento |
| RF cubierto | RF-002.1 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero generar un informe diario al cierre de jornada para tener un resumen de las actividades del día.

## Criterios de aceptación

- **CA-01:** El sistema genera el reporte con datos del día en curso.
- **CA-02:** El reporte queda almacenado en el repositorio de informes.
- **CA-03:** El reporte no puede modificarse manualmente una vez generado.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/reportes/diario |
| Backend | Implementar CronJob para ejecución automática al cierre de jornada |
| Backend | Bloquear edición del reporte tras generarse |
| Base de datos | Crear tabla reporte: id, tipo, fecha, contenido_json, generado_por, fecha_creacion |
| Frontend | Botón "Generar reporte diario" en panel de reportes |
| Frontend | Lista cronológica de reportes generados |
| QA | CP-15: Generar reporte diario manualmente |
| QA | CP-16: Verificar que el reporte queda bloqueado para edición |

## Notas técnicas

- CronJob en horario configurable.
- Evaluar el mecanismo de tareas programadas disponible según el stack (Python/FastAPI).
