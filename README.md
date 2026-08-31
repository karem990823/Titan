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

## Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Docker Desktop | reciente, con Compose v2 | Única vía soportada para correr el sistema completo |
| Python | 3.12 | Backend, solo si lo corres fuera de Docker |
| Node.js | 20 o superior | Requisito de Vite 8, solo si corres el frontend fuera de Docker |
| pnpm | 9.12.0 (fijado en `packageManager` de `fe/frontend-titan/package.json`) | Gestor de paquetes del frontend — nunca `npm` |

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

## Correr sin Docker

Pensado solo para desarrollo puntual del backend o frontend por separado — requiere una instancia de MySQL 8 corriendo aparte (con el esquema de `base/titan.sql` y, opcionalmente, `base/inserts.sql`) y sus datos de conexión en `be/.env`.

**Backend:**
```bash
cd be
python -m venv .venv
.venv\Scripts\activate        # Windows — en Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # editar DB_HOST=localhost y las credenciales reales
uvicorn main:app --reload
```

**Frontend:**
```bash
cd fe/frontend-titan
pnpm install
cp ../frontend.env.example .env
pnpm dev
```

## Variables de entorno

Cada `.env.example` del repo tiene su propio propósito — no son intercambiables:

**`root.env.example`** (raíz — copiar como `.env`, la lee `docker-compose.yml` para crear la base de datos):

| Variable | Significado |
|---|---|
| `DB_NAME` | Nombre de la base de datos MySQL |
| `DB_USER` | Usuario de aplicación (no root) para conectarse a MySQL |
| `DB_PASSWORD` | Contraseña de `DB_USER` |
| `DB_ROOT_PASSWORD` | Contraseña del usuario `root` de MySQL, usada solo al inicializar el contenedor |

**`be/.env.example`** (copiar como `be/.env`; dentro de Docker, `DB_HOST` se sobreescribe a `db` automáticamente):

| Variable | Significado |
|---|---|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Conexión a MySQL — deben coincidir con `root.env.example` |
| `JWT_SECRET_KEY` | Secreto para firmar los tokens de sesión. **Nunca uses el valor de ejemplo**: `start.sh` genera uno real automáticamente, y el backend rechaza arrancar si detecta el placeholder o un secreto de menos de 32 caracteres |
| `JWT_ALGORITHM` | Algoritmo de firma del JWT (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de vigencia de la sesión (60 por defecto) |
| `UPLOADS_DIR` | Carpeta donde se guardan los documentos y evidencias subidos |

**`fe/frontend.env.example`** (copiar como `fe/frontend-titan/.env`):

| Variable | Significado |
|---|---|
| `VITE_API_URL` | URL base del backend que consume el frontend |

**`base/.env.example`** (para correr solo la base de datos fuera del stack completo, con `base/docker-compose.yml`): mismas 4 variables que `root.env.example`.

## Pruebas

```bash
docker compose exec be pytest -v          # con el stack ya levantado
# o, fuera de Docker, con el venv del backend activo:
cd be && pytest -v
```

Cubren las 5 validaciones de negocio de `inscribir_participante` (cupos, inscripción duplicada, aptitud médica, requisito de reentrenamiento, trabajador ajeno a la empresa) y una prueba de concurrencia (5 inscripciones simultáneas sobre el último cupo, verificando que no hay sobreventa).

## Auditoría de dependencias

Antes de fijar cualquier versión nueva:

```bash
cd fe/frontend-titan && pnpm audit --audit-level moderate
cd be && uvx pip-audit -r requirements.txt
```

El CI (`.github/workflows/docker-ci.yml`) corre ambos comandos en cada PR hacia `develop`/`main` (ignorando explícitamente `PYSEC-2026-1325` de `ecdsa`, transitivo vía `python-jose` — sin fix publicado en ningún lado a la fecha; cualquier vulnerabilidad nueva sigue rompiendo el build).

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

## Cómo contribuir

1. Parte siempre de `develop` actualizado: `git checkout develop && git pull`.
2. Crea una rama por tarea: `feature/<nombre>` para funcionalidad nueva, `fix/<nombre>` para correcciones, `docs/<nombre>` para documentación.
3. Commits en [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat:`, `fix:`, `docs:`), en español, describiendo el porqué del cambio.
4. Antes de abrir el PR: `pnpm run lint` y `tsc --noEmit` en `fe/frontend-titan`, `pytest` en `be`, y probar con `./scripts/start.sh` que el stack completo levanta.
5. Abre el PR hacia `develop` — nunca hacia `main`, y nunca push directo a ninguna de las dos. `main` solo recibe PRs desde `develop` cuando ese estado ya es 100% funcional.

## Flujo de trabajo en Git

- `main` — exclusivamente producción, 100% funcional.
- `develop` — rama de integración sobre la que se apoyan todas las features.
- `feature/<nombre>` y `docs/<nombre>` — una rama por tarea, con PR hacia `develop`.
- Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat:`, `fix:`, `docs:`, etc.
- Dependencias siempre en versión exacta (sin `^`/`~`), auditadas con `pnpm audit` / `pip-audit` antes de fijar una versión nueva (ver [Auditoría de dependencias](#auditoría-de-dependencias)).

## Decisiones de alcance documentadas

- **Nomenclatura en español**: el código (archivos, funciones, variables, rutas) está en español, no en inglés. Es una desviación consciente frente a la convención técnica habitual — renombrar el proyecto completo sin una batería de pruebas exhaustiva introduce un riesgo de regresión desproporcionado. Se aplicará nomenclatura en inglés a todo código nuevo y se documenta como deuda técnica planificada.
- **Token de sesión en `localStorage`**: expone el token a cualquier script que corra en la página (XSS). Se mitigó reduciendo la vigencia a 60 minutos y agregando límite de intentos de login (5 por 15 min, por IP+correo) en vez de migrar a cookies `httpOnly`, que habría requerido cambios más amplios en el cliente HTTP. Riesgo residual aceptado para el alcance formativo de este proyecto.
