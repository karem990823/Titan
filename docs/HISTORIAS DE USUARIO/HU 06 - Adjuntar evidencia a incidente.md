# HU 06 - Adjuntar evidencia a incidente

| Campo | Valor |
|-------|-------|
| ID | HU 06 |
| Épica | Seguridad y Control |
| RF cubierto | RF-001.4 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero adjuntar archivos de evidencia a un incidente registrado para respaldar la información con documentos o imágenes.

## Criterios de aceptación

- **CA-01:** El sistema permite subir imágenes y PDF como evidencia.
- **CA-02:** El sistema rechaza formatos o tamaños no permitidos con mensaje de error.
- **CA-03:** La evidencia queda asociada al incidente y puede consultarse después.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint POST /api/incidentes/:id/evidencia |
| Backend | Validar tipo y tamaño de archivo |
| Backend | Almacenar archivo de forma segura |
| Base de datos | Crear tabla evidencia: id, id_incidente, ruta_archivo, tipo, fecha_subida |
| Frontend | Componente de carga de archivos (drag & drop) |
| Frontend | Validación de tipo y tamaño en cliente |
| Frontend | Mostrar listado de evidencias adjuntas |
| QA | CP-11: Subir PDF válido como evidencia |
| QA | CP-12: Intentar subir archivo con formato no permitido |

## Notas técnicas

- Tamaño máximo recomendado: 5 MB por archivo.
- Validación antivirus en backend si el entorno lo permite.
