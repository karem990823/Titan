# HU 26 - Carga y consulta de documentos de trabajadores

| Campo | Valor |
|-------|-------|
| ID | HU 26 |
| Épica | Gestión de Personas |
| RF cubierto | RF-001.9 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como empresa quiero subir y consultar los documentos de mis trabajadores (cédula, examen médico, etc.) para tener su información organizada digitalmente en un solo lugar.

## Criterios de aceptación

- **CA-01:** Solo se aceptan archivos PDF, JPG o PNG de hasta 10 MB.
- **CA-02:** Una empresa solo puede subir, listar o descargar documentos de trabajadores que le pertenecen (403 en caso contrario).
- **CA-03:** El sistema nunca expone al cliente la ruta real del archivo en el servidor; la descarga ocurre siempre a través de un endpoint controlado.
- **CA-04:** Instructor y Administrador pueden consultar y descargar documentos de cualquier trabajador; solo Empresa y Administrador pueden subir.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | `POST /api/documentos/{id_usuario}` — `UploadFile` multipart, valida tipo/tamaño, guarda en disco bajo `uploads/{id_usuario}/` |
| Backend | `GET /api/documentos/usuario/{id_usuario}` — listado con validación de pertenencia |
| Backend | `GET /api/documentos/{id_documento}/descargar` — `FileResponse` con el mismo control de acceso |
| Infraestructura | Volumen Docker `titan_uploads` para persistir los archivos entre reinicios del contenedor |
| Frontend | `DocumentosTrabajador.tsx` — selector de trabajador, formulario de carga y listado con descarga |
| QA | CP-01: Subir un PDF válido y verificar que aparece en el listado |
| QA | CP-02: Intentar subir un `.exe` → rechazado |
| QA | CP-03: Empresa A intenta descargar un documento de un trabajador de Empresa B → 403 |

## Notas técnicas

- La tabla `documentos` ya existía en `base/titan.sql` sin ningún modelo de Python asociado; esta historia construye toda la capa de aplicación (modelo, schema, controller, rutas) sobre esa tabla existente.
