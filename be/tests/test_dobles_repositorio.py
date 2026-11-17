from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from App.Modulo_Cursos.controllers import usuario_controller
from App.Modulo_Cursos.controllers.usuario_controller import crear_usuario
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.schemas.usuario_schema import UsuarioCreate


@pytest.fixture()
def correo(monkeypatch):
    """STUB + SPY: el envío siempre sale bien, y registra si se intentó enviar."""
    doble = MagicMock(return_value=True)
    monkeypatch.setattr(usuario_controller, "enviar_correo_crear_password", doble)
    return doble


@pytest.fixture()
def repo(db_session):
    """SPY sobre la sesión: la base real de prueba sigue funcionando, pero se registran add y commit.

    Las fixtures de datos (roles, empresa_a) deben ir ANTES que `repo` en los parámetros
    del test; así sus propios add/commit no se cuentan.
    """
    with patch.object(db_session, "add", wraps=db_session.add) as add, \
         patch.object(db_session, "commit", wraps=db_session.commit) as commit:
        yield db_session, add, commit


def _datos(id_rol, **cambios) -> UsuarioCreate:
    base = {
        "tipo_registro": "usuario",
        "nombre": "Laura",
        "apellido": "Gomez",
        "correo": "laura@test.com",
        "id_rol": id_rol,
    }
    return UsuarioCreate(**{**base, **cambios})


def test_crear_usuario_con_rol_inexistente_no_guarda_nada_ni_envia_correo(correo, repo):
    # Doble: SPY sobre el repositorio (verifica que NO se guardó)
    db, add, commit = repo

    with pytest.raises(HTTPException) as error:
        crear_usuario(db, _datos(id_rol=9999))

    assert error.value.status_code == 400
    assert error.value.detail["error"] == "El rol indicado no existe"
    add.assert_not_called()
    commit.assert_not_called()
    correo.assert_not_called()
    assert db.query(Usuario).filter(Usuario.correo == "laura@test.com").count() == 0


def test_crear_usuario_con_correo_duplicado_no_guarda_otro_ni_envia_correo(roles, empresa_a, correo, repo):
    # Doble: SPY sobre el repositorio (verifica que NO se guardó)
    db, add, commit = repo

    with pytest.raises(HTTPException) as error:
        crear_usuario(db, _datos(id_rol=roles["Instructor"].id_rol, correo="empresa-a@test.com"))

    assert error.value.status_code == 400
    assert error.value.detail["error"] == "Ya existe un usuario registrado con ese correo"
    add.assert_not_called()
    commit.assert_not_called()
    correo.assert_not_called()
    assert db.query(Usuario).filter(Usuario.correo == "empresa-a@test.com").count() == 1


def test_crear_usuario_valido_guarda_sin_contrasena_y_envia_el_correo(roles, correo, repo):
    # Dobles: SPY sobre el repositorio + STUB del correo
    db, add, commit = repo

    respuesta = crear_usuario(db, _datos(id_rol=roles["Instructor"].id_rol))

    # Comportamiento: lo primero que se agregó es el usuario y se confirmó la transacción
    nuevo = add.call_args_list[0].args[0]
    assert isinstance(nuevo, Usuario)
    assert nuevo.correo == "laura@test.com"
    commit.assert_called()
    correo.assert_called_once()
    # Estado: quedó guardado y sin contraseña (la crea la persona con el enlace)
    guardado = db.query(Usuario).filter(Usuario.correo == "laura@test.com").one()
    assert guardado.password_hash is None
    assert respuesta["success"] is True