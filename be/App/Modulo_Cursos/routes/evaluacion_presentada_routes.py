from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.evaluacion_presentada_controller import (
    listar_presentaciones,
    obtener_presentacion
)
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/evaluaciones-presentadas",
    tags=["Evaluaciones Presentadas"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_presentaciones(db)


@router.get("/{id_presentada}")
def obtener(id_presentada: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return obtener_presentacion(db, id_presentada)
