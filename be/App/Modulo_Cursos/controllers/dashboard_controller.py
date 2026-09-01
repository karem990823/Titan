from datetime import date

from sqlalchemy.orm import Session

from App.Modulo_Cursos.models.inscripcion_model import Inscripcion
from App.Modulo_Cursos.models.programacion_model import ProgramacionCurso
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response


def obtener_resumen(db: Session) -> dict:
    cursos_programados = db.query(ProgramacionCurso).count()

    participantes = db.query(Usuario).filter(
        Usuario.tipo_registro == "trabajador",
        Usuario.estado_activo == True,
    ).count()

    cursos_hoy = db.query(ProgramacionCurso).filter(
        ProgramacionCurso.fecha == date.today()
    ).count()

    inscripciones = db.query(Inscripcion).filter(
        Inscripcion.estado == "inscrito"
    ).count()

    return api_response(
        success=True,
        message="Resumen obtenido correctamente",
        data={
            "cursos_programados": cursos_programados,
            "participantes": participantes,
            "cursos_hoy": cursos_hoy,
            "inscripciones": inscripciones,
        }
    )
