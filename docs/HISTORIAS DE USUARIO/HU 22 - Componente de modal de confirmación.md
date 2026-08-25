# HU 22 - Componente de modal de confirmación

| Campo | Valor |
|-------|-------|
| ID | HU 22 |
| Épica | Transversal |
| RF cubierto | Todos los módulos |
| Prioridad | Media |
| Versión | 1.0 |

## Historia de usuario

Yo como usuario quiero que el sistema me solicite confirmación antes de ejecutar acciones destructivas o irreversibles para evitar errores accidentales.

## Criterios de aceptación

- **CA-01:** El modal muestra un mensaje descriptivo de la acción que se va a ejecutar.
- **CA-02:** El modal dispone de los botones "Confirmar" y "Cancelar".
- **CA-03:** Si el usuario cancela, la acción no se ejecuta y el sistema mantiene su estado actual.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Frontend | Crear componente reutilizable de modal de confirmación |
| Frontend | Permitir recibir mensajes y funciones de confirmación/cancelación mediante props o parámetros |
| Frontend | Integrar el modal en eliminaciones, cierre de mes, cambio de estado de incidentes y cierre de calificaciones |
| QA | CP-45: Abrir modal y confirmar la acción |
| QA | CP-46: Abrir modal y cancelar, verificando que no se realiza ningún cambio |

## Notas técnicas

- Debe existir un único componente reutilizable para toda la aplicación.
- El componente debe ser configurable para distintos escenarios sin duplicar código.
- Se recomienda mantener consistencia visual y de comportamiento en todos los módulos.
- Un solo componente reutilizable para toda la app, no duplicar por módulo.
