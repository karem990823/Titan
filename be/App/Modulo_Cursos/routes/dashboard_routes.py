from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.controllers.dashboard_controller import obtener_resumen
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/resumen")
def resumen(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return obtener_resumen(db)
