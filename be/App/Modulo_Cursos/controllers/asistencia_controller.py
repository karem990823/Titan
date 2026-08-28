from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.asistencia_model import Asistencia
from App.Modulo_Cursos.models.inscripcion_model import Inscripcion
from App.Modulo_Cursos.models.programacion_model import ProgramacionCurso
from App.Modulo_Cursos.utils.response import api_response


def _validar_programacion_existe(db: Session, id_programacion: int):
    if not db.query(ProgramacionCurso).filter(ProgramacionCurso.id_programacion == id_programacion).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo procesar la asistencia",
                error="La programación indicada no existe"
            )
        )


def listar_por_programacion(db: Session, id_programacion: int):
    _validar_programacion_existe(db, id_programacion)

    inscripciones = db.query(Inscripcion).options(joinedload(Inscripcion.usuario)).filter(
        Inscripcion.id_programacion == id_programacion,
        Inscripcion.estado == "inscrito",
    ).all()

    ids_inscripcion = [i.id_inscripcion for i in inscripciones]
    asistencias = db.query(Asistencia).filter(Asistencia.id_inscripcion.in_(ids_inscripcion)).all()
    asistencia_por_inscripcion = {a.id_inscripcion: a.asistio for a in asistencias}

    return api_response(
        success=True,
        message="Inscritos obtenidos correctamente",
        data=[{
            "id_inscripcion": i.id_inscripcion,
            "id_usuario": i.id_usuario,
            "nombre": f"{i.usuario.nombre} {i.usuario.apellido or ''}".strip() if i.usuario else None,
            "asistio": asistencia_por_inscripcion.get(i.id_inscripcion),
        } for i in inscripciones]
    )


def marcar_asistencia(db: Session, id_programacion: int, data):
    _validar_programacion_existe(db, id_programacion)

    ids_validos = {
        i.id_inscripcion
        for i in db.query(Inscripcion.id_inscripcion).filter(
            Inscripcion.id_programacion == id_programacion
        ).all()
    }

    for item in data.asistencias:
        if item.id_inscripcion not in ids_validos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=api_response(
                    success=False,
                    message="No se pudo guardar la asistencia",
                    error=f"La inscripción {item.id_inscripcion} no pertenece a esta programación"
                )
            )

        registro = db.query(Asistencia).filter(Asistencia.id_inscripcion == item.id_inscripcion).first()
        if registro:
            registro.asistio = item.asistio
        else:
            db.add(Asistencia(id_inscripcion=item.id_inscripcion, asistio=item.asistio))

    db.commit()

    return api_response(
        success=True,
        message="Asistencia guardada correctamente",
        data={"id_programacion": id_programacion, "registros": len(data.asistencias)}
    )
