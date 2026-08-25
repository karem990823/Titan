from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.factura_schema import FacturaCreate, FacturaUpdate
from App.Modulo_Cursos.schemas.detalle_factura_schema import DetalleFacturaCreate
from App.Modulo_Cursos.controllers.factura_controller import (
    listar_facturas,
    obtener_factura,
    crear_factura,
    actualizar_factura,
    eliminar_factura
)
from App.Modulo_Cursos.controllers.detalle_factura_controller import (
    listar_detalles_por_factura,
    crear_detalle_factura
)
from App.Modulo_Cursos.controllers.pago_controller import listar_pagos_por_factura
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/facturas",
    tags=["Facturas"]
)


@router.get("/")
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_facturas(db)


@router.get("/{id_factura}")
def obtener(id_factura: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return obtener_factura(db, id_factura)


@router.post("/")
def crear(data: FacturaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return crear_factura(db, data)


@router.put("/{id_factura}")
def actualizar(id_factura: int, data: FacturaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_factura(db, id_factura, data)


@router.delete("/{id_factura}")
def eliminar(id_factura: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return eliminar_factura(db, id_factura)


@router.get("/{id_factura}/detalles")
def listar_detalles(id_factura: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_detalles_por_factura(db, id_factura)


@router.post("/{id_factura}/detalles")
def agregar_detalle(id_factura: int, data: DetalleFacturaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return crear_detalle_factura(db, id_factura, data)


@router.get("/{id_factura}/pagos")
def listar_pagos(id_factura: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return listar_pagos_por_factura(db, id_factura)
