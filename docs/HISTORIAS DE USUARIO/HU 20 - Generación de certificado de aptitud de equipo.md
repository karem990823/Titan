# HU 20 - Generación de certificado de aptitud de equipo

| Campo | Valor |
|-------|-------|
| ID | HU 20 |
| Épica | Seguridad Operacional |
| RF cubierto | RF-005.4 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero generar el certificado de aptitud de un equipo inspeccionado para tener constancia oficial de su estado.

## Criterios de aceptación

- **CA-01:** Solo se puede generar un certificado para equipos con inspección vigente y estado Apto.
- **CA-02:** El certificado se genera en formato PDF y puede descargarse.
- **CA-03:** El certificado posee una vigencia definida y queda registrado en el sistema.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/equipos/:id/certificado |
| Backend | Validar que el equipo tenga una inspección vigente con resultado Apto |
| Backend | Generar PDF del certificado con información del equipo e inspector |
| Base de datos | Crear tabla certificado_equipo: id, equipo_id, inspeccion_id, fecha_emision, fecha_vencimiento, pdf_ruta |
| Frontend | Botón "Generar certificado" visible únicamente para equipos Aptos |
| Frontend | Descarga directa del PDF generado |
| QA | CP-41: Generar certificado para equipo Apto |
| QA | CP-42: Verificar que equipo No apto no tiene opción de certificado |

## Notas técnicas

- La vigencia de los certificados debe ser configurable (por ejemplo, 1 año).
- El PDF generado debe almacenarse y mantenerse disponible para futuras consultas.
- Solo se permitirá la generación cuando exista una inspección vigente y aprobada.
