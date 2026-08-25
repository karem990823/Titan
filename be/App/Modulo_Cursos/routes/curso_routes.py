from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.deps import get_current_user
from App.Modulo_Cursos.models.curso_model import Curso
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/cursos",
    tags=["Cursos"]
)

@router.get("/lista-cursos")
def get_cursos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    cursos = db.query(Curso).all()
    return [{
        "id_curso": c.id_curso,
        "nombre_curso": c.nombre_curso
    } for c in cursos]