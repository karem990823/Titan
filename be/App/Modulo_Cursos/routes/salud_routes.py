from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.salud_schema import SaludCreate, SaludUpdate
from App.Modulo_Cursos.controllers.salud_controller import (
    listar_salud,
    listar_salud_por_trabajador,
    crear_salud,
    actualizar_salud,
    eliminar_salud,
)
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/salud",
    tags=["Salud"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_salud(db)


@router.get("/trabajador/{id_trabajador}")
def listar_por_trabajador(id_trabajador: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_salud_por_trabajador(db, id_trabajador)


@router.post("/")
def crear(data: SaludCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return crear_salud(db, data)


@router.put("/{id_salud}")
def actualizar(id_salud: int, data: SaludUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return actualizar_salud(db, id_salud, data)


@router.delete("/{id_salud}")
def eliminar(id_salud: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return eliminar_salud(db, id_salud)
