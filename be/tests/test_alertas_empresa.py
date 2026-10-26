import pytest

from App.Modulo_Cursos.controllers import alerta_controller
from App.Modulo_Cursos.controllers.alerta_controller import generar_alertas
from App.Modulo_Cursos.models.alerta_model import Alerta
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.security import create_access_token, hash_password
from tests.helpers import crear_certificado, crear_trabajador_apto


@pytest.fixture()
def correos(monkeypatch):
    """Reemplaza el envío real de correos y guarda lo que se habría enviado."""
    enviados = {"empresas": [], "admins": []}

    def fake_empresa(destinatario, nombre_empresa, vencimientos):
        enviados["empresas"].append((destinatario, [v["mensaje"] for v in vencimientos]))
        return True

    def fake_admin(destinatario, vencimientos, facturas):
        enviados["admins"].append(destinatario)
        return True

    monkeypatch.setattr(alerta_controller, "enviar_correo_alertas_empresa", fake_empresa)
    monkeypatch.setattr(alerta_controller, "enviar_correo_alertas", fake_admin)
    return enviados


@pytest.fixture()
def empresa_a_token(empresa_a):
    return create_access_token(data={"sub": str(empresa_a.id_usuario), "rol": "Empresa"})


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_empresa_recibe_solo_sus_trabajadores(
    db_session, roles, tipo_cc, empresa_a, empresa_b, curso, correos
):
    t_a = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1001)
    t_b = crear_trabajador_apto(db_session, roles, empresa_b, tipo_cc, numero=2001)
    crear_certificado(db_session, t_a, curso, dias_para_vencer=10)
    crear_certificado(db_session, t_b, curso, dias_para_vencer=10)

    generar_alertas(db_session)

    por_destinatario = dict(correos["empresas"])
    assert set(por_destinatario) == {"empresa-a@test.com", "empresa-b@test.com"}
    assert any("1001" in m for m in por_destinatario["empresa-a@test.com"])
    assert not any("2001" in m for m in por_destinatario["empresa-a@test.com"])
    assert any("2001" in m for m in por_destinatario["empresa-b@test.com"])


def test_no_envia_correo_si_nada_vence_pronto(db_session, roles, tipo_cc, empresa_a, curso, correos):
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1002)
    crear_certificado(db_session, trabajador, curso, dias_para_vencer=90)

    generar_alertas(db_session)

    assert correos["empresas"] == []
    assert db_session.query(Alerta).count() == 0


def test_correr_dos_veces_no_duplica(db_session, roles, tipo_cc, empresa_a, curso, correos):
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1003)
    crear_certificado(db_session, trabajador, curso, dias_para_vencer=5)

    generar_alertas(db_session)
    generar_alertas(db_session)

    assert len(correos["empresas"]) == 1
    assert db_session.query(Alerta).count() == 1


def test_administrador_sigue_recibiendo_su_correo(
    db_session, roles, tipo_cc, empresa_a, curso, correos
):
    admin = Usuario(
        tipo_registro="usuario", nombre="Admin", apellido="Titan",
        correo="admin@test.com", password_hash=hash_password("123"),
        id_rol=roles["Administrador"].id_rol, estado_activo=True,
    )
    db_session.add(admin)
    db_session.commit()
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1004)
    crear_certificado(db_session, trabajador, curso, dias_para_vencer=7)

    generar_alertas(db_session)

    assert correos["admins"] == ["admin@test.com"]
    assert len(correos["empresas"]) == 1


def test_mis_alertas_aisla_por_empresa(
    client, db_session, roles, tipo_cc, empresa_a, empresa_b, empresa_a_token, empresa_b_token, curso, correos
):
    t_a = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1005)
    t_b = crear_trabajador_apto(db_session, roles, empresa_b, tipo_cc, numero=2005)
    crear_certificado(db_session, t_a, curso, dias_para_vencer=10)
    crear_certificado(db_session, t_b, curso, dias_para_vencer=10)
    generar_alertas(db_session)

    res_a = client.get("/api/alertas/mis-alertas", headers=_headers(empresa_a_token))
    res_b = client.get("/api/alertas/mis-alertas", headers=_headers(empresa_b_token))

    assert res_a.status_code == 200
    mensajes_a = [a["mensaje"] for a in res_a.json()["data"]]
    mensajes_b = [a["mensaje"] for a in res_b.json()["data"]]
    assert len(mensajes_a) == 1 and "1005" in mensajes_a[0]
    assert len(mensajes_b) == 1 and "2005" in mensajes_b[0]


def test_mis_alertas_rechaza_otros_roles(client, instructor_token):
    res = client.get("/api/alertas/mis-alertas", headers=_headers(instructor_token))
    assert res.status_code == 403


def test_mis_alertas_exige_login(client):
    res = client.get("/api/alertas/mis-alertas")
    assert res.status_code == 401
