from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.accidente_schema import AccidenteCreate, AccidenteUpdate
from App.Modulo_Cursos.controllers.accidente_controller import (
    listar_accidentes,
    listar_accidentes_por_trabajador,
    crear_accidente,
    actualizar_accidente,
    eliminar_accidente,
)
from App.Modulo_Cursos.deps import require_instructor_or_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/accidentes",
    tags=["Incidentes de seguridad"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_accidentes(db)


@router.get("/trabajador/{id_trabajador}")
def listar_por_trabajador(id_trabajador: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return listar_accidentes_por_trabajador(db, id_trabajador)


@router.post("/")
def crear(data: AccidenteCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return crear_accidente(db, data)


@router.put("/{id_accidente}")
def actualizar(id_accidente: int, data: AccidenteUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return actualizar_accidente(db, id_accidente, data)


@router.delete("/{id_accidente}")
def eliminar(id_accidente: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_instructor_or_admin)):
    return eliminar_accidente(db, id_accidente)
