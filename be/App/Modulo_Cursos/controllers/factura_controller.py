from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from App.Modulo_Cursos.models.factura_model import Factura
from App.Modulo_Cursos.models.detalle_factura_model import DetalleFactura
from App.Modulo_Cursos.models.usuario_model import Usuario
from App.Modulo_Cursos.utils.response import api_response


def _validar_empresa_existe(db: Session, id_empresa: int):
    empresa = db.query(Usuario).filter(Usuario.id_usuario == id_empresa).first()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="No se pudo procesar la factura",
                error="La empresa indicada no existe"
            )
        )

    if empresa.tipo_registro != "empresa":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo procesar la factura",
                error="El usuario indicado no está registrado como empresa"
            )
        )


def _calcular_total(factura: Factura) -> Decimal:
    return sum((d.valor for d in factura.detalles), Decimal("0"))


def _calcular_saldo(factura: Factura) -> Decimal:
    total_pagado = sum((p.monto for p in factura.pagos), Decimal("0"))
    return _calcular_total(factura) - total_pagado


def _estado_pago(total: Decimal, saldo: Decimal) -> str:
    if saldo <= 0:
        return "pagada"
    if saldo >= total:
        return "pendiente"
    return "parcial"


def _serializar_lista(item: Factura):
    total = _calcular_total(item)
    saldo = _calcular_saldo(item)
    return {
        "id_factura": item.id_factura,
        "fecha": item.fecha.strftime("%Y-%m-%d") if item.fecha else None,
        "id_empresa": item.id_empresa,
        "empresa": item.empresa.nombre if item.empresa else None,
        "numero_factura_externa": item.numero_factura_externa,
        "total": total,
        "saldo_pendiente": saldo,
        "estado": _estado_pago(total, saldo),
    }


def _serializar_detalle(item: Factura):
    total = _calcular_total(item)
    saldo = _calcular_saldo(item)
    return {
        "id_factura": item.id_factura,
        "fecha": item.fecha.strftime("%Y-%m-%d") if item.fecha else None,
        "id_empresa": item.id_empresa,
        "numero_factura_externa": item.numero_factura_externa,
        "detalles": [{
            "id_detalle": d.id_detalle,
            "id_factura": d.id_factura,
            "descripcion": d.descripcion,
            "valor": d.valor
        } for d in item.detalles],
        "total": total,
        "saldo_pendiente": saldo,
        "estado": _estado_pago(total, saldo),
    }


def _obtener_o_404(db: Session, id_factura: int) -> Factura:
    item = db.query(Factura).options(
        joinedload(Factura.detalles),
        joinedload(Factura.pagos),
        joinedload(Factura.empresa)
    ).filter(Factura.id_factura == id_factura).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Factura no encontrada",
                error="No existe factura con ese ID"
            )
        )
    return item


def listar_facturas(db: Session):
    items = db.query(Factura).options(
        joinedload(Factura.detalles),
        joinedload(Factura.empresa),
        joinedload(Factura.pagos)
    ).all()

    return api_response(
        success=True,
        message="Facturas obtenidas correctamente",
        data=[_serializar_lista(i) for i in items]
    )


def obtener_factura(db: Session, id_factura: int):
    item = _obtener_o_404(db, id_factura)
    return api_response(
        success=True,
        message="Factura obtenida correctamente",
        data=_serializar_detalle(item)
    )


def crear_factura(db: Session, data):
    _validar_empresa_existe(db, data.id_empresa)

    datos = data.model_dump()
    detalles = datos.pop("detalles", None) or []

    nueva = Factura(**datos)

    for detalle in detalles:
        nueva.detalles.append(DetalleFactura(**detalle))

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Factura creada correctamente",
        data=_serializar_detalle(nueva)
    )


def actualizar_factura(db: Session, id_factura: int, data):
    item = _obtener_o_404(db, id_factura)

    datos = data.model_dump(exclude_unset=True)

    if "id_empresa" in datos:
        _validar_empresa_existe(db, datos["id_empresa"])

    for campo, valor in datos.items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Factura actualizada correctamente",
        data=_serializar_detalle(item)
    )


def eliminar_factura(db: Session, id_factura: int):
    item = _obtener_o_404(db, id_factura)

    if item.pagos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo eliminar la factura",
                error="La factura tiene pagos registrados, no puede eliminarse"
            )
        )

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Factura eliminada correctamente",
        data={"id_factura": id_factura}
    )
