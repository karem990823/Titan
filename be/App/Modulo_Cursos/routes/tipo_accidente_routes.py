from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.accidente_controller import listar_tipos_accidente
from App.Modulo_Cursos.deps import get_current_user
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/tipos-accidente",
    tags=["Tipos de incidente"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return listar_tipos_accidente(db)
