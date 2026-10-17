from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.alerta_controller import (
    generar_alertas,
    listar_alertas,
    listar_alertas_empresa,
)
from App.Modulo_Cursos.deps import require_admin, require_empresa
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/alertas",
    tags=["Alertas"]
)


@router.post("/generar")
def generar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return generar_alertas(db)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_alertas(db)


@router.get("/mis-alertas")
def mis_alertas(db: Session = Depends(get_db), current_user: Usuario = Depends(require_empresa)):
    return listar_alertas_empresa(db, current_user)
