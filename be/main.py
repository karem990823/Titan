from fastapi import FastAPI
from App.Modulo_Cursos.routes import (
    accidente_routes,
    asistencia_routes,
    auth_routes,
    certificado_indumentaria_routes,
    certificado_routes,
    curso_routes,
    dashboard_routes,
    detalle_factura_routes,
    documento_routes,
    evaluacion_presentada_routes,
    evaluacion_routes,
    factura_routes,
    indumentaria_routes,
    inspeccion_indumentaria_routes,
    inscripcion_routes,
    metodo_pago_routes,
    pago_routes,
    pregunta_routes,
    programacion_routes,
    reporte_routes,
    respuesta_routes,
    resultado_routes,
    rol_routes,
    salud_routes,
    tipo_accidente_routes,
    tipo_identificacion_routes,
    usuario_routes
)
from App.Modulo_Cursos.config.database import engine, Base
from App.Modulo_Cursos.middleware.error_middleware import register_middlewares
from fastapi.exceptions import RequestValidationError
from App.Modulo_Cursos.exceptions import (
    validation_exception_handler,
    general_exception_handler
)


# Nota: crear las tablas en el evento de arranque para evitar errores
# durante la importación si la base de datos no está disponible.

# 2. Inicializar la aplicación FastAPI
app = FastAPI(
    title="TITAN - Centro de Entrenamiento en Alturas",
    description="Módulo de Gestión de Cursos e Inscripciones",
    version="1.0.0"
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)


app.add_exception_handler(
    Exception,
    general_exception_handler
)
# Registrar middlewares (CORS y manejo de errores)
register_middlewares(app)


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("Tablas de la base de datos creadas (si no existían)")
    except Exception as e:
        print(f"Advertencia: no se pudieron crear las tablas: {e}")

# 4. Incluir las rutas del Módulo de Cursos
# Aquí conectamos el router que creamos en curso_routes.py
app.include_router(auth_routes.router)
app.include_router(curso_routes.router)
app.include_router(programacion_routes.router)
app.include_router(inscripcion_routes.router)
app.include_router(usuario_routes.router)
app.include_router(tipo_identificacion_routes.router)
app.include_router(salud_routes.router)
app.include_router(certificado_routes.router)
app.include_router(certificado_indumentaria_routes.router)
app.include_router(detalle_factura_routes.router)
app.include_router(documento_routes.router)
app.include_router(evaluacion_presentada_routes.router)
app.include_router(evaluacion_routes.router)
app.include_router(factura_routes.router)
app.include_router(indumentaria_routes.router)
app.include_router(inspeccion_indumentaria_routes.router)
app.include_router(metodo_pago_routes.router)
app.include_router(pago_routes.router)
app.include_router(pregunta_routes.router)
app.include_router(respuesta_routes.router)
app.include_router(resultado_routes.router)
app.include_router(rol_routes.router)
app.include_router(asistencia_routes.router)
app.include_router(accidente_routes.router)
app.include_router(tipo_accidente_routes.router)
app.include_router(reporte_routes.router)
app.include_router(dashboard_routes.router)

# 5. Ruta de bienvenida (opcional)
@app.get("/")
def root():
    return {
        "mensaje": "Bienvenido a la API de TITAN",
        "modulo": "Gestión Académica",
        "estado": "Online"
    }

