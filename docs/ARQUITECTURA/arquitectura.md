# Arquitectura General del Sistema — TITAN


---

## 1. Definición de Arquitectura de Software

La arquitectura de software se define como la estructura organizativa fundamental de un
sistema. Comprende los componentes de software, sus propiedades visibles externamente y
las relaciones entre ellos. Su propósito es establecer una base sólida que guíe el
desarrollo, garantice el cumplimiento de los atributos de calidad (escalabilidad,
seguridad, rendimiento) y facilite el mantenimiento a lo largo del ciclo de vida del
proyecto TITAN.

## 2. Selección y Justificación del Patrón Arquitectónico

Para el desarrollo del Sistema de Información de TITAN - ES SEGURIDAD EN ALTURAS S.A.S.,
se ha seleccionado una **Arquitectura Cliente-Servidor basada en servicios**, implementando
una API RESTful y una organización en capas (Routes → Controllers → Models/Schemas),
alineada con principios de Clean Architecture.

**Justificación técnica de la selección:**

- **Prevención de sobreingeniería:** dado que el sistema presenta un modelo de datos
  altamente relacional y un volumen de usuarios moderado, se descarta el uso de
  microservicios. Una arquitectura monolítica modular permite mantener la simplicidad,
  garantizar la integridad transaccional y reducir la complejidad operativa.
- **Separación de responsabilidades:** la división entre frontend y backend permite
  escalar cada componente de forma independiente, facilitando la integración futura de
  aplicaciones móviles o nuevos clientes sin modificar la lógica de negocio.
- **Escalabilidad y mantenibilidad:** el uso de una arquitectura por capas desacopla la
  lógica del sistema, facilitando pruebas, mantenimiento y evolución del software.

## 3. Stack Tecnológico

**Backend (Lógica de Negocio y API):**

- **Lenguaje:** Python
- **Framework:** FastAPI + Uvicorn (servidor ASGI)
- **ORM:** SQLAlchemy — mapea las clases de Python a las tablas de MySQL
- **Pydantic** — validación, serialización y documentación automática de la API
- **JWT (python-jose)** — autenticación y autorización de usuarios
- **Passlib + bcrypt** — cifrado seguro de contraseñas
- **fpdf2** — generación de certificados en PDF

**Frontend (Interfaz de Usuario):**

- **Lenguaje:** TypeScript (React 19 + Vite)
- **Gestor de dependencias:** pnpm — más rápido y eficiente en disco que npm gracias a su
  almacén de paquetes compartido (content-addressable store); además `pnpm install` es
  estricto con el árbol de dependencias, lo que evita el problema de "phantom
  dependencies" (usar un paquete que no está declarado directamente pero funciona porque
  otro paquete lo trajo de arrastre) que sí permite npm
- **Enrutamiento:** React Router
- Consumo de la API vía `fetch`/Axios

**Base de Datos (Persistencia):**

- **Motor:** MySQL 8 (relacional). Ideal para garantizar la integridad de las relaciones
  entre cursos, participantes, certificaciones y auditorías.

**Infraestructura:**

- **Contenedores:** Docker + Docker Compose (base de datos, backend y frontend)
- **Control de versiones:** Git y GitHub
- **Gestor de dependencias:** `pip` + `requirements.txt` (backend), `npm` + `package.json` (frontend)
- **Documentación de API:** Swagger/OpenAPI, autogenerado por FastAPI en `/docs`



---

## 4. Módulos del Sistema (Alcance General)

El sistema completo está organizado en 5 grandes módulos de negocio, derivados de los
requisitos funcionales (RF-001 a RF-005). Esta tabla resume el alcance total del proyecto
y sirve como referencia de avance frente al 100%:

| Módulo | RF | Alcance | Estado |
|---|---|---|---|
| **Gestión Académica y Operaciones** | RF-003 | Programación de cursos, inscripciones, calificaciones (por evaluación), gestión de equipos | 🟡 En progreso — falta asistencia (RF-003.3) y alertas de vencimiento (RF-003.6) |
| **Gestión de Usuarios y Roles** | RF-001 | Autenticación por rol, registro/búsqueda de participantes, registro documental por empresa, gestión de cuentas (admin) | 🟡 En progreso — falta historial integral (RF-001.4), incidentes (RF-001.6) y notificaciones (RF-001.7) |
| **Certificación, Reportería y Calidad** | RF-002 | Consulta y descarga pública de certificados (PDF) | 🟡 En progreso — falta cierre mensual/generación automática, QR, informes diarios y de auditoría |
| **Seguridad, Equipos y Reglas de Negocio** | RF-005 | Clasificación de cursos, requisitos previos (aptitud médica, reentrenamiento), inspección y certificación de equipos | 🟡 En progreso — falta control de aforo (RF-005.5) |
| **Integraciones Financieras y Pagos** | RF-004 | Registro interno de facturación y pagos (RF-004.2) | 🟡 En progreso — sin pasarela de pago real (RF-004.1) |

Detalle RF por RF en [`docs/REQUISITOS/2.functional_requirements.md`](../REQUISITOS/2.functional_requirements.md) — cada sub-requisito indica su propio estado.


---

## 5. Vista General del Sistema

El sistema sigue una **arquitectura Cliente–Servidor de 3 capas**, donde cada capa tiene
una responsabilidad única y se comunica solo con la capa adyacente:

```
┌──────────────────────────────────────────────────────────────────┐
│  CAPA 3 — CLIENTE (Navegador Web)                                 │
│                                                                    │
│  React 19 + TypeScript + Vite + React Router (pnpm)               │
│  http://localhost:5173                                            │
│                                                                    │
│  ┌──────────────┐   ┌───────────────────┐   ┌──────────────────┐  │
│  │  Features    │   │  Components        │   │  api/client.ts + │  │
│  │  (vistas por │   │  (Layout: Sidebar, │   │  constants        │  │
│  │  rol/área)   │   │  Header, RequireRole│  │  (color, API_*)  │  │
│  │              │   │  · UI: Field, Toast)│  │                  │  │
│  └──────┬───────┘   └─────────┬──────────┘   └──────────────────┘  │
│         └──────────────────────┘                                   │
│                     │ apiFetch (JSON + Bearer token)                │
└─────────────────────┼────────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  CAPA 2 — SERVIDOR (Backend API)                                  │
│                                                                    │
│  FastAPI + Uvicorn (ASGI)                                         │
│  http://localhost:8000                                            │
│                                                                    │
│  ┌────────────┐   ┌──────────────┐   ┌─────────────────────────┐  │
│  │  Routes    │ → │ Controllers  │ → │  Schemas (Pydantic) +    │  │
│  │ (endpoints)│   │  (lógica de  │   │  Models (SQLAlchemy ORM) │  │
│  │            │   │   negocio)   │   │                          │  │
│  └────────────┘   └──────────────┘   └─────────────────────────┘  │
│         Middleware (CORS, manejo de errores) — main.py            │
└─────────────────────┼──────────────────────────────────────────────┘
                       │ SQL (PyMySQL)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  CAPA 1 — DATOS (Base de Datos)                                   │
│                                                                    │
│  MySQL 8 (contenedor Docker)                                      │
│  localhost:3306                                                   │
│                                                                    │
│  cursos · programaciones · inscripciones · usuarios · roles ·     │
│  documentos · facturas · pagos · indumentaria · evaluaciones ·    │
│  certificados · salud ...                                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Arquitectura del Backend (convención general del proyecto)

En la práctica, todos los dominios de negocio (académico, usuarios/auth, documentos,
certificación, indumentaria, evaluaciones, pagos) viven hoy bajo un único paquete,
`App/Modulo_Cursos/`, organizado por capas horizontales (`routes/`, `controllers/`,
`models/`, `schemas/`) en vez de por módulos de negocio verticales:

```
App/
└── Modulo_Cursos/    ← único paquete de la aplicación; contiene TODOS los dominios
```

Dentro de `routes/`, `controllers/`, `models/` y `schemas/` sí hay un archivo por
entidad (`curso_routes.py`, `usuario_routes.py`, `documento_routes.py`,
`certificado_routes.py`, `auth_routes.py`, `factura_routes.py`, `indumentaria_routes.py`,
`evaluacion_routes.py`...), así que localizar el código de un RF concreto sigue siendo
directo — pero la separación en paquetes `Modulo_Usuarios/`, `Modulo_Certificados/`, etc.
que se planteó inicialmente no llegó a implementarse. Se documenta así, y no como se
planeó originalmente, para que esta guía siga siendo confiable.

### Estructura interna del paquete (`Modulo_Cursos/`)

```
App/Modulo_Cursos/
│
├── config/
│   ├── config.py        ← Lee variables de entorno (.env)
│   └── database.py      ← Engine + Session de SQLAlchemy, get_db()
│
├── routes/              ← CAPA DE PRESENTACIÓN (HTTP)
│   ├── curso_routes.py
│   ├── inscripcion_routes.py
│   ├── factura_routes.py
│   ├── pago_routes.py
│   └── ... (un archivo de rutas por entidad)
│
├── controllers/         ← CAPA DE LÓGICA DE NEGOCIO
│   ├── curso_controller.py     ← p.ej. inscribir_participante()
│   ├── pago_controller.py
│   └── ...
│
├── models/               ← CAPA DE DATOS (ORM)
│   ├── curso_model.py
│   ├── usuario_model.py
│   └── ...
│
├── schemas/              ← VALIDACIÓN (Pydantic)
│   ├── curso_schema.py
│   ├── inscripcion_schema.py
│   └── ...
│
├── middleware/
│   └── error_middleware.py   ← Registra CORS y manejo de errores
│
├── deps.py               ← get_current_user, require_roles(*roles) — guards de auth/rol
├── exceptions.py         ← Manejadores globales de excepciones
└── utils/
    ├── response.py         ← api_response(): formato estándar de respuesta
    ├── security.py          ← hash/verify de contraseñas (bcrypt) y JWT (create/decode)
    └── pdf_certificado.py     ← genera el PDF del certificado con fpdf2
```


**Responsabilidad de cada capa:**

| Capa | Responsabilidad | No debe hacer |
|---|---|---|
| `routes/` | Definir el endpoint HTTP, recibir el `Depends(get_db)` y delegar al controller | Contener lógica de negocio ni consultas SQL directas |
| `controllers/` | Validar reglas de negocio, orquestar la transacción, llamar al ORM | Formatear la respuesta HTTP directamente sin pasar por `utils/response.py` |
| `models/` | Definir las tablas y relaciones (SQLAlchemy) | Contener validaciones de negocio |
| `schemas/` | Validar y tipar lo que entra/sale de la API (Pydantic) | Acceder a la base de datos |

### Flujo de una petición — ejemplo real: inscribir un participante a un curso

```
1. Cliente envía:    POST /api/inscripciones/{id_programacion}  { id_usuario }
                     ↓
2. FastAPI valida    El schema `InscripcionBase` (Pydantic) valida el body.
   el body:          Si hay errores → 422 automático.
                     ↓
3. Route:            inscripcion_routes.py::inscribir()
                     Llama a curso_controller.inscribir_participante(db, id_prog, id_user)
                     ↓
4. Controller:       curso_controller.inscribir_participante():
                      - Abre una transacción anidada y bloquea la fila de la
                        programación (with_for_update) para evitar condiciones de carrera
                        si dos personas se inscriben al mismo cupo a la vez
                      - Valida cupos disponibles
                      - Valida que no exista una inscripción duplicada
                      - Valida aptitud médica del participante
                      - Valida requisito de reentrenamiento
                      - Crea la Inscripcion, descuenta un cupo, hace commit
                     ↓
5. Response:         Controller retorna api_response(success, message, data)
                     Route lo devuelve como JSON al cliente
```

Este flujo es un buen ejemplo para el resto del equipo porque muestra dónde va cada
responsabilidad: el *route* no sabe nada de cupos ni de reglas médicas, solo delega; toda
la lógica de negocio vive en el *controller*.

---

## 7. Arquitectura del Frontend (convención general del proyecto)

Con la migración a TypeScript, todo el código de `src/` pasa a `.tsx`/`.ts`, y se agrega
una carpeta `types/` para las interfaces compartidas (p. ej. `Curso`, `Participante`,
`Usuario`) consumidas por varios módulos.

### Estructura de carpetas

```
src/
│
├── main.tsx               ← Punto de entrada, monta <App /> con React Router
├── App.tsx                 ← Layout raíz + definición de rutas (<Routes>)
├── vite-env.d.ts            ← Tipos de entorno de Vite (import.meta.env)
│
├── api/
│   └── client.ts              ← apiFetch/apiFetchBlob: único cliente HTTP (auth header, manejo de 401)
│
├── components/
│   ├── Layout/              ← Sidebar, Header, RequireRole (guard de rutas por rol)
│   └── UI/                   ← Field, Toast, PageHeader (componentes reutilizables)
│
├── features/                 ← Un subdirectorio por área de negocio
│   ├── auth/                  ← AuthContext, LoginPage
│   ├── publico/                 ← Página pública de consulta/descarga de certificados
│   ├── academico/                ← Instructor/Admin: Dashboard, Calendario, ProgramarCurso,
│   │                                InscribirParticipante, Evaluaciones, EditarEvaluacion, Resultados
│   ├── empresa/                    ← RegistrarTrabajador, DocumentosTrabajador,
│   │                                  InscribirTrabajador, MisCertificados
│   └── admin/                        ← UsuariosAdmin, Facturacion, Inventario
│
├── types/                        ← Interfaces TypeScript compartidas entre módulos
│   └── index.ts
│
├── constants/
│   └── color.ts                  ← Paleta de colores + una constante API_* por router del backend
│
└── assets/                        ← Imágenes estáticas (logo, etc.)
```

**Convención:** cada carpeta dentro de `features/` corresponde a un área de negocio por
rol (auth, público, académico, empresa, admin), no a un módulo 1:1 del backend — el
backend en cambio sí organiza sus archivos por entidad dentro de `routes/`,
`controllers/`, etc. (ver sección 6). Los componentes que se repiten entre features van en
`components/`, nunca duplicados dentro de cada una.

---

## 8. Modelo de Datos

El modelo entidad-relación completo está versionado en `base/ER_TITAN.svg` (diagrama) y
`base/titan.sql` (script de creación). Este documento no lo duplica para evitar que
queden desincronizados — cualquier cambio al esquema debe reflejarse primero ahí.

---

## 9. Despliegue (Docker)

```
docker-compose.yml
├── db   → MySQL 8.4              (puerto 3306, datos persistidos en volumen)
├── be   → FastAPI/Uvicorn        (puerto 8000, depende de "db" healthy)
└── fe   → React + TS build (pnpm) servido con Nginx (puerto 5173, depende de "be")
```

Cada servicio tiene su propio `Dockerfile`. El del frontend usa `pnpm install --frozen-lockfile`
en la etapa de build (equivalente a `npm ci`: instala exactamente lo que dice
`pnpm-lock.yaml`, sin modificarlo). Las credenciales de base de datos se leen de variables
de entorno (`.env`, nunca versionado) — ver `docs/... /despliegue.md` para el detalle de
cómo levantar el entorno completo con `docker compose up --build`.
