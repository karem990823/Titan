# HU 10 - Generación automática de certificados

| Campo | Valor |
|-------|-------|
| ID | HU 10 |
| Épica | Reportes y Cumplimiento |
| RF cubierto | RF-002.3 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero que el sistema genere certificados PDF automáticamente al ejecutar el cierre de mes para los participantes aprobados.

## Criterios de aceptación

- **CA-01:** El sistema genera un certificado PDF por cada participante aprobado con datos completos.
- **CA-02:** Cada certificado tiene un número único e irrepetible.
- **CA-03:** El sistema no genera certificado para participantes con datos incompletos y muestra un aviso.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear servicio de generación PDF (fpdf2) |
| Backend | Asignar numeración única a cada certificado |
| Backend | Archivar PDF generado y registrar en base de datos |
| Base de datos | Agregar columna numero_certificado con restricción UNIQUE en tabla certificado |
| Frontend | Vista de certificados generados con opción de descarga |
| Frontend | Aviso de participantes omitidos con motivo |
| QA | CP-19: Verificar generación de PDF con datos completos |
| QA | CP-20: Verificar que participante con datos incompletos no recibe certificado |

## Notas técnicas

- Los certificados deben cumplir la Resolución 4272 del Ministerio de Trabajo.
- Se recomienda implementar control de versiones de los PDF generados.
