from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from App.Modulo_Cursos.routes import curso_routes
from App.Modulo_Cursos.config.database import engine, Base

# 1. Crear las tablas en la base de datos
# Esto asegura que SQLAlchemy reconozca las tablas definidas en los modelos
Base.metadata.create_all(bind=engine)

# 2. Inicializar la aplicación FastAPI
app = FastAPI(
    title="TITAN - Centro de Entrenamiento en Alturas",
    description="Módulo de Gestión de Cursos e Inscripciones",
    version="1.0.0"
)

# 3. Configurar CORS 
# Esto permite que el frontend (React, Vue o HTML) se comunique con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"], # Permitir todos los métodos (GET, POST, etc)
    allow_headers=["*"],
)

# 4. Incluir las rutas del Módulo de Cursos
# Aquí conectamos el router que creamos en curso_routes.py
app.include_router(curso_routes.router)

# 5. Ruta de bienvenida (opcional)
@app.get("/")
def root():
    return {
        "mensaje": "Bienvenido a la API de TITAN",
        "modulo": "Gestión Académica",
        "estado": "Online"
    }

# Para ejecutar la aplicación, usa el siguiente comando en la terminal:
# uvicorn main:app --reload