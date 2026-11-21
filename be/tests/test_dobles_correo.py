from unittest.mock import MagicMock

import pytest

from App.Modulo_Cursos.controllers import auth_controller, usuario_controller
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils import rate_limit
from App.Modulo_Cursos.utils.security import create_access_token, hash_password


@pytest.fixture(autouse=True)
def limpiar_intentos():
    """El limitador guarda estado global: cada test empieza sin intentos previos."""
    rate_limit._intentos.clear()
    yield
    rate_limit._intentos.clear()


@pytest.fixture()
def correo_restablecer(monkeypatch):
    """MOCK: reemplaza el envío donde se usa (auth_controller) y registra cómo lo llamaron."""
    doble = MagicMock(return_value=True)
    monkeypatch.setattr(auth_controller, "enviar_correo_restablecer_password", doble)
    return doble


@pytest.fixture()
def correo_activacion(monkeypatch):
    """STUB: responde True (envío exitoso); un test lo cambia a False (proveedor caído)."""
    doble = MagicMock(return_value=True)
    monkeypatch.setattr(usuario_controller, "enviar_correo_crear_password", doble)
    return doble


@pytest.fixture()
def admin_token(db_session, roles):
    admin = Usuario(
        tipo_registro="usuario", nombre="Admin", apellido="Titan",
        correo="admin@test.com", password_hash=hash_password("123"),
        id_rol=roles["Administrador"].id_rol, estado_activo=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return create_access_token(data={"sub": str(admin.id_usuario), "rol": "Administrador"})


def _nuevo_usuario(roles) -> dict:
    return {
        "tipo_registro": "usuario",
        "nombre": "Nuevo",
        "apellido": "Usuario",
        "correo": "nuevo@test.com",
        "id_rol": roles["Instructor"].id_rol,
    }


def test_olvide_password_envia_el_enlace_al_correo_registrado(client, empresa_a, correo_restablecer):
    # Doble: MOCK (verifica con qué se llamó)
    res = client.post("/api/auth/olvide-password", json={"correo": "empresa-a@test.com"})

    # Assert (comportamiento): una sola llamada, al destinatario correcto y con enlace de un solo uso
    assert res.status_code == 200
    correo_restablecer.assert_called_once()
    destinatario, nombre, enlace = correo_restablecer.call_args.args
    assert destinatario == "empresa-a@test.com"
    assert nombre == "Empresa A"
    assert "/crear-password?token=" in enlace


def test_olvide_password_no_envia_correo_si_la_cuenta_no_existe_y_responde_igual(
    client, empresa_a, correo_restablecer
):
    # Doble: MOCK (verifica que NO se llamó)
    existente = client.post("/api/auth/olvide-password", json={"correo": "empresa-a@test.com"})
    correo_restablecer.reset_mock()

    desconocido = client.post("/api/auth/olvide-password", json={"correo": "nadie@test.com"})

    # Comportamiento: no se envió nada. Estado: la respuesta no revela qué correos existen
    correo_restablecer.assert_not_called()
    assert desconocido.json() == existente.json()


def test_olvide_password_no_envia_correo_a_una_cuenta_inactiva(
    client, db_session, empresa_a, correo_restablecer
):
    # Doble: MOCK (verifica que NO se llamó)
    empresa_a.estado_activo = False
    db_session.commit()

    res = client.post("/api/auth/olvide-password", json={"correo": "empresa-a@test.com"})

    assert res.status_code == 200
    correo_restablecer.assert_not_called()


def test_crear_usuario_envia_el_correo_de_activacion_al_nuevo_usuario(
    client, roles, admin_token, correo_activacion
):
    # Doble: MOCK (verifica con qué se llamó)
    res = client.post(
        "/api/usuarios/", json=_nuevo_usuario(roles), headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert res.status_code == 200
    correo_activacion.assert_called_once()
    destinatario, _nombre, enlace = correo_activacion.call_args.args
    assert destinatario == "nuevo@test.com"
    assert "/crear-password?token=" in enlace
    assert "Se le envió un correo" in res.json()["message"]


def test_crear_usuario_resiste_si_el_correo_de_activacion_falla(
    client, db_session, roles, admin_token, correo_activacion
):
    # Doble: STUB del proveedor caído (enviar_correo devuelve False cuando SMTP falla)
    correo_activacion.return_value = False

    res = client.post(
        "/api/usuarios/", json=_nuevo_usuario(roles), headers={"Authorization": f"Bearer {admin_token}"}
    )

    # Estado: la cuenta quedó creada y el mensaje avisa del problema, sin error 500
    assert res.status_code == 200
    assert "no se pudo enviar el correo" in res.json()["message"]
    assert db_session.query(Usuario).filter(Usuario.correo == "nuevo@test.com").count() == 1