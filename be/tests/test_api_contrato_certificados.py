import pytest

from tests.helpers import crear_certificado, crear_trabajador_apto

# Campos que lee la interfaz de ConsultaCertificado (CertificadoPublico en types/index.ts)
CAMPOS_QUE_USA_LA_INTERFAZ = {
    "id_certificado",
    "nombre_completo",
    "curso_nombre",
    "codigo",
    "fecha_emision",
    "fecha_vencimiento",
    "vigente",
}


def _buscar(client, id_tipo, numero):
    return client.get(
        "/api/certificados/publico/buscar",
        params={"id_tipo": id_tipo, "numero_identificacion": numero},
    )


def test_buscar_publico_devuelve_exactamente_los_campos_que_usa_la_interfaz(
    client, db_session, roles, tipo_cc, empresa_a, curso
):
    # Arrange
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=3001)
    cert = crear_certificado(db_session, trabajador, curso, dias_para_vencer=30)

    # Act
    res = _buscar(client, tipo_cc.id_tipo, 3001)

    # Assert: estado, Content-Type y cuerpo
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/json"
    cuerpo = res.json()
    assert cuerpo["success"] is True
    assert len(cuerpo["data"]) == 1
    certificado = cuerpo["data"][0]
    assert set(certificado) == CAMPOS_QUE_USA_LA_INTERFAZ
    assert certificado["nombre_completo"] == "Trabajador 3001"
    assert certificado["curso_nombre"] == "Trabajador Autorizado"
    assert certificado["codigo"] == cert.codigo
    assert certificado["fecha_vencimiento"] == cert.fecha_vencimiento.isoformat()


@pytest.mark.parametrize(
    ("dias_para_vencer", "vigente"),
    [
        (30, True),   # le quedan días
        (0, True),    # vence hoy: todavía vigente (el borde)
        (-1, False),  # venció ayer
    ],
)
def test_buscar_publico_marca_vigente_segun_la_fecha_de_vencimiento(
    client, db_session, roles, tipo_cc, empresa_a, curso, dias_para_vencer, vigente
):
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=3002)
    crear_certificado(db_session, trabajador, curso, dias_para_vencer=dias_para_vencer)

    res = _buscar(client, tipo_cc.id_tipo, 3002)

    assert res.json()["data"][0]["vigente"] is vigente


def test_buscar_publico_devuelve_lista_vacia_si_el_documento_no_tiene_certificados(client, tipo_cc):
    res = _buscar(client, tipo_cc.id_tipo, 999999)

    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["data"] == []


def test_error_de_validacion_incluye_el_mensaje_que_la_interfaz_muestra(client, tipo_cc):
    # Act: el número de documento no es un entero
    res = client.get(
        "/api/certificados/publico/buscar",
        params={"id_tipo": tipo_cc.id_tipo, "numero_identificacion": "abc"},
    )

    # Assert: apiFetch (client.ts) lee `message` o `error`; sin ellos la interfaz muestra "Error 422"
    assert res.status_code == 422
    cuerpo = res.json()
    assert cuerpo["success"] is False
    assert cuerpo.get("message") or cuerpo.get("error")


def test_descargar_publico_entrega_un_pdf_con_el_codigo_en_el_nombre(
    client, db_session, roles, tipo_cc, empresa_a, curso
):
    # Arrange
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=3003)
    cert = crear_certificado(db_session, trabajador, curso, dias_para_vencer=30)

    # Act
    res = client.get(
        f"/api/certificados/publico/{cert.id_certificado}/descargar",
        params={"id_tipo": tipo_cc.id_tipo, "numero_identificacion": 3003},
    )

    # Assert
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert f'filename="certificado-{cert.codigo}.pdf"' in res.headers["content-disposition"]
    assert res.content.startswith(b"%PDF")


def test_descargar_publico_responde_el_mismo_404_si_el_documento_no_coincide_o_no_existe(
    client, db_session, roles, tipo_cc, empresa_a, curso
):
    # Arrange
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=3004)
    cert = crear_certificado(db_session, trabajador, curso, dias_para_vencer=30)

    # Act: documento ajeno al certificado vs. certificado que no existe
    documento_ajeno = client.get(
        f"/api/certificados/publico/{cert.id_certificado}/descargar",
        params={"id_tipo": tipo_cc.id_tipo, "numero_identificacion": 9999},
    )
    inexistente = client.get(
        "/api/certificados/publico/99999/descargar",
        params={"id_tipo": tipo_cc.id_tipo, "numero_identificacion": 3004},
    )

    # Assert: no se puede confirmar por fuerza bruta que un certificado existe
    assert documento_ajeno.status_code == 404
    assert documento_ajeno.json() == inexistente.json()
    assert documento_ajeno.json()["detail"]["error"] == "No existe un certificado con esos datos"