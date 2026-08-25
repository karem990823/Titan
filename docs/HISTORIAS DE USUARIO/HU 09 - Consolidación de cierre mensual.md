# HU 09 - Consolidación de cierre mensual

| Campo | Valor |
|-------|-------|
| ID | HU 09 |
| Épica | Reportes y Cumplimiento |
| RF cubierto | RF-002.2 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero ejecutar el cierre de mes para consolidar automáticamente la información de participantes aprobados en el período.

## Criterios de aceptación

- **CA-01:** El sistema consolida todos los participantes aprobados del mes.
- **CA-02:** El proceso omite participantes con datos incompletos y notifica cuáles fueron omitidos.
- **CA-03:** El consolidado queda archivado en el repositorio mensual.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/reportes/cierre-mes |
| Backend | Lógica de consolidación: filtrar aprobados con datos completos |
| Backend | Generar registro del consolidado mensual |
| Base de datos | Crear tabla consolidado_mensual con referencia a participantes incluidos |
| Frontend | Botón "Ejecutar cierre de mes" |
| Frontend | Resultado con lista de incluidos y excluidos |
| Frontend | Confirmación antes de ejecutar (usar HU 22 — Componente de modal de confirmación) |
| QA | CP-17: Ejecutar cierre con participantes completos e incompletos |
| QA | CP-18: Verificar que incompletos aparecen en lista de omitidos |

## Notas técnicas

- La base de datos debe estar optimizada para consultas masivas durante el cierre mensual.
