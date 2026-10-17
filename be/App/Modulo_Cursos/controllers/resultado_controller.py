from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.resultado_model import Resultado
from App.Modulo_Cursos.models.evaluacion_presentada_model import EvaluacionPresentada
from App.Modulo_Cursos.utils.response import api_response


def _serializar(item: Resultado):
    return {
        "id_resultado": item.id_resultado,
        "id_presentada": item.id_presentada,
        "puntaje": item.puntaje,
        "id_usuario": item.presentada.id_usuario if item.presentada else None,
        "id_evaluacion": item.presentada.id_evaluacion if item.presentada else None,
        "fecha": item.presentada.fecha.strftime("%Y-%m-%d") if item.presentada and item.presentada.fecha else None
    }


def listar_resultados(db: Session):
    items = db.query(Resultado).options(joinedload(Resultado.presentada)).all()

    return api_response(
        success=True,
        message="Resultados obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def listar_resultados_por_usuario(db: Session, id_usuario: int):
    items = db.query(Resultado).join(EvaluacionPresentada).options(
        joinedload(Resultado.presentada)
    ).filter(EvaluacionPresentada.id_usuario == id_usuario).all()

    return api_response(
        success=True,
        message="Resultados obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def obtener_resultado(db: Session, id_resultado: int):
    item = db.query(Resultado).options(joinedload(Resultado.presentada)).filter(
        Resultado.id_resultado == id_resultado
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Resultado no encontrado",
                error="No existe resultado con ese ID"
            )
        )

    return api_response(
        success=True,
        message="Resultado obtenido correctamente",
        data=_serializar(item)
    )
