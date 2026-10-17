from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.pago_model import Pago
from App.Modulo_Cursos.models.factura_model import Factura
from App.Modulo_Cursos.models.metodo_pago_model import MetodoPago
from App.Modulo_Cursos.utils.response import api_response


def _validar_factura_existe(db: Session, id_factura: int) -> Factura:
    factura = db.query(Factura).options(
        joinedload(Factura.detalles),
        joinedload(Factura.pagos)
    ).filter(Factura.id_factura == id_factura).first()

    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar el pago",
                error="La factura indicada no existe"
            )
        )
    return factura


def _validar_metodo_existe(db: Session, id_metodo: int):
    if not db.query(MetodoPago).filter(MetodoPago.id_metodo == id_metodo).first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo registrar el pago",
                error="El método de pago indicado no existe"
            )
        )


def _saldo_pendiente(factura: Factura, excluir_pago_id: int = None) -> Decimal:
    total = sum((d.valor for d in factura.detalles), Decimal("0"))
    pagado = sum(
        (p.monto for p in factura.pagos if p.id_pago != excluir_pago_id),
        Decimal("0")
    )
    return total - pagado


def _validar_monto_no_excede_saldo(factura: Factura, monto: Decimal, excluir_pago_id: int = None):
    saldo = _saldo_pendiente(factura, excluir_pago_id)

    if monto > saldo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo registrar el pago",
                error=f"El monto excede el saldo pendiente de la factura (saldo actual: {saldo})"
            )
        )


def _serializar(item: Pago):
    return {
        "id_pago": item.id_pago,
        "fecha": item.fecha.strftime("%Y-%m-%d") if item.fecha else None,
        "monto": item.monto,
        "id_factura": item.id_factura,
        "id_metodo": item.id_metodo,
        "metodo_pago": item.metodo_pago.nombre if item.metodo_pago else None
    }


def _obtener_o_404(db: Session, id_pago: int) -> Pago:
    item = db.query(Pago).options(joinedload(Pago.metodo_pago)).filter(
        Pago.id_pago == id_pago
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Pago no encontrado",
                error="No existe pago con ese ID"
            )
        )
    return item


def listar_pagos(db: Session):
    items = db.query(Pago).options(joinedload(Pago.metodo_pago)).all()

    return api_response(
        success=True,
        message="Pagos obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def listar_pagos_por_factura(db: Session, id_factura: int):
    factura = _validar_factura_existe(db, id_factura)

    return api_response(
        success=True,
        message="Pagos obtenidos correctamente",
        data={
            "pagos": [_serializar(p) for p in factura.pagos],
            "saldo_pendiente": _saldo_pendiente(factura)
        }
    )


def obtener_pago(db: Session, id_pago: int):
    item = _obtener_o_404(db, id_pago)
    return api_response(
        success=True,
        message="Pago obtenido correctamente",
        data=_serializar(item)
    )


def crear_pago(db: Session, data):
    factura = _validar_factura_existe(db, data.id_factura)
    _validar_metodo_existe(db, data.id_metodo)
    _validar_monto_no_excede_saldo(factura, data.monto)

    nuevo = Pago(**data.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Pago registrado correctamente",
        data=_serializar(nuevo)
    )


def actualizar_pago(db: Session, id_pago: int, data):
    item = _obtener_o_404(db, id_pago)
    factura = _validar_factura_existe(db, item.id_factura)

    datos = data.model_dump(exclude_unset=True)

    if "id_metodo" in datos:
        _validar_metodo_existe(db, datos["id_metodo"])

    nuevo_monto = datos.get("monto", item.monto)
    _validar_monto_no_excede_saldo(factura, nuevo_monto, excluir_pago_id=item.id_pago)

    for campo, valor in datos.items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Pago actualizado correctamente",
        data=_serializar(item)
    )


def eliminar_pago(db: Session, id_pago: int):
    item = _obtener_o_404(db, id_pago)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Pago eliminado correctamente",
        data={"id_pago": id_pago}
    )
