from unittest.mock import MagicMock

import pytest

from App.Modulo_Cursos.controllers import usuario_controller
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.security import create_access_token, hash_password


@pytest.fixture(autouse=True)
def sin_smtp(monkeypatch):
    """STUB: esta integración prueba la BD, no el correo; evita conectarse al SMTP real."""
    monkeypatch.setattr(usuario_controller, "enviar_correo_crear_password", MagicMock(return_value=True))


@pytest.fixture()
def admin_headers(db_session, roles):
    admin = Usuario(
        tipo_registro="usuario", nombre="Admin", apellido="Titan",
        correo="admin@test.com", password_hash=hash_password("123"),
        id_rol=roles["Administrador"].id_rol, estado_activo=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    token = create_access_token(data={"sub": str(admin.id_usuario), "rol": "Administrador"})
    return {"Authorization": f"Bearer {token}"}


def _cuerpo(roles, **cambios) -> dict:
    base = {
        "tipo_registro": "usuario",
        "nombre": "Laura",
        "apellido": "Gomez",
        "correo": "laura@test.com",
        "id_rol": roles["Instructor"].id_rol,
    }
    return {**base, **cambios}


def test_crear_usuario_guarda_la_fila_en_la_bd_real(client, db_session, roles, admin_headers):
    # Act
    res = client.post("/api/usuarios/", json=_cuerpo(roles), headers=admin_headers)

    # Assert: la respuesta Y la fila en la BD
    assert res.status_code == 200
    guardado = db_session.query(Usuario).filter(Usuario.correo == "laura@test.com").one()
    assert guardado.nombre == "Laura"
    assert guardado.tipo_registro == "usuario"
    assert guardado.id_rol == roles["Instructor"].id_rol
    assert guardado.password_hash is None


def test_crear_usuario_con_correo_repetido_responde_400_y_no_duplica_la_fila(
    client, db_session, roles, empresa_a, admin_headers
):
    res = client.post("/api/usuarios/", json=_cuerpo(roles, correo="empresa-a@test.com"), headers=admin_headers)

    assert res.status_code == 400
    assert res.json()["detail"]["error"] == "Ya existe un usuario registrado con ese correo"
    assert db_session.query(Usuario).filter(Usuario.correo == "empresa-a@test.com").count() == 1


@pytest.mark.parametrize(
    ("campo", "valor"),
    [
        ("nombre", "a" * 151),                              # VARCHAR(150)
        ("apellido", "a" * 151),                            # VARCHAR(150)
        ("direccion", "a" * 201),                           # VARCHAR(200)
        ("correo", "a" * 64 + "@" + "b" * 40 + ".com"),     # VARCHAR(100): 109 caracteres
        ("numero_identificacion", 2**63),                   # BIGINT: uno más que el máximo
        ("telefono", 2**63),                                # BIGINT: uno más que el máximo
    ],
    ids=["nombre", "apellido", "direccion", "correo", "documento", "telefono"],
)
def test_una_violacion_de_columna_se_responde_como_422_no_como_500(
    client, roles, admin_headers, campo, valor
):
    res = client.post("/api/usuarios/", json=_cuerpo(roles, **{campo: valor}), headers=admin_headers)

    assert res.status_code == 422, res.text


def test_id_empresa_inexistente_se_responde_como_404_no_como_500(client, roles, admin_headers):
    res = client.post("/api/usuarios/", json=_cuerpo(roles, id_empresa=9999), headers=admin_headers)

    assert res.status_code == 404, res.text
    assert res.json()["detail"]["error"] == "La empresa indicada no existe"


def test_tipo_de_documento_inexistente_se_responde_como_400_no_como_500(client, roles, admin_headers):
    res = client.post(
        "/api/usuarios/",
        json=_cuerpo(roles, id_tipo=9999, numero_identificacion=1234),
        headers=admin_headers,
    )

    assert res.status_code == 400, res.text
    assert res.json()["detail"]["error"] == "El tipo de documento indicado no existe"