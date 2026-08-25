# HU 21 - Componente de mensajes de confirmación y error

| Campo | Valor |
|-------|-------|
| ID | HU 21 |
| Épica | Transversal |
| RF cubierto | Todos los módulos |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como usuario del sistema quiero ver mensajes claros de éxito o error después de cada operación para saber si la acción fue completada correctamente.

## Criterios de aceptación

- **CA-01:** El sistema muestra un mensaje de éxito en color verde al completar una operación correctamente.
- **CA-02:** El sistema muestra un mensaje de error en color rojo con una descripción clara del problema.
- **CA-03:** Los mensajes desaparecen automáticamente después de un tiempo o pueden cerrarse manualmente.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Frontend | Crear componente reutilizable Toast/Alert (éxito, error, advertencia e información) |
| Frontend | Integrar el componente en todos los formularios y procesos del sistema |
| Frontend | Configurar tiempo de auto-cierre y opción de cierre manual |
| QA | CP-43: Verificar que el Toast de éxito aparece tras una operación exitosa |
| QA | CP-44: Verificar que el Toast de error aparece con un mensaje descriptivo |

## Notas técnicas

- El componente debe cumplir criterios de accesibilidad utilizando el rol "alert" para lectores de pantalla.
- Debe existir un único componente reutilizable para toda la aplicación.
- Evitar implementaciones duplicadas en módulos específicos.
