# HU 25 - Registro de trabajadores por empresa

| Campo | Valor |
|-------|-------|
| ID | HU 25 |
| Épica | Gestión de Personas |
| RF cubierto | RF-001.9 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como empresa (o independiente) quiero registrar a mis propios trabajadores para poder inscribirlos en cursos y gestionar su documentación, sin poder ver ni afectar los trabajadores de otras empresas.

## Criterios de aceptación

- **CA-01:** El trabajador queda asociado automáticamente a la empresa autenticada; el campo `id_empresa` nunca se recibe desde el cliente.
- **CA-02:** El trabajador registrado así no recibe correo ni contraseña — no puede iniciar sesión.
- **CA-03:** Una empresa solo ve, en su listado, a los trabajadores que ella misma registró.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | `POST /api/usuarios/trabajadores` — crea `Usuario` con `tipo_registro='trabajador'`, `id_rol=Participante`, `id_empresa` forzado al usuario autenticado |
| Backend | `GET /api/usuarios/trabajadores` — lista filtrada por `id_empresa == current_user.id_usuario` |
| Frontend | `RegistrarTrabajador.tsx` — formulario de alta + tabla de trabajadores propios |
| QA | CP-01: Registrar un trabajador y verificar que aparece en el listado de esa empresa |
| QA | CP-02: Verificar que otra empresa no puede ver ese trabajador en su propio listado |

## Notas técnicas

- Es la base para HU 26 (documentos) y para la inscripción de trabajadores en cursos (ver `InscribirTrabajador.tsx`), que reutiliza esta misma lista.
