# HU 04 - Actualización de datos de personas

| Campo | Valor |
|-------|-------|
| ID | HU 04 |
| Épica | Gestión de Personas |
| RF cubierto | RF-001.3 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como personal administrativo quiero editar los datos de un participante o instructor para corregir información incorrecta o desactualizada.

## Criterios de aceptación

- **CA-01:** El sistema permite modificar campos editables del registro.
- **CA-02:** El sistema guarda los cambios y muestra confirmación.
- **CA-03:** El sistema registra quién, cuándo y qué campo fue modificado.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | Crear endpoint PUT /api/personas/:id |
| Backend | Registrar log de auditoría con usuario, fecha y campos modificados |
| Backend | Validar datos antes de actualizar |
| Base de datos | Crear tabla auditoria_personas: id_persona, campo, valor_anterior, valor_nuevo, usuario, fecha |
| Frontend | Formulario de edición prellenado con datos actuales |
| Frontend | Confirmación antes de guardar |
| Frontend | Mostrar historial de cambios |
| QA | CP-07: Editar nombre de un participante |
| QA | CP-08: Verificar que el log registra el cambio |

## Notas técnicas

- Solo usuarios con rol administrativo pueden editar.
- Las modificaciones no deben requerir reingreso completo del formulario.
