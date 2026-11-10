"""Semana 4 - Pruebas de API, angulo E2E: seguridad y contrato de errores.

Usa los fixtures de conftest.py (client, db_session, roles, instructor_token),
asi que no levanta servidor ni toca MySQL: la BD es SQLite en archivo temporal.
"""
import pytest

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.security import create_access_token, hash_password
from main import app


def _headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_token(db_session, roles):
    admin = Usuario(
        tipo_registro="usuario", nombre="Ana", apellido="Admin",
        correo="admin-s4@test.com", password_hash=hash_password("123"),
        id_rol=roles["Administrador"].id_rol, estado_activo=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return create_access_token(data={"sub": str(admin.id_usuario), "rol": "Administrador"})


# --- Endpoint protegido: GET /api/alertas/ (solo Administrador) -------------

def test_listar_alertas_sin_token_responde_401_con_contrato_json(client):
    res = client.get("/api/alertas/")

    assert res.status_code == 401
    assert res.headers["content-type"] == "application/json"
    assert res.json()["detail"]["success"] is False


def test_listar_alertas_con_token_basura_responde_401(client):
    res = client.get("/api/alertas/", headers=_headers("esto.no.es.un.jwt"))

    assert res.status_code == 401


def test_listar_alertas_con_rol_insuficiente_responde_403(client, instructor_token):
    res = client.get("/api/alertas/", headers=_headers(instructor_token))

    assert res.status_code == 403
    assert res.json()["detail"]["success"] is False


def test_listar_alertas_como_administrador_responde_200(client, admin_token):
    res = client.get("/api/alertas/", headers=_headers(admin_token))

    assert res.status_code == 200


# --- Contrato de errores ----------------------------------------------------

def test_login_con_json_mal_formado_responde_400_con_detail(client):
    # OJO: verifica que la ruta real sea /api/auth/login (mira /docs)
    res = client.post(
        "/api/auth/login",
        content='{"correo":',
        headers={"Content-Type": "application/json"},
    )

    assert res.status_code == 400
    assert res.headers["content-type"] == "application/json"
    assert "Traceback" not in res.text


def test_error_interno_responde_500_sin_filtrar_sql_ni_stack_trace(client):
    def get_db_roto():
        raise RuntimeError("SELECT * FROM usuarios WHERE password_hash = 'x'")
        yield  # noqa: hace que sea generador, como el get_db real

    app.dependency_overrides[get_db] = get_db_roto

    res = client.get("/api/alertas/", headers=_headers("cualquiera"))

    assert res.status_code == 500
    assert "id_correlacion" in res.json()
    for filtrado in ("SELECT", "Traceback", "RuntimeError"):
        assert filtrado not in res.text
