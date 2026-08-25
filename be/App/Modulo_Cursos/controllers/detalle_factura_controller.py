from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from App.Modulo_Cursos.models.detalle_factura_model import DetalleFactura
from App.Modulo_Cursos.models.factura_model import Factura
from App.Modulo_Cursos.utils.response import api_response


def _serializar(item: DetalleFactura):
    return {
        "id_detalle": item.id_detalle,
        "id_factura": item.id_factura,
        "descripcion": item.descripcion,
        "valor": item.valor
    }


def _validar_factura_existe(db: Session, id_factura: int) -> Factura:
    factura = db.query(Factura).filter(Factura.id_factura == id_factura).first()

    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo procesar el detalle",
                error="La factura indicada no existe"
            )
        )
    return factura


def _obtener_o_404(db: Session, id_detalle: int) -> DetalleFactura:
    item = db.query(DetalleFactura).filter(DetalleFactura.id_detalle == id_detalle).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Detalle no encontrado",
                error="No existe detalle de factura con ese ID"
            )
        )
    return item


def listar_detalles_por_factura(db: Session, id_factura: int):
    _validar_factura_existe(db, id_factura)

    items = db.query(DetalleFactura).filter(DetalleFactura.id_factura == id_factura).all()

    return api_response(
        success=True,
        message="Detalles obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def crear_detalle_factura(db: Session, id_factura: int, data):
    _validar_factura_existe(db, id_factura)

    nuevo = DetalleFactura(id_factura=id_factura, **data.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Detalle agregado correctamente",
        data=_serializar(nuevo)
    )


def actualizar_detalle_factura(db: Session, id_detalle: int, data):
    item = _obtener_o_404(db, id_detalle)

    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Detalle actualizado correctamente",
        data=_serializar(item)
    )


def eliminar_detalle_factura(db: Session, id_detalle: int):
    item = _obtener_o_404(db, id_detalle)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Detalle eliminado correctamente",
        data={"id_detalle": id_detalle}
    )
