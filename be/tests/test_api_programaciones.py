from datetime import date

from tests.helpers import crear_programacion, crear_trabajador_apto


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _inscribir(client, token, id_programacion, id_usuario):
    return client.post(
        f"/api/inscripciones/{id_programacion}",
        json={"id_usuario": id_usuario},
        headers=_headers(token),
    )


def test_programaciones_por_curso_lista_solo_las_que_tienen_cupos(
    client, db_session, instructor, instructor_token, curso
):
    # Arrange: una programación con cupos y otra agotada
    con_cupos = crear_programacion(db_session, curso, instructor, cupos=5)
    crear_programacion(db_session, curso, instructor, cupos=0, fecha=date(2030, 1, 2))

    # Act
    res = client.get(f"/api/programaciones/{curso.id_curso}", headers=_headers(instructor_token))

    # Assert
    assert res.status_code == 200
    assert [p["id_programacion"] for p in res.json()] == [con_cupos.id_programacion]


def test_inscritos_incluye_tipo_y_numero_de_documento_del_trabajador(
    client, db_session, roles, tipo_cc, instructor, instructor_token, empresa_a, curso
):
    # Arrange
    prog = crear_programacion(db_session, curso, instructor, cupos=5)
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=2001)
    assert _inscribir(client, instructor_token, prog.id_programacion, trabajador.id_usuario).status_code == 200

    # Act
    res = client.get(
        f"/api/programaciones/{prog.id_programacion}/inscritos", headers=_headers(instructor_token)
    )

    # Assert
    assert res.status_code == 200
    inscritos = res.json()["data"]
    assert len(inscritos) == 1
    assert inscritos[0]["numero_identificacion"] == 2001
    assert inscritos[0]["tipo_documento"] == "CC"


def test_inscritos_devuelve_lista_vacia_cuando_nadie_se_ha_inscrito(
    client, db_session, instructor, instructor_token, curso
):
    prog = crear_programacion(db_session, curso, instructor, cupos=5)

    res = client.get(
        f"/api/programaciones/{prog.id_programacion}/inscritos", headers=_headers(instructor_token)
    )

    assert res.status_code == 200
    assert res.json()["data"] == []


def test_programar_curso_rechaza_el_horario_ocupado_del_instructor(
    client, db_session, instructor, instructor_token, curso
):
    # Arrange: el instructor ya tiene una programación a las 8:00
    ocupada = crear_programacion(db_session, curso, instructor, cupos=5)

    # Act: intenta programar otra en la misma fecha y hora
    res = client.post(
        "/api/programaciones/",
        json={
            "id_curso": curso.id_curso,
            "id_usuario": instructor.id_usuario,
            "fecha": ocupada.fecha.isoformat(),
            "hora": "08:00:00",
            "cupos": 10,
        },
        headers=_headers(instructor_token),
    )

    # Assert: código, cuerpo y Content-Type
    assert res.status_code == 400
    assert res.headers["content-type"] == "application/json"
    detalle = res.json()["detail"]
    assert detalle["success"] is False
    assert detalle["error"] == "El instructor ya tiene un curso en ese horario"


def test_programar_curso_rechaza_un_usuario_que_no_es_instructor(
    client, instructor_token, empresa_a, curso
):
    res = client.post(
        "/api/programaciones/",
        json={
            "id_curso": curso.id_curso,
            "id_usuario": empresa_a.id_usuario,
            "fecha": "2030-01-01",
            "hora": "09:00:00",
            "cupos": 5,
        },
        headers=_headers(instructor_token),
    )

    assert res.status_code == 400
    assert res.json()["detail"]["error"] == "El usuario indicado no es un Instructor"


def test_eliminar_programacion_con_inscritos_responde_409_y_no_la_borra(
    client, db_session, roles, tipo_cc, instructor, instructor_token, empresa_a, curso
):
    # Arrange: una programación con un trabajador inscrito
    prog = crear_programacion(db_session, curso, instructor, cupos=5)
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=2002)
    assert _inscribir(client, instructor_token, prog.id_programacion, trabajador.id_usuario).status_code == 200

    # Act
    res = client.delete(f"/api/programaciones/{prog.id_programacion}", headers=_headers(instructor_token))

    # Assert: conflicto, y la programación sigue existiendo
    assert res.status_code == 409
    assert res.json()["detail"]["success"] is False
    restantes = client.get(f"/api/programaciones/{curso.id_curso}", headers=_headers(instructor_token)).json()
    assert [p["id_programacion"] for p in restantes] == [prog.id_programacion]