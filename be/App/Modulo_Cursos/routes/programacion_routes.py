from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.programacion_schema import ProgramacionBase
from App.Modulo_Cursos.controllers import curso_controller
from App.Modulo_Cursos.deps import get_current_user, require_instructor_or_admin
from App.Modulo_Cursos.models.programacion_model import ProgramacionCurso
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/programaciones",
    tags=["Programaciones"]
)

@router.post("/")
def crear_programacion(
    data: ProgramacionBase,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_instructor_or_admin),
):
    return curso_controller.programar_nuevo_curso(db, data)

@router.get("/calendario")
def ver_calendario(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return curso_controller.obtener_calendario(db)

@router.get("/{id_curso}")
def get_programaciones_por_curso(
    id_curso: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    programaciones = db.query(ProgramacionCurso).filter(
        ProgramacionCurso.id_curso == id_curso,
        ProgramacionCurso.cupos > 0
    ).all()

    return [{
        "id_programacion": p.id_programacion,
        "fecha": p.fecha.strftime("%Y-%m-%d") if p.fecha else None,
        "hora": p.hora.strftime("%H:%M") if p.hora else None,
        "cupos": p.cupos
    } for p in programaciones]

@router.put("/{id_programacion}")
def actualizar(
    id_programacion: int,
    data: ProgramacionBase,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_instructor_or_admin),
):
    return curso_controller.actualizar_programacion(
        db,
        id_programacion,
        data
    )

@router.delete("/{id_programacion}")
def eliminar(
    id_programacion: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_instructor_or_admin),
):
    return curso_controller.eliminar_programacion(
        db,
        id_programacion
    )
