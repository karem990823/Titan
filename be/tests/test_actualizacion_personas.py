"""HU 04 — Actualización de datos de personas (CP-07 y CP-08, más validaciones)."""
import pytest

from App.Modulo_Cursos.models.auditoria_persona_model import AuditoriaPersona
from App.Modulo_Cursos.models.tipo_identificacion_model import TipoIdentificacion
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.security import create_access_token, hash_password
from tests.helpers import crear_trabajador_apto


@pytest.fixture()
def admin(db_session, roles):
    usuario = Usuario(
        tipo_registro="usuario", nombre="Ana", apellido="Admin",
        correo="admin@test.com", password_hash=hash_password("123"),
        id_rol=roles["Administrador"].id_rol, estado_activo=True,
    )
    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)
    return usuario


@pytest.fixture()
def admin_token(admin):
    return create_access_token(data={"sub": str(admin.id_usuario), "rol": "Administrador"})


@pytest.fixture()
def empresa_a_token(empresa_a):
    return create_access_token(data={"sub": str(empresa_a.id_usuario), "rol": "Empresa"})


def _h(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def trabajador(db_session, roles, tipo_cc, empresa_a):
    return crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=5001, con_salud=False)


def test_cp07_editar_nombre_de_participante(client, admin_token, trabajador, db_session):
    res = client.put(
        f"/api/usuarios/{trabajador.id_usuario}",
        json={"nombre": "Marcos"},
        headers=_h(admin_token),
    )

    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["nombre"] == "Marcos"
    assert body["data"]["campos_modificados"] == ["nombre"]

    db_session.expire_all()
    assert db_session.get(Usuario, trabajador.id_usuario).nombre == "Marcos"


def test_cp08_el_log_registra_quien_cuando_y_que_campo(client, admin, admin_token, trabajador, db_session):
    client.put(
        f"/api/usuarios/{trabajador.id_usuario}",
        json={"nombre": "Marcos", "telefono": 3001234567},
        headers=_h(admin_token),
    )

    registros = db_session.query(AuditoriaPersona).filter_by(id_persona=trabajador.id_usuario).all()
    por_campo = {r.campo: r for r in registros}

    assert set(por_campo) == {"nombre", "telefono"}
    assert por_campo["nombre"].valor_anterior == "Trabajador"
    assert por_campo["nombre"].valor_nuevo == "Marcos"
    assert por_campo["telefono"].valor_anterior is None
    assert por_campo["telefono"].valor_nuevo == "3001234567"
    assert all(r.id_usuario == admin.id_usuario for r in registros)
    assert all(r.fecha is not None for r in registros)


def test_historial_devuelve_cambios_con_nombre_del_editor(client, admin_token, trabajador):
    client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"apellido": "Gomez"}, headers=_h(admin_token))

    res = client.get(f"/api/usuarios/{trabajador.id_usuario}/historial", headers=_h(admin_token))

    assert res.status_code == 200
    historial = res.json()["data"]
    assert len(historial) == 1
    assert historial[0]["campo"] == "apellido"
    assert historial[0]["valor_anterior"] == "5001"
    assert historial[0]["valor_nuevo"] == "Gomez"
    assert historial[0]["usuario"] == "Ana Admin"


def test_reenviar_los_mismos_valores_no_genera_auditoria(client, admin_token, trabajador, db_session):
    res = client.put(
        f"/api/usuarios/{trabajador.id_usuario}",
        json={"nombre": trabajador.nombre, "apellido": trabajador.apellido},
        headers=_h(admin_token),
    )

    assert res.status_code == 200
    assert res.json()["message"] == "No hay cambios para guardar"
    assert db_session.query(AuditoriaPersona).count() == 0


def test_tipo_documento_y_rol_se_guardan_con_nombre_legible(
    client, admin_token, trabajador, db_session
):
    ce = TipoIdentificacion(nombre="CE")
    db_session.add(ce)
    db_session.commit()
    db_session.refresh(ce)

    client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"id_tipo": ce.id_tipo}, headers=_h(admin_token))

    registro = db_session.query(AuditoriaPersona).filter_by(campo="id_tipo").one()
    assert registro.valor_anterior == "CC"
    assert registro.valor_nuevo == "CE"


def test_la_contrasena_nunca_queda_en_el_log(client, admin_token, trabajador, db_session):
    client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"password": "SecretoNuevo1"}, headers=_h(admin_token))

    registro = db_session.query(AuditoriaPersona).filter_by(campo="password").one()
    assert registro.valor_anterior == "[oculto]"
    assert registro.valor_nuevo == "[oculto]"
    assert "SecretoNuevo1" not in (registro.valor_anterior + registro.valor_nuevo)


def test_rechaza_documento_duplicado(client, admin_token, db_session, roles, tipo_cc, empresa_a, trabajador):
    otro = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=5002, con_salud=False)

    res = client.put(
        f"/api/usuarios/{otro.id_usuario}",
        json={"numero_identificacion": 5001},
        headers=_h(admin_token),
    )

    assert res.status_code == 400
    assert "documento" in res.json()["detail"]["error"]
    assert db_session.query(AuditoriaPersona).count() == 0


def test_rechaza_correo_duplicado(client, admin_token, trabajador, empresa_a):
    res = client.put(
        f"/api/usuarios/{trabajador.id_usuario}",
        json={"correo": empresa_a.correo},
        headers=_h(admin_token),
    )

    assert res.status_code == 400


def test_rechaza_tipo_documento_inexistente(client, admin_token, trabajador):
    res = client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"id_tipo": 9999}, headers=_h(admin_token))

    assert res.status_code == 400


def test_rechaza_nombre_vacio_y_numeros_negativos(client, admin_token, trabajador):
    vacio = client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"nombre": "   "}, headers=_h(admin_token))
    negativo = client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"telefono": -5}, headers=_h(admin_token))
    nulo = client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"nombre": None}, headers=_h(admin_token))

    assert vacio.status_code == 422
    assert negativo.status_code == 422
    assert nulo.status_code == 400


def test_persona_inexistente_devuelve_404(client, admin_token):
    assert client.put("/api/usuarios/99999", json={"nombre": "X"}, headers=_h(admin_token)).status_code == 404
    assert client.get("/api/usuarios/99999/historial", headers=_h(admin_token)).status_code == 404


def test_solo_el_administrador_puede_editar_y_ver_historial(
    client, trabajador, empresa_a_token, instructor_token
):
    for token in (empresa_a_token, instructor_token):
        assert client.put(
            f"/api/usuarios/{trabajador.id_usuario}", json={"nombre": "X"}, headers=_h(token)
        ).status_code == 403
        assert client.get(f"/api/usuarios/{trabajador.id_usuario}", headers=_h(token)).status_code == 403
        assert client.get(f"/api/usuarios/{trabajador.id_usuario}/historial", headers=_h(token)).status_code == 403

    assert client.put(f"/api/usuarios/{trabajador.id_usuario}", json={"nombre": "X"}).status_code == 401


def test_obtener_persona_devuelve_campos_editables_para_prellenar(client, admin_token, trabajador, tipo_cc):
    res = client.get(f"/api/usuarios/{trabajador.id_usuario}", headers=_h(admin_token))

    assert res.status_code == 200
    data = res.json()["data"]
    assert data["id_tipo"] == tipo_cc.id_tipo
    assert data["tipo_documento"] == "CC"
    assert data["numero_identificacion"] == 5001
    assert {"direccion", "telefono", "correo", "nit"} <= set(data)


def test_las_rutas_literales_no_chocan_con_el_id(client, admin_token, instructor_token):
    # "/instructores" debe seguir resolviéndose como lista, no como {id_usuario}.
    assert client.get("/api/usuarios/instructores", headers=_h(admin_token)).status_code == 200
