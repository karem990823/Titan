# Reflexión sobre los backends vistos en el programa y deuda técnica de TITAN

## 1. Reflexión comparativa: Spring Boot, Express y FastAPI

A lo largo de la formación ADSO hemos visto tres frameworks de backend distintos — **Spring Boot** (Java), **Express** (Node.js) y **FastAPI** (Python) — aunque TITAN-ES se construyó siempre sobre el mismo: FastAPI. Esta reflexión compara los tres desde lo que vimos en clase de cada uno, y profundiza en FastAPI con evidencia real de haberlo usado en un proyecto completo durante varios meses.

### Spring Boot

Lo que más se nota viniendo de un lenguaje tipado como Java es cuánta estructura impone el framework desde el principio: anotaciones (`@RestController`, `@Service`, `@Repository`), inyección de dependencias nativa, y un compilador que detecta errores de tipo antes de ejecutar nada. Esa rigidez es una ventaja real en equipos grandes o proyectos de larga duración — es difícil que un error tonto de tipos llegue a producción. El costo es la cantidad de código repetitivo (boilerplate) y una curva de entrada más empinada: antes de escribir el primer endpoint ya hay que entender inversión de control, anotaciones y el ciclo de vida de un bean de Spring.

### Express

Es el extremo opuesto: minimalista, sin opiniones impuestas por el framework (no hay una única forma "correcta" de estructurar un proyecto), y con la flexibilidad de JavaScript/Node para prototipar rápido. Esa misma libertad es su mayor riesgo — un equipo sin disciplina termina con rutas, validación y lógica de negocio mezcladas en el mismo archivo, porque Express no obliga a separarlas. El tipado dinámico de JavaScript (o TypeScript, si se adopta aparte) también significa que errores que Spring Boot o FastAPI atraparían en el momento de escribir el código solo aparecen en tiempo de ejecución.

### FastAPI (el que usamos en TITAN)

FastAPI terminó siendo, para el tamaño y el plazo de este proyecto, un punto intermedio cómodo entre los otros dos:

- **Lo que más nos sirvió:**
  - **Pydantic como validación de entrada "gratis".** Definir un schema (`UsuarioCreate`, `ProgramacionBase`, etc.) con type hints de Python nos daba validación automática de tipos, campos requeridos y hasta reglas de negocio con `@model_validator` (ver `_validar_identificacion_empresa` en `usuario_schema.py`) — sin escribir una sola línea de código de validación manual.
  - **Documentación de la API automática.** `/docs` (Swagger) se generó solo a partir de los mismos schemas y rutas, sin mantener un archivo OpenAPI aparte que se desactualiza con el tiempo.
  - **Inyección de dependencias simple.** `Depends(get_db)`, `Depends(require_admin)` resolvieron tanto la sesión de base de datos como la autorización por rol con el mismo mecanismo, sin un contenedor de IoC tan pesado como el de Spring.
  - **Que sea Python de verdad.** Ningún "framework" encima del lenguaje: una función normal con type hints es un endpoint. Eso bajó bastante la curva de entrada para todo el equipo.

- **Dónde nos costó más (y por qué importa para la reflexión, no solo para quejarse):**
  - **Nada obliga a separar capas.** Como con Express, FastAPI no impone una estructura — la organización en `routes/`, `controllers/`, `models/`, `schemas/` que tiene TITAN fue una decisión nuestra, no del framework. Esto es justo lo que nos pasó con `App/Modulo_Cursos/`: planeamos separar por módulo de negocio y terminamos con un único paquete gigante (ver sección 2, deuda #1).
  - **Diferencias sutiles entre pruebas contra SQLite (en memoria, para los tests unitarios) y MySQL real.** Varias reglas que dependen de *constraints* reales de la base de datos (claves foráneas, `UNIQUE`, longitud de columna) no fallaban en los tests unitarios con SQLite, y solo se detectaron al correr pruebas de integración contra MySQL de verdad en la semana 6 del bootcamp de testing — encontramos así dos bugs reales (un `id_tipo` inexistente reventaba con 500 en vez de 400, y no existía validación de documento duplicado). Spring Boot, con Testcontainers como práctica común, empuja más naturalmente a probar contra la base real desde el principio; en FastAPI/SQLAlchemy esa disciplina hay que imponerla uno mismo.
  - **El manejo de errores es manual.** A diferencia de Spring Boot (que tiene `@ExceptionHandler` y una jerarquía de excepciones bastante estandarizada), en FastAPI cada `HTTPException` se levanta a mano en el controller. Terminamos con un patrón repetido (`_validar_X_existe`) que funciona pero que una capa de excepciones de dominio más formal habría hecho más consistente.

**Conclusión de la comparación:** no hay un framework objetivamente "mejor" — Spring Boot habría dado más garantías de tipo y estructura a costa de velocidad de desarrollo; Express habría sido más rápido para prototipar a costa de más disciplina manual. Para el tamaño de equipo, el plazo y el nivel de experiencia del grupo en este momento del programa, FastAPI fue el que permitió entregar más funcionalidad real sin sacrificar demasiada seguridad de tipos — el balance correcto no fue gratis: la parte de disciplina que Spring Boot habría impuesto por diseño, en FastAPI tuvimos que ponerla nosotros mismos (y, como el punto de las pruebas de integración lo muestra, no siempre a tiempo).

## 2. Deuda técnica documentada y priorizada

| # | Deuda | Impacto si no se atiende | Prioridad | Esfuerzo estimado |
|---|---|---|---|---|
| 1 | `App/Modulo_Cursos/` es un único paquete con todos los dominios de negocio, en vez de módulos verticales (`Modulo_Usuarios/`, `Modulo_Certificados/`...) como se planeó originalmente (ver `docs/ARQUITECTURA/arquitectura.md`, sección 6) | A medida que crece, cuesta más ubicar y aislar el código de un dominio; dos personas tocando dominios distintos siguen chocando en las mismas carpetas | Media | Alto — es una reorganización transversal, mejor hacerla con la suite de pruebas ya consolidada para detectar regresiones |
| 2 | Nomenclatura del código en español en vez de inglés (decisión documentada en el README) | Dificulta reusar librerías/ejemplos en inglés y onboarding de alguien externo al equipo | Baja | Alto si se hace retroactivo; se mitiga aplicando inglés solo a código nuevo |
| 3 | Token de sesión en `localStorage` en vez de cookie `httpOnly` (documentado en el README) | Expone el token ante un XSS exitoso | Media | Medio — migrar el cliente HTTP y el flujo de login/logout |
| 4 | Cobertura muy baja en generación de PDF (`pdf_certificado_equipo.py` 8%, `pdf_reporte.py` 11%) | Un cambio en esos archivos puede romper la generación de certificados/reportes sin que ninguna prueba lo detecte | Alta | Medio — requiere probar contra PDFs generados, no solo el código que los arma |
| 5 | Ningún endpoint valida de forma consistente las foreign keys antes de insertar (el patrón `_validar_X_existe` se fue agregando reactivamente, uno a la vez, según lo que las pruebas de integración contra MySQL real iban encontrando) | Nuevos endpoints pueden repetir el mismo bug (500 en vez de 400 ante un dato relacionado que no existe) | Alta | Bajo — ya existe el patrón, falta aplicarlo sistemáticamente y agregar un test de integración por cada FK nueva |
| 6 | Sin registro formal de defectos (el label `bug` de GitHub existe pero no se usa; los hallazgos viven dispersos en commits y comentarios de PR) | Se pierde trazabilidad de qué se encontró, cuándo y con qué severidad — y es justo lo que pide el criterio 9 de la rúbrica | Alta | Bajo — es un hábito, no una reescritura de código |
| 7 | El CI (`tests.yml`) corre las pruebas de backend pero no las de frontend ni las E2E | Un PR puede romper un componente de React o un flujo E2E y el pipeline queda igual de verde | Alta | Bajo — agregar los jobs ya existe como comando (`pnpm test`, `pnpm exec playwright test`), falta conectarlos al workflow |

**Nota sobre cómo se construyó esta tabla:** no es una lista teórica — cada fila salió de algo que realmente pasó durante el desarrollo (una decisión documentada en el README, un hallazgo de las pruebas de integración de la semana 6, una cobertura real medida con `pytest-cov`/`vitest --coverage`, o una revisión directa del `docker-ci.yml`/`tests.yml`). La prioridad combina impacto (¿puede producir un bug visible para el usuario final o un hueco de seguridad?) con qué tan barato es dejarlo para después sin que empeore.
