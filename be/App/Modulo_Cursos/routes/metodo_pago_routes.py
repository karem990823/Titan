from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.metodo_pago_schema import MetodoPagoCreate, MetodoPagoUpdate
from App.Modulo_Cursos.controllers.metodo_pago_controller import (
    listar_metodos_pago,
    obtener_metodo_pago,
    crear_metodo_pago,
    actualizar_metodo_pago,
    eliminar_metodo_pago
)
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/metodos-pago",
    tags=["Métodos de Pago"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_metodos_pago(db)


@router.get("/{id_metodo}")
def obtener(id_metodo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return obtener_metodo_pago(db, id_metodo)


@router.post("/")
def crear(data: MetodoPagoCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return crear_metodo_pago(db, data)


@router.put("/{id_metodo}")
def actualizar(id_metodo: int, data: MetodoPagoUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_metodo_pago(db, id_metodo, data)


@router.delete("/{id_metodo}")
def eliminar(id_metodo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return eliminar_metodo_pago(db, id_metodo)
