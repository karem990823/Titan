# HU 24 - Gestión de cuentas de usuario

| Campo | Valor |
|-------|-------|
| ID | HU 24 |
| Épica | Seguridad y Control |
| RF cubierto | RF-001.8 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como administrador quiero crear, listar y desactivar cuentas de administradores, instructores y empresas para controlar quién tiene acceso al sistema.

## Criterios de aceptación

- **CA-01:** Solo el rol Administrador puede crear, listar, actualizar o desactivar cuentas.
- **CA-02:** El sistema rechaza la creación de una cuenta con un correo ya registrado.
- **CA-03:** Desactivar una cuenta es reversible desde la base de datos (borrado lógico, no físico) y le impide iniciar sesión de inmediato.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | `POST /api/usuarios` — crear cuenta (admin/instructor/empresa) con contraseña hasheada |
| Backend | `GET /api/usuarios` — listar con filtro por `tipo_registro` / `id_rol` |
| Backend | `PUT /api/usuarios/{id}` — actualizar datos y, opcionalmente, contraseña |
| Backend | `PATCH /api/usuarios/{id}/desactivar` — borrado lógico (`estado_activo=false`) |
| Frontend | `UsuariosAdmin.tsx` — formulario de creación + tabla con estado y acción de desactivar |
| QA | CP-01: Crear una cuenta Empresa y verificar que puede iniciar sesión |
| QA | CP-02: Intentar crear dos cuentas con el mismo correo → error |
| QA | CP-03: Desactivar una cuenta y verificar que el login subsiguiente falla |

## Notas técnicas

- El único punto de entrada para crear cuentas con acceso al sistema es este módulo; una Empresa nunca puede auto-asignarse el rol Administrador o Instructor (ver HU 25 para el auto-registro, limitado a trabajadores sin acceso).
