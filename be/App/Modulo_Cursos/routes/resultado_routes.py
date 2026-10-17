from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.resultado_controller import (
    listar_resultados,
    listar_resultados_por_usuario,
    obtener_resultado
)
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/resultados",
    tags=["Resultados"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_resultados(db)


@router.get("/usuario/{id_usuario}")
def listar_por_usuario(id_usuario: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_resultados_por_usuario(db, id_usuario)


@router.get("/{id_resultado}")
def obtener(id_resultado: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return obtener_resultado(db, id_resultado)
