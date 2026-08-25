# TITAN

Sistema de información para **TITAN-ES SEGURIDAD EN ALTURAS SAS**, centro de entrenamiento en trabajo seguro en alturas. Automatiza la programación de cursos, la inscripción y documentación de trabajadores, la evaluación académica, la emisión de certificados y la facturación básica del centro.

## Acceso al sistema

El sistema tiene una única página pública y tres roles con credenciales:

| Quién | Acceso | Qué puede hacer |
|---|---|---|
| Participante / trabajador | Sin login, página pública (`/`) | Buscar por tipo + número de documento y descargar su certificado en PDF |
| Empresa (incluye independientes) | Login | Registrar sus trabajadores, subir sus documentos, inscribirlos en cursos, descargar sus certificados |
| Instructor | Login | Programar cursos, calificar evaluaciones, ver resultados |
| Administrador | Login | Todo lo anterior + gestión de cuentas, facturación e inventario |

## Estructura del repositorio

```
TITAN/
├── be/              Backend — FastAPI + SQLAlchemy + MySQL (ver be/README.md)
├── fe/               Frontend — React 19 + TypeScript + Vite (ver fe/README.md)
├── base/              Esquema y datos semilla de MySQL (titan.sql, inserts.sql)
├── docs/               Documentación funcional (ver abajo)
├── scripts/             start.sh / stop.sh — levantar y detener el stack con Docker
└── docker-compose.yml    Orquesta db + be + fe
```

## Cómo levantar el proyecto

Requiere Docker Desktop corriendo. Es la única vía soportada para correr el sistema completo (base de datos incluida):

```bash
./scripts/start.sh            # crea los .env que falten, construye y levanta db + be + fe
./scripts/stop.sh             # detiene los contenedores (conserva los datos)
./scripts/stop.sh --volumes   # detiene y borra también los datos de MySQL
```

Al terminar:
- Frontend: http://localhost:5173
- API: http://localhost:8000 · Swagger: http://localhost:8000/docs

Credenciales de prueba (semilla en `base/inserts.sql`):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `contacto@titan-es.com` | `empresa123` |
| Instructor | `carlos@titan-es.com` | `123` |
| Empresa | `contacto@constructora-andina.com` | `empresa123` |

## Documentación

Toda la documentación funcional vive en [`docs/`](./docs), en Markdown:

- [`docs/REQUISITOS/`](./docs/REQUISITOS) — requisitos funcionales (RF) y no funcionales (RNF)
- [`docs/HISTORIAS DE USUARIO/`](./docs/HISTORIAS%20DE%20USUARIO) — historias de usuario (HU)
- [`docs/CASOS DE USO/`](./docs/CASOS%20DE%20USO) — casos de uso (CU) detallados
- [`docs/RESTRICCIONES/`](./docs/RESTRICCIONES) — restricciones del proyecto
- [`docs/ARQUITECTURA/arquitectura.md`](./docs/ARQUITECTURA/arquitectura.md) — arquitectura, stack tecnológico y convenciones de código

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, JWT (`python-jose`), `passlib`/bcrypt, `fpdf2`
- **Frontend:** TypeScript, React 19, Vite, React Router, pnpm
- **Base de datos:** MySQL 8
- **Infraestructura:** Docker + Docker Compose

## Flujo de trabajo en Git

- `main` — exclusivamente producción, 100% funcional.
- `develop` — rama de integración sobre la que se apoyan todas las features.
- `feature/<nombre>` y `docs/<nombre>` — una rama por tarea, con PR hacia `develop`.
- Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat:`, `fix:`, `docs:`, etc.
- Dependencias siempre en versión exacta (sin `^`/`~`), auditadas con `pnpm audit` / `pip-audit` antes de fijar una versión nueva.
