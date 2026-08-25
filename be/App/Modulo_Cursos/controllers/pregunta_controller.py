from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.pregunta_model import Pregunta
from App.Modulo_Cursos.models.respuesta_model import Respuesta
from App.Modulo_Cursos.models.evaluacion_model import Evaluacion
from App.Modulo_Cursos.utils.response import api_response


def _validar_evaluacion_existe(db: Session, id_evaluacion: int) -> Evaluacion:
    evaluacion = db.query(Evaluacion).filter(Evaluacion.id_evaluacion == id_evaluacion).first()

    if not evaluacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo procesar la pregunta",
                error="La evaluación indicada no existe"
            )
        )
    return evaluacion


def _serializar(item: Pregunta):
    return {
        "id_pregunta": item.id_pregunta,
        "id_evaluacion": item.id_evaluacion,
        "pregunta": item.pregunta,
        "respuestas": [{
            "id_respuesta": r.id_respuesta,
            "respuesta": r.respuesta,
            "es_correcta": r.es_correcta
        } for r in item.respuestas]
    }


def _obtener_o_404(db: Session, id_pregunta: int) -> Pregunta:
    item = db.query(Pregunta).options(joinedload(Pregunta.respuestas)).filter(
        Pregunta.id_pregunta == id_pregunta
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Pregunta no encontrada",
                error="No existe pregunta con ese ID"
            )
        )
    return item


def listar_preguntas_por_evaluacion(db: Session, id_evaluacion: int):
    _validar_evaluacion_existe(db, id_evaluacion)

    items = db.query(Pregunta).options(joinedload(Pregunta.respuestas)).filter(
        Pregunta.id_evaluacion == id_evaluacion
    ).all()

    return api_response(
        success=True,
        message="Preguntas obtenidas correctamente",
        data=[_serializar(i) for i in items]
    )


def crear_pregunta(db: Session, id_evaluacion: int, data):
    _validar_evaluacion_existe(db, id_evaluacion)

    datos = data.model_dump()
    respuestas_data = datos.pop("respuestas", None) or []

    if respuestas_data and not any(r["es_correcta"] for r in respuestas_data):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo crear la pregunta",
                error="Debe incluir al menos una respuesta correcta"
            )
        )

    nueva = Pregunta(id_evaluacion=id_evaluacion, **datos)
    for respuesta_data in respuestas_data:
        nueva.respuestas.append(Respuesta(**respuesta_data))

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Pregunta creada correctamente",
        data=_serializar(nueva)
    )


def actualizar_pregunta(db: Session, id_pregunta: int, data):
    item = _obtener_o_404(db, id_pregunta)

    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Pregunta actualizada correctamente",
        data=_serializar(item)
    )


def eliminar_pregunta(db: Session, id_pregunta: int):
    item = _obtener_o_404(db, id_pregunta)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Pregunta eliminada correctamente",
        data={"id_pregunta": id_pregunta}
    )
