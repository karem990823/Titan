from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.security import hash_password


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_crear_usuario_caso_feliz(client, db_session, roles, admin_token):
    # Arrange
    payload = {
        "tipo_registro": "usuario",
        "nombre": "Laura",
        "apellido": "Gomez",
        "correo": "laura.gomez@test.com",
        "id_rol": roles["Instructor"].id_rol,
    }

    # Act
    res = client.post("/api/usuarios/", json=payload, headers=_headers(admin_token))

    # Assert: código, cuerpo y Content-Type
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/json"
    cuerpo = res.json()
    assert cuerpo["success"] is True
    assert cuerpo["data"]["correo"] == "laura.gomez@test.com"
    assert cuerpo["data"]["rol_nombre"] == "Instructor"
    assert cuerpo["data"]["estado_activo"] is True


def test_crear_usuario_con_correo_duplicado_responde_400(client, db_session, roles, admin_token):
    # Arrange: ya existe un usuario con ese correo
    existente = Usuario(
        tipo_registro="usuario", nombre="Ana", apellido="Ruiz",
        correo="ana.ruiz@test.com", password_hash=hash_password("123"),
        id_rol=roles["Instructor"].id_rol, estado_activo=True,
    )
    db_session.add(existente)
    db_session.commit()

    # Act
    res = client.post(
        "/api/usuarios/",
        json={
            "tipo_registro": "usuario",
            "nombre": "Ana",
            "correo": "ana.ruiz@test.com",
            "id_rol": roles["Instructor"].id_rol,
        },
        headers=_headers(admin_token),
    )

    # Assert
    assert res.status_code == 400
    detalle = res.json()["detail"]
    assert detalle["success"] is False
    assert detalle["error"] == "Ya existe un usuario registrado con ese correo"


def test_crear_usuario_con_rol_inexistente_responde_400(client, admin_token):
    # Act
    res = client.post(
        "/api/usuarios/",
        json={
            "tipo_registro": "usuario",
            "nombre": "Pedro",
            "correo": "pedro@test.com",
            "id_rol": 99999,
        },
        headers=_headers(admin_token),
    )

    # Assert
    assert res.status_code == 400
    assert res.json()["detail"]["error"] == "El rol indicado no existe"


def test_actualizar_usuario_inexistente_responde_404(client, admin_token):
    # Act
    res = client.put(
        "/api/usuarios/99999",
        json={"nombre": "No existe"},
        headers=_headers(admin_token),
    )

    # Assert
    assert res.status_code == 404
    assert res.json()["detail"]["error"] == "No existe un usuario con ese ID"


def test_desactivar_usuario_caso_feliz(client, db_session, roles, admin_token):
    # Arrange
    usuario = Usuario(
        tipo_registro="usuario", nombre="Marco", apellido="Diaz",
        correo="marco.diaz@test.com", password_hash=hash_password("123"),
        id_rol=roles["Instructor"].id_rol, estado_activo=True,
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)

    # Act
    res = client.patch(f"/api/usuarios/{usuario.id_usuario}/desactivar", headers=_headers(admin_token))

    # Assert
    assert res.status_code == 200
    cuerpo = res.json()
    assert cuerpo["success"] is True
    assert cuerpo["data"]["estado_activo"] is False
