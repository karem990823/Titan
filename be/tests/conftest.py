import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from App.Modulo_Cursos.config.database import Base, get_db
from App.Modulo_Cursos.models.curso_model import Curso
from App.Modulo_Cursos.models.rol_model import Rol
from App.Modulo_Cursos.models.tipo_identificacion_model import TipoIdentificacion
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.security import create_access_token, hash_password
from main import app


@pytest.fixture()
def db_engine(tmp_path):
    # Archivo SQLite real (no :memory:) para que cada hilo de la prueba de
    # concurrencia obtenga su propia conexión de verdad, en vez de compartir
    # un único objeto de conexión entre hilos — el driver sqlite3 de Python no
    # es seguro para eso incluso con check_same_thread=False, y produce fallos
    # intermitentes ("bad parameter or other API misuse") que no tienen nada
    # que ver con la lógica de negocio que se quiere probar. Con conexiones
    # separadas sobre el mismo archivo, el locking real de SQLite (con
    # timeout para esperar en vez de fallar) sí serializa escritores.
    db_path = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False, "timeout": 30},
    )

    @event.listens_for(engine, "connect")
    def _set_busy_timeout(dbapi_connection, _):
        dbapi_connection.execute("PRAGMA busy_timeout = 30000")

    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()
    if db_path.exists():
        os.remove(db_path)


@pytest.fixture()
def session_factory(db_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=db_engine)


@pytest.fixture()
def db_session(session_factory):
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(session_factory):
    # Cada request crea su propia Session (igual que get_db en producción) para
    # que la prueba de concurrencia ejercite sesiones separadas por hilo, tal
    # como pasaría con conexiones separadas del pool contra MySQL real.
    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture()
def roles(db_session):
    nombres = ["Administrador", "Instructor", "Participante", "Empresa"]
    creados = {}
    for nombre in nombres:
        r = Rol(nombre_rol=nombre)
        db_session.add(r)
        db_session.flush()
        creados[nombre] = r
    db_session.commit()
    return creados


@pytest.fixture()
def tipo_cc(db_session):
    tipo = TipoIdentificacion(nombre="CC")
    db_session.add(tipo)
    db_session.commit()
    db_session.refresh(tipo)
    return tipo


@pytest.fixture()
def instructor(db_session, roles):
    usuario = Usuario(
        tipo_registro="usuario", nombre="Carlos", apellido="Ramirez",
        correo="carlos@test.com", password_hash=hash_password("123"),
        id_rol=roles["Instructor"].id_rol, estado_activo=True,
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture()
def instructor_token(instructor):
    return create_access_token(data={"sub": str(instructor.id_usuario), "rol": "Instructor"})


@pytest.fixture()
def empresa_a(db_session, roles):
    usuario = Usuario(
        tipo_registro="empresa", nombre="Empresa A",
        correo="empresa-a@test.com", password_hash=hash_password("123"),
        id_rol=roles["Empresa"].id_rol, estado_activo=True,
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture()
def empresa_b(db_session, roles):
    usuario = Usuario(
        tipo_registro="empresa", nombre="Empresa B",
        correo="empresa-b@test.com", password_hash=hash_password("123"),
        id_rol=roles["Empresa"].id_rol, estado_activo=True,
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture()
def empresa_b_token(empresa_b):
    return create_access_token(data={"sub": str(empresa_b.id_usuario), "rol": "Empresa"})


@pytest.fixture()
def curso(db_session):
    c = Curso(nombre_curso="Trabajador Autorizado", intensidad_horaria=32)
    db_session.add(c)
    db_session.commit()
    db_session.refresh(c)
    return c


@pytest.fixture()
def curso_reentrenamiento(db_session):
    c = Curso(nombre_curso="Reentrenamiento", intensidad_horaria=8)
    db_session.add(c)
    db_session.commit()
    db_session.refresh(c)
    return c


