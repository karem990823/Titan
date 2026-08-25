from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.respuesta_schema import RespuestaUpdate
from App.Modulo_Cursos.controllers.respuesta_controller import (
    actualizar_respuesta,
    eliminar_respuesta
)
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/respuestas",
    tags=["Respuestas"]
)


@router.put("/{id_respuesta}")
def actualizar(id_respuesta: int, data: RespuestaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return actualizar_respuesta(db, id_respuesta, data)


@router.delete("/{id_respuesta}")
def eliminar(id_respuesta: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return eliminar_respuesta(db, id_respuesta)
