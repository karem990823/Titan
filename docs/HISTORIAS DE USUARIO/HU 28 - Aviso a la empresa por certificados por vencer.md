# HU 28 - Aviso a la empresa por certificados por vencer

| Campo | Valor |
|-------|-------|
| ID | HU 28 |
| Épica | Reportes y Cumplimiento |
| RF cubierto | Por asignar |
| Prioridad | Media |
| Versión | 1.0 |

## Historia de usuario

Yo como empresa cliente quiero recibir un aviso (por correo y dentro del sistema) cuando el certificado de alguno de mis trabajadores esté por vencer para reinscribirlo a tiempo y no dejarlo sin certificación vigente para trabajar en alturas.

## Criterios de aceptación

- **CA-01:** Si un certificado vence en 30 días o menos, la empresa dueña del trabajador recibe un correo con la lista de esos trabajadores.
- **CA-02:** Cada empresa ve solo los avisos de sus propios trabajadores, nunca los de otra.
- **CA-03:** La empresa tiene una vista "Alertas" con los certificados por vencer.
- **CA-04:** Si no hay certificados por vencer, no se envía ningún correo.
- **CA-05:** Los administradores siguen recibiendo su correo como hasta ahora.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Agrupar las alertas de vencimiento pendientes por empresa del trabajador y enviar un correo por empresa |
| Backend | Crear endpoint GET /api/alertas/mis-alertas protegido con require_empresa |
| Backend | Crear plantilla de correo enviar_correo_alertas_empresa en utils/email.py |
| Base de datos | Sin cambios: se reutilizan las tablas alertas y tipos_alerta |
| Frontend | Crear vista features/empresa/CompanyAlerts.tsx |
| Frontend | Agregar ruta /empresa/alertas y opción "Alertas" en el menú lateral para el rol Empresa |
| QA | Pruebas automáticas en be/tests/test_alertas_empresa.py (aislamiento entre empresas, sin duplicados, sin correo si no hay vencimientos) |

## Notas técnicas

- El estado de la alerta pasa a "enviada" si se envió al menos un correo (a un administrador o a una empresa).
- Los certificados ya vencidos no generan alertas nuevas; la vista solo muestra las alertas ya generadas.
- Código nuevo con nomenclatura en inglés, según las decisiones de alcance del README.
