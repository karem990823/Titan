from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.salud_model import Salud
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/salud",
    tags=["Salud"]
)

@router.get("/")
def listar_salud(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_instructor_or_admin),
):
    return db.query(Salud).all()
