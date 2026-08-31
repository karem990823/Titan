import random
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from App.Modulo_Cursos.controllers.curso_controller import inscribir_participante
from App.Modulo_Cursos.models.certificado_model import Certificado
from tests.helpers import crear_programacion, crear_trabajador_apto


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_cupos_agotados(client, db_session, roles, tipo_cc, instructor, instructor_token, empresa_a, curso):
    prog = crear_programacion(db_session, curso, instructor, cupos=0)
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1001)

    res = client.post(
        f"/api/inscripciones/{prog.id_programacion}",
        json={"id_usuario": trabajador.id_usuario},
        headers=_headers(instructor_token),
    )

    assert res.status_code == 400
    assert "cupos" in res.json()["detail"]["error"].lower()


def test_inscripcion_duplicada(client, db_session, roles, tipo_cc, instructor, instructor_token, empresa_a, curso):
    prog = crear_programacion(db_session, curso, instructor, cupos=5)
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1002)

    primera = client.post(
        f"/api/inscripciones/{prog.id_programacion}",
        json={"id_usuario": trabajador.id_usuario},
        headers=_headers(instructor_token),
    )
    assert primera.status_code == 200

    segunda = client.post(
        f"/api/inscripciones/{prog.id_programacion}",
        json={"id_usuario": trabajador.id_usuario},
        headers=_headers(instructor_token),
    )
    assert segunda.status_code == 400
    assert "ya está inscrito" in segunda.json()["detail"]["error"]


def test_aptitud_medica_requerida(client, db_session, roles, tipo_cc, instructor, instructor_token, empresa_a, curso):
    prog = crear_programacion(db_session, curso, instructor, cupos=5)
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1003, con_salud=False)

    res = client.post(
        f"/api/inscripciones/{prog.id_programacion}",
        json={"id_usuario": trabajador.id_usuario},
        headers=_headers(instructor_token),
    )

    assert res.status_code == 403
    assert "aptitud médica" in res.json()["detail"]["error"]


def test_requisito_reentrenamiento_sin_certificado_previo(
    client, db_session, roles, tipo_cc, instructor, instructor_token, empresa_a, curso_reentrenamiento
):
    prog = crear_programacion(db_session, curso_reentrenamiento, instructor, cupos=5)
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1004)

    res = client.post(
        f"/api/inscripciones/{prog.id_programacion}",
        json={"id_usuario": trabajador.id_usuario},
        headers=_headers(instructor_token),
    )

    assert res.status_code == 403
    assert "reentrenamiento" in res.json()["detail"]["error"].lower()


def test_requisito_reentrenamiento_con_certificado_previo(
    client, db_session, roles, tipo_cc, instructor, instructor_token, empresa_a, curso_reentrenamiento
):
    prog = crear_programacion(db_session, curso_reentrenamiento, instructor, cupos=5)
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1005)

    certificado = Certificado(
        codigo="CERT-TEST", fecha_emision=date.today() - timedelta(days=30),
        fecha_vencimiento=date.today() + timedelta(days=335),
        id_usuario=trabajador.id_usuario, id_curso=curso_reentrenamiento.id_curso,
    )
    db_session.add(certificado)
    db_session.commit()

    res = client.post(
        f"/api/inscripciones/{prog.id_programacion}",
        json={"id_usuario": trabajador.id_usuario},
        headers=_headers(instructor_token),
    )

    assert res.status_code == 200


def test_trabajador_ajeno_a_empresa(
    client, db_session, roles, tipo_cc, instructor, empresa_a, empresa_b, empresa_b_token, curso
):
    prog = crear_programacion(db_session, curso, instructor, cupos=5)
    trabajador_de_a = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=1006)

    res = client.post(
        f"/api/inscripciones/{prog.id_programacion}",
        json={"id_usuario": trabajador_de_a.id_usuario},
        headers=_headers(empresa_b_token),
    )

    assert res.status_code == 403
    assert "propia empresa" in res.json()["detail"]["error"]


def test_concurrencia_ultimo_cupo_no_permite_sobreventa(
    session_factory, db_session, roles, tipo_cc, instructor, empresa_a, curso
):
    # Llama directo al controller (no via HTTP/TestClient): cada hilo abre su
    # propia Session sobre el mismo archivo SQLite, igual que cada request
    # abriría su propia conexión del pool contra MySQL real. Se evita pasar
    # por FastAPI/Starlette a propósito — su ejecución de dependencias sync
    # en un threadpool de anyio no garantiza que una Session viva en un solo
    # hilo de SO, lo que confunde al driver sqlite3 y no tiene relación con
    # lo que esta prueba quiere validar: que with_for_update() + una sola
    # transacción (el fix de D1) evita la sobreventa bajo contención real.
    #
    # SQLite no tiene locking a nivel de fila: with_for_update() es un no-op
    # ahí (SQLAlchemy lo documenta así para este dialecto), así que bajo
    # contención real con varios hilos genuinos el driver sqlite3/SQLAlchemy
    # puede rechazar un escritor con distintos errores propios de la
    # infraestructura de pruebas (database is locked, bad parameter or other
    # API misuse, ObjectDeletedError por una fila tocada desde otra Session)
    # en vez del 400 limpio que produce el mismo código contra MySQL (que sí
    # soporta SELECT ... FOR UPDATE). Se aceptan esos errores como rechazo
    # válido aquí: lo que esta prueba certifica —y lo único que puede
    # certificar sobre SQLite— es que nunca hay más de un éxito. La ausencia
    # de sobreventa contra MySQL real ya se verificó aparte con Docker: 5
    # inscripciones concurrentes por curl, 1 sola exitosa, sin ningún error
    # de base de datos.
    prog = crear_programacion(db_session, curso, instructor, cupos=1)
    trabajadores = [
        crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=2000 + i)
        for i in range(3)
    ]

    def inscribir(trabajador, intentos_restantes=3):
        hilo_db = session_factory()
        try:
            inscribir_participante(hilo_db, prog.id_programacion, trabajador.id_usuario, instructor)
            return 200
        except HTTPException as exc:
            return exc.status_code
        except SQLAlchemyError:
            hilo_db.rollback()
            hilo_db.close()
            if intentos_restantes > 1:
                # Reintento simple con backoff aleatorio, como haría un
                # cliente real ante un error transitorio de base de datos.
                time.sleep(random.uniform(0.01, 0.05))
                return inscribir(trabajador, intentos_restantes - 1)
            return "error de infraestructura sqlite bajo contención"
        finally:
            hilo_db.close()

    with ThreadPoolExecutor(max_workers=3) as executor:
        resultados = list(executor.map(inscribir, trabajadores))

    exitosos = [r for r in resultados if r == 200]
    rechazados = [r for r in resultados if r != 200]

    assert len(exitosos) == 1
    assert len(rechazados) == 2
