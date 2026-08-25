# HU 12 - Descarga de certificado en PDF

| Campo | Valor |
|-------|-------|
| ID | HU 12 |
| Épica | Servicios al Participante |
| RF cubierto | RF-002.4 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como participante quiero descargar mi certificado en PDF para tenerlo disponible o presentarlo donde se requiera.

## Criterios de aceptación

- **CA-01:** El sistema permite descargar únicamente certificados vigentes.
- **CA-02:** El archivo descargado es un PDF válido con los datos del participante.
- **CA-03:** Los certificados expirados no son descargables.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint GET /api/certificados/:id/pdf |
| Backend | Validar que el certificado pertenece al participante solicitante |
| Backend | Servir archivo PDF desde almacenamiento |
| Base de datos | Verificar ruta de almacenamiento del PDF en tabla certificado |
| Frontend | Botón "Descargar PDF" en cada certificado vigente |
| Frontend | Deshabilitar botón para certificados expirados |
| Frontend | Mostrar indicador de carga durante la descarga |
| QA | CP-24: Descargar certificado vigente |
| QA | CP-25: Verificar que certificado expirado no tiene opción de descarga |

## Notas técnicas

- El renderizado del PDF se realiza en el backend.
- Considerar el uso de caché para certificados PDF previamente generados.
