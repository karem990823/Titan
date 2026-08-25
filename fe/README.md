# Frontend TITAN

Interfaz de usuario del sistema TITAN. React 19 + TypeScript + Vite, con tres áreas separadas por rol (Empresa, Instructor, Administrador) y una página pública de descarga de certificados.

## Características principales

- **Página pública (`/`):** consulta y descarga de certificado por tipo + número de documento, sin necesidad de iniciar sesión.
- **Login por rol (`/login`):** Administrador, Instructor o Empresa; cada uno ve solo la navegación y las rutas que le corresponden (`RequireRole`).
- **Empresa:** registro de trabajadores propios, carga y consulta de sus documentos, inscripción a cursos, descarga de sus certificados.
- **Instructor:** calendario, programación de cursos, inscripción de participantes, gestión de evaluaciones (preguntas/respuestas) y calificación.
- **Administrador:** todo lo anterior + gestión de cuentas de usuario, facturación e inventario de equipos.

## Estructura

```
src/
├── api/client.ts          Cliente fetch único: inyecta el token, maneja 401, parsea errores
├── features/
│   ├── auth/                AuthContext, LoginPage
│   ├── publico/               Página pública de consulta de certificados
│   ├── academico/               Calendario, cursos, evaluaciones (Instructor/Admin)
│   ├── empresa/                   Trabajadores, documentos, inscripción, certificados
│   └── admin/                      Usuarios, facturación, inventario
├── components/Layout/         Sidebar, Header, RequireRole
├── components/UI/               Field, Toast, PageHeader
├── constants/color.ts             Paleta + constantes API_* (una por router del backend)
└── types/index.ts                  Interfaces TypeScript compartidas
```

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/) — este proyecto usa `pnpm-lock.yaml`, no `package-lock.json`. Instálalo con `corepack enable` o `npm install -g pnpm`.

## Instalación y desarrollo local

```bash
pnpm install
pnpm run dev       # http://localhost:5173, con proxy de /api hacia el backend (ver vite.config.ts)
```

Por defecto el proxy de desarrollo apunta a `http://localhost:8000`. Para apuntar a otro backend, define `VITE_API_URL` en un `.env` local (ver `.env.example`).

## Otros comandos

```bash
pnpm run build      # tsc -b && vite build
pnpm run lint        # eslint .
pnpm run preview      # sirve el build de producción localmente
```

## Conexión con el backend

El backend expone cada dominio bajo su propio router (`/api/auth`, `/api/cursos`, `/api/programaciones`, `/api/inscripciones`, `/api/usuarios`, `/api/documentos`, `/api/certificados`, `/api/evaluaciones`, `/api/facturas`, `/api/indumentaria`, etc. — ver `be/main.py`), no un único endpoint base. Cada uno tiene su constante `API_*` en `src/constants/color.ts`.

Todas las llamadas pasan por `apiFetch`/`apiFetchBlob` en `src/api/client.ts`, que agrega el header `Authorization: Bearer <token>` automáticamente y redirige a `/login` si el backend responde 401 — nunca se debe usar `fetch()` directamente en una página nueva.

## Docker

En producción no se usa `pnpm run dev`: `fe.Dockerfile` construye el bundle (`pnpm run build`) y lo sirve con Nginx, que además hace de reverse proxy de `/api/*` hacia el contenedor `be` (ver `nginx.conf`). El flujo recomendado para correr todo el stack es `../scripts/start.sh` desde la raíz del repositorio, no ejecutar este frontend de forma aislada.
