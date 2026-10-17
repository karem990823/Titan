from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from App.Modulo_Cursos.config.database import get_db
from App.Modulo_Cursos.schemas.detalle_factura_schema import DetalleFacturaUpdate
from App.Modulo_Cursos.controllers.detalle_factura_controller import (
    actualizar_detalle_factura,
    eliminar_detalle_factura
)
from App.Modulo_Cursos.deps import require_admin
from App.Modulo_Cursos.models.usuario_model import Usuario

router = APIRouter(
    prefix="/api/detalle-factura",
    tags=["Detalle Factura"]
)


@router.put("/{id_detalle}")
def actualizar(id_detalle: int, data: DetalleFacturaUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return actualizar_detalle_factura(db, id_detalle, data)


@router.delete("/{id_detalle}")
def eliminar(id_detalle: int, db: Session = Depends(get_db), current_user: Usuario = Depends(require_admin)):
    return eliminar_detalle_factura(db, id_detalle)
