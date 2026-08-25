from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.pregunta_schema import PreguntaUpdate
from App.Modulo_Cursos.schemas.respuesta_schema import RespuestaCreate
from App.Modulo_Cursos.controllers.pregunta_controller import (
    actualizar_pregunta,
    eliminar_pregunta
)
from App.Modulo_Cursos.controllers.respuesta_controller import crear_respuesta
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/preguntas",
    tags=["Preguntas"]
)


@router.put("/{id_pregunta}")
def actualizar(id_pregunta: int, data: PreguntaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return actualizar_pregunta(db, id_pregunta, data)


@router.delete("/{id_pregunta}")
def eliminar(id_pregunta: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return eliminar_pregunta(db, id_pregunta)


@router.post("/{id_pregunta}/respuestas")
def agregar_respuesta(id_pregunta: int, data: RespuestaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return crear_respuesta(db, id_pregunta, data)
