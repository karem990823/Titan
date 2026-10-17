from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.solicitud_contacto_schema import (
    SolicitudContactoCreate,
    SolicitudContactoUpdate,
)
from App.Modulo_Cursos.controllers.solicitud_contacto_controller import (
    actualizar_solicitud,
    crear_solicitud,
    listar_solicitudes,
)
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/solicitudes-contacto",
    tags=["Solicitudes de contacto"]
)


@router.post("/")
def crear(data: SolicitudContactoCreate, db: Session = Depends(get_db)):
    # Sin autenticación a propósito: es el formulario de cotización del landing
    # público, cualquier visitante debe poder enviarlo.
    return crear_solicitud(db, data)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_solicitudes(db)


@router.put("/{id_solicitud}")
def actualizar(id_solicitud: int, data: SolicitudContactoUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_solicitud(db, id_solicitud, data)
