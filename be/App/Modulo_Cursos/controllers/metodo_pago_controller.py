from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from App.Modulo_Cursos.models.metodo_pago_model import MetodoPago
from App.Modulo_Cursos.utils.response import api_response


def _serializar(item: MetodoPago):
    return {"id_metodo": item.id_metodo, "nombre": item.nombre}


def _obtener_o_404(db: Session, id_metodo: int) -> MetodoPago:
    item = db.query(MetodoPago).filter(MetodoPago.id_metodo == id_metodo).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Método de pago no encontrado",
                error="No existe método de pago con ese ID"
            )
        )
    return item


def listar_metodos_pago(db: Session):
    items = db.query(MetodoPago).all()
    return api_response(
        success=True,
        message="Métodos de pago obtenidos correctamente",
        data=[_serializar(i) for i in items]
    )


def obtener_metodo_pago(db: Session, id_metodo: int):
    item = _obtener_o_404(db, id_metodo)
    return api_response(
        success=True,
        message="Método de pago obtenido correctamente",
        data=_serializar(item)
    )


def crear_metodo_pago(db: Session, data):
    nuevo = MetodoPago(**data.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return api_response(
        success=True,
        message="Método de pago creado correctamente",
        data=_serializar(nuevo)
    )


def actualizar_metodo_pago(db: Session, id_metodo: int, data):
    item = _obtener_o_404(db, id_metodo)

    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Método de pago actualizado correctamente",
        data=_serializar(item)
    )


def eliminar_metodo_pago(db: Session, id_metodo: int):
    item = _obtener_o_404(db, id_metodo)

    if item.pagos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=api_response(
                success=False,
                message="No se pudo eliminar el método de pago",
                error="El método de pago tiene pagos registrados asociados"
            )
        )

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Método de pago eliminado correctamente",
        data={"id_metodo": id_metodo}
    )
