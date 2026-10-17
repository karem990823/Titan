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

## Estado de implementación

Implementada. Por convención del proyecto los endpoints viven bajo `/api/usuarios` (no `/api/personas`) y todos requieren rol Administrador:

| Endpoint | Uso |
|----------|-----|
| `GET /api/usuarios/{id}` | Datos actuales de la persona, para prellenar el formulario |
| `PUT /api/usuarios/{id}` | Actualiza solo los campos enviados; valida y registra la auditoría |
| `GET /api/usuarios/{id}/historial` | Historial de cambios (campo, valor anterior y nuevo, quién y cuándo) |

- **Validaciones:** nombre no vacío, números positivos, correo y documento (tipo + número) sin duplicar, tipo de documento y empresa existentes.
- **Auditoría:** tabla `auditoria_personas`; un registro por campo realmente modificado, guardado en la misma transacción que el cambio. Los IDs de catálogo (tipo de documento, rol, empresa) se guardan con su nombre. Un cambio de contraseña se registra como `[oculto]`, nunca su valor.
- **Frontend:** botón *Editar* en Usuarios (administradores, instructores, empresas) y en Trabajadores; el modal prellena los datos, pide confirmación listando los cambios y muestra el historial.
- **Pruebas:** `be/tests/test_actualizacion_personas.py` (CP-07 y CP-08, más validaciones y permisos).
- **Bases de datos existentes:** la tabla se crea sola al arrancar el backend (`create_all`); para una base nueva está en `base/titan.sql`.
