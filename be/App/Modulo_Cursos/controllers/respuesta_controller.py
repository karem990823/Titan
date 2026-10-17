from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from App.Modulo_Cursos.models.respuesta_model import Respuesta
from App.Modulo_Cursos.models.pregunta_model import Pregunta
from App.Modulo_Cursos.utils.response import api_response


def _validar_pregunta_existe(db: Session, id_pregunta: int) -> Pregunta:
    pregunta = db.query(Pregunta).filter(Pregunta.id_pregunta == id_pregunta).first()

    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo procesar la respuesta",
                error="La pregunta indicada no existe"
            )
        )
    return pregunta


def _serializar(item: Respuesta):
    return {
        "id_respuesta": item.id_respuesta,
        "id_pregunta": item.id_pregunta,
        "respuesta": item.respuesta,
        "es_correcta": item.es_correcta
    }


def _obtener_o_404(db: Session, id_respuesta: int) -> Respuesta:
    item = db.query(Respuesta).filter(Respuesta.id_respuesta == id_respuesta).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Respuesta no encontrada",
                error="No existe respuesta con ese ID"
            )
        )
    return item


def crear_respuesta(db: Session, id_pregunta: int, data):
    _validar_pregunta_existe(db, id_pregunta)

    nueva = Respuesta(id_pregunta=id_pregunta, **data.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Respuesta creada correctamente",
        data=_serializar(nueva)
    )


def actualizar_respuesta(db: Session, id_respuesta: int, data):
    item = _obtener_o_404(db, id_respuesta)

    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Respuesta actualizada correctamente",
        data=_serializar(item)
    )


def eliminar_respuesta(db: Session, id_respuesta: int):
    item = _obtener_o_404(db, id_respuesta)
    pregunta = item.pregunta

    otras_correctas = any(
        r.es_correcta for r in pregunta.respuestas if r.id_respuesta != id_respuesta
    )

    if item.es_correcta and not otras_correctas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo eliminar la respuesta",
                error="Es la única respuesta correcta de la pregunta"
            )
        )

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Respuesta eliminada correctamente",
        data={"id_respuesta": id_respuesta}
    )
