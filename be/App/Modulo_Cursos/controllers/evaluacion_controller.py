from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.evaluacion_model import Evaluacion
from App.Modulo_Cursos.models.pregunta_model import Pregunta
from App.Modulo_Cursos.models.respuesta_model import Respuesta
from App.Modulo_Cursos.utils.response import api_response


def _validar_preguntas_con_respuesta_correcta(preguntas: list):
    for pregunta in preguntas:
        respuestas = pregunta.get("respuestas")
        if respuestas and not any(r["es_correcta"] for r in respuestas):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=api_response(
                    success=False,
                    message="No se pudo crear la evaluación",
                    error=f"La pregunta '{pregunta['pregunta']}' no tiene ninguna respuesta correcta"
                )
            )


def _serializar_lista(item: Evaluacion):
    return {
        "id_evaluacion": item.id_evaluacion,
        "nombre": item.nombre,
        "total_preguntas": len(item.preguntas)
    }


def _serializar_detalle(item: Evaluacion):
    return {
        "id_evaluacion": item.id_evaluacion,
        "nombre": item.nombre,
        "preguntas": [{
            "id_pregunta": p.id_pregunta,
            "id_evaluacion": p.id_evaluacion,
            "pregunta": p.pregunta,
            "respuestas": [{
                "id_respuesta": r.id_respuesta,
                "id_pregunta": r.id_pregunta,
                "respuesta": r.respuesta,
                "es_correcta": r.es_correcta
            } for r in p.respuestas]
        } for p in item.preguntas]
    }


def _obtener_o_404(db: Session, id_evaluacion: int) -> Evaluacion:
    item = db.query(Evaluacion).options(
        joinedload(Evaluacion.preguntas).joinedload(Pregunta.respuestas)
    ).filter(Evaluacion.id_evaluacion == id_evaluacion).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Evaluación no encontrada",
                error="No existe evaluación con ese ID"
            )
        )
    return item


def listar_evaluaciones(db: Session):
    items = db.query(Evaluacion).options(joinedload(Evaluacion.preguntas)).all()
    return api_response(
        success=True,
        message="Evaluaciones obtenidas correctamente",
        data=[_serializar_lista(i) for i in items]
    )


def obtener_evaluacion(db: Session, id_evaluacion: int):
    item = _obtener_o_404(db, id_evaluacion)
    return api_response(
        success=True,
        message="Evaluación obtenida correctamente",
        data=_serializar_detalle(item)
    )


def obtener_evaluacion_para_presentar(db: Session, id_evaluacion: int):
    item = _obtener_o_404(db, id_evaluacion)

    return api_response(
        success=True,
        message="Evaluación obtenida correctamente",
        data={
            "id_evaluacion": item.id_evaluacion,
            "nombre": item.nombre,
            "preguntas": [{
                "id_pregunta": p.id_pregunta,
                "id_evaluacion": p.id_evaluacion,
                "pregunta": p.pregunta,
                "respuestas": [{
                    "id_respuesta": r.id_respuesta,
                    "respuesta": r.respuesta
                } for r in p.respuestas]
            } for p in item.preguntas]
        }
    )


def crear_evaluacion(db: Session, data):
    datos = data.model_dump()
    preguntas_data = datos.pop("preguntas", None) or []

    _validar_preguntas_con_respuesta_correcta(preguntas_data)

    nueva = Evaluacion(**datos)

    for pregunta_data in preguntas_data:
        respuestas_data = pregunta_data.pop("respuestas", None) or []
        nueva_pregunta = Pregunta(**pregunta_data)
        for respuesta_data in respuestas_data:
            nueva_pregunta.respuestas.append(Respuesta(**respuesta_data))
        nueva.preguntas.append(nueva_pregunta)

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Evaluación creada correctamente",
        data=_serializar_detalle(nueva)
    )


def actualizar_evaluacion(db: Session, id_evaluacion: int, data):
    item = _obtener_o_404(db, id_evaluacion)

    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Evaluación actualizada correctamente",
        data=_serializar_lista(item)
    )


def eliminar_evaluacion(db: Session, id_evaluacion: int):
    item = _obtener_o_404(db, id_evaluacion)

    if item.presentaciones:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo eliminar la evaluación",
                error="La evaluación ya tiene presentaciones registradas"
            )
        )

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Evaluación eliminada correctamente",
        data={"id_evaluacion": id_evaluacion}
    )
