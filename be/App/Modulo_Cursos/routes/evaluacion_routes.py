from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.evaluacion_schema import EvaluacionCreate, EvaluacionUpdate
from App.Modulo_Cursos.schemas.pregunta_schema import PreguntaCreate
from App.Modulo_Cursos.schemas.evaluacion_presentada_schema import PresentarEvaluacionRequest
from App.Modulo_Cursos.controllers.evaluacion_controller import (
    listar_evaluaciones,
    obtener_evaluacion,
    obtener_evaluacion_para_presentar,
    crear_evaluacion,
    actualizar_evaluacion,
    eliminar_evaluacion
)
from App.Modulo_Cursos.controllers.pregunta_controller import (
    listar_preguntas_por_evaluacion,
    crear_pregunta
)
from App.Modulo_Cursos.controllers.evaluacion_presentada_controller import presentar_evaluacion
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/evaluaciones",
    tags=["Evaluaciones"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_evaluaciones(db)


@router.get("/{id_evaluacion}")
def obtener(id_evaluacion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return obtener_evaluacion(db, id_evaluacion)


@router.get("/{id_evaluacion}/presentar")
def obtener_para_presentar(id_evaluacion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return obtener_evaluacion_para_presentar(db, id_evaluacion)


@router.post("/")
def crear(data: EvaluacionCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return crear_evaluacion(db, data)


@router.put("/{id_evaluacion}")
def actualizar(id_evaluacion: int, data: EvaluacionUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return actualizar_evaluacion(db, id_evaluacion, data)


@router.delete("/{id_evaluacion}")
def eliminar(id_evaluacion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return eliminar_evaluacion(db, id_evaluacion)


@router.get("/{id_evaluacion}/preguntas")
def listar_preguntas(id_evaluacion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_preguntas_por_evaluacion(db, id_evaluacion)


@router.post("/{id_evaluacion}/preguntas")
def agregar_pregunta(id_evaluacion: int, data: PreguntaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return crear_pregunta(db, id_evaluacion, data)


@router.post("/{id_evaluacion}/presentar")
def presentar(id_evaluacion: int, data: PresentarEvaluacionRequest, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return presentar_evaluacion(db, id_evaluacion, data)
