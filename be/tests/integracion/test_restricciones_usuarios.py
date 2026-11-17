import pytest
from sqlalchemy import delete, text
from sqlalchemy.exc import DataError, IntegrityError

from App.Modulo_Cursos.controllers.certificado_controller import buscar_publico
from App.Modulo_Cursos.controllers.usuario_controller import listar_usuarios
from App.Modulo_Cursos.models.inscripcion_model import Inscripcion
from App.Modulo_Cursos.models.usuario_model import Usuario
from tests.helpers import crear_certificado, crear_programacion, crear_trabajador_apto


def _usuario(**cambios) -> Usuario:
    datos = {"tipo_registro": "usuario", "nombre": "Ana", "apellido": "Lopez", "correo": "ana@test.com"}
    return Usuario(**{**datos, **cambios})


# --- Restricciones de la tabla usuarios (lo que SQLite no veía) ---

def test_la_bd_rechaza_dos_usuarios_con_el_mismo_correo(db_session):
    db_session.add(_usuario(correo="repetido@test.com"))
    db_session.flush()

    db_session.add(_usuario(correo="repetido@test.com"))

    with pytest.raises(IntegrityError):  # UNIQUE (correo)
        db_session.flush()


def test_la_bd_rechaza_un_usuario_sin_nombre(db_session):
    db_session.add(_usuario(nombre=None))

    with pytest.raises(IntegrityError):  # NOT NULL (nombre)
        db_session.flush()


def test_nombre_acepta_150_caracteres(db_session):
    db_session.add(_usuario(nombre="a" * 150))

    db_session.flush()  # el límite exacto de VARCHAR(150): no lanza


def test_nombre_de_151_caracteres_excede_la_columna(db_session):
    db_session.add(_usuario(nombre="a" * 151))

    with pytest.raises(DataError):  # VARCHAR(150): "Data too long"
        db_session.flush()


def test_la_bd_rechaza_un_documento_fuera_del_rango_de_bigint(db_session):
    db_session.add(_usuario(numero_identificacion=9223372036854775808))  # 2^63, uno más que el máximo

    with pytest.raises(DataError):  # BIGINT fuera de rango
        db_session.flush()


def test_la_bd_rechaza_un_rol_inexistente(db_session):
    db_session.add(_usuario(id_rol=9999))

    with pytest.raises(IntegrityError):  # FOREIGN KEY (id_rol)
        db_session.flush()


def test_borrar_un_usuario_borra_sus_inscripciones_por_cascada(
    db_session, roles, tipo_cc, empresa_a, instructor, curso
):
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=4001, con_salud=False)
    programacion = crear_programacion(db_session, curso, instructor, cupos=5)
    db_session.add(
        Inscripcion(id_programacion=programacion.id_programacion, id_usuario=trabajador.id_usuario, estado="inscrito")
    )
    db_session.flush()

    # Con SQL directo (no con el ORM): así actúa la BD y no la sesión
    db_session.execute(delete(Usuario).where(Usuario.id_usuario == trabajador.id_usuario))

    restantes = db_session.execute(
        text("SELECT COUNT(*) FROM inscripciones WHERE id_usuario = :id"), {"id": trabajador.id_usuario}
    ).scalar()
    assert restantes == 0  # ON DELETE CASCADE


# --- Consultas propias (filtros y JOIN) ---

def test_buscar_publico_solo_devuelve_certificados_de_trabajadores(
    db_session, roles, tipo_cc, empresa_a, instructor, curso
):
    trabajador = crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=5001)
    crear_certificado(db_session, trabajador, curso, dias_para_vencer=30)
    # Un usuario que NO es trabajador, con el mismo documento y también con certificado
    instructor.id_tipo = tipo_cc.id_tipo
    instructor.numero_identificacion = 5001
    db_session.flush()
    crear_certificado(db_session, instructor, curso, dias_para_vencer=30)

    respuesta = buscar_publico(db_session, tipo_cc.id_tipo, 5001)

    assert [c["nombre_completo"] for c in respuesta["data"]] == ["Trabajador 5001"]


def test_listar_usuarios_excluye_trabajadores_salvo_que_se_pidan(
    db_session, roles, tipo_cc, empresa_a, instructor
):
    crear_trabajador_apto(db_session, roles, empresa_a, tipo_cc, numero=6001)

    sin_filtro = {u["correo"] for u in listar_usuarios(db_session)["data"]}
    trabajadores = {u["correo"] for u in listar_usuarios(db_session, tipo_registro="trabajador")["data"]}

    assert sin_filtro == {"carlos@test.com", "empresa-a@test.com"}
    assert trabajadores == {"trabajador6001@test.com"}