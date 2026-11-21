import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from main import app


@pytest.fixture(scope="session")
def mysql_engine():
    """Motor hacia la BD de pruebas desechable. Sin TEST_DATABASE_URL la integración se salta."""
    url = os.getenv("TEST_DATABASE_URL")
    if not url:
        pytest.skip("Define TEST_DATABASE_URL para correr la integración (ver README).")
    if not url.endswith("_test"):
        pytest.fail("TEST_DATABASE_URL debe apuntar a una BD que termine en _test, nunca a la de desarrollo.")
    engine = create_engine(url)
    yield engine
    engine.dispose()


@pytest.fixture()
def db_session(mysql_engine):
    """Cada test corre dentro de una transacción que nunca se confirma (rollback al final).

    create_savepoint convierte los commit() del código bajo prueba en savepoints.
    """
    with mysql_engine.connect() as conexion:
        transaccion = conexion.begin()
        sesion = Session(bind=conexion, join_transaction_mode="create_savepoint")
        yield sesion
        sesion.close()
        transaccion.rollback()


@pytest.fixture()
def client(db_session):
    """Cliente HTTP con la misma sesión del test; un 500 llega como respuesta, no como excepción."""
    app.dependency_overrides[get_db] = lambda: db_session
    yield TestClient(app, raise_server_exceptions=False)
    app.dependency_overrides.clear()