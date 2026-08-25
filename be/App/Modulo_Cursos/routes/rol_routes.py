from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.deps import get_current_user
from App.Modulo_Cursos.models.rol_model import Rol
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/roles",
    tags=["Roles"]
)

@router.get("/")
def listar_roles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return db.query(Rol).all()
