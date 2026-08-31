from datetime import date, time, timedelta

from App.Modulo_Cursos.models.programacion_model import ProgramacionCurso
from App.Modulo_Cursos.models.salud_model import Salud
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.security import hash_password


def crear_trabajador_apto(db_session, roles, empresa, tipo_cc, numero, con_salud=True):
    trabajador = Usuario(
        tipo_registro="trabajador", nombre="Trabajador", apellido=str(numero),
        id_tipo=tipo_cc.id_tipo, numero_identificacion=numero,
        correo=f"trabajador{numero}@test.com", password_hash=hash_password("123"),
        id_rol=roles["Participante"].id_rol, id_empresa=empresa.id_usuario, estado_activo=True,
    )
    db_session.add(trabajador)
    db_session.commit()
    db_session.refresh(trabajador)

    if con_salud:
        salud = Salud(
            apto="SI", fecha_examen=date.today(),
            fecha_vencimiento=date.today() + timedelta(days=365),
            id_trabajador=trabajador.id_usuario,
        )
        db_session.add(salud)
        db_session.commit()

    return trabajador


def crear_programacion(db_session, curso_obj, instructor_obj, cupos, fecha=None):
    prog = ProgramacionCurso(
        id_curso=curso_obj.id_curso, fecha=fecha or date.today(), hora=time(8, 0, 0),
        cupos=cupos, id_usuario=instructor_obj.id_usuario,
    )
    db_session.add(prog)
    db_session.commit()
    db_session.refresh(prog)
    return prog
