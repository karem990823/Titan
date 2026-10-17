from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.indumentaria_schema import IndumentariaCreate, IndumentariaUpdate
from App.Modulo_Cursos.controllers.indumentaria_controller import (
    listar_indumentaria,
    obtener_indumentaria,
    crear_indumentaria,
    actualizar_indumentaria,
    eliminar_indumentaria
)
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/indumentaria",
    tags=["Indumentaria"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_indumentaria(db)


@router.get("/{id_indumentaria}")
def obtener(id_indumentaria: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return obtener_indumentaria(db, id_indumentaria)


@router.post("/")
def crear(data: IndumentariaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return crear_indumentaria(db, data)


@router.put("/{id_indumentaria}")
def actualizar(id_indumentaria: int, data: IndumentariaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_indumentaria(db, id_indumentaria, data)


@router.delete("/{id_indumentaria}")
def eliminar(id_indumentaria: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return eliminar_indumentaria(db, id_indumentaria)
