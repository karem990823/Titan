from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.pago_schema import PagoCreate, PagoUpdate
from App.Modulo_Cursos.controllers.pago_controller import (
    listar_pagos,
    obtener_pago,
    crear_pago,
    actualizar_pago,
    eliminar_pago
)
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/pagos",
    tags=["Pagos"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_pagos(db)


@router.get("/{id_pago}")
def obtener(id_pago: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return obtener_pago(db, id_pago)


@router.post("/")
def crear(data: PagoCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return crear_pago(db, data)


@router.put("/{id_pago}")
def actualizar(id_pago: int, data: PagoUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_pago(db, id_pago, data)


@router.delete("/{id_pago}")
def eliminar(id_pago: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return eliminar_pago(db, id_pago)
