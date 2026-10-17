# HU 11 - Consulta de certificados por participante

| Campo | Valor |
|-------|-------|
| ID | HU 11 |
| Épica | Servicios al Participante |
| RF cubierto | RF-002.4 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como participante quiero consultar mis certificados ingresando mi número de documento para verificar cuáles tengo disponibles.

## Criterios de aceptación

- **CA-01:** El sistema valida que el documento ingresado exista en el sistema.
- **CA-02:** El sistema muestra la lista de certificados asociados al participante.
- **CA-03:** Los certificados vencidos aparecen marcados como "Expirado".
- **CA-04:** Si no hay certificados, muestra un mensaje informativo.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint GET /api/certificados?documento=X |
| Backend | Validar existencia del documento |
| Backend | Filtrar y retornar certificados con estado vigente/expirado |
| Base de datos | Agregar columna fecha_vencimiento en tabla certificado |
| Frontend | Campo de ingreso de documento |
| Frontend | Botón "Consultar" |
| Frontend | Lista de tarjetas de certificados con estado |
| Frontend | Mensaje si no hay resultados |
| QA | CP-21: Consultar con documento válido y con certificados |
| QA | CP-22: Consultar con documento válido sin certificados |
| QA | CP-23: Consultar con documento inexistente |

## Notas técnicas

- El participante solo puede visualizar sus propios certificados mediante validación por documento.
- La interfaz debe ser responsiva para dispositivos móviles.
