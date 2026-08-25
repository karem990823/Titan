from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.evaluacion_model import Evaluacion
from App.Modulo_Cursos.models.pregunta_model import Pregunta
from App.Modulo_Cursos.models.evaluacion_presentada_model import EvaluacionPresentada
from App.Modulo_Cursos.models.resultado_model import Resultado
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response


def _validar_evaluacion_existe(db: Session, id_evaluacion: int) -> Evaluacion:
    evaluacion = db.query(Evaluacion).options(
        joinedload(Evaluacion.preguntas).joinedload(Pregunta.respuestas)
    ).filter(Evaluacion.id_evaluacion == id_evaluacion).first()

    if not evaluacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo presentar la evaluación",
                error="La evaluación indicada no existe"
            )
        )
    return evaluacion


def _validar_usuario_existe(db: Session, id_usuario: int):
    if not db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo presentar la evaluación",
                error="El usuario indicado no existe"
            )
        )


def _validar_respuestas_completas(evaluacion: Evaluacion, respuestas_enviadas: list):
    preguntas_evaluacion = {p.id_pregunta for p in evaluacion.preguntas}
    preguntas_respondidas = {r.id_pregunta for r in respuestas_enviadas}

    if preguntas_evaluacion != preguntas_respondidas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo presentar la evaluación",
                error="Debe responder todas las preguntas de la evaluación, exactamente una vez cada una"
            )
        )


def _calcular_puntaje(evaluacion: Evaluacion, respuestas_enviadas: list) -> Decimal:
    respuestas_por_pregunta = {r.id_pregunta: r.id_respuesta for r in respuestas_enviadas}

    correctas = 0
    for pregunta in evaluacion.preguntas:
        id_respuesta_marcada = respuestas_por_pregunta.get(pregunta.id_pregunta)
        respuesta_correcta = next((r for r in pregunta.respuestas if r.es_correcta), None)

        if respuesta_correcta and id_respuesta_marcada == respuesta_correcta.id_respuesta:
            correctas += 1

    total_preguntas = len(evaluacion.preguntas)
    if total_preguntas == 0:
        return Decimal("0.00")

    puntaje = (Decimal(correctas) / Decimal(total_preguntas)) * Decimal("100")
    return puntaje.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _serializar(item: EvaluacionPresentada):
    return {
        "id_presentada": item.id_presentada,
        "id_usuario": item.id_usuario,
        "id_evaluacion": item.id_evaluacion,
        "fecha": item.fecha.strftime("%Y-%m-%d") if item.fecha else None,
        "resultado": {
            "id_resultado": item.resultado.id_resultado,
            "id_presentada": item.resultado.id_presentada,
            "puntaje": item.resultado.puntaje
        } if item.resultado else None
    }


def listar_presentaciones(db: Session):
    items = db.query(EvaluacionPresentada).options(joinedload(EvaluacionPresentada.resultado)).all()

    return api_response(
        success=True,
        message="Presentaciones obtenidas correctamente",
        data=[_serializar(i) for i in items]
    )


def obtener_presentacion(db: Session, id_presentada: int):
    item = db.query(EvaluacionPresentada).options(joinedload(EvaluacionPresentada.resultado)).filter(
        EvaluacionPresentada.id_presentada == id_presentada
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Presentación no encontrada",
                error="No existe presentación con ese ID"
            )
        )

    return api_response(
        success=True,
        message="Presentación obtenida correctamente",
        data=_serializar(item)
    )


def presentar_evaluacion(db: Session, id_evaluacion: int, data):
    evaluacion = _validar_evaluacion_existe(db, id_evaluacion)
    _validar_usuario_existe(db, data.id_usuario)
    _validar_respuestas_completas(evaluacion, data.respuestas)

    puntaje = _calcular_puntaje(evaluacion, data.respuestas)

    nueva_presentada = EvaluacionPresentada(
        id_usuario=data.id_usuario,
        id_evaluacion=id_evaluacion,
        fecha=date.today()
    )
    nueva_presentada.resultado = Resultado(puntaje=puntaje)

    db.add(nueva_presentada)
    db.commit()
    db.refresh(nueva_presentada)

    return api_response(
        success=True,
        message="Evaluación presentada correctamente",
        data=_serializar(nueva_presentada)
    )
