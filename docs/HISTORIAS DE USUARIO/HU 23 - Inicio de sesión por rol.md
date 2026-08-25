# HU 23 - Inicio de sesión por rol

| Campo | Valor |
|-------|-------|
| ID | HU 23 |
| Épica | Seguridad y Control |
| RF cubierto | RF-001.8 |
| Prioridad | Alta |
| Versión | 1.0 |

## Historia de usuario

Yo como administrador, instructor o empresa quiero iniciar sesión con mi correo y contraseña para acceder únicamente a las funciones que corresponden a mi rol.

## Criterios de aceptación

- **CA-01:** El sistema autentica con correo + contraseña y devuelve un token de sesión válido por 8 horas.
- **CA-02:** Una cuenta con rol Participante no puede iniciar sesión; el sistema muestra un mensaje indicando que debe usar la página pública de certificados.
- **CA-03:** Una cuenta desactivada no puede iniciar sesión.
- **CA-04:** Cada endpoint protegido responde 401 sin token y 403 si el rol autenticado no tiene permiso para esa acción.

## Tareas técnicas

| Capa | Tarea |
|------|-------|
| Backend | `POST /api/auth/login` — validar credenciales, verificar rol permitido, emitir JWT |
| Backend | `GET /api/auth/me` — devolver el usuario autenticado a partir del token |
| Backend | `deps.py` — `get_current_user` y `require_roles(*roles)` reutilizables en cada router |
| Backend | Hash de contraseñas con `passlib`/bcrypt; nunca almacenar texto plano |
| Frontend | `AuthContext` + `useAuth()` — persistir token en `localStorage`, restaurar sesión con `/me` |
| Frontend | `LoginPage.tsx` y `RequireRole.tsx` — formulario y guard de rutas por rol |
| QA | CP-01: Login exitoso por cada uno de los 3 roles |
| QA | CP-02: Login con cuenta Participante → rechazado con mensaje específico |
| QA | CP-03: Acceso a ruta protegida sin token → 401 |
| QA | CP-04: Acceso con rol insuficiente (ej. Instructor a facturación) → 403 |

## Notas técnicas

- El token incluye `sub` (id de usuario) y `rol`; el rol se resuelve siempre contra la tabla `roles` en cada petición, nunca se confía únicamente en el valor del token.
- Sin refresh token en esta versión: al expirar el token de 8 horas, el usuario debe volver a iniciar sesión.
