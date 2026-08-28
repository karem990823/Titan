from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.asistencia_schema import AsistenciaMarcarRequest
from App.Modulo_Cursos.controllers.asistencia_controller import (
    listar_por_programacion,
    marcar_asistencia,
)
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/asistencias",
    tags=["Asistencias"]
)


@router.get("/programacion/{id_programacion}")
def listar(id_programacion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_por_programacion(db, id_programacion)


@router.post("/programacion/{id_programacion}")
def marcar(id_programacion: int, data: AsistenciaMarcarRequest, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return marcar_asistencia(db, id_programacion, data)
