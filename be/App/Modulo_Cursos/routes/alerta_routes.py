from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.alerta_controller import generar_alertas, listar_alertas
from App.Modulo_Cursos.deps import require_admin
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
