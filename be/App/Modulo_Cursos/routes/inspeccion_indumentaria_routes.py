from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.inspeccion_indumentaria_schema import (
    InspeccionIndumentariaCreate,
    InspeccionIndumentariaUpdate
)
from App.Modulo_Cursos.controllers.inspeccion_indumentaria_controller import (
    listar_inspecciones,
    obtener_inspeccion,
    crear_inspeccion,
    actualizar_inspeccion,
    eliminar_inspeccion
)
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/inspecciones-indumentaria",
    tags=["Inspecciones Indumentaria"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_inspecciones(db)


@router.get("/{id_inspeccion}")
def obtener(id_inspeccion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return obtener_inspeccion(db, id_inspeccion)


@router.post("/")
def crear(data: InspeccionIndumentariaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return crear_inspeccion(db, data)


@router.put("/{id_inspeccion}")
def actualizar(id_inspeccion: int, data: InspeccionIndumentariaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_inspeccion(db, id_inspeccion, data)


@router.delete("/{id_inspeccion}")
def eliminar(id_inspeccion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return eliminar_inspeccion(db, id_inspeccion)
