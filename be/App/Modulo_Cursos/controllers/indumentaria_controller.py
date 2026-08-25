from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from App.Modulo_Cursos.models.indumentaria_model import Indumentaria
from App.Modulo_Cursos.utils.response import api_response


def _serializar(item: Indumentaria):
    return {
        "id_indumentaria": item.id_indumentaria,
        "nombre": item.nombre,
        "descripcion": item.descripcion
    }


def _obtener_o_404(db: Session, id_indumentaria: int) -> Indumentaria:
    item = db.query(Indumentaria).filter(
        Indumentaria.id_indumentaria == id_indumentaria
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=api_response(
                success=False,
                message="Indumentaria no encontrada",
                error="No existe indumentaria con ese ID"
            )
        )
    return item


def listar_indumentaria(db: Session):
    items = db.query(Indumentaria).all()
    return api_response(
        success=True,
        message="Indumentaria obtenida correctamente",
        data=[_serializar(i) for i in items]
    )


def obtener_indumentaria(db: Session, id_indumentaria: int):
    item = _obtener_o_404(db, id_indumentaria)
    return api_response(
        success=True,
        message="Indumentaria obtenida correctamente",
        data=_serializar(item)
    )


def crear_indumentaria(db: Session, data):
    nueva = Indumentaria(**data.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return api_response(
        success=True,
        message="Indumentaria creada correctamente",
        data=_serializar(nueva)
    )


def actualizar_indumentaria(db: Session, id_indumentaria: int, data):
    item = _obtener_o_404(db, id_indumentaria)

    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(item, campo, valor)

    db.commit()
    db.refresh(item)

    return api_response(
        success=True,
        message="Indumentaria actualizada correctamente",
        data=_serializar(item)
    )


def eliminar_indumentaria(db: Session, id_indumentaria: int):
    item = _obtener_o_404(db, id_indumentaria)

    db.delete(item)
    db.commit()

    return api_response(
        success=True,
        message="Indumentaria eliminada correctamente",
        data={"id_indumentaria": id_indumentaria}
    )
